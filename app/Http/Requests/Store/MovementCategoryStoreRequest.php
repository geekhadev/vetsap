<?php

namespace App\Http\Requests\Store;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\MovementCategoryPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MovementCategoryStoreRequest extends FormRequest
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

        return MovementCategoryPayloadValidationRules::storeRules(
            $companyId,
            is_string($this->input('type')) ? $this->input('type') : null,
        );
    }

    /**
     * @return array{company_id: string|null, name: string, type: string, is_active: bool}
     */
    public function movementCategoryPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return MovementCategoryPayloadValidationRules::storePayload(
            $this->selectedCompanyId(),
            $validated,
        );
    }
}
