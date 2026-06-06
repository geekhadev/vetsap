<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\CertificationSiiTickets\CreateCertificationSiiTicketAction;
use App\Actions\Sale\CertificationSiiTickets\ListCertificationSiiTicketsForCompanyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\CertificationSiiTicketsRequest;
use App\Models\Company;
use App\Models\Sale\CertificationSiiTicket;
use App\Support\Sale\CompanySiiBoletaCertificationReadiness;
use App\Support\Storage\CompanyPrivateStorageLayout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CertificationSiiTicketsController extends Controller
{
    public function index(Request $request, ListCertificationSiiTicketsForCompanyAction $list): Response
    {
        $this->authorize('viewAny', CertificationSiiTicket::class);

        $company = $this->resolveCompany($request);
        $readiness = $company instanceof Company
            ? CompanySiiBoletaCertificationReadiness::assess($company)
            : ['ready' => false, 'missing_keys' => []];

        $tickets = [];
        if ($company instanceof Company && $readiness['ready']) {
            $tickets = $list->execute($company)->map(fn (CertificationSiiTicket $t): array => [
                'id' => $t->id,
                'number' => $t->number,
                'created_at' => $t->created_at?->toIso8601String(),
                'dte_init' => $t->dte_init,
                'dte_end' => $t->dte_end,
            ])->values()->all();
        }

        return Inertia::render('sale/certification-sii-tickets/index', [
            'sii_ready' => $readiness['ready'],
            'tickets' => $tickets,
        ]);
    }

    public function store(CertificationSiiTicketsRequest $request, CreateCertificationSiiTicketAction $action): RedirectResponse
    {
        $this->authorize('create', CertificationSiiTicket::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['caf' => 'Debes seleccionar una empresa para certificar.']);
        }

        $readiness = CompanySiiBoletaCertificationReadiness::assess($company);
        if (! $readiness['ready']) {
            return back()->withErrors(['caf' => 'La integración SII de la empresa no está completa.']);
        }

        try {
            $action->execute($request->user(), $company, $request->cafXml(), $request->parsedCaf());
        } catch (RuntimeException $e) {
            return back()->withErrors(['caf' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Certificación generada y guardada.']);

        return to_route('sale.sii-certification-tickets.index');
    }

    public function download(Request $request, CertificationSiiTicket $certificationSiiTicket, string $kind): StreamedResponse
    {
        $this->authorize('view', $certificationSiiTicket);

        $company = $this->resolveCompany($request);
        if (! $company instanceof Company || $certificationSiiTicket->company_id !== $company->id) {
            abort(403);
        }

        $column = match ($kind) {
            'caf' => 'file_caf',
            'envio_dte' => 'file_envio_dte',
            'consumo_folios' => 'file_consumo_folios',
        };

        $relative = $certificationSiiTicket->{$column};
        if (! is_string($relative) || $relative === '') {
            abort(404);
        }

        if (! CompanyPrivateStorageLayout::certificationArtifactBelongsToTicket(
            $company->id,
            $certificationSiiTicket->id,
            $relative,
        )) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($relative)) {
            abort(404);
        }

        $downloadName = match ($kind) {
            'caf' => 'CAF.xml',
            'envio_dte' => 'EnvioDTE.xml',
            'consumo_folios' => 'ConsumoFolios.xml',
            default => 'documento.xml',
        };

        return Storage::disk('local')->download($relative, $downloadName);
    }
}
