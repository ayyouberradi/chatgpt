<x-filament-widgets::widget>
    <x-filament::section heading="Your client workflow">
        @if(\App\Models\BusinessSetting::current()->tax_mode==='not_configured')
            <p>Start by completing your business identity and tax settings. Review service prices and approve complete contract terms before issuing documents.</p>
        @else
            <p>Review enquiries, prepare a scoped quote, record acceptance, then create an invoice and an optional service-specific contract. Record payments when received.</p>
        @endif
        <br>
        <x-filament::button tag="a" href="/manage/settings" color="gray">Business settings</x-filament::button>
        <x-filament::button tag="a" href="/manage/leads" color="gray">Enquiries</x-filament::button>
        <x-filament::button tag="a" href="/manage/quotes">Quotes</x-filament::button>
    </x-filament::section>
</x-filament-widgets::widget>
