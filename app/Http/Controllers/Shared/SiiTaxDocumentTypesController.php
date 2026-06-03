<?php

namespace App\Http\Controllers\Shared;

use App\Actions\Shared\SiiTaxDocumentTypes\CreateSiiTaxDocumentTypeAction;
use App\Actions\Shared\SiiTaxDocumentTypes\DeleteSiiTaxDocumentTypeAction;
use App\Actions\Shared\SiiTaxDocumentTypes\ListSiiTaxDocumentTypesAction;
use App\Actions\Shared\SiiTaxDocumentTypes\UpdateSiiTaxDocumentTypeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shared\SiiTaxDocumentTypeListRequest;
use App\Http\Requests\Shared\SiiTaxDocumentTypesRequest;
use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiiTaxDocumentTypesController extends Controller
{
    public function index(SiiTaxDocumentTypeListRequest $request, ListSiiTaxDocumentTypesAction $action): Response
    {
        $this->authorize('viewAny', SiiTaxDocumentType::class);

        $rows = $action->execute($request->filtersForAction());

        return Inertia::render('shared/sii-tax-document-types/index', [
            'data' => $rows,
            'filters' => $request->filtersForFrontend(),
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', SiiTaxDocumentType::class);

        return to_route('shared.sii-tax-document-types.index');
    }

    public function store(SiiTaxDocumentTypesRequest $request, CreateSiiTaxDocumentTypeAction $action): RedirectResponse
    {
        $this->authorize('create', SiiTaxDocumentType::class);

        $action->execute($request->siiTaxDocumentTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de documento tributario creado.']);

        return to_route('shared.sii-tax-document-types.index');
    }

    public function edit(SiiTaxDocumentType $siiTaxDocumentType): RedirectResponse
    {
        $this->authorize('update', $siiTaxDocumentType);

        return to_route('shared.sii-tax-document-types.index');
    }

    public function update(SiiTaxDocumentTypesRequest $request, SiiTaxDocumentType $siiTaxDocumentType, UpdateSiiTaxDocumentTypeAction $action): RedirectResponse
    {
        $this->authorize('update', $siiTaxDocumentType);

        $action->execute($siiTaxDocumentType, $request->siiTaxDocumentTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de documento tributario actualizado.']);

        return to_route('shared.sii-tax-document-types.index');
    }

    public function destroy(SiiTaxDocumentType $siiTaxDocumentType, DeleteSiiTaxDocumentTypeAction $action): RedirectResponse
    {
        $this->authorize('delete', $siiTaxDocumentType);

        $action->execute($siiTaxDocumentType);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de documento tributario eliminado.']);

        return to_route('shared.sii-tax-document-types.index');
    }
}
