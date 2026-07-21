<?php

namespace App\Actions\Medic\VaccinationProtocols;

use App\Models\Medic\VaccinationProtocol;

final class DeleteVaccinationProtocolAction
{
    public function execute(VaccinationProtocol $protocol): void
    {
        $protocol->delete();
    }
}
