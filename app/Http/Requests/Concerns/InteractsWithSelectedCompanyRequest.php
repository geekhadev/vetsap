<?php

namespace App\Http\Requests\Concerns;

use App\Enums\UserType;
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

    public function wantsGlobalRecord(): bool
    {
        return $this->user()?->type === UserType::Root
            && filter_var($this->input('is_global'), FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Empresa destino del registro: null si es global (root + is_global), si no la de sesión.
     */
    public function resolvedCompanyId(): ?string
    {
        if ($this->wantsGlobalRecord()) {
            return null;
        }

        return $this->selectedCompanyId();
    }
}
