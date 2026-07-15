<?php

namespace App\Http\Requests\Store;

use App\Enums\Store\InventoryMovementType;
use App\Http\Requests\Concerns\InteractsWithIsActiveListFilter;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Store\MovementCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MovementCategoryListRequest extends FormRequest
{
    use InteractsWithIsActiveListFilter;
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
            'sort' => ['nullable', 'string', Rule::in(MovementCategory::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'type' => ['nullable', 'string', Rule::in(InventoryMovementType::values())],
            ...$this->isActiveListFilterRules(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->prepareNameSortedListDefaults();
        $this->prepareStandardListQuery();
        $this->prepareIsActiveListFilter();

        if ($this->input('type') === '') {
            $this->merge(['type' => null]);
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
            ...$this->isActiveListFilterForAction($validated),
            'type' => $validated['type'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            ...$this->isActiveListFilterForFrontend(),
            'type' => $this->input('type') ?? '',
        ];
    }
}
