<?php

namespace App\Actions\Sale\Pos;

use App\Actions\Sale\SaleDocuments\RecalculateSaleDocumentTotalsAction;
use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocumentDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class UpdatePosDraftDetailAction
{
    public function __construct(
        private RecalculateSaleDocumentTotalsAction $recalculate,
        private LoadCustomerDraftAttentionsForPosAction $loadCart,
    ) {}

    /**
     * @param  array{quantity?: int, discount_percent?: float|int|string, notes?: string|null}  $data
     * @return array<string, mixed>
     */
    public function execute(
        Customer $customer,
        SaleDocumentDetail $detail,
        array $data,
        ?string $userId = null,
    ): array {
        return DB::transaction(function () use ($customer, $detail, $data, $userId): array {
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

            $updates = [];

            if (array_key_exists('quantity', $data)) {
                if ($detail->detail_type === SaleDocumentDetailType::Service) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Solo se puede cambiar la cantidad de productos.',
                    ]);
                }

                $updates['quantity'] = max(1, (int) $data['quantity']);
            }

            if (array_key_exists('discount_percent', $data)) {
                $updates['discount_percent'] = max(0, min(100, (float) $data['discount_percent']));
            }

            if (array_key_exists('notes', $data)) {
                $notes = $data['notes'];
                $updates['notes'] = is_string($notes) && trim($notes) !== ''
                    ? trim($notes)
                    : null;
            }

            if ($updates === []) {
                return $this->loadCart->execute($customer->fresh());
            }

            $detail->update($updates);
            $document->update(['updated_by_user_id' => $userId]);
            $this->recalculate->execute($document->fresh(['details']));

            return $this->loadCart->execute($customer->fresh());
        });
    }
}
