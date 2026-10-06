<?php
namespace App\Http\Controllers;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
class SettingsController extends Controller {
 const COLLECTIONS = ['services', 'projects', 'testimonials', 'retainers', 'comboPackages', 'stats', 'clients', 'industries', 'benefits', 'helpOptions', 'skills', 'caseStudies'];
 public function show(Request $request) {
  $content = SiteSetting::findOrFail(1)->content;
  if (!$request->user()) {
   foreach (self::COLLECTIONS as $key) {
    $content['admin_data'][$key] = array_values(array_filter($content['admin_data'][$key] ?? [], fn ($item) => ($item['isActive'] ?? true) === true));
   }
  }
  return response()->json($content);
 }
 public function update(Request $request) {
  abort_if(strlen($request->getContent()) > 2000000, 413);
  $fields = $request->validate([
   'admin_data' => 'sometimes|required|array:'.implode(',', self::COLLECTIONS),
   'seo_data' => 'sometimes|required|array:siteTitle,siteDescription,siteKeywords,ogImage',
   'seo_data.*' => 'string|max:10000',
   'about_data' => 'sometimes|required|array:heroTitle,heroSubtitle,heroDescription,heroImage,storyTitle,storyParagraph1,storyParagraph2,storyParagraph3',
   'about_data.*' => 'string|max:20000',
   'availability_data' => 'sometimes|required|array:status,lastUpdated,showWaitingList',
   'availability_data.status' => ['sometimes', Rule::in(['available','limited','booking-next-month'])],
   'availability_data.lastUpdated' => 'sometimes|date_format:Y-m-d',
   'availability_data.showWaitingList' => 'sometimes|boolean',
  ]);
  if (isset($fields['admin_data'])) foreach ($fields['admin_data'] as $value) $this->validateCollection($value);
  DB::transaction(function () use ($fields) {
   $settings = SiteSetting::lockForUpdate()->findOrFail(1);
   $settings->update(['content' => array_replace($settings->content, $fields)]);
  });
  return response()->json(['message' => 'Saved.']);
 }
 private function validateCollection($value): void {
  validator(['value' => $value], ['value' => 'present|array|max:500', 'value.*' => 'array', 'value.*.id' => 'required|string|max:200|distinct', 'value.*.isActive' => 'sometimes|boolean', 'value.*.displayOrder' => 'sometimes|integer|min:0'])->validate();
 }
 public function collection(Request $request, string $collection) {
  abort_unless(in_array($collection, self::COLLECTIONS, true), 404);
  abort_if(strlen($request->getContent()) > 2000000, 413);
  $request->validate(['value' => 'present|array']);
  $this->validateCollection($request->input('value'));
  DB::transaction(function () use ($request, $collection) {
   $settings = SiteSetting::lockForUpdate()->findOrFail(1);
   $content = $settings->content;
   $content['admin_data'][$collection] = $request->input('value');
   $settings->update(['content' => $content]);
  });
  return response()->json(['message' => 'Saved.']);
 }
}
