<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->dedupeDefaultServices();

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement(
                'CREATE UNIQUE INDEX medic_services_one_default_per_company '
                .'ON medic_services (company_id) WHERE is_default = true'
            );
        } elseif ($driver === 'sqlite') {
            DB::statement(
                'CREATE UNIQUE INDEX medic_services_one_default_per_company '
                .'ON medic_services (company_id) WHERE is_default = 1'
            );
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            Schema::table('medic_services', function (Blueprint $table): void {
                $table->char('is_default_key', 1)
                    ->nullable()
                    ->storedAs('IF(is_default, \'Y\', NULL)');
                $table->unique(
                    ['company_id', 'is_default_key'],
                    'medic_services_one_default_per_company',
                );
            });
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            Schema::table('medic_services', function (Blueprint $table): void {
                $table->dropUnique('medic_services_one_default_per_company');
                $table->dropColumn('is_default_key');
            });

            return;
        }

        DB::statement('DROP INDEX IF EXISTS medic_services_one_default_per_company');
    }

    private function dedupeDefaultServices(): void
    {
        $companyIds = DB::table('medic_services')
            ->select('company_id')
            ->where('is_default', true)
            ->groupBy('company_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('company_id');

        foreach ($companyIds as $companyId) {
            $keepId = DB::table('medic_services')
                ->where('company_id', $companyId)
                ->where('is_default', true)
                ->orderBy('created_at')
                ->value('id');

            if ($keepId === null) {
                continue;
            }

            DB::table('medic_services')
                ->where('company_id', $companyId)
                ->where('is_default', true)
                ->where('id', '!=', $keepId)
                ->update(['is_default' => false]);
        }
    }
};
