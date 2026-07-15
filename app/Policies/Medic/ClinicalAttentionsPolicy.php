<?php

namespace App\Policies\Medic;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class ClinicalAttentionsPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.clinical-attentions')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.clinical-attentions')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.clinical-attentions')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.clinical-attentions')->delete();
    }
}
