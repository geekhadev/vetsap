<?php

namespace App\Http\Requests\Purchase;

use App\Models\Purchase\ExpenseType;
use App\Support\Validation\ExpenseTypePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ExpenseTypeUpdateRequest extends FormRequest
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
        $expenseType = $this->route('expense_type');

        if (! is_string($companyId) || $companyId === '' || ! $expenseType instanceof ExpenseType) {
            return ['name' => ['required']];
        }

        return ExpenseTypePayloadValidationRules::updateRules($companyId, (string) $expenseType->id);
    }

    /**
     * @return array{name: string, abbreviation: string}
     */
    public function expenseTypePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ExpenseTypePayloadValidationRules::updatePayload($validated);
    }
}
