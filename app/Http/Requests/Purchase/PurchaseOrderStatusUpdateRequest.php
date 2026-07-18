<?php

namespace App\Http\Requests\Purchase;

use App\Models\Purchase\PurchaseOrderStatus;
use App\Support\Validation\PurchaseOrderStatusPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderStatusUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = data_get($this->session()->get('company_selected'), 'id');
        $purchaseOrderStatus = $this->route('purchase_order_status');

        if (! is_string($companyId) || $companyId === '' || ! $purchaseOrderStatus instanceof PurchaseOrderStatus) {
            return ['name' => ['required']];
        }

        return PurchaseOrderStatusPayloadValidationRules::updateRules($companyId, (string) $purchaseOrderStatus->id);
    }

    /**
     * @return array{name: string, color: string}
     */
    public function purchaseOrderStatusPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return PurchaseOrderStatusPayloadValidationRules::updatePayload($validated);
    }
}
