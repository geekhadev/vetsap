<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agenda_appointment_statuses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->nullable()
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 32);
            $table->boolean('is_global')->default(false);
            $table->boolean('blocks_schedule')->default(true);
            $table->boolean('is_terminal')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name'], 'agenda_appointment_statuses_company_name_unique');
            $table->index('company_id', 'agenda_appointment_statuses_company_id_idx');
            $table->index('is_global', 'agenda_appointment_statuses_is_global_idx');
            $table->index('blocks_schedule', 'agenda_appointment_statuses_blocks_schedule_idx');
            $table->index('is_terminal', 'agenda_appointment_statuses_is_terminal_idx');
            $table->index('is_active', 'agenda_appointment_statuses_is_active_idx');
            $table->index('color', 'agenda_appointment_statuses_color_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agenda_appointment_statuses');
    }
};
