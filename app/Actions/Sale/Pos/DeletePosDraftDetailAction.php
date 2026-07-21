<?php

namespace App\Actions\Sale\Pos;

use App\Actions\Sale\SaleDocuments\RecalculateSaleDocumentTotalsAction;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocumentDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class DeletePosDraftDetailAction
{
    public function __construct(
        private RecalculateSaleDocumentTotalsAction $recalculate,
        private LoadCustomerDraftAttentionsForPosAction $loadCart,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function execute(
        Customer $customer,
        SaleDocumentDetail $detail,
        ?string $userId = null,
    ): array {
        return DB::transaction(function () use ($customer, $detail, $userId): array {
            $detail->loadMissing('saleDocument');
            $document = $detail->saleDocument;

            if (
                $document === null
                || $document->company_id !== $customer->company_id
                || $document->customer_id !== $customer->id
            ) {
                throw ValidationException::withMessages([
                    'detail' => 'El detalle no pertenece al cliente.',
                ]);
            }

            if ($document->status !== SaleDocumentStatus::Draft) {
                throw ValidationException::withMessages([
                    'sale_document' => 'Solo se pueden editar documentos en borrador.',
                ]);
            }

            $detail->delete();

            $document->update(['updated_by_user_id' => $userId]);
            $this->recalculate->execute($document->fresh(['details']));

            return $this->loadCart->execute($customer->fresh());
        });
    }
}
