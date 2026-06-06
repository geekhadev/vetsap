<?php

namespace App\Support\Pagination;

final class ListFilterPagination
{
    /**
     * @param  array<string, mixed>  $filters
     * @param  list<string>  $sortableColumns
     * @return array{sort: string, direction: string, per_page: int}
     */
    public static function resolveFromFilters(
        array $filters,
        array $sortableColumns,
        string $defaultSort = 'name',
        string $defaultDirection = 'asc',
        int $defaultPerPage = 20,
    ): array {
        $sort = in_array($filters['sort'], $sortableColumns, true)
            ? (string) $filters['sort']
            : $defaultSort;
        $direction = ($filters['direction'] ?? $defaultDirection) === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? $defaultPerPage);

        return [
            'sort' => $sort,
            'direction' => $direction,
            'per_page' => $perPage,
        ];
    }
}
