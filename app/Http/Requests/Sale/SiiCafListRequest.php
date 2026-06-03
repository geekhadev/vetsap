<?php

namespace App\Http\Requests\Sale;

use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Sale\SiiCaf;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiiCafListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(SiiCaf::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'sii_tax_document_type_id' => ['nullable', 'uuid', Rule::exists('shared_sii_tax_document_types', 'id')],
            'folios_for' => ['nullable', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $perPage = (int) $this->input('per_page', 20);
        $perPage = max(5, min(100, $perPage));
        $search = $this->input('search');

        $foliosFor = $this->input('folios_for');
        if ($foliosFor === '') {
            $this->merge(['folios_for' => null]);
        }

        $docType = $this->input('sii_tax_document_type_id');
        if ($docType === '') {
            $this->merge(['sii_tax_document_type_id' => null]);
        }

        $this->merge([
            'sort' => $this->input('sort', 'folio_from'),
            'direction' => $this->input('direction', 'desc'),
            'per_page' => $perPage,
            'search' => is_string($search) && $search === '' ? null : $search,
        ]);
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
            'sii_tax_document_type_id' => $validated['sii_tax_document_type_id'] ?? null,
            'folios_for' => $validated['folios_for'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            'sii_tax_document_type_id' => $this->input('sii_tax_document_type_id') ?? '',
            'folios_for' => $this->input('folios_for') ?? '',
        ];
    }
}
