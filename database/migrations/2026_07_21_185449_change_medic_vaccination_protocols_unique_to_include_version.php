<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medic_vaccination_protocols', function (Blueprint $table) {
            $table->dropUnique('medic_vaccination_protocols_company_name_uq');
            $table->unique(
                ['company_id', 'name', 'version'],
                'medic_vaccination_protocols_company_name_version_uq',
            );
        });
    }

    public function down(): void
    {
        Schema::table('medic_vaccination_protocols', function (Blueprint $table) {
            $table->dropUnique('medic_vaccination_protocols_company_name_version_uq');
            $table->unique(['company_id', 'name'], 'medic_vaccination_protocols_company_name_uq');
        });
    }
};
