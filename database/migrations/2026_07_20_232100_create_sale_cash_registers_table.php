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
        Schema::create('sale_cash_registers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('office_id')
                ->constrained('configuration_company_offices')
                ->restrictOnDelete();
            $table->foreignUuid('opened_by_user_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->timestamp('opened_at');
            $table->unsignedBigInteger('opening_amount')->default(0);
            $table->string('status', 20);
            $table->foreignUuid('closed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('company_id', 'sale_cash_registers_company_id_idx');
            $table->index(['company_id', 'status'], 'sale_cash_registers_company_status_idx');
            $table->index(['company_id', 'opened_at'], 'sale_cash_registers_company_opened_idx');
            $table->index(['opened_by_user_id', 'status'], 'sale_cash_registers_user_status_idx');
            $table->index('office_id', 'sale_cash_registers_office_id_idx');
        });

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement(
                'CREATE UNIQUE INDEX sale_cash_registers_one_open_per_user_office '
                .'ON sale_cash_registers (company_id, office_id, opened_by_user_id) '
                ."WHERE status = 'open'"
            );
        } elseif ($driver === 'sqlite') {
            DB::statement(
                'CREATE UNIQUE INDEX sale_cash_registers_one_open_per_user_office '
                .'ON sale_cash_registers (company_id, office_id, opened_by_user_id) '
                ."WHERE status = 'open'"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_cash_registers');
    }
};
