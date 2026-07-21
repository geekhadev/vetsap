<?php

namespace App\Actions\Sale\Pos;

use App\Actions\Sale\SaleDocuments\EnsureOpenDraftSaleDocumentForCustomerAction;
use App\Actions\Sale\SaleDocuments\RecalculateSaleDocumentTotalsAction;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use Illuminate\Support\Facades\DB;

final class UpdatePosDraftGlobalDiscountAction
{
    public function __construct(
        private EnsureOpenDraftSaleDocumentForCustomerAction $ensureDraft,
        private RecalculateSaleDocumentTotalsAction $recalculate,
        private LoadCustomerDraftAttentionsForPosAction $loadCart,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function execute(
        Customer $customer,
        float $globalDiscountPercent,
        ?string $userId = null,
    ): array {
        return DB::transaction(function () use ($customer, $globalDiscountPercent, $userId): array {
            $percent = max(0, min(100, $globalDiscountPercent));

            $this->ensureDraft->execute($customer, $userId);

            $documents = SaleDocument::query()
                ->where('company_id', $customer->company_id)
                ->where('customer_id', $customer->id)
                ->where('status', SaleDocumentStatus::Draft)
                ->lockForUpdate()
                ->get();

            foreach ($documents as $document) {
                $document->update([
                    'global_discount_percent' => $percent,
                    'updated_by_user_id' => $userId,
                ]);

                $this->recalculate->execute($document->fresh(['details']));
            }

            return $this->loadCart->execute($customer->fresh());
        });
    }
}
