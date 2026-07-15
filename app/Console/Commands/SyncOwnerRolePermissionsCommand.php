<?php

namespace App\Console\Commands;

use App\Actions\Configuration\Roles\SyncOwnerRolePermissionsAction;
use Illuminate\Console\Command;

class SyncOwnerRolePermissionsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'vetsap:sync-owner-role-permissions';

    /**
     * @var string
     */
    protected $description = 'Asigna al rol Owner todos los permisos excepto Administración y Compartido';

    public function handle(SyncOwnerRolePermissionsAction $action): int
    {
        $result = $action->execute();

        $this->info(sprintf(
            'Rol Owner sincronizado con %d permisos (sin administration ni shared).',
            $result['permission_count'],
        ));

        return self::SUCCESS;
    }
}
