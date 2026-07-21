<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shared_payment_types', function (Blueprint $table) {
            $table->boolean('is_credit')->default(false)->after('code');
            $table->index('is_credit');
        });

        DB::table('shared_payment_types')
            ->where('code', 'CO')
            ->update(['is_credit' => false]);

        DB::table('shared_payment_types')
            ->whereIn('code', ['CR', 'CR30'])
            ->update(['is_credit' => true]);

        Schema::table('sale_documents', function (Blueprint $table) {
            $table->foreignUuid('payment_type_id')
                ->nullable()
                ->after('sii_tax_document_type_id')
                ->constrained('shared_payment_types')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sale_documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_type_id');
        });

        Schema::table('shared_payment_types', function (Blueprint $table) {
            $table->dropIndex(['is_credit']);
            $table->dropColumn('is_credit');
        });
    }
};
