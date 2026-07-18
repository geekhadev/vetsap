<?php

namespace App\Http\Requests\Purchase;

use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Purchase\PurchaseOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseOrderListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(PurchaseOrder::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'supplier_id' => ['nullable', 'string', 'uuid'],
            'purchase_order_status_id' => ['nullable', 'string', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('sort')) {
            $this->merge([
                'sort' => 'ordered_at',
                'direction' => $this->input('direction', 'desc'),
            ]);
        }

        $this->prepareStandardListQuery();

        if ($this->input('supplier_id') === '') {
            $this->merge(['supplier_id' => null]);
        }

        if ($this->input('purchase_order_status_id') === '') {
            $this->merge(['purchase_order_status_id' => null]);
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
            'supplier_id' => $validated['supplier_id'] ?? null,
            'purchase_order_status_id' => $validated['purchase_order_status_id'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            'supplier_id' => $this->input('supplier_id') ?? '',
            'purchase_order_status_id' => $this->input('purchase_order_status_id') ?? '',
        ];
    }
}
