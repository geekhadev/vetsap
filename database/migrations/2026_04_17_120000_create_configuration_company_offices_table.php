<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('configuration_company_offices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->boolean('is_main')->default(false);
            $table->timestamps();

            $table->unique(['company_id', 'name'], 'configuration_company_offices_company_name_unique');
            $table->index(['company_id', 'created_at']);
        });

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement(
                'CREATE UNIQUE INDEX configuration_company_offices_one_main_per_company '
                .'ON configuration_company_offices (company_id) WHERE is_main = true'
            );
        } elseif ($driver === 'sqlite') {
            DB::statement(
                'CREATE UNIQUE INDEX configuration_company_offices_one_main_per_company '
                .'ON configuration_company_offices (company_id) WHERE is_main = 1'
            );
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            Schema::table('configuration_company_offices', function (Blueprint $table): void {
                $table->char('is_main_key', 1)
                    ->nullable()
                    ->storedAs('IF(is_main, \'Y\', NULL)');
                $table->unique(
                    ['company_id', 'is_main_key'],
                    'configuration_company_offices_one_main_per_company',
                );
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuration_company_offices');
    }
};
