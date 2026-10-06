<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\LeadFollowUp;
use App\Models\User;
use App\Services\LeadFollowUpWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private function booking(array $extra = []): array
    {
        return $extra + ['name' => 'Booking Client', 'email' => 'booking@example.test', 'phone' => '0612345678', 'service' => 'website', 'intent' => 'discovery_call', 'whatsapp_consent' => true, 'booking_timezone' => 'Europe/Paris', 'submission_key' => (string) Str::uuid(), 'source' => 'booking_section'];
    }

    public function test_booking_capture_is_idempotent_with_full_whatsapp_details(): void
    {
        $data = $this->booking(['preferred_date' => now()->addDays(5)->format('Y-m-d'), 'preferred_time' => '14:30']);
        $first = $this->postJson('/api/bookings', $data)->assertCreated();
        $this->postJson('/api/bookings', $data)->assertOk()->assertJsonPath('reference', $first->json('reference'));
        $lead = Lead::sole();
        $this->assertSame('+212612345678', $lead->phone);
        $this->assertTrue($lead->whatsappReady());
        $this->assertSame('14:30', $lead->preferred_at->setTimezone('Europe/Paris')->format('H:i'));
        $this->assertSame('booking_section', $lead->source);
        $this->assertSame('new', $lead->status);
        $this->assertSame(0, LeadFollowUp::count());
        $this->assertStringContainsString('Email: booking@example.test', rawurldecode($first->json('whatsapp_url')));
        $this->assertStringContainsString('Name: Booking Client', rawurldecode($first->json('whatsapp_url')));
        $this->assertStringContainsString('Preferred time:', rawurldecode($first->json('whatsapp_url')));
        $this->assertStringContainsString($first->json('reference'), rawurldecode($first->json('whatsapp_url')));
        $this->postJson('/api/bookings', $this->booking(['submission_key' => $data['submission_key'], 'email' => 'different@example.test']))->assertUnprocessable();
    }

    public function test_booking_rejects_missing_consent_invalid_phone_and_past_time(): void
    {
        $this->postJson('/api/bookings', $this->booking(['whatsapp_consent' => false]))->assertUnprocessable();
        $this->postJson('/api/bookings', $this->booking(['phone' => 'abcdef']))->assertUnprocessable();
        $this->postJson('/api/bookings', $this->booking(['preferred_date' => now()->subDay()->format('Y-m-d'), 'preferred_time' => '14:30']))->assertUnprocessable();
        $this->assertSame(0, Lead::count());
    }

    public function test_non_consented_enquiry_is_saved_without_whatsapp_jobs(): void
    {
        $this->postJson('/api/enquiries', ['name' => 'Client', 'email' => 'test@example.test', 'service' => 'website', 'business' => 'other', 'budget' => '5000-10000', 'timeline' => 'flexible'])->assertCreated();
        $this->assertFalse(Lead::sole()->whatsappReady());
        $this->assertSame(0, LeadFollowUp::count());
    }

    public function test_recorded_manual_followup_is_distinct_from_prepared_draft(): void
    {
        $this->actingAs(User::factory()->create());
        $lead = Lead::create(['name' => 'Client', 'email' => 'manual@example.test', 'phone' => '+33612345678', 'whatsapp_consent_at' => now(), 'status' => 'new']);
        $workflow = app(LeadFollowUpWorkflow::class);
        $draft = $workflow->prepare($lead, "Hello Client, when can we discuss your request?\nAyoub");
        $this->assertSame('draft', $draft->status);
        $this->assertNull($draft->sent_at);
        $this->assertSame('new', $lead->fresh()->status);
        $this->assertStringStartsWith('https://wa.me/33612345678?text=', $draft->whatsappUrl());
        $workflow->recordSent($draft, now()->addDays(3)->format('Y-m-d'));
        $this->assertSame('sent', $draft->fresh()->status);
        $this->assertSame('contacted', $lead->fresh()->status);
    }

    public function test_revoked_permission_blocks_followup_and_sent_history_is_immutable(): void
    {
        $lead = Lead::create(['name' => 'Client', 'email' => 'permission@example.test', 'phone' => '+33612345678', 'whatsapp_consent_at' => now(), 'status' => 'new']);
        $workflow = app(LeadFollowUpWorkflow::class);
        $draft = $workflow->prepare($lead, 'Hello Client, can we discuss your project?');
        $lead->update(['whatsapp_consent' => false]);
        $this->assertFalse($draft->fresh()->canOpen());
        try {
            $workflow->recordSent($draft, null);
            $this->fail('Revoked permission was ignored.');
        } catch (ValidationException $e) {
            $this->assertNotEmpty($e->errors());
        }
        $lead->update(['whatsapp_consent' => true]);
        $workflow->recordSent($draft, null);
        try {
            $draft->fresh()->update(['message' => 'Changed after sending']);
            $this->fail('Sent history was editable.');
        } catch (ValidationException $e) {
            $this->assertNotEmpty($e->errors());
        }
    }

    public function test_followup_admin_requires_admin_and_renders_for_admin(): void
    {
        $this->get('/manage/whatsapp-follow-ups')->assertRedirect();
        $this->actingAs(User::factory()->create(['role' => 'client']))->get('/manage/whatsapp-follow-ups')->assertForbidden();
        $this->actingAs(User::factory()->create())->get('/manage/whatsapp-follow-ups')->assertOk();
    }
}
