<?php

namespace App\Http\Requests\Store;

use App\Http\Requests\Concerns\InteractsWithIsActiveListFilter;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Store\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(Product::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            ...$this->isActiveListFilterRules(),
            'product_category_id' => ['nullable', 'string', 'uuid'],
            'product_type_id' => ['nullable', 'string', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->prepareNameSortedListDefaults();
        $this->prepareStandardListQuery();
        $this->prepareIsActiveListFilter();

        foreach (['product_category_id', 'product_type_id'] as $key) {
            if ($this->input($key) === '') {
                $this->merge([$key => null]);
            }
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
            'product_category_id' => $validated['product_category_id'] ?? null,
            'product_type_id' => $validated['product_type_id'] ?? null,
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
            'product_category_id' => $this->input('product_category_id') ?? '',
            'product_type_id' => $this->input('product_type_id') ?? '',
        ];
    }
}
