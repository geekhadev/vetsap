<?php

namespace App\Actions\Configuration\CompanyOffices;

use App\Models\CompanyOffice;
use Illuminate\Auth\Access\AuthorizationException;

class UpdateCompanyOfficeAction
{
    /**
     * @param  array{name: string, email: string|null, phone: string|null, address: string}  $payload
     */
    public function execute(CompanyOffice $office, array $payload): CompanyOffice
    {
        if ($office->is_main) {
            throw new AuthorizationException(__('No se puede editar la sucursal matriz desde aquí.'));
        }

        $office->update([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'],
            'address' => $payload['address'],
        ]);

        return $office->fresh();
    }
}
