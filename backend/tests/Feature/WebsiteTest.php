<?php
namespace Tests\Feature;
use App\Models\User;
use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
class WebsiteTest extends TestCase {
 use RefreshDatabase;
 protected function setUp(): void { parent::setUp(); $this->seed(); }
 public function test_public_content_is_seeded_and_hidden_items_are_filtered(): void {
  $this->getJson('/api/settings')->assertOk()->assertJsonPath('admin_data.projects.0.title', 'La Ferme Medina');
  $settings = SiteSetting::find(1); $content = $settings->content;
  $content['admin_data']['projects'][0]['isActive'] = false; $settings->update(['content' => $content]);
  $projects = $this->getJson('/api/settings')->assertOk()->json('admin_data.projects');
  $this->assertNotContains('la-ferme-medina', array_column($projects, 'id'));
 }
 public function test_guests_cannot_change_content_or_manage_media(): void {
  $this->patchJson('/api/settings', ['seo_data' => ['siteTitle' => 'Changed']])->assertUnauthorized();
  $this->putJson('/api/settings/projects', ['value' => []])->assertUnauthorized();
  $this->getJson('/api/media')->assertUnauthorized();
  $this->postJson('/api/media')->assertUnauthorized();
  $this->deleteJson('/api/media/example.jpg')->assertUnauthorized();
 }
 public function test_login_persistence_and_logout(): void {
  User::factory()->create(['email' => 'admin@example.test', 'password' => bcrypt('test-password-123')]);
  $this->postJson('/api/login', ['email' => 'admin@example.test', 'password' => 'wrong'])->assertUnprocessable();
  $this->postJson('/api/login', ['email' => 'admin@example.test', 'password' => 'test-password-123'])->assertOk()->assertJsonPath('user.email', 'admin@example.test');
  $this->patchJson('/api/settings', ['seo_data' => ['siteTitle' => 'Updated title']])->assertOk();
  $this->getJson('/api/settings')->assertJsonPath('seo_data.siteTitle', 'Updated title');
  $this->postJson('/api/logout')->assertOk();
  $this->getJson('/api/session')->assertJsonPath('user', null);
 }
 public function test_collection_deletion_stays_deleted_and_other_collections_survive(): void {
  $this->actingAs(User::factory()->create());
  $this->putJson('/api/settings/projects', ['value' => []])->assertOk();
  $this->getJson('/api/settings')->assertJsonPath('admin_data.projects', []);
  $this->assertNotEmpty(SiteSetting::find(1)->content['admin_data']['services']);
  $this->seed(); $this->assertSame([], SiteSetting::find(1)->content['admin_data']['projects']);
 }
 public function test_invalid_settings_and_collections_are_rejected(): void {
  $this->actingAs(User::factory()->create());
  $this->patchJson('/api/settings', ['availability_data' => ['status' => 'bad']])->assertUnprocessable();
  $this->putJson('/api/settings/projects', ['value' => [['title' => 'Missing id']]])->assertUnprocessable();
  $this->putJson('/api/settings/users', ['value' => []])->assertNotFound();
 }
 public function test_media_upload_list_and_delete_and_unsafe_type_rejection(): void {
  Storage::fake('public'); $this->actingAs(User::factory()->create());
  $upload = UploadedFile::fake()->createWithContent('photo.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1kAAAAASUVORK5CYII='));
  $result = $this->postJson('/api/media', ['file' => $upload])->assertCreated();
  $name = $result->json('name'); Storage::disk('public')->assertExists('media/'.$name);
  $this->getJson('/api/media')->assertOk()->assertJsonPath('0.name', $name);
  $this->postJson('/api/media', ['file' => UploadedFile::fake()->createWithContent('bad.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')])->assertUnprocessable();
  $this->deleteJson('/api/media/'.$name)->assertOk(); Storage::disk('public')->assertMissing('media/'.$name);
 }
 public function test_unknown_api_endpoint_is_not_the_spa(): void { $this->getJson('/api/missing')->assertNotFound(); }
}
