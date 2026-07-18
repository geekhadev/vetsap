<?php

namespace App\Http\Requests\Purchase;

use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Purchase\Expense;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExpenseListRequest extends FormRequest
{
    use InteractsWithPaginatedListQuery;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', Rule::in(Expense::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'expense_type_id' => ['nullable', 'string', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('sort')) {
            $this->merge([
                'sort' => 'spent_at',
                'direction' => $this->input('direction', 'desc'),
            ]);
        }

        $this->prepareStandardListQuery();

        if ($this->input('expense_type_id') === '') {
            $this->merge(['expense_type_id' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForAction(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return [
            ...$this->standardListFiltersForAction($validated),
            'expense_type_id' => $validated['expense_type_id'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            'expense_type_id' => $this->input('expense_type_id') ?? '',
        ];
    }
}
