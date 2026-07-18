<?php

namespace App\Http\Requests\Purchase;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ExpenseTypePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ExpenseTypeStoreRequest extends FormRequest
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

        return ExpenseTypePayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, name: string, abbreviation: string, is_global: bool}
     */
    public function expenseTypePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ExpenseTypePayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
