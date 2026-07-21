<?php

namespace App\Actions\Medic\VaccinationProtocols;

use App\Models\Medic\VaccinationProtocol;
use Illuminate\Support\Facades\DB;

final class UpdateVaccinationProtocolAction
{
    /**
     * @param  array{
     *     species_id: string,
     *     name: string,
     *     description: string|null,
     *     version: int,
     *     is_active: bool,
     *     items: list<array{
     *         product_id: string,
     *         schedule_type: string,
     *         week_number: int|null,
     *         min_age_weeks: int|null,
     *         max_age_weeks: int|null,
     *         interval_months: int|null,
     *         series_key: string|null,
     *         sort_order: int
     *     }>
     * }  $data
     */
    public function execute(VaccinationProtocol $protocol, array $data): VaccinationProtocol
    {
        return DB::transaction(function () use ($protocol, $data): VaccinationProtocol {
            $items = $data['items'];
            unset($data['items']);

            $protocol->update($data);

            $protocol->items()->delete();
            foreach ($items as $item) {
                $protocol->items()->create($item);
            }

            return $protocol->refresh()->load(['species:id,name', 'items.product:id,name']);
        });
    }
}
