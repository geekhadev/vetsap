<?php

namespace App\Http\Requests\Purchase;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ExpensePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ExpenseUpdateRequest extends FormRequest
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
            return ['spent_at' => ['required']];
        }

        return ExpensePayloadValidationRules::updateRules($companyId);
    }

    /**
     * @return array{spent_at: string, expense_type_id: string, amount: string, reason: string}
     */
    public function expensePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ExpensePayloadValidationRules::updatePayload($validated);
    }
}
