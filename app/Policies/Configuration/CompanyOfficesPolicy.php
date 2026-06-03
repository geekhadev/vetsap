<?php

namespace App\Policies\Configuration;

use App\Enums\UserType;
use App\Models\CompanyOffice;
use App\Models\User;

class CompanyOfficesPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->type, [UserType::Root, UserType::Owner], true);
    }

    public function view(User $user, CompanyOffice $office): bool
    {
        return $this->managesCompany($user, $office);
    }

    public function create(User $user): bool
    {
        return in_array($user->type, [UserType::Root, UserType::Owner], true);
    }

    public function update(User $user, CompanyOffice $office): bool
    {
        if ($office->is_main) {
            return false;
        }

        return $this->managesCompany($user, $office);
    }

    public function delete(User $user, CompanyOffice $office): bool
    {
        if ($office->is_main) {
            return false;
        }

        return $this->managesCompany($user, $office);
    }

    private function managesCompany(User $user, CompanyOffice $office): bool
    {
        $company = $office->company;

        if ($user->type === UserType::Root) {
            return true;
        }

        return $user->isOwnerOf($company);
    }
}
