<?php

namespace App\Http\Requests\Store;

use App\Enums\Store\InventoryMovementType;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Store\InventoryMovement;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryMovementListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(InventoryMovement::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'type' => ['nullable', 'string', Rule::in(InventoryMovementType::values())],
            'movement_category_id' => ['nullable', 'string', 'uuid'],
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

        foreach (['type', 'movement_category_id'] as $key) {
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
            'movement_category_id' => $validated['movement_category_id'] ?? null,
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
            'movement_category_id' => $this->input('movement_category_id') ?? '',
        ];
    }
}
