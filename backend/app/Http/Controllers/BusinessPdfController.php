<?php

namespace App\Http\Controllers;

use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use Barryvdh\DomPDF\Facade\Pdf;

class BusinessPdfController extends Controller
{
    public function __invoke(BusinessDocument $document)
    {
        $document->load(['client', 'items', 'source']);
        $issuer = $document->issued_at ? $document->issuer_snapshot : BusinessSetting::current()->toArray();
        $client = $document->issued_at ? $document->client_snapshot : $document->client->toArray();
        $totals = $document->issued_at ? $document->only(['subtotal_amount', 'tax_amount', 'total_amount']) : $document->totals();

        $pdfTitle = $document->pdfTitle();

        return Pdf::loadView('business.document', compact('document', 'issuer', 'client', 'totals', 'pdfTitle'))->setPaper('a4')->setOption('isRemoteEnabled', false)->download($document->pdfFilename())->header('Cache-Control', 'private, no-store');
    }
}
