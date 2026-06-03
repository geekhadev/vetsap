<?php

namespace App\Actions\Configuration\CompanyOffices;

use App\Models\Company;
use App\Models\CompanyOffice;

class CreateCompanyOfficeAction
{
    /**
     * @param  array{name: string, email: string|null, phone: string|null, address: string}  $payload
     */
    public function execute(Company $company, array $payload): CompanyOffice
    {
        return CompanyOffice::query()->create([
            'company_id' => $company->id,
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'],
            'address' => $payload['address'],
            'is_main' => false,
        ]);
    }
}
