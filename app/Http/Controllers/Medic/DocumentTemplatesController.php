<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\DocumentTemplates\CreateDocumentTemplateAction;
use App\Actions\Medic\DocumentTemplates\DeleteDocumentTemplateAction;
use App\Actions\Medic\DocumentTemplates\ListDocumentTemplatesForCompanyAction;
use App\Actions\Medic\DocumentTemplates\UpdateDocumentTemplateAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\DocumentTemplateListRequest;
use App\Http\Requests\Medic\DocumentTemplateStoreRequest;
use App\Http\Requests\Medic\DocumentTemplateUpdateRequest;
use App\Models\Company;
use App\Models\Medic\DocumentTemplate;
use App\Support\Medic\DocumentTemplateVariables;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTemplatesController extends Controller
{
    public function index(
        DocumentTemplateListRequest $request,
        ListDocumentTemplatesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', DocumentTemplate::class);

        $company = $this->resolveCompany($request);
        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        $user = $request->user();

        return Inertia::render('medic/document-templates/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'variables' => DocumentTemplateVariables::catalog(),
            'can' => [
                'create' => $user?->can('create', DocumentTemplate::class) ?? false,
                'update' => $user?->can('updateAny', DocumentTemplate::class) ?? false,
                'delete' => $user?->can('deleteAny', DocumentTemplate::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', DocumentTemplate::class);

        return to_route('medic.document-templates.index');
    }

    public function store(
        DocumentTemplateStoreRequest $request,
        CreateDocumentTemplateAction $action,
    ): RedirectResponse {
        $this->authorize('create', DocumentTemplate::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['title' => 'Debes seleccionar una empresa para crear plantillas.']);
        }

        $action->execute($request->templatePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plantilla creada correctamente.']);

        return to_route('medic.document-templates.index');
    }

    public function edit(DocumentTemplate $document_template): RedirectResponse
    {
        $this->authorize('update', $document_template);

        return to_route('medic.document-templates.index');
    }

    public function update(
        DocumentTemplateUpdateRequest $request,
        DocumentTemplate $document_template,
        UpdateDocumentTemplateAction $action,
    ): RedirectResponse {
        $this->authorize('update', $document_template);

        $action->execute($document_template, $request->templatePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plantilla actualizada correctamente.']);

        return to_route('medic.document-templates.index');
    }

    public function destroy(
        DocumentTemplate $document_template,
        DeleteDocumentTemplateAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $document_template);

        $action->execute($document_template);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plantilla eliminada.']);

        return to_route('medic.document-templates.index');
    }
}
