<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use App\Models\ClientPortalAccess;
use App\Models\User;
use App\Services\DocumentWorkflow;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientPortalController extends Controller
{
    private function protect($response)
    {
        return $response->header('Cache-Control', 'private, no-store')->header('Referrer-Policy', 'no-referrer')->header('X-Robots-Tag', 'noindex, nofollow')->header('X-Frame-Options', 'SAMEORIGIN');
    }

    private function access(Request $request): ClientPortalAccess
    {
        $access = ClientPortalAccess::with('client')->whereNull('revoked_at')->where('expires_at', '>', now())->find($request->session()->get('client_portal_access'));
        abort_unless($access && $access->client?->is_active, 403, 'This client link has expired or been revoked. Request a new link from your project contact.');

        return $access;
    }

    private function documents(ClientPortalAccess $access)
    {
        return BusinessDocument::where('business_client_id', $access->business_client_id)->whereNotNull('issued_at')->whereNull('archived_at')->where('status', '!=', 'cancelled')->whereIn('type', ['quote', 'contract', 'invoice', 'credit_note']);
    }

    public function enter(Request $request, string $token)
    {
        abort_unless(strlen($token) === 64, 404);
        $access = ClientPortalAccess::with('client')->where('token_hash', hash('sha256', $token))->whereNull('revoked_at')->where('expires_at', '>', now())->first();
        abort_unless($access && $access->client?->is_active, 404);
        $request->session()->regenerate();
        $request->session()->put('client_portal_access', $access->id);

        return $this->protect(redirect()->route('portal.home'));
    }

    public function home(Request $request)
    {
        $access = $this->access($request);
        $client = $access->client;
        $documents = $this->documents($access)->with('items', 'source')->orderByDesc('issued_at')->orderByDesc('id')->get();
        $balances = [];
        foreach ($documents->where('type', 'invoice') as $invoice) {
            $balances[$invoice->currency] = ($balances[$invoice->currency] ?? 0) + $invoice->balanceAmount();
        }
        $projects = $client->leads()->select('id', 'service', 'status')->get();
        $company = BusinessSetting::current();

        return $this->protect(response()->view('portal.home', compact('client', 'documents', 'balances', 'projects', 'company')));
    }

    public function pdf(Request $request, int $id)
    {
        $access = $this->access($request);
        $document = $this->documents($access)->findOrFail($id);

        return $this->protect(app(BusinessPdfController::class)($document));
    }

    public function accept(Request $request, int $id)
    {
        $access = $this->access($request);
        $request->validate(['agreement' => 'required|accepted']);
        DB::transaction(function () use ($access, $id) {
            $access = ClientPortalAccess::lockForUpdate()->findOrFail($access->id);
            abort_if($access->revoked_at || $access->expires_at->isPast() || ! $access->client()->where('is_active', true)->exists(), 403);
            $document = $this->documents($access)->where('type', 'quote')->lockForUpdate()->findOrFail($id);
            $document = app(DocumentWorkflow::class)->accept($document, 'client_portal');
            AuditEvent::record('portal.quote_accepted', $document, ['portal_access_id' => $access->id]);
            foreach (User::where('role', 'admin')->get() as $admin) {
                $admin->notifyNow(Notification::make()->title('Client accepted a quote')->body('Quote N°'.$document->number.' has been accepted in the client portal.')->actions([Action::make('quotes')->label('View quotes')->url('/manage/quotes')])->toDatabase());
            }
        }, 5);

        return $this->protect(redirect()->route('portal.home')->with('portal_success', 'accepted'));
    }

    public function leave(Request $request)
    {
        $request->session()->forget('client_portal_access');
        $request->session()->regenerateToken();

        return $this->protect(redirect('/'));
    }
}
