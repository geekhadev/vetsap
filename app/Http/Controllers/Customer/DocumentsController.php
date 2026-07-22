<?php

namespace App\Http\Controllers\Customer;

use App\Actions\Customer\Documents\ListSaleDocumentsForCustomerUserAction;
use App\Actions\Sale\SaleDocuments\BuildSaleDocumentPreviewAction;
use App\Enums\Sale\SaleDocumentStatus;
use App\Http\Controllers\Controller;
use App\Models\Sale\SaleDocument;
use App\Models\User;
use App\Support\SelectedCompanySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DocumentsController extends Controller
{
    public function index(
        Request $request,
        ListSaleDocumentsForCustomerUserAction $listDocuments,
    ): Response {
        $user = $request->user();
        assert($user instanceof User);

        $documents = $listDocuments->execute(
            $user,
            SelectedCompanySession::selectedCompanyId($request),
        );

        return Inertia::render('customer/documents/index', [
            'documents' => $documents,
        ]);
    }

    public function show(
        Request $request,
        SaleDocument $saleDocument,
        BuildSaleDocumentPreviewAction $buildPreview,
    ): JsonResponse {
        $user = $request->user();
        assert($user instanceof User);

        $this->assertDocumentBelongsToCustomerUser($user, $saleDocument);

        if (! in_array($saleDocument->status, [SaleDocumentStatus::Issued, SaleDocumentStatus::Voided], true)) {
            throw new NotFoundHttpException;
        }

        return response()->json([
            'data' => [
                ...$buildPreview->execute($saleDocument),
                'can' => [
                    'delete' => false,
                ],
            ],
        ]);
    }

    private function assertDocumentBelongsToCustomerUser(User $user, SaleDocument $saleDocument): void
    {
        $saleDocument->loadMissing('customer:id,user_id');

        if ($saleDocument->customer?->user_id !== $user->id) {
            throw new NotFoundHttpException;
        }
    }
}
