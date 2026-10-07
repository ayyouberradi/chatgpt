<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\BillingScheduleResource;
use App\Services\RecurringBilling;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageBillingSchedules extends ManageRecords
{
    protected static string $resource = BillingScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->using(fn (array $data) => app(RecurringBilling::class)->create($data))];
    }
}
