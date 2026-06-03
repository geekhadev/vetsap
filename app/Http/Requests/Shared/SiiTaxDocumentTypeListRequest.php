<?php

namespace App\Http\Requests\Shared;

use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiiTaxDocumentTypeListRequest extends FormRequest
{
    use InteractsWithPaginatedListQuery;

    /**
     * La autorización de listados se delega a las Policies vía controlador (`$this->authorize(...)`).
     */
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
            'sort' => ['nullable', 'string', Rule::in(SiiTaxDocumentType::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'usage' => ['nullable', 'string', Rule::in(['sale', 'purchase'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->prepareStandardListQuery();

        $usage = $this->input('usage');
        if ($usage === '' || $usage === null) {
            $this->merge(['usage' => null]);
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
            'usage_filter' => $validated['usage'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            'usage' => $this->input('usage') ?? '',
        ];
    }
}
