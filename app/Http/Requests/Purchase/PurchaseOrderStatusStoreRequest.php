<?php

namespace App\Http\Requests\Purchase;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\PurchaseOrderStatusPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PurchaseOrderStatusStoreRequest extends FormRequest
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
            return ['name' => ['required']];
        }

        return PurchaseOrderStatusPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, name: string, color: string, is_global: bool}
     */
    public function purchaseOrderStatusPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return PurchaseOrderStatusPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
