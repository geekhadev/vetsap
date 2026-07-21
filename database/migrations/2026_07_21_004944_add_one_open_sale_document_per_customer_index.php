<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (! in_array($driver, ['pgsql', 'sqlite'], true)) {
            return;
        }

        // Una sola venta abierta (draft) por cliente/empresa.
        DB::statement(
            'CREATE UNIQUE INDEX sale_documents_one_draft_per_customer '
            .'ON sale_documents (company_id, customer_id) '
            ."WHERE status = 'draft'"
        );
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (! in_array($driver, ['pgsql', 'sqlite'], true)) {
            return;
        }

        DB::statement('DROP INDEX IF EXISTS sale_documents_one_draft_per_customer');
    }
};
