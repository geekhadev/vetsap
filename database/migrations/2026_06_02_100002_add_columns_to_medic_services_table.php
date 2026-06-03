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
        if (Schema::hasColumn('medic_services', 'name')) {
            return;
        }

        Schema::table('medic_services', function (Blueprint $table) {
            $table->string('name')->after('specialty_id');
            $table->text('description')->nullable()->after('name');
            $table->decimal('price', 12, 0)->nullable()->after('description');
            $table->unsignedInteger('duration_minutes')->nullable()->after('price');

            $table->unique(['company_id', 'name'], 'medic_services_company_name_unique');
            $table->index(['company_id', 'specialty_id'], 'medic_services_company_specialty_idx');
            $table->index('is_active', 'medic_services_is_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('medic_services', 'name')) {
            return;
        }

        Schema::table('medic_services', function (Blueprint $table) {
            $table->dropIndex('medic_services_company_name_unique');
            $table->dropIndex('medic_services_company_specialty_idx');
            $table->dropIndex('medic_services_is_active_idx');
            $table->dropColumn([
                'name',
                'description',
                'price',
                'duration_minutes',
            ]);
        });
    }
};
