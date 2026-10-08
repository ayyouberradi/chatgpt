<x-filament-widgets::widget>
    <x-filament::section heading="Today" :description="now('Africa/Casablanca')->format('l, d F Y').' · Your next actions'">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            @foreach($this->agenda() as $section)
                <div>
                    <h3 class="font-semibold text-gray-950 dark:text-white">{{ $section['title'] }} ({{ $section['count'] }})</h3>
                    <ul class="mt-3 space-y-3">
                        @forelse($section['items'] as $item)
                            <li>
                                <a href="{{ $item['url'] }}" class="text-primary-600 dark:text-primary-400 underline">{{ $item['title'] }}</a>
                                <p class="text-sm text-gray-600 dark:text-gray-400 break-words">{{ $item['detail'] }}</p>
                            </li>
                        @empty
                            <li class="text-sm text-gray-600 dark:text-gray-400">Nothing needs attention here.</li>
                        @endforelse
                    </ul>
                    <a href="{{ $section['url'] }}" class="mt-3 inline-block text-sm text-primary-600 dark:text-primary-400 underline">Open {{ $section['title'] }}</a>
                    @if($section['count'] > 5)<p class="text-sm text-gray-500">Showing the first 5 of {{ $section['count'] }}.</p>@endif
                </div>
            @endforeach
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
