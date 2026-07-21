<?php

namespace App\Actions\Medic\VaccinationProtocols;

use App\Models\Medic\VaccinationProtocol;
use Illuminate\Support\Facades\DB;

final class CreateVaccinationProtocolAction
{
    /**
     * @param  array{
     *     company_id: string,
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
    public function execute(array $data): VaccinationProtocol
    {
        return DB::transaction(function () use ($data): VaccinationProtocol {
            $items = $data['items'];
            unset($data['items']);

            $data['version'] = 1;

            /** @var VaccinationProtocol $protocol */
            $protocol = VaccinationProtocol::query()->create($data);

            foreach ($items as $item) {
                $protocol->items()->create($item);
            }

            return $protocol->load(['species:id,name', 'items.product:id,name']);
        });
    }
}
