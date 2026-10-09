<?php

namespace Tests\Feature;

use App\Filament\Pages\FinancialReports;
use App\Models\BusinessClient;
use App\Models\BusinessDocument;
use App\Models\Payment;
use App\Models\User;
use App\Services\FinancialReport;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use Tests\TestCase;

class FinancialReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_reports_use_original_dates_separate_receipts_and_currencies_and_exclude_archived_balances(): void
    {
        $this->travelTo(now('Africa/Casablanca')->setDate(2026, 10, 9));
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        $client = BusinessClient::create(['company' => '=Client', 'currency' => 'MAD', 'language' => 'fr']);
        $make = function ($title, $currency, $date, $status = 'issued', $archived = false) use ($client) {
            $d = BusinessDocument::create(['type' => 'invoice', 'business_client_id' => $client->id, 'title' => $title, 'currency' => $currency, 'language' => 'fr', 'document_date' => $date, 'due_on' => '2026-09-30', 'total_amount' => 10000, 'status' => 'draft']);
            $d->items()->create(['description' => 'Design', 'quantity' => '1.000', 'unit_price' => '100.00']);
            DB::table('business_documents')->where('id', $d->id)->update(['issued_at' => $status === 'draft' ? null : now(), 'status' => $status, 'archived_at' => $archived ? now() : null, 'number' => 'N'.$d->id]);

            return $d->fresh();
        };
        $open = $make('Open', 'MAD', '2026-09-01');
        $archived = $make('Archived', 'MAD', '2026-09-30', 'paid', true);
        $euro = $make('Euro', 'EUR', '2026-09-30');
        $old = $make('Old', 'MAD', '2026-08-01');
        $make('Cancelled', 'MAD', '2026-09-01', 'cancelled');
        $make('Draft', 'MAD', '2026-09-01', 'draft');
        Payment::create(['business_document_id' => $open->id, 'amount' => 3000, 'paid_on' => '2026-10-01', 'method' => 'cash']);
        Payment::create(['business_document_id' => $archived->id, 'amount' => 10000, 'paid_on' => '2026-09-30', 'method' => 'cash']);
        Payment::create(['business_document_id' => $old->id, 'amount' => 5000, 'paid_on' => '2026-09-30', 'method' => 'cash']);
        Payment::create(['business_document_id' => $open->id, 'amount' => 1000, 'paid_on' => '2026-09-30', 'method' => 'cash', 'voided_at' => now()]);
        BusinessDocument::create(['type' => 'credit_note', 'business_client_id' => $client->id, 'source_document_id' => $open->id, 'title' => 'Credit', 'currency' => 'MAD', 'language' => 'fr', 'document_date' => '2026-09-30', 'issued_at' => now(), 'total_amount' => 2000]);
        $report = app(FinancialReport::class)->month('2026-09');
        $this->assertSame(['invoiced' => 20000, 'credits' => 2000, 'received' => 15000, 'outstanding' => 5000, 'overdue' => 5000], $report['currencies']['MAD']);
        $this->assertSame(10000, $report['currencies']['EUR']['outstanding']);
        $this->assertSame(20000, $report['services']['MAD|Design']['amount']);
        $this->assertCount(6, $report['rows']);
        Livewire::test(FinancialReports::class)->set('month', '2026-09')->assertSee('150.00')->call('export')->assertFileDownloaded('financial-report-2026-09.csv');
        $this->actingAs(User::factory()->create(['role' => 'user']));
        $this->get('/manage/financial-reports')->assertForbidden();
    }
}
