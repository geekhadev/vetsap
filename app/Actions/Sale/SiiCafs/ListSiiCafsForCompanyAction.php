<?php

namespace App\Actions\Sale\SiiCafs;

use App\Enums\Sale\SiiCafFolioStatus;
use App\Models\Sale\SiiCaf;
use App\Models\Sale\SiiCafFolio;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

final class ListSiiCafsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            SiiCaf::SORTABLE_COLUMNS,
            'folio_from',
            'desc',
        );

        $cafsTable = (new SiiCaf)->getTable();

        $used = SiiCafFolioStatus::Used->value;

        $query = SiiCaf::query()
            ->forCompany($companyId)
            ->filterDocumentType($filters['sii_tax_document_type_id'] ?? null)
            ->with('siiTaxDocumentType:id,name,code')
            ->when($filters['search'] ?? null, function (Builder $q, string $search): void {
                $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
                $q->whereHas('siiTaxDocumentType', function (Builder $inner) use ($term): void {
                    $inner->where(function (Builder $w) use ($term): void {
                        $w->where('name', 'like', $term)
                            ->orWhere('code', 'like', $term);
                    });
                });
            })
            ->addSelect([
                'folios_used_count' => SiiCafFolio::query()
                    ->selectRaw('count(*)')
                    ->whereColumn('sale_sii_caf_id', $cafsTable.'.id')
                    ->where('status', $used),
                'last_used_folio' => SiiCafFolio::query()
                    ->selectRaw('max(folio_number)')
                    ->whereColumn('sale_sii_caf_id', $cafsTable.'.id')
                    ->where('status', $used),
            ]);

        return $query
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
