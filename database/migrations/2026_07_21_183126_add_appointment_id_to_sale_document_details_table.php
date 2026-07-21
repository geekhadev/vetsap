<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_document_details', function (Blueprint $table) {
            $table->foreignUuid('appointment_id')
                ->nullable()
                ->after('patient_vaccination_dose_id')
                ->constrained('agenda_appointments')
                ->nullOnDelete();

            $table->unique('appointment_id', 'sale_document_details_appointment_id_uq');
        });
    }

    public function down(): void
    {
        Schema::table('sale_document_details', function (Blueprint $table) {
            $table->dropUnique('sale_document_details_appointment_id_uq');
            $table->dropConstrainedForeignId('appointment_id');
        });
    }
};
