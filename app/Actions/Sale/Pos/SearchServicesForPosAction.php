<?php

namespace App\Actions\Sale\Pos;

use App\Models\Medic\Service;
use Illuminate\Support\Collection;

final class SearchServicesForPosAction
{
    /**
     * @return Collection<int, array{id: string, name: string, price: string, tax_treatment: string}>
     */
    public function execute(string $companyId, string $query, int $limit = 15): Collection
    {
        return Service::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->search($query)
            ->orderBy('name')
            ->limit($limit)
            ->get(['id', 'name', 'price', 'tax_treatment'])
            ->map(static fn (Service $service): array => [
                'id' => $service->id,
                'name' => $service->name,
                'price' => (string) ($service->price ?? 0),
                'tax_treatment' => $service->tax_treatment?->value ?? 'exempt',
            ])
            ->values();
    }
}
