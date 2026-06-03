<?php

namespace App\Actions\Sale\CertificationSiiTickets;

use App\Models\Company;
use App\Models\Sale\CertificationSiiTicket;
use Illuminate\Database\Eloquent\Collection;

final class ListCertificationSiiTicketsForCompanyAction
{
    /**
     * @return Collection<int, CertificationSiiTicket>
     */
    public function execute(Company $company): Collection
    {
        return CertificationSiiTicket::query()
            ->where('company_id', $company->id)
            ->orderByDesc('created_at')
            ->get();
    }
}
