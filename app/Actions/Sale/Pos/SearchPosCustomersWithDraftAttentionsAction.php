<?php

namespace App\Actions\Sale\Pos;

use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use Illuminate\Support\Collection;

final class SearchPosCustomersWithDraftAttentionsAction
{
    /**
     * Clientes de la empresa para el PTV (con o sin ventas abiertas).
     *
     * @return Collection<int, array{
     *     id: string,
     *     name: string,
     *     document_type: string|null,
     *     document_number: string|null,
     *     phone: string|null,
     *     open_sales_count: int
     * }>
     */
    public function execute(string $companyId, string $query, int $limit = 15): Collection
    {
        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $query).'%';

        $openSalesCount = SaleDocument::query()
            ->selectRaw('count(*)')
            ->where('status', SaleDocumentStatus::Draft)
            ->where('company_id', $companyId)
            ->whereColumn('sale_documents.customer_id', 'sale_customers.id')
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('sale_document_details')
                    ->whereColumn(
                        'sale_document_details.sale_document_id',
                        'sale_documents.id',
                    );
            });

        return Customer::query()
            ->forCompany($companyId)
            ->where(function ($customerQuery) use ($term): void {
                $customerQuery
                    ->where('name', 'like', $term)
                    ->orWhere('document_number', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhereHas('patients', function ($patientQuery) use ($term): void {
                        $patientQuery->where('name', 'like', $term);
                    });
            })
            ->addSelect([
                'sale_customers.*',
                'open_sales_count' => $openSalesCount,
            ])
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(static function (Customer $customer): array {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'document_type' => $customer->document_type?->value,
                    'document_number' => $customer->document_number,
                    'phone' => $customer->phone,
                    'open_sales_count' => (int) $customer->open_sales_count,
                ];
            })
            ->values();
    }
}
