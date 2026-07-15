<?php

namespace App\Actions\Medic\ClinicalTemplates;

use App\Models\Medic\ClinicalTemplate;

final class DeleteClinicalTemplateAction
{
    public function execute(ClinicalTemplate $template): void
    {
        $template->delete();
    }
}
