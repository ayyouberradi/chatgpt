<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;

class BusinessStart extends Widget
{
    protected string $view = 'filament.widgets.business-start';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;

    protected static bool $isLazy = false;
}
