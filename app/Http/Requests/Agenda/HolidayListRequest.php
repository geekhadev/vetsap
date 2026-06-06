<?php

namespace App\Http\Requests\Agenda;

use App\Http\Requests\Concerns\InteractsWithIsActiveListFilter;
use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Agenda\Holiday;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HolidayListRequest extends FormRequest
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
            'sort' => ['nullable', 'string', Rule::in(Holiday::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            ...$this->isActiveListFilterRules(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sort' => $this->input('sort', 'date'),
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
        ];
    }
}
