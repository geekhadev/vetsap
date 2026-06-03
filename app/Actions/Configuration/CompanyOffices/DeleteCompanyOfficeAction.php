<?php

namespace App\Actions\Configuration\CompanyOffices;

use App\Models\CompanyOffice;
use Illuminate\Auth\Access\AuthorizationException;

class DeleteCompanyOfficeAction
{
    public function execute(CompanyOffice $office): void
    {
        if ($office->is_main) {
            throw new AuthorizationException(__('No se puede eliminar la sucursal matriz.'));
        }

        $office->delete();
    }
}
