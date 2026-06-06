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
        Schema::create('agenda_appointment_status_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('appointment_id')
                ->constrained('agenda_appointments')
                ->cascadeOnDelete();
            $table->foreignUuid('from_appointment_status_id')
                ->nullable()
                ->constrained('agenda_appointment_statuses')
                ->nullOnDelete();
            $table->foreignUuid('to_appointment_status_id')
                ->constrained('agenda_appointment_statuses')
                ->restrictOnDelete();
            $table->foreignUuid('changed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('source', 32);
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['appointment_id', 'occurred_at'], 'agenda_appt_status_logs_appt_occurred_idx');
            $table->index('to_appointment_status_id', 'agenda_appt_status_logs_to_status_idx');
            $table->index('changed_by_user_id', 'agenda_appt_status_logs_changed_by_idx');
            $table->index('occurred_at', 'agenda_appt_status_logs_occurred_at_idx');
            $table->index('created_at', 'agenda_appt_status_logs_created_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agenda_appointment_status_logs');
    }
};
