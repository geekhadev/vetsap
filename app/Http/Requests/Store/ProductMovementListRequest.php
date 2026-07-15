<?php

namespace App\Http\Requests\Store;

use App\Actions\Store\ProductMovements\ListProductMovementsForCompanyAction;
use App\Enums\Store\InventoryMovementType;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductMovementListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(ListProductMovementsForCompanyAction::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'type' => ['nullable', 'string', Rule::in(InventoryMovementType::values())],
            'product_id' => ['nullable', 'string', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('sort')) {
            $this->merge([
                'sort' => 'moved_at',
                'direction' => $this->input('direction', 'desc'),
            ]);
        }

        $this->prepareStandardListQuery();

        foreach (['type', 'product_id'] as $key) {
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
            'type' => $validated['type'] ?? null,
            'product_id' => $validated['product_id'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            'type' => $this->input('type') ?? '',
            'product_id' => $this->input('product_id') ?? '',
        ];
    }
}
