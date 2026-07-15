<?php

namespace App\Models\Medic\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait InteractsWithCompanyOrGlobalMasterRecord
{
    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForCompany(Builder $query, string $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForCompanyOrGlobal(Builder $query, string $companyId): Builder
    {
        return $query->where(function (Builder $inner) use ($companyId): void {
            $inner->where('company_id', $companyId)
                ->orWhere(function (Builder $global): void {
                    $global->where('is_global', true)
                        ->whereNull('company_id');
                });
        });
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOnlyGlobal(Builder $query): Builder
    {
        return $query->where('is_global', true)->whereNull('company_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterIsActive(Builder $query, ?string $isActive): Builder
    {
        if ($isActive === null || $isActive === '') {
            return $query;
        }

        return $query->where('is_active', $isActive === '1');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if ($search === null || $search === '') {
            return $query;
        }

        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

        return $query->where('name', 'like', $term);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOrderByColumn(Builder $query, string $column, string $direction): Builder
    {
        return $query->orderBy($column, $direction);
    }

    public function isGlobal(): bool
    {
        return $this->is_global || $this->company_id === null;
    }

    public function resolveRouteBinding($value, $field = null): static
    {
        $field ??= $this->getRouteKeyName();

        /** @var static|null $record */
        $record = static::query()->where($field, $value)->first();

        if ($record === null) {
            abort(404);
        }

        if ($record->isGlobal()) {
            abort(404);
        }

        $sessionCompanyId = data_get(request()->session()->get('company_selected'), 'id');
        if (! is_string($sessionCompanyId) || $sessionCompanyId === '' || $sessionCompanyId !== $record->company_id) {
            abort(404);
        }

        return $record;
    }
}
