<?php

namespace App\Policies\Agenda;

use App\Enums\UserType;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\User;
use App\Models\UserCompanyRole;
use App\Support\Administration\ModulePermissionSlugs;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canList($user);
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $this->canList($user)
            && $this->sessionCompanyMatches((string) $appointment->company_id);
    }

    public function create(User $user): bool
    {
        return $this->canCreate($user);
    }

    public function updateAny(User $user): bool
    {
        return $this->canUpdate($user);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $this->canUpdate($user)
            && $this->sessionCompanyMatches((string) $appointment->company_id);
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $this->canDelete($user)
            && $this->sessionCompanyMatches((string) $appointment->company_id);
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
            return false;
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

        return $this->userHasPermissionForCompany($user, $companyId, $this->createPermissionSlug());
    }

    protected function canUpdate(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, $this->updatePermissionSlug());
    }

    protected function canDelete(User $user): bool
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

        return $this->userHasPermissionForCompany($user, $companyId, $this->deletePermissionSlug());
    }

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.calendar')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.calendar')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.calendar')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.calendar')->delete();
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
