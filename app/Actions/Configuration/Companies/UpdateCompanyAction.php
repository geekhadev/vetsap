<?php

namespace App\Actions\Configuration\Companies;

use App\Actions\Configuration\CompanyOffices\UpsertCompanyMainOfficeFromCompanyAction;
use App\Models\Company;

class UpdateCompanyAction
{
    public function __construct(
        private UpsertCompanyMainOfficeFromCompanyAction $upsertMainOffice,
    ) {}

    /**
     * @param  array{name: string, alias: string|null, email: string|null, phone: string|null, address: string|null}  $payload
     */
    public function execute(Company $company, array $payload): Company
    {
        $company->update([
            'name' => $payload['name'],
            'alias' => $payload['alias'],
            'email' => $payload['email'],
            'phone' => $payload['phone'],
            'address' => $payload['address'],
        ]);

        $this->upsertMainOffice->execute($company);

        return $company->fresh();
    }
}
