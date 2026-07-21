<?php

namespace App\Actions\Medic\VaccinationProtocols;

use App\Models\Medic\VaccinationProtocol;
use Illuminate\Support\Facades\DB;

final class UpdateVaccinationProtocolAction
{
    /**
     * Crea una nueva versión del protocolo (no muta la plantilla existente).
     * Los planes de pacientes ya asignados siguen apuntando a la versión anterior.
     *
     * @param  array{
     *     species_id: string,
     *     name: string,
     *     description: string|null,
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

            $nextVersion = (int) VaccinationProtocol::query()
                ->where('company_id', $protocol->company_id)
                ->where('name', $data['name'])
                ->max('version');

            $data['company_id'] = $protocol->company_id;
            $data['version'] = $nextVersion + 1;

            $protocol->update(['is_active' => false]);

            if ($data['is_active']) {
                VaccinationProtocol::query()
                    ->where('company_id', $protocol->company_id)
                    ->where('name', $data['name'])
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            /** @var VaccinationProtocol $newProtocol */
            $newProtocol = VaccinationProtocol::query()->create($data);

            foreach ($items as $item) {
                $newProtocol->items()->create($item);
            }

            return $newProtocol->load(['species:id,name', 'items.product:id,name']);
        });
    }
}
