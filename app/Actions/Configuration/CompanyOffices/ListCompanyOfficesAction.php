<?php

namespace App\Actions\Configuration\CompanyOffices;

use App\Models\Company;
use App\Models\CompanyOffice;
use Illuminate\Database\Eloquent\Collection;

class ListCompanyOfficesAction
{
    /**
     * @return Collection<int, CompanyOffice>
     */
    public function execute(Company $company): Collection
    {
        return CompanyOffice::query()
            ->where('company_id', $company->id)
            ->whereNotMain()
            ->orderBy('name')
            ->get();
    }
}
