<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\SiiCafs\DeleteSiiCafAction;
use App\Actions\Sale\SiiCafs\ListSiiCafsForCompanyAction;
use App\Actions\Sale\SiiCafs\UploadSiiCafAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\SiiCafListRequest;
use App\Http\Requests\Sale\SiiCafUploadRequest;
use App\Models\Company;
use App\Models\Sale\SiiCaf;
use App\Models\Sale\SiiCafFolio;
use App\Models\Shared\SiiTaxDocumentType;
use App\Support\Sale\CompanySiiBoletaCertificationReadiness;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class SiiCafsController extends Controller
{
    public function index(
        SiiCafListRequest $request,
        ListSiiCafsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', SiiCaf::class);

        $company = $this->resolveCompany($request);
        $readiness = $company instanceof Company
            ? CompanySiiBoletaCertificationReadiness::assess($company)
            : ['ready' => false, 'missing_keys' => []];

        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        $documentTypes = SiiTaxDocumentType::query()
            ->where('use_sale', true)
            ->orderBy('code')
            ->get(['id', 'name', 'code'])
            ->map(fn (SiiTaxDocumentType $t): array => [
                'id' => $t->id,
                'name' => $t->name,
                'code' => $t->code,
            ])
            ->values()
            ->all();

        $foliosForModal = null;
        if ($company instanceof Company && is_string($filters['folios_for'] ?? null)) {
            $foliosForModal = $this->foliosModalPayload($company->id, $filters['folios_for']);
        }

        return Inertia::render('sale/sii-cafs/index', [
            'sii_ready' => $readiness['ready'],
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'document_types' => $documentTypes,
            'folios_for_modal' => $foliosForModal,
            'can' => [
                'upload' => $request->user()?->can('create', SiiCaf::class) ?? false,
                'delete' => $request->user()?->can('deleteAny', SiiCaf::class) ?? false,
            ],
        ]);
    }

    public function store(SiiCafUploadRequest $request, UploadSiiCafAction $action): RedirectResponse
    {
        $this->authorize('create', SiiCaf::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['xml_file' => 'Debes seleccionar una empresa para subir CAFs.']);
        }

        if (! CompanySiiBoletaCertificationReadiness::assess($company)['ready']) {
            return back()->withErrors(['xml_file' => 'La integración SII de la empresa no está completa.']);
        }

        try {
            $action->execute($company, $request->xmlFileContents());
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['xml_file' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'CAF SII cargado correctamente.']);

        return to_route('sale.sii-cafs.index');
    }

    public function destroy(Request $request, SiiCaf $siiCaf, DeleteSiiCafAction $action): RedirectResponse
    {
        $this->authorize('delete', $siiCaf);

        $action->execute($siiCaf);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'CAF SII eliminado.']);

        return to_route('sale.sii-cafs.index');
    }

    private function resolveCompany(Request $request): ?Company
    {
        $id = data_get($request->session()->get('company_selected'), 'id');

        if (! is_string($id) || $id === '') {
            return null;
        }

        return Company::query()->find($id);
    }

    /**
     * @return array{caf: array<string, mixed>, folios: list<array<string, mixed>>, truncated: bool}|null
     */
    private function foliosModalPayload(string $companyId, string $cafId): ?array
    {
        /** @var SiiCaf|null $caf */
        $caf = SiiCaf::query()
            ->forCompany($companyId)
            ->with('siiTaxDocumentType:id,name,code')
            ->whereKey($cafId)
            ->first();

        if ($caf === null) {
            return null;
        }

        $limit = 5000;
        /** @var Collection<int, SiiCafFolio> $folios */
        $folios = SiiCafFolio::query()
            ->where('sale_sii_caf_id', $caf->id)
            ->orderBy('folio_number')
            ->limit($limit + 1)
            ->get();

        $truncated = $folios->count() > $limit;
        if ($truncated) {
            $folios = $folios->take($limit);
        }

        return [
            'caf' => [
                'id' => $caf->id,
                'folio_from' => $caf->folio_from,
                'folio_to' => $caf->folio_to,
                'document_type_name' => $caf->siiTaxDocumentType?->name ?? '',
                'document_type_code' => $caf->siiTaxDocumentType?->code ?? $caf->sii_document_type_code,
            ],
            'folios' => $folios->map(fn (SiiCafFolio $f): array => [
                'id' => $f->id,
                'folio_number' => $f->folio_number,
                'status' => $f->status->value,
                'used_at' => $f->used_at?->toIso8601String(),
            ])->values()->all(),
            'truncated' => $truncated,
        ];
    }
}
