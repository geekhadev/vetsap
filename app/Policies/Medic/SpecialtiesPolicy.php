<?php

namespace App\Policies\Medic;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Medic\Specialty;
use App\Models\User;
use App\Models\UserCompanyRole;
use App\Support\Medic\SpecialtyPermissionSlugs;

class SpecialtiesPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canList($user);
    }

    public function view(User $user, Specialty $specialty): bool
    {
        return $this->canList($user)
            && $this->sessionCompanyMatches((string) $specialty->company_id);
    }

    public function create(User $user): bool
    {
        return $this->canCreate($user);
    }

    public function updateAny(User $user): bool
    {
        return $this->canUpdate($user);
    }

    public function deleteAny(User $user): bool
    {
        return $this->canDelete($user);
    }

    public function update(User $user, Specialty $specialty): bool
    {
        return $this->canUpdate($user)
            && $this->sessionCompanyMatches((string) $specialty->company_id);
    }

    public function delete(User $user, Specialty $specialty): bool
    {
        return $this->canDelete($user)
            && $this->sessionCompanyMatches((string) $specialty->company_id);
    }

    private function sessionCompanyMatches(string $specialtyCompanyId): bool
    {
        $sessionId = data_get(request()->session()->get('company_selected'), 'id');

        return is_string($sessionId) && $sessionId !== '' && $sessionId === $specialtyCompanyId;
    }

    private function canList(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, SpecialtyPermissionSlugs::list());
    }

    private function canCreate(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, SpecialtyPermissionSlugs::create());
    }

    private function canUpdate(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, SpecialtyPermissionSlugs::update());
    }

    private function canDelete(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, SpecialtyPermissionSlugs::delete());
    }

    private function sessionCompanyId(): ?string
    {
        $id = data_get(request()->session()->get('company_selected'), 'id');

        return is_string($id) && $id !== '' ? $id : null;
    }

    private function userHasPermissionForCompany(User $user, string $companyId, string $permissionSlug): bool
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
