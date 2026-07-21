<?php

namespace App\Http\Requests\Purchase;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\PurchaseOrderPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->selectedCompanyId();

        if ($companyId === null) {
            return ['ordered_at' => ['required']];
        }

        return PurchaseOrderPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{
     *     company_id: string,
     *     ordered_at: string,
     *     supplier_id: string,
     *     purchase_order_status_id: string,
     *     user_id: string,
     *     details: list<array{product_id: string, quantity: int, unit_price: string, total: string}>,
     *     total: string
     * }
     */
    public function purchaseOrderPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return PurchaseOrderPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            (string) $this->user()?->id,
            $validated,
        );
    }
}
