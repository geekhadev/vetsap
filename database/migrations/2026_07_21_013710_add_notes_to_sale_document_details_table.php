<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_document_details', function (Blueprint $table) {
            $table->string('notes', 500)->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('sale_document_details', function (Blueprint $table) {
            $table->dropColumn('notes');
        });
    }
};
