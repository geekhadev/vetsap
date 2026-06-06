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
        Schema::create('agenda_holidays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->string('name');
            $table->date('date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'date'], 'agenda_holidays_company_date_unique');
            $table->index('is_active', 'agenda_holidays_is_active_idx');
            $table->index('date', 'agenda_holidays_date_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agenda_holidays');
    }
};
