<x-filament-panels::page>
    <div class="flex flex-wrap items-end gap-4">
        <label>Month <input type="month" wire:model.live="month" class="block rounded-lg text-gray-950" aria-label="Report month"></label>
        <x-filament::button wire:click="export">Export CSV</x-filament::button>
    </div>
    <p>Invoices use their original document date. Receipts use the payment date. Outstanding and overdue amounts are today's balances on this month's invoices; archived and cancelled invoices are excluded from these balances. Archived documents and their payments remain in historical totals.</p>
    <x-filament::section heading="Monthly totals by currency">
        <div class="overflow-x-auto"><table class="w-full text-left"><thead><tr><th>Currency</th><th>Invoiced</th><th>Credit notes</th><th>Received</th><th>Outstanding today</th><th>Overdue today</th></tr></thead><tbody>
        @forelse($report['currencies'] as $currency => $totals)
            <tr><td class="py-3">{{ $currency }}</td>@foreach($totals as $amount)<td>{{ \App\Support\Money::decimal($amount) }}</td>@endforeach</tr>
        @empty<tr><td colspan="6">No activity for this month.</td></tr>@endforelse
        </tbody></table></div>
    </x-filament::section>
    <x-filament::section heading="By client">
        <div class="overflow-x-auto"><table class="w-full text-left"><thead><tr><th>Client</th><th>Currency</th><th>Invoiced</th><th>Credits</th><th>Received</th><th>Outstanding today</th><th>Overdue today</th></tr></thead><tbody>
        @foreach($report['clients'] as $client)<tr><td class="py-3">{{ $client['name'] }}</td><td>{{ $client['currency'] }}</td>@foreach(['invoiced', 'credits', 'received', 'outstanding', 'overdue'] as $field)<td>{{ \App\Support\Money::decimal($client[$field]) }}</td>@endforeach</tr>@endforeach
        </tbody></table></div>
    </x-filament::section>
    <x-filament::section heading="Billed services">
        <p>Invoice line amounts before invoice-level discounts and tax. Credit notes are shown separately above.</p>
        <div class="overflow-x-auto"><table class="w-full text-left"><thead><tr><th>Service</th><th>Currency</th><th>Billed amount</th></tr></thead><tbody>
        @foreach($report['services'] as $service)<tr><td class="py-3">{{ $service['name'] }}</td><td>{{ $service['currency'] }}</td><td>{{ \App\Support\Money::decimal($service['amount']) }}</td></tr>@endforeach
        </tbody></table></div>
    </x-filament::section>
    <p>CSV contains separate invoice, credit-note and payment entries. Their amounts represent different activity; do not sum all entry types together.</p>
</x-filament-panels::page>
