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
        Schema::create('agenda_appointments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('appointment_status_id')
                ->constrained('agenda_appointment_statuses')
                ->restrictOnDelete();
            $table->foreignUuid('doctor_id')
                ->constrained('medic_doctors')
                ->restrictOnDelete();
            $table->foreignUuid('service_id')
                ->constrained('medic_services')
                ->restrictOnDelete();
            $table->foreignUuid('customer_id')
                ->constrained('sale_customers')
                ->restrictOnDelete();
            $table->foreignUuid('patient_id')
                ->constrained('medic_patients')
                ->restrictOnDelete();
            $table->foreignUuid('office_id')
                ->nullable()
                ->constrained('configuration_company_offices')
                ->nullOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->unsignedSmallInteger('duration_minutes');
            $table->decimal('price', 12, 0)->nullable();
            $table->string('source', 32);
            $table->text('notes')->nullable();
            $table->text('public_notes')->nullable();
            $table->timestamp('status_changed_at')->nullable();
            $table->foreignUuid('status_changed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignUuid('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignUuid('updated_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id', 'starts_at'], 'agenda_appointments_company_starts_at_idx');
            $table->index(['doctor_id', 'starts_at'], 'agenda_appointments_doctor_starts_at_idx');
            $table->index('appointment_status_id', 'agenda_appointments_status_id_idx');
            $table->index('customer_id', 'agenda_appointments_customer_id_idx');
            $table->index('patient_id', 'agenda_appointments_patient_id_idx');
            $table->index('service_id', 'agenda_appointments_service_id_idx');
            $table->index('office_id', 'agenda_appointments_office_id_idx');
            $table->index('ends_at', 'agenda_appointments_ends_at_idx');
            $table->index('created_at', 'agenda_appointments_created_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agenda_appointments');
    }
};
