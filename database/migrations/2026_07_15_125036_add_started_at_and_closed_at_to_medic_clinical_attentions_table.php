<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medic_clinical_attentions', function (Blueprint $table) {
            $table->timestamp('started_at')->nullable()->after('status');
            $table->timestamp('closed_at')->nullable()->after('started_at');
            $table->index('started_at', 'medic_clinical_attentions_started_at_idx');
            $table->index('closed_at', 'medic_clinical_attentions_closed_at_idx');
        });

        DB::table('medic_clinical_attentions')
            ->whereNull('started_at')
            ->update([
                'started_at' => DB::raw('created_at'),
            ]);

        DB::table('medic_clinical_attentions')
            ->where('status', 'closed')
            ->whereNull('closed_at')
            ->update([
                'closed_at' => DB::raw('updated_at'),
            ]);

        Schema::table('medic_clinical_attentions', function (Blueprint $table) {
            $table->timestamp('started_at')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('medic_clinical_attentions', function (Blueprint $table) {
            $table->dropIndex('medic_clinical_attentions_started_at_idx');
            $table->dropIndex('medic_clinical_attentions_closed_at_idx');
            $table->dropColumn(['started_at', 'closed_at']);
        });
    }
};
