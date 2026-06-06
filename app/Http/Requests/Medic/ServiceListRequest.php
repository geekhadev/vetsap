<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithIsActiveListFilter;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Medic\Service;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(Service::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            ...$this->isActiveListFilterRules(),
            'specialty_id' => ['nullable', 'string', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->prepareNameSortedListDefaults();
        $this->prepareStandardListQuery();
        $this->prepareIsActiveListFilter();

        if ($this->input('specialty_id') === '') {
            $this->merge(['specialty_id' => null]);
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
            'specialty_id' => $validated['specialty_id'] ?? null,
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
            'specialty_id' => $this->input('specialty_id') ?? '',
        ];
    }
}
