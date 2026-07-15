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
        Schema::table('medic_clinical_attention_requested_services', function (Blueprint $table) {
            $table->string('result_path')->nullable()->after('service_id');
            $table->string('result_original_name')->nullable()->after('result_path');
            $table->string('result_mime_type', 127)->nullable()->after('result_original_name');
            $table->timestamp('result_uploaded_at')->nullable()->after('result_mime_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medic_clinical_attention_requested_services', function (Blueprint $table) {
            $table->dropColumn([
                'result_path',
                'result_original_name',
                'result_mime_type',
                'result_uploaded_at',
            ]);
        });
    }
};
