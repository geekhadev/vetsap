<?php

namespace App\Http\Requests\Purchase;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\PurchaseOrderPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderUpdateRequest extends FormRequest
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

        return PurchaseOrderPayloadValidationRules::updateRules($companyId);
    }

    /**
     * @return array{
     *     ordered_at: string,
     *     supplier_id: string,
     *     purchase_order_status_id: string,
     *     details: list<array{product_id: string, quantity: int, unit_price: string, total: string}>,
     *     total: string
     * }
     */
    public function purchaseOrderPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return PurchaseOrderPayloadValidationRules::updatePayload($validated);
    }
}
