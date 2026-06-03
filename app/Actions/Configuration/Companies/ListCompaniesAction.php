<?php

namespace App\Actions\Configuration\Companies;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ListCompaniesAction
{
    /**
     * Empresas gestionables en configuración: root ve todas; owner solo las que posee en el pivot.
     *
     * @return Collection<int, Company>
     */
    public function execute(User $user): Collection
    {
        if ($user->type === UserType::Root) {
            return Company::query()->orderBy('name')->get();
        }

        if ($user->type === UserType::Owner) {
            return Company::query()->ownedBy($user)->orderBy('name')->get();
        }

        return new Collection;
    }
}
