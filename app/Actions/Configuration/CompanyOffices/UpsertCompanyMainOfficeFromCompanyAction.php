<?php

namespace App\Actions\Configuration\CompanyOffices;

use App\Models\Company;
use App\Models\CompanyOffice;

class UpsertCompanyMainOfficeFromCompanyAction
{
    public function execute(Company $company): CompanyOffice
    {
        $company->refresh();

        $main = CompanyOffice::query()
            ->where('company_id', $company->id)
            ->where('is_main', true)
            ->first();

        $attributes = [
            'name' => $company->name,
            'email' => $company->email,
            'phone' => $company->phone,
            'address' => $company->address,
            'is_main' => true,
        ];

        if ($main !== null) {
            $main->update($attributes);

            return $main->fresh();
        }

        return CompanyOffice::query()->create(array_merge(
            ['company_id' => $company->id],
            $attributes,
        ));
    }
}
