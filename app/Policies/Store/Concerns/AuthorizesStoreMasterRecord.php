<?php

namespace App\Policies\Store\Concerns;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Store\MovementCategory;
use App\Models\Store\ProductCategory;
use App\Models\User;
use App\Models\UserCompanyRole;

trait AuthorizesStoreMasterRecord
{
    abstract protected function listPermissionSlug(): string;

    abstract protected function createPermissionSlug(): string;

    abstract protected function updatePermissionSlug(): string;

    abstract protected function deletePermissionSlug(): string;

    public function viewAny(User $user): bool
    {
        return $this->canList($user);
    }

    public function view(User $user, ProductCategory|MovementCategory $record): bool
    {
        return $this->canList($user);
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

    public function update(User $user, ProductCategory|MovementCategory $record): bool
    {
        return $this->canModifyRecord($user, $record, $this->canUpdate($user));
    }

    public function delete(User $user, ProductCategory|MovementCategory $record): bool
    {
        return $this->canModifyRecord($user, $record, $this->canDelete($user));
    }

    protected function canModifyRecord(User $user, ProductCategory|MovementCategory $record, bool $hasAbility): bool
    {
        if (! $hasAbility) {
            return false;
        }

        if ($record->company_id === null) {
            return false;
        }

        return $this->sessionCompanyMatches((string) $record->company_id);
    }

    protected function sessionCompanyMatches(string $recordCompanyId): bool
    {
        $sessionId = $this->sessionCompanyId();

        return $sessionId !== null && $sessionId === $recordCompanyId;
    }

    protected function canList(User $user): bool
    {
        $companyId = $this->sessionCompanyId();
        if ($companyId === null) {
            return $user->type === UserType::Root;
        }

        if ($user->type === UserType::Root) {
            return true;
        }

        if ($user->type === UserType::Owner) {
            $company = Company::query()->find($companyId);

            return $company instanceof Company && $user->isOwnerOf($company);
        }

        return $this->userHasPermissionForCompany($user, $companyId, $this->listPermissionSlug());
    }

    protected function canCreate(User $user): bool
    {
        if ($user->type === UserType::Root) {
            return true;
        }

        $companyId = $this->sessionCompanyId();
        if ($companyId === null) {
            return false;
        }

        if ($user->type === UserType::Owner) {
            $company = Company::query()->find($companyId);

            return $company instanceof Company && $user->isOwnerOf($company);
        }

        return $this->userHasPermissionForCompany($user, $companyId, $this->createPermissionSlug());
    }

    protected function canUpdate(User $user): bool
    {
        if ($user->type === UserType::Root) {
            return true;
        }

        $companyId = $this->sessionCompanyId();
        if ($companyId === null) {
            return false;
        }

        if ($user->type === UserType::Owner) {
            $company = Company::query()->find($companyId);

            return $company instanceof Company && $user->isOwnerOf($company);
        }

        return $this->userHasPermissionForCompany($user, $companyId, $this->updatePermissionSlug());
    }

    protected function canDelete(User $user): bool
    {
        if ($user->type === UserType::Root) {
            return true;
        }

        $companyId = $this->sessionCompanyId();
        if ($companyId === null) {
            return false;
        }

        if ($user->type === UserType::Owner) {
            $company = Company::query()->find($companyId);

            return $company instanceof Company && $user->isOwnerOf($company);
        }

        return $this->userHasPermissionForCompany($user, $companyId, $this->deletePermissionSlug());
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
