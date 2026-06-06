<?php

namespace App\Policies\Sale;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Sale\SiiCaf;
use App\Models\User;
use App\Models\UserCompanyRole;
use App\Support\Administration\ModulePermissionSlugs;

class SiiCafPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canViewModule($user);
    }

    public function view(User $user, SiiCaf $siiCaf): bool
    {
        return $this->canViewModule($user)
            && $this->sessionCompanyMatches($user, (string) $siiCaf->company_id);
    }

    public function create(User $user): bool
    {
        return $this->canUpload($user);
    }

    public function deleteAny(User $user): bool
    {
        return $this->canDelete($user);
    }

    public function delete(User $user, SiiCaf $siiCaf): bool
    {
        return $this->canDelete($user)
            && $this->sessionCompanyMatches($user, (string) $siiCaf->company_id);
    }

    private function sessionCompanyMatches(User $user, string $cafCompanyId): bool
    {
        $sessionId = data_get(request()->session()->get('company_selected'), 'id');

        return is_string($sessionId) && $sessionId !== '' && $sessionId === $cafCompanyId;
    }

    private function canViewModule(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, ModulePermissionSlugs::for('sale.sii-cafs')->segment('view'));
    }

    private function canUpload(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, ModulePermissionSlugs::for('sale.sii-cafs')->segment('upload'));
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

        return $this->userHasPermissionForCompany($user, $companyId, ModulePermissionSlugs::for('sale.sii-cafs')->delete());
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
