<?php

namespace App\Actions\Configuration\Companies;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ListSelectableCompaniesForUserAction
{
    /**
     * Empresas que el usuario puede elegir como contexto activo
     * (root: todas; customer: vía sale_customers; resto: con al menos un rol en el pivot).
     *
     * @return Collection<int, Company>
     */
    public function execute(User $user): Collection
    {
        if ($user->type === UserType::Root) {
            return Company::query()->orderBy('name')->get();
        }

        if ($user->type === UserType::Customer) {
            return Company::query()
                ->whereHas('customers', fn ($q) => $q->where('user_id', $user->id))
                ->orderBy('name')
                ->get();
        }

        return Company::query()
            ->whereHas('userRoles', fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('name')
            ->get();
    }
}
