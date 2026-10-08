<x-filament-panels::page>
 <p>Move each inquiry through your sales stages. Set follow-up dates in Leads &amp; bookings. Accepting a linked quote advances the inquiry to Accepted. Moving a card tracks progress; it does not issue documents or record payments.</p>
 <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:20px;align-items:flex-start">
 @foreach($stages as $stage=>$label)
 <section style="min-width:270px;width:270px;flex-shrink:0">
  <h2 style="font-weight:700;margin-bottom:12px">{{ $label }} · {{ $columns[$stage]->count() }}</h2>
  @foreach($columns[$stage] as $lead)
  <article wire:key="lead-{{ $lead->id }}" style="border:1px solid #aaa5;border-radius:12px;padding:16px;margin-bottom:12px">
   <strong>{{ $lead->name }}</strong><p>{{ $lead->client?->display_name ?? $lead->business }}</p><p>{{ $lead->service }}</p>
   @if($lead->follow_up_on)<p style="margin:8px 0;color:{{ $lead->follow_up_on->toDateString() <= now('Africa/Casablanca')->toDateString() && !in_array($stage,['completed','lost']) ? '#d97706' : 'inherit' }}">Follow up {{ $lead->follow_up_on->format('d/m/Y') }}{{ $lead->follow_up_on->toDateString() <= now('Africa/Casablanca')->toDateString() && !in_array($stage,['completed','lost']) ? ' · Needs attention' : '' }}</p>@endif
   <label style="display:block;margin:10px 0">Stage
    <select aria-label="Stage for {{ $lead->name }}" wire:change="move({{ $lead->id }}, $event.target.value)" style="display:block;width:100%;border-radius:8px;color:#111;background:#fff;padding:6px">
     @foreach($stages as $value=>$text)<option value="{{ $value }}" @selected($stage===$value)>{{ $text }}</option>@endforeach
    </select>
   </label>
   <a style="text-decoration:underline" href="{{ \App\Filament\Resources\LeadResource::getUrl('index',['tableSearch'=>$lead->email]) }}">Details &amp; follow-up</a>
  </article>
  @endforeach
  @if($columns[$stage]->isEmpty())<p style="opacity:.6">No inquiries here.</p>@endif
 </section>
 @endforeach
 </div>
 <p style="font-size:12px;opacity:.7">Up to 100 inquiries per stage, ordered by follow-up date. All records remain available in Leads &amp; bookings.</p>
</x-filament-panels::page>
