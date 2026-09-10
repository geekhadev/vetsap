<?php

namespace App\Console\Commands;

use App\Actions\Configuration\Roles\SyncOwnerRolePermissionsAction;
use Illuminate\Console\Command;

class SyncOwnerRolePermissionsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'vetsap:sync-owner-role-permissions
                            {--grant-all : Asigna todos los permisos asignables al Owner (pisa toggles)}';

    /**
     * @var string
     */
    protected $description = 'Asegura el rol Owner. Con --grant-all asigna todos los permisos excepto Administración y Compartido';

    public function handle(SyncOwnerRolePermissionsAction $action): int
    {
        if ($this->option('grant-all')) {
            $result = $action->grantAllAssignablePermissions();

            $this->info(sprintf(
                'Rol Owner sincronizado con %d permisos (sin administration ni shared).',
                $result['permission_count'],
            ));

            return self::SUCCESS;
        }

        $result = $action->execute();

        $this->info(sprintf(
            'Rol Owner asegurado (%d permisos actuales). Usa --grant-all para asignar todos los asignables.',
            $result['permission_count'],
        ));

        return self::SUCCESS;
    }
}
