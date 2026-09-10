<?php

namespace App\Support\Administration;

use App\Models\Administration\Permission;
use App\Models\Configuration\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

final class OwnerRolePermissions
{
    /**
     * Systems whose permissions must never be granted to the Owner role.
     *
     * @var list<string>
     */
    public const EXCLUDED_SYSTEM_SLUGS = [
        'administration',
        'shared',
    ];

    public static function ensureOwnerRole(): Role
    {
        return Role::query()->firstOrCreate(
            [
                'name' => Role::OWNER_SYSTEM_NAME,
                'is_public' => true,
                'company_id' => null,
            ],
        );
    }

    /**
     * @return Builder<Permission>
     */
    public static function assignablePermissionsQuery(): Builder
    {
        return Permission::query()
            ->whereHas('module.system', function ($query): void {
                $query->whereNotIn('slug', self::EXCLUDED_SYSTEM_SLUGS);
            });
    }

    public static function isAssignable(Permission $permission): bool
    {
        $permission->loadMissing('module.system');

        $systemSlug = $permission->module?->system?->slug;

        return is_string($systemSlug)
            && $systemSlug !== ''
            && ! in_array($systemSlug, self::EXCLUDED_SYSTEM_SLUGS, true);
    }

    public static function assertAssignable(Permission $permission): void
    {
        if (self::isAssignable($permission)) {
            return;
        }

        throw ValidationException::withMessages([
            'permission' => 'Este permiso pertenece a Administración o Compartido y no puede asignarse al rol Owner.',
        ]);
    }
}
