@php
$fr = $document->language === 'fr';
$date = ($document->issued_at ?? $document->created_at)->copy()->setTimezone('Africa/Casablanca');
$clientName = trim($client['company'] ?? '') ?: ($client['name'] ?? 'Client');
$money = function ($value) use ($document, $fr) {
    [$whole, $fraction] = explode('.', \App\Support\Money::decimal((int) $value));
    $grouped = number_format((int) $whole, 0, '', $fr ? '.' : ',');
    $amount = $grouped.($fraction !== '00' ? ($fr ? ',' : '.').$fraction : '');
    return $amount.' '.($document->currency === 'MAD' ? 'DHs' : $document->currency);
};
$footer = $issuer['pdf_footer'] ?? null;
$showTax = ($issuer['tax_mode'] ?? '') === 'vat' || $totals['tax_amount'] > 0;
$paid = $document->issued_at && $document->type === 'invoice' ? $document->paidAmount() : 0;
$credited = $document->issued_at && $document->type === 'invoice' ? $document->creditAmount() : 0;
@endphp
<!doctype html>
<html lang="{{ $document->language }}">
<head><meta charset="utf-8"><title>{{ $pdfTitle }}</title>
<style>
@page { margin: 48px 38px 145px; }
body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #171717; line-height: 1.6; }
h1 { margin: 2px 0 30px; text-align: center; font-size: 15px; font-weight: normal; }
.metadata { width: 100%; margin-bottom: 25px; font-size: 11px; letter-spacing: 1px; }
.metadata td { width: 50%; vertical-align: top; }
.metadata .date { text-align: right; }
.client { margin-bottom: 16px; letter-spacing: .5px; }
.client strong { font-size: 11px; }
.secondary { font-size: 9px; color: #555; }
.draft { border: 1px solid #777; padding: 6px 10px; margin-bottom: 14px; font-size: 9px; }
.rule { border-top: 3px solid #171717; margin: 0 0 8px; }
.line-area { min-height: 390px; }
table.lines { width: 100%; border-collapse: collapse; }
.lines thead { display: table-header-group; }
.lines th { background: #333; color: #fff; font-size: 11px; text-align: left; padding: 10px 14px; letter-spacing: 1px; }
.lines th.price { text-align: right; width: 21%; }
.lines td { padding: 2px 13px; vertical-align: top; }
.lines tr { page-break-inside: avoid; }
.lines .item-heading td { padding-top: 12px; font-weight: bold; letter-spacing: .6px; }
.item-heading { page-break-after: avoid; }
.scope { padding-left: 24px !important; line-height: 1.8; }
.price { text-align: right; white-space: nowrap; }
.summary { margin-top: 32px; width: 100%; border-collapse: collapse; page-break-inside: avoid; }
.summary td { padding: 4px 12px; text-align: right; }
.summary td:first-child { width: 79%; }
.summary .total td { background: #333; color: #fff; padding: 11px 13px; font-weight: bold; font-size: 11px; letter-spacing: .6px; text-transform: uppercase; }
.terms { white-space: pre-line; margin-top: 24px; font-size: 9px; }
.bank { margin-top: 40px; page-break-inside: avoid; padding-left: 15px; }
.bank strong { letter-spacing: 1px; }
.bank .details { white-space: pre-line; line-height: 1.8; margin-top: 6px; }
.legal-footer { position: fixed; bottom: -115px; left: 0; right: 0; border-top: 3px solid #171717; padding-top: 9px; text-align: center; font-size: 10px; line-height: 1.4; }
.footer-text { white-space: pre-line; }
</style></head>
<body>
<div class="legal-footer">
@if($footer)<div class="footer-text">{{ $footer }}</div>
@else
<div>{{ $issuer['business_type'] ?? '' }}{{ !empty($issuer['business_type']) ? ' : ' : '' }}{{ $issuer['legal_name'] ?? ($fr ? 'Identité de l’émetteur à configurer' : 'Configure issuer identity') }}</div>
@if(!empty($issuer['address']))<div>{{ $fr ? 'Adresse' : 'Address' }} : {{ $issuer['address'] }}</div>@endif
@if(!empty($issuer['registration_number']))<div>{{ $fr ? 'Immatriculation / ICE' : 'Registration / business ID' }} : {{ $issuer['registration_number'] }}</div>@endif
@if(!empty($issuer['tax_identifier']))<div>{{ $fr ? 'Identifiant fiscal' : 'Tax ID' }} : {{ $issuer['tax_identifier'] }}</div>@endif
<div>{{ $issuer['phone'] ?? '' }}{{ !empty($issuer['phone']) && !empty($issuer['email']) ? ' · ' : '' }}{{ $issuer['email'] ?? '' }}</div>
@endif
<div class="secondary">{{ $document->display_number }}</div>
</div>
@if(!$document->issued_at)<div class="draft">{{ $fr ? 'BROUILLON — document non émis' : 'DRAFT — not issued' }}</div>@endif
<h1>{{ $pdfTitle }}</h1>
<table class="metadata"><tr><td>N° {{ $document->display_number }}</td><td class="date">{{ $fr ? 'FAIT LE' : 'DATE' }}<br>{{ $date->format('d/m/Y') }}</td></tr></table>
<div class="client"><strong>{{ $clientName }}</strong>
@if(!empty($client['company']) && !empty($client['name']) && $client['name'] !== $client['company'])<div>{{ $client['name'] }}</div>@endif
@if(!empty($client['tax_identifier']))<div><strong>{{ $fr ? 'ICE / Identifiant fiscal' : 'Business / tax ID' }} :</strong> {{ $client['tax_identifier'] }}</div>@endif
@if(!empty($client['address']))<div class="secondary">{{ $client['address'] }}</div>@endif
</div>
<div class="secondary">{{ $document->title }}@if($document->due_on) · {{ $document->type === 'quote' ? ($fr ? 'Valable jusqu’au' : 'Valid until') : ($fr ? 'Échéance' : 'Due date') }} {{ $document->due_on->format('d/m/Y') }}@endif</div>
@if($document->source)<div class="secondary">{{ $fr ? 'Référence' : 'Reference' }} : {{ $document->source->number }}</div>@endif
@if($document->billing_period !== 'one_time')<div class="secondary">{{ $fr ? 'Périodicité' : 'Billing period' }} : {{ $document->billing_period === 'monthly' ? ($fr ? 'Mensuelle' : 'Monthly') : ($fr ? 'Annuelle' : 'Yearly') }}</div>@endif
<div class="rule"></div>
<div class="line-area"><table class="lines"><thead><tr><th>DESCRIPTION</th><th class="price">{{ $fr ? 'PRIX' : 'PRICE' }}</th></tr></thead><tbody>
@foreach($document->items as $item)
@php $scope = array_values(array_filter(array_map('trim', preg_split('/\R/u', $item->scope ?? '')), fn($line) => $line !== '')); @endphp
<tr class="item-heading"><td>{{ $item->description }}@if($item->quantity_milli !== 1000)<div class="secondary">{{ $fr ? 'Quantité' : 'Quantity' }} : {{ $item->quantity }} × {{ $money($item->unit_amount) }}</div>@endif</td><td class="price">@if(!$scope){{ $money($item->lineAmount()) }}@endif</td></tr>
@foreach($scope as $line)<tr><td class="scope">• {{ preg_replace('/^[•*\-]\s*/u', '', $line) }}</td><td class="price">@if($loop->last){{ $money($item->lineAmount()) }}@endif</td></tr>@endforeach
@endforeach
</tbody></table></div>
<table class="summary">
@if($document->discount_amount || $showTax)<tr><td>{{ $fr ? 'Sous-total' : 'Subtotal' }}</td><td class="price">{{ $money($totals['subtotal_amount']) }}</td></tr>@endif
@if($document->discount_amount)<tr><td>{{ $fr ? 'Remise' : 'Discount' }}</td><td class="price">-{{ $money($document->discount_amount) }}</td></tr>@endif
@if($showTax)<tr><td>{{ $fr ? 'TVA' : 'Tax' }} ({{ $document->tax_percent }}%)</td><td class="price">{{ $money($totals['tax_amount']) }}</td></tr>@endif
<tr class="total"><td>TOTAL :</td><td class="price">{{ $money($totals['total_amount']) }}</td></tr>
@if($paid || $credited)
@if($paid)<tr><td>{{ $fr ? 'Paiements reçus' : 'Payments received' }}</td><td class="price">{{ $money($paid) }}</td></tr>@endif
@if($credited)<tr><td>{{ $fr ? 'Avoirs' : 'Credits' }}</td><td class="price">{{ $money($credited) }}</td></tr>@endif
<tr><td>{{ $fr ? 'Solde dû' : 'Balance due' }}</td><td class="price">{{ $money($document->balanceAmount()) }}</td></tr>
@endif
</table>
@if($document->terms)<div class="terms"><strong>{{ $fr ? 'CONDITIONS' : 'TERMS' }}</strong><br>{{ $document->terms }}</div>@endif
@if(!empty($issuer['payment_instructions']))<div class="bank"><strong>{{ $fr ? 'COORDONNÉES BANCAIRES / PAIEMENT' : 'BANK / PAYMENT DETAILS' }}</strong><div class="details">{{ $issuer['payment_instructions'] }}</div></div>@endif
</body></html>
