<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_patient_vaccination_doses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('plan_id')
                ->constrained('medic_patient_vaccination_plans')
                ->cascadeOnDelete();
            $table->foreignUuid('product_id')
                ->constrained('store_products')
                ->restrictOnDelete();
            $table->string('series_key', 64)->nullable();
            $table->unsignedSmallInteger('sequence')->default(0);
            $table->date('scheduled_on');
            $table->dateTime('administered_on')->nullable();
            $table->string('status', 32);
            $table->string('administered_origin', 32)->nullable();
            $table->string('source', 32);
            $table->text('notes')->nullable();
            $table->foreignUuid('recorded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->index('plan_id', 'medic_patient_vaccination_doses_plan_id_idx');
            $table->index('product_id', 'medic_patient_vaccination_doses_product_id_idx');
            $table->index(['plan_id', 'scheduled_on'], 'medic_patient_vaccination_doses_schedule_idx');
            $table->index('status', 'medic_patient_vaccination_doses_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_patient_vaccination_doses');
    }
};
