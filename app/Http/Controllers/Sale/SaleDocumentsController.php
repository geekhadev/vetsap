<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\SaleDocuments\BuildSaleDocumentPreviewAction;
use App\Actions\Sale\SaleDocuments\DeleteSaleDocumentAction;
use App\Actions\Sale\SaleDocuments\ListSaleDocumentsForCompanyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\SaleDocumentListRequest;
use App\Models\Company;
use App\Models\Sale\SaleDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class SaleDocumentsController extends Controller
{
    public function index(
        SaleDocumentListRequest $request,
        ListSaleDocumentsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', SaleDocument::class);

        $company = $this->resolveCompany($request);
        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        return Inertia::render('sale/sale-documents/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $request->user()?->can('create', SaleDocument::class) ?? false,
            ],
        ]);
    }

    public function show(
        Request $request,
        SaleDocument $saleDocument,
        BuildSaleDocumentPreviewAction $buildPreview,
    ): JsonResponse {
        $this->authorize('view', $saleDocument);

        return response()->json([
            'data' => [
                ...$buildPreview->execute($saleDocument),
                'can' => [
                    'delete' => $request->user()?->can('delete', $saleDocument) ?? false,
                ],
            ],
        ]);
    }

    public function destroy(
        SaleDocument $saleDocument,
        DeleteSaleDocumentAction $action,
    ): JsonResponse {
        $this->authorize('delete', $saleDocument);

        $id = $saleDocument->id;
        $action->execute($saleDocument);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Documento de venta eliminado.',
        ]);

        return response()->json([
            'data' => ['id' => $id],
        ]);
    }
}
