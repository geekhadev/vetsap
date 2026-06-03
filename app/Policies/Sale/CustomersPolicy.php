<?php

namespace App\Policies\Sale;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Sale\Customer;
use App\Models\User;
use App\Models\UserCompanyRole;
use App\Support\Sale\CustomerPermissionSlugs;

class CustomersPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canList($user);
    }

    public function view(User $user, Customer $customer): bool
    {
        return $this->canList($user)
            && $this->sessionCompanyMatches((string) $customer->company_id);
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

    public function update(User $user, Customer $customer): bool
    {
        return $this->canUpdate($user)
            && $this->sessionCompanyMatches((string) $customer->company_id);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $this->canDelete($user)
            && $this->sessionCompanyMatches((string) $customer->company_id);
    }

    private function sessionCompanyMatches(string $customerCompanyId): bool
    {
        $sessionId = data_get(request()->session()->get('company_selected'), 'id');

        return is_string($sessionId) && $sessionId !== '' && $sessionId === $customerCompanyId;
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

        return $this->userHasPermissionForCompany($user, $companyId, CustomerPermissionSlugs::list());
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

        return $this->userHasPermissionForCompany($user, $companyId, CustomerPermissionSlugs::create());
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

        return $this->userHasPermissionForCompany($user, $companyId, CustomerPermissionSlugs::update());
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

        return $this->userHasPermissionForCompany($user, $companyId, CustomerPermissionSlugs::delete());
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
