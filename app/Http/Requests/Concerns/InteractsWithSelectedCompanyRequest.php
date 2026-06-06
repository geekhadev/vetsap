<?php

namespace App\Http\Requests\Concerns;

use App\Models\Company;
use App\Support\SelectedCompanySession;

trait InteractsWithSelectedCompanyRequest
{
    public function selectedCompanyId(): ?string
    {
        return SelectedCompanySession::selectedCompanyId($this);
    }

    public function selectedCompany(): ?Company
    {
        $id = $this->selectedCompanyId();

        if ($id === null) {
            return null;
        }

        return Company::query()->find($id);
    }
}
