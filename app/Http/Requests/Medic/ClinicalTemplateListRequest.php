<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithIsActiveListFilter;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Medic\ClinicalTemplate;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClinicalTemplateListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(ClinicalTemplate::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'species_id' => ['nullable', 'uuid'],
            ...$this->isActiveListFilterRules(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sort' => $this->input('sort', 'name'),
            'direction' => $this->input('direction', 'asc'),
        ]);

        $this->prepareStandardListQuery();
        $this->prepareIsActiveListFilter();
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
            'species_id' => $validated['species_id'] ?? null,
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
            'species_id' => (string) ($this->input('species_id') ?? ''),
        ];
    }
}
