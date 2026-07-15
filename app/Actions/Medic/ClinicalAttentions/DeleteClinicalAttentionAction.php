<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Models\Medic\ClinicalAttention;

final class DeleteClinicalAttentionAction
{
    public function execute(ClinicalAttention $attention): void
    {
        $attention->delete();
    }
}
