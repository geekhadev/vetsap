<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Models\Medic\ClinicalAttention;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

final class DeleteClinicalAttentionAction
{
    public function execute(ClinicalAttention $attention): void
    {
        DB::transaction(function () use ($attention): void {
            $attention->loadMissing('requestedServices');

            foreach ($attention->requestedServices as $service) {
                $path = $service->pivot->result_path;

                if (is_string($path) && $path !== '') {
                    Storage::disk('public')->delete($path);
                }
            }

            $attention->delete();
        });
    }
}
