<?php

namespace App\Policies\Agenda;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use App\Models\UserCompanyRole;
use App\Support\Administration\ModulePermissionSlugs;

class CalendarPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canList($user);
    }

    protected function canList(User $user): bool
    {
        $companyId = $this->sessionCompanyId();
        if ($companyId === null) {
            return false;
        }

        if ($user->type === UserType::Root) {
            return true;
        }

        if ($user->type === UserType::Owner) {
            $company = Company::query()->find($companyId);

            return $company instanceof Company && $user->isOwnerOf($company);
        }

        return $this->userHasPermissionForCompany(
            $user,
            $companyId,
            ModulePermissionSlugs::for('agenda.calendar')->list(),
        );
    }

    protected function sessionCompanyId(): ?string
    {
        $id = data_get(request()->session()->get('company_selected'), 'id');

        return is_string($id) && $id !== '' ? $id : null;
    }

    protected function userHasPermissionForCompany(User $user, string $companyId, string $permissionSlug): bool
    {
        return UserCompanyRole::query()
            ->where('user_id', $user->id)
            ->where('company_id', $companyId)
            ->whereHas('role.permissions', function ($query) use ($permissionSlug): void {
                $query->where('slug', $permissionSlug);
            })
            ->exists();
    }
}
