@php
$fr=$document->language==='fr';
$labels=$fr?['quote'=>'DEVIS','invoice'=>'FACTURE','contract'=>'CONTRAT','credit_note'=>'AVOIR']:['quote'=>'QUOTE','invoice'=>'INVOICE','contract'=>'SERVICE AGREEMENT','credit_note'=>'CREDIT NOTE'];
$money=fn($v)=>\App\Support\Money::decimal((int)$v).' '.$document->currency;
@endphp
<!doctype html><html lang="{{ $document->language }}"><head><meta charset="utf-8"><style>
@page { margin: 38px; } body{font-family:DejaVu Sans,sans-serif;font-size:10px;color:#202238;line-height:1.5}h1{font-size:23px;color:#4338ca}h2{font-size:13px} .muted{color:#677080}.draft{padding:10px;border:1px solid #f59e0b;color:#92400e;margin-bottom:16px}.identity{width:100%;margin-bottom:24px}.identity td{width:50%;vertical-align:top;padding-right:14px}table.lines{width:100%;border-collapse:collapse}.lines th{background:#eef2ff;text-align:left;padding:8px}.lines td{padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top}.amount{text-align:right}.scope{white-space:pre-line;font-size:9px;color:#596079}.terms{white-space:pre-line}.totals{width:50%;margin-left:50%;margin-top:15px}.totals td{padding:5px}.total{background:#eef2ff;font-weight:bold}footer{margin-top:24px;font-size:9px}.signatures{margin-top:40px;width:100%}
</style></head><body>
@if(!$document->issued_at)<div class="draft">{{ $fr?'BROUILLON — document non émis':'DRAFT — not issued' }}</div>@endif
<h1>{{ $labels[$document->type] }}</h1><div>{{ $document->display_number }} · {{ ($document->issued_at??$document->created_at)->format('d/m/Y') }}</div><h2>{{ $document->title }}</h2>
<table class="identity"><tr><td><strong>{{ $issuer['legal_name']??($fr?'Émetteur à configurer':'Configure issuer identity') }}</strong><div class="terms">{{ $issuer['address']??'' }}</div>{{ $issuer['email']??'' }}<br>{{ $issuer['phone']??'' }}<br>{{ $issuer['business_type']??'' }}
@if(!empty($issuer['tax_identifier']))<br>{{ $fr?'Identifiant fiscal':'Tax identifier' }}: {{ $issuer['tax_identifier'] }}@endif
@if(!empty($issuer['registration_number']))<br>{{ $fr?'Immatriculation':'Registration' }}: {{ $issuer['registration_number'] }}@endif
</td><td><strong>{{ $client['company']?:$client['name'] }}</strong>@if(!empty($client['company']))<br>{{ $client['name'] }}@endif<div class="terms">{{ $client['address']??'' }}</div>{{ $client['email']??'' }}<br>{{ $client['phone']??'' }}
@if(!empty($client['tax_identifier']))<br>{{ $fr?'Identifiant fiscal':'Tax identifier' }}: {{ $client['tax_identifier'] }}@endif</td></tr></table>
@if($document->source)<p>{{ $fr?'Référence':'Reference' }}: {{ $document->source->number }}</p>@endif
@if($document->due_on)<p>{{ $document->type==='quote'?($fr?'Valable jusqu’au':'Valid until'):($fr?'Échéance':'Due date') }}: {{ $document->due_on->format('d/m/Y') }}</p>@endif
<p>{{ $fr?'Périodicité':'Billing period' }}: {{ ['one_time'=>$fr?'Prestation unique':'One-time','monthly'=>$fr?'Mensuelle':'Monthly','yearly'=>$fr?'Annuelle':'Yearly'][$document->billing_period] }}</p>
<table class="lines"><thead><tr><th>{{ $fr?'Prestation / livrables':'Service / deliverables' }}</th><th>{{ $fr?'Quantité':'Quantity' }}</th><th>{{ $fr?'Prix unitaire':'Unit price' }}</th><th>{{ $fr?'Montant':'Amount' }}</th></tr></thead><tbody>@foreach($document->items as $item)<tr><td><strong>{{ $item->description }}</strong><div class="scope">{{ $item->scope }}</div></td><td>{{ $item->quantity }}</td><td>{{ $money($item->unit_amount) }}</td><td class="amount">{{ $money($item->lineAmount()) }}</td></tr>@endforeach</tbody></table>
<table class="totals"><tr><td>{{ $fr?'Sous-total':'Subtotal' }}</td><td class="amount">{{ $money($totals['subtotal_amount']) }}</td></tr>@if($document->discount_amount)<tr><td>{{ $fr?'Remise':'Discount' }}</td><td class="amount">-{{ $money($document->discount_amount) }}</td></tr>@endif<tr><td>{{ $fr?'Taxe':'Tax' }} ({{ $document->tax_percent }}%)</td><td class="amount">{{ $money($totals['tax_amount']) }}</td></tr><tr class="total"><td>Total</td><td class="amount">{{ $money($totals['total_amount']) }}</td></tr>
@if($document->type==='invoice'&&$document->issued_at)<tr><td>{{ $fr?'Paiements reçus':'Payments received' }}</td><td class="amount">{{ $money($document->paidAmount()) }}</td></tr><tr><td>{{ $fr?'Avoirs':'Credits' }}</td><td class="amount">{{ $money($document->creditAmount()) }}</td></tr><tr><td>{{ $fr?'Solde dû':'Balance due' }}</td><td class="amount">{{ $money($document->balanceAmount()) }}</td></tr>@endif</table>
@if($document->terms)<h2>{{ $fr?'Conditions':'Terms' }}</h2><div class="terms">{{ $document->terms }}</div>@endif
@if(!empty($issuer['payment_instructions']))<h2>{{ $fr?'Instructions de paiement':'Payment instructions' }}</h2><div class="terms">{{ $issuer['payment_instructions'] }}</div>@endif
@if($document->type==='contract')<table class="signatures"><tr><td>{{ $fr?'Signature du prestataire':'Provider signature' }}<br><br>________________________</td><td>{{ $fr?'Signature du client et date':'Client signature and date' }}<br><br>________________________</td></tr></table>@endif
<footer>{{ $document->display_number }} · {{ $issuer['legal_name']??'' }}</footer>
</body></html>
