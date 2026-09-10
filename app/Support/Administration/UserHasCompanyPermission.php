<?php

namespace App\Support\Administration;

use App\Enums\UserType;
use App\Models\User;
use App\Models\UserCompanyRole;
use App\Support\SelectedCompanySession;
use Illuminate\Http\Request;

final class UserHasCompanyPermission
{
    public static function check(User $user, string $permissionSlug, ?string $companyId = null, ?Request $request = null): bool
    {
        if ($user->type === UserType::Root) {
            return true;
        }

        $resolvedCompanyId = $companyId;

        if ($resolvedCompanyId === null || $resolvedCompanyId === '') {
            $resolvedCompanyId = SelectedCompanySession::selectedCompanyId($request ?? request());
        }

        if (! is_string($resolvedCompanyId) || $resolvedCompanyId === '') {
            return false;
        }

        return UserCompanyRole::query()
            ->where('user_id', $user->id)
            ->where('company_id', $resolvedCompanyId)
            ->whereHas('role.permissions', function ($query) use ($permissionSlug): void {
                $query->where('slug', $permissionSlug);
            })
            ->exists();
    }
}
