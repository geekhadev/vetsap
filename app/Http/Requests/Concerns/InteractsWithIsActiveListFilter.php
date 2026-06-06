<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Rule;

trait InteractsWithIsActiveListFilter
{
    /**
     * @return array<string, array<int, mixed|string>>
     */
    protected function isActiveListFilterRules(): array
    {
        return [
            'is_active' => ['nullable', 'string', Rule::in(['1', '0', ''])],
        ];
    }

    protected function prepareNameSortedListDefaults(): void
    {
        $this->merge([
            'sort' => $this->input('sort', 'name'),
            'direction' => $this->input('direction', 'asc'),
        ]);
    }

    protected function prepareIsActiveListFilter(): void
    {
        if ($this->input('is_active') === '') {
            $this->merge(['is_active' => null]);
        }
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{is_active: mixed}
     */
    protected function isActiveListFilterForAction(array $validated): array
    {
        return [
            'is_active' => $validated['is_active'] ?? null,
        ];
    }

    /**
     * @return array{is_active: mixed}
     */
    protected function isActiveListFilterForFrontend(): array
    {
        return [
            'is_active' => $this->input('is_active') ?? '',
        ];
    }
}
