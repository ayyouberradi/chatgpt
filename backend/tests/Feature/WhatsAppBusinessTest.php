<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppReply;
use App\Models\WhatsAppSetting;
use App\Services\WhatsAppBusiness;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class WhatsAppBusinessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
        config(['whatsapp.access_token' => 'test-token-not-real', 'whatsapp.phone_number_id' => '123456', 'whatsapp.app_secret' => 'test-secret', 'whatsapp.verify_token' => 'test-verify', 'whatsapp.graph_version' => 'v23.0']);
    }

    private function enable(bool $followups = true): void
    {
        WhatsAppSetting::current()->update(['enabled' => true, 'confirmations' => true, 'followups' => $followups, 'confirmation_template' => 'booking_received', 'followup_template' => 'lead_followup', 'language' => 'fr']);
    }

    private function lead(): Lead
    {
        return Lead::create(['name' => 'Test Client', 'email' => 'client@example.test', 'phone' => '+212612345678', 'service' => 'website', 'status' => 'new', 'follow_up_on' => today(), 'whatsapp_consent_at' => now()]);
    }

    private function payload(array $values): array
    {
        return ['object' => 'whatsapp_business_account', 'entry' => [['changes' => [['value' => ['metadata' => ['phone_number_id' => '123456']] + $values]]]]];
    }

    private function webhook(array $payload)
    {
        $body = json_encode($payload);

        return $this->call('POST', '/integrations/whatsapp/webhook', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $body, 'test-secret')], $body);
    }

    private function event(string $id, string $status): array
    {
        return ['id' => $id, 'status' => $status, 'timestamp' => (string) now()->timestamp];
    }

    public function test_disabled_integration_saves_bookings_without_sending(): void
    {
        $this->postJson('/api/bookings', ['name' => 'Client', 'email' => 'client@example.test', 'phone' => '0612345678', 'service' => 'website', 'intent' => 'whatsapp', 'whatsapp_consent' => true, 'booking_timezone' => 'Africa/Casablanca'])->assertCreated();
        $this->assertSame(1, Lead::count());
        $this->assertSame(0, WhatsAppMessage::count());
        Http::assertNothingSent();
    }

    public function test_booking_uses_approved_template_and_deduplicates_submission_and_sender(): void
    {
        $this->enable();
        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.confirmed']]], 200)]);
        $data = ['name' => 'Client', 'email' => 'client@example.test', 'phone' => '0612345678', 'service' => 'website', 'intent' => 'discovery_call', 'whatsapp_consent' => true, 'booking_timezone' => 'Africa/Casablanca', 'submission_key' => (string) Str::uuid()];
        $this->postJson('/api/bookings', $data)->assertCreated();
        $this->postJson('/api/bookings', $data)->assertOk();
        $this->assertSame(1, WhatsAppMessage::count());
        $message = WhatsAppMessage::sole();
        app(WhatsAppBusiness::class)->send($message->id);
        app(WhatsAppBusiness::class)->send($message->id);
        Http::assertSentCount(1);
        Http::assertSent(fn ($r) => $r['type'] === 'template' && $r['template']['name'] === 'booking_received' && count($r['template']['components'][0]['parameters']) === 4 && $r['to'] === '212612345678');
        $this->assertSame('accepted', $message->fresh()->status);
        $this->assertNull($message->fresh()->delivered_at);
        $this->assertSame(now('Africa/Casablanca')->addDays(3)->toDateString(), $message->lead->fresh()->follow_up_on->toDateString());
    }

    public function test_consent_and_phone_are_rechecked_at_send_time(): void
    {
        $this->enable();
        $lead = $this->lead();
        $m = app(WhatsAppBusiness::class)->enqueue($lead);
        $lead->update(['whatsapp_consent' => false]);
        $this->assertSame('cancelled', app(WhatsAppBusiness::class)->send($m->id));
        Http::assertNothingSent();
        $lead->update(['whatsapp_consent' => true]);
        $this->actingAs(User::factory()->create()->forceFill(['role' => 'admin']));
        $m = app(WhatsAppBusiness::class)->enqueue($lead, 'followup', false);
        $lead->update(['phone' => '+33612345678']);
        $this->assertSame('cancelled', app(WhatsAppBusiness::class)->send($m->id));
        Http::assertNothingSent();
    }

    public function test_webhook_requires_signature_and_statuses_never_regress(): void
    {
        $this->enable();
        $lead = $this->lead();
        $m = app(WhatsAppBusiness::class)->enqueue($lead);
        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.status']]], 200)]);
        app(WhatsAppBusiness::class)->send($m->id);
        $this->postJson('/integrations/whatsapp/webhook', $this->payload(['statuses' => [$this->event('wamid.status', 'read')]]))->assertUnauthorized();
        $this->webhook($this->payload(['statuses' => [$this->event('wamid.status', 'read')]]))->assertOk();
        $this->webhook($this->payload(['statuses' => [$this->event('wamid.status', 'delivered'), $this->event('wamid.status', 'sent')]]))->assertOk();
        $this->webhook($this->payload(['statuses' => [$this->event('wamid.status', 'read')]]))->assertOk();
        $this->assertSame('read', $m->fresh()->status);
        $this->assertNotNull($m->fresh()->read_at);
        $this->assertSame(3, DB::table('whatsapp_status_events')->count());
        $other = $this->payload(['statuses' => [$this->event('wamid.status', 'failed')]]);
        $other['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'] = '999';
        $this->webhook($other)->assertOk();
        $this->assertSame(3, DB::table('whatsapp_status_events')->count());
    }

    public function test_incoming_reply_is_deduplicated_and_stops_pending_followup(): void
    {
        $this->enable();
        $lead = $this->lead();
        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.reply-confirmation']]], 200)]);
        $w = app(WhatsAppBusiness::class);
        $m = $w->enqueue($lead);
        $w->send($m->id);
        $this->travel(3)->days();
        $follow = $w->enqueue($lead, 'followup');
        $this->assertNotNull($follow);
        $payload = $this->payload(['messages' => [['id' => 'wamid.inbound', 'from' => '212612345678', 'timestamp' => (string) now()->timestamp, 'type' => 'text', 'text' => ['body' => 'Thank you, let us discuss.']]]]);
        $this->webhook($payload)->assertOk();
        $this->webhook($payload)->assertOk();
        $this->assertSame(1, WhatsAppReply::count());
        $this->assertNull($lead->fresh()->follow_up_on);
        $this->assertSame('contacted', $lead->fresh()->status);
        $this->assertSame('cancelled', $w->send($follow->id));
        Http::assertSentCount(1);
    }

    public function test_followups_skip_historical_leads_and_stop_after_two_attempts(): void
    {
        $old = $this->lead();
        $this->enable();
        $lead = $this->lead();
        $w = app(WhatsAppBusiness::class);
        Http::fakeSequence()->push(['messages' => [['id' => 'wamid.first']]], 200)->push(['messages' => [['id' => 'wamid.second']]], 200)->push(['messages' => [['id' => 'wamid.third']]], 200);
        $w->send($w->enqueue($lead)->id);
        $this->travel(3)->days();
        $w->run();
        $this->travel(7)->days();
        $w->run();
        $this->travel(7)->days();
        $w->run();
        $this->assertSame(0, WhatsAppMessage::where('lead_id', $old->id)->count());
        $this->assertSame(2, WhatsAppMessage::where('lead_id', $lead->id)->where('kind', 'followup')->count());
        Http::assertSentCount(3);
    }

    public function test_timeout_does_not_blindly_resend(): void
    {
        $this->enable();
        $w = app(WhatsAppBusiness::class);
        $m = $w->enqueue($this->lead());
        Http::fake(fn () => throw new ConnectionException('Interrupted'));
        $this->assertSame('unknown', $w->send($m->id));
        $w->send($m->id);
        $this->assertSame(1, $m->fresh()->attempts);
    }

    public function test_rate_limit_retries_only_rejections(): void
    {
        $this->enable();
        $w = app(WhatsAppBusiness::class);
        $m2 = $w->enqueue($this->lead());
        Http::fakeSequence()->push([], 429)->push(['messages' => [['id' => 'wamid.retry']]], 200);
        $this->assertSame('queued', $w->send($m2->id));
        $w->send($m2->id);
        $this->assertSame(1, $m2->fresh()->attempts);
        $this->travel(16)->minutes();
        $this->assertSame('accepted', $w->send($m2->id));
        $this->assertSame(2, $m2->fresh()->attempts);
    }

    public function test_early_status_events_are_replayed_after_api_acceptance(): void
    {
        $this->enable();
        $w = app(WhatsAppBusiness::class);
        $m = $w->enqueue($this->lead());
        $this->webhook($this->payload(['statuses' => [$this->event('wamid.early', 'delivered')]]))->assertOk();
        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.early']]], 200)]);
        $this->assertSame('delivered', $w->send($m->id));
    }

    public function test_verification_challenge_and_admin_pages_are_protected(): void
    {
        $this->get('/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test-verify&hub.challenge=12345')->assertOk()->assertSee('12345');
        $this->get('/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345')->assertForbidden();
        $user = User::factory()->create();
        $user->forceFill(['role' => 'admin'])->save();
        $this->actingAs($user);
        foreach (['/manage/whatsapp-settings', '/manage/whatsapp-outbox', '/manage/whatsapp-replies'] as $url) {
            $this->get($url)->assertOk();
        }
        $user->forceFill(['role' => 'client'])->save();
        $this->actingAs($user);
        $this->get('/manage/whatsapp-outbox')->assertForbidden();
        config(['whatsapp.access_token' => null]);
        $this->expectException(ValidationException::class);
        $this->enable();
    }
}
