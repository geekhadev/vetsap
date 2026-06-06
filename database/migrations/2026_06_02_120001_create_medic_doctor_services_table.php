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
        Schema::create('medic_doctor_services', function (Blueprint $table) {
            $table->foreignUuid('doctor_id')
                ->constrained('medic_doctors')
                ->cascadeOnDelete();
            $table->foreignUuid('service_id')
                ->constrained('medic_services')
                ->cascadeOnDelete();
            $table->unsignedInteger('duration_override_minutes')->nullable();
            $table->decimal('price_override', 12, 0)->nullable();
            $table->timestamps();

            $table->primary(['doctor_id', 'service_id']);
            $table->index('service_id', 'medic_doctor_services_service_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medic_doctor_services');
    }
};
