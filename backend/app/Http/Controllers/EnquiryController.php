<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Services\WhatsAppBusiness;
use App\Support\WhatsAppPhone;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EnquiryController extends Controller
{
    private const SERVICES = 'website,seo,digital-marketing,photography,graphic-design,full-service,consultation';

    private function contactRules(): array
    {
        return [
            'name' => 'required|string|max:150', 'email' => 'required|email|max:255', 'phone' => 'nullable|string|max:60',
            'honeypot' => 'nullable|string|max:0', 'submission_key' => 'nullable|uuid', 'whatsapp_consent' => 'nullable|boolean',
            'source' => 'nullable|in:website,hero,header,booking_section,footer,contact_page,final_cta,floating_button',
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->contactRules() + [
            'service' => 'required|in:'.self::SERVICES, 'business' => 'required|in:hotel-riad,restaurant-cafe,real-estate,ecommerce,medical,lawyer,other',
            'budget' => 'required|in:under-5000,5000-10000,10000-20000,20000-50000,50000-plus',
            'timeline' => 'required|in:urgent,within-30-days,flexible', 'message' => 'nullable|string|max:5000',
        ]);
        if ($request->boolean('whatsapp_consent') && empty($data['phone'])) {
            throw ValidationException::withMessages(['phone' => 'Provide a phone number for WhatsApp follow-up.']);
        }

        return $this->save($data, 'enquiry');
    }

    public function booking(Request $request)
    {
        $rules = $this->contactRules();
        $rules['phone'] = 'required|string|max:60';
        $rules['whatsapp_consent'] = 'required|accepted';
        $data = $request->validate($rules + [
            'intent' => 'required|in:discovery_call,whatsapp', 'service' => 'required|in:'.self::SERVICES, 'message' => 'nullable|string|max:5000',
            'preferred_date' => 'nullable|required_with:preferred_time|date_format:Y-m-d',
            'preferred_time' => 'nullable|required_with:preferred_date|date_format:H:i', 'booking_timezone' => 'required|timezone',
        ]);
        if (! empty($data['preferred_date'])) {
            $preferred = Carbon::createFromFormat('Y-m-d H:i', $data['preferred_date'].' '.$data['preferred_time'], $data['booking_timezone'])->startOfMinute();
            if ($preferred->isPast()) {
                throw ValidationException::withMessages(['preferred_date' => 'Choose a future preferred time.']);
            }
            $data['preferred_at'] = $preferred->utc();
        }
        unset($data['preferred_date'],$data['preferred_time']);

        return $this->save($data, $data['intent']);
    }

    private function save(array $data, string $intent)
    {
        unset($data['honeypot']);
        $consent = filter_var($data['whatsapp_consent'] ?? false, FILTER_VALIDATE_BOOLEAN);
        unset($data['whatsapp_consent']);
        if (! empty($data['phone'])) {
            $data['phone'] = WhatsAppPhone::normalize($data['phone']);
        }
        $data['source'] = $data['source'] ?? 'website';
        $key = $data['submission_key'] ?? (string) Str::uuid();
        unset($data['submission_key']);
        $lead = DB::transaction(function () use ($key, $data, $intent, $consent) {
            $lead = Lead::firstOrCreate(['submission_key' => $key], $data + ['intent' => $intent, 'source' => 'website', 'status' => 'new', 'follow_up_on' => today(), 'whatsapp_consent_at' => $consent ? now() : null]);
            if (! $lead->wasRecentlyCreated && ($lead->email !== $data['email'] || $lead->name !== $data['name'])) {
                throw ValidationException::withMessages(['submission_key' => 'This request identifier is already in use.']);
            }

            if ($lead->wasRecentlyCreated) {
                $outbound = app(WhatsAppBusiness::class)->enqueue($lead);
                if ($outbound) {
                    defer(fn () => app(WhatsAppBusiness::class)->send($outbound->id));
                }
            }

            return $lead;
        });
        $reference = sprintf('REQ-%06d', $lead->id);
        $details = [
            'Name' => $lead->name, 'Email' => $lead->email, 'Phone' => $lead->phone,
            'Request' => match ($lead->intent) {
                'discovery_call' => 'Discovery call', 'whatsapp' => 'WhatsApp enquiry', default => 'Project enquiry'
            },
            'Service' => $lead->service, 'Business' => $lead->business, 'Budget' => $lead->budget,
            'Timeline' => $lead->timeline, 'Preferred time' => $lead->preferred_at ? $lead->preferred_display : null,
            'Message' => $lead->message,
        ];
        $text = "Hello Ayoub, here are my enquiry details.\nReference: $reference";
        foreach ($details as $label => $value) {
            if ($value !== null && $value !== '') {
                $text .= "\n$label: $value";
            }
        }

        return response()->json(['message' => 'Request received.', 'reference' => $reference, 'whatsapp_url' => 'https://wa.me/212708295518?text='.rawurlencode($text)], $lead->wasRecentlyCreated ? 201 : 200);
    }
}
