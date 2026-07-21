<?php

namespace App\Http\Requests\Sale;

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Sale\SaleDocument;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaleDocumentListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(SaleDocument::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'status' => ['nullable', 'string', Rule::enum(SaleDocumentStatus::class)],
            'payment_status' => ['nullable', 'string', Rule::enum(SaleDocumentPaymentStatus::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('sort')) {
            $this->merge([
                'sort' => 'created_at',
                'direction' => $this->input('direction', 'desc'),
            ]);
        }

        $this->prepareStandardListQuery();

        if ($this->input('status') === '') {
            $this->merge(['status' => null]);
        }

        if ($this->input('payment_status') === '') {
            $this->merge(['payment_status' => null]);
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
            'status' => $validated['status'] ?? null,
            'payment_status' => $validated['payment_status'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            'status' => $this->input('status') ?? '',
            'payment_status' => $this->input('payment_status') ?? '',
        ];
    }
}
