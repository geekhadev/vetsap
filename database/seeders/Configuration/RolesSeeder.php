<?php

namespace Database\Seeders\Configuration;

use App\Actions\Configuration\Roles\SyncOwnerRolePermissionsAction;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(SyncOwnerRolePermissionsAction::class)->execute();
    }
}
