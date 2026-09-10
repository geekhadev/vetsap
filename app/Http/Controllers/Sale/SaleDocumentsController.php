<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\SaleDocuments\BuildSaleDocumentChargeContextAction;
use App\Actions\Sale\SaleDocuments\BuildSaleDocumentPaymentsAction;
use App\Actions\Sale\SaleDocuments\BuildSaleDocumentPreviewAction;
use App\Actions\Sale\SaleDocuments\ChargeSaleDocumentFromListAction;
use App\Actions\Sale\SaleDocuments\DeleteSaleDocumentAction;
use App\Actions\Sale\SaleDocuments\ListSaleDocumentsForCompanyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\SaleDocumentChargeRequest;
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

    public function payments(
        Request $request,
        SaleDocument $saleDocument,
        BuildSaleDocumentPaymentsAction $buildPayments,
    ): JsonResponse {
        $this->authorize('view', $saleDocument);

        $canCreate = $request->user()?->can('create', SaleDocument::class) ?? false;

        return response()->json([
            'data' => $buildPayments->execute($saleDocument, $canCreate),
        ]);
    }

    public function chargeContext(
        Request $request,
        SaleDocument $saleDocument,
        BuildSaleDocumentChargeContextAction $buildContext,
    ): JsonResponse {
        $this->authorize('view', $saleDocument);
        $this->authorize('create', SaleDocument::class);

        $canCreate = $request->user()?->can('create', SaleDocument::class) ?? false;

        return response()->json([
            'data' => $buildContext->execute($saleDocument, $canCreate),
        ]);
    }

    public function charge(
        SaleDocumentChargeRequest $request,
        SaleDocument $saleDocument,
        ChargeSaleDocumentFromListAction $action,
    ): JsonResponse {
        $this->authorize('view', $saleDocument);
        $this->authorize('create', SaleDocument::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return response()->json(['message' => 'Debes seleccionar una empresa.'], 422);
        }

        $userId = $request->user()?->id;
        if (! is_string($userId) || $userId === '') {
            abort(403);
        }

        $document = $action->execute(
            $saleDocument,
            $company->id,
            $userId,
            $request->chargePayload(),
        );

        return response()->json([
            'data' => [
                'id' => $document->id,
                'total_amount' => (int) $document->total_amount,
                'paid_amount' => (int) $document->paid_amount,
            ],
        ]);
    }

    public function destroy(
        Request $request,
        SaleDocument $saleDocument,
        DeleteSaleDocumentAction $action,
    ): JsonResponse {
        $this->authorize('delete', $saleDocument);

        $id = $saleDocument->id;
        $userId = $request->user()?->id;

        if (! is_string($userId) || $userId === '') {
            abort(403);
        }

        $action->execute($saleDocument, $userId);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Documento de venta eliminado.',
        ]);

        return response()->json([
            'data' => ['id' => $id],
        ]);
    }
}
