<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->date('spent_at');
            $table->foreignUuid('expense_type_id')
                ->constrained('purchase_expense_types')
                ->restrictOnDelete();
            $table->decimal('amount', 12, 0);
            $table->string('reason', 500);
            $table->timestamps();

            $table->index('company_id', 'purchase_expenses_company_id_idx');
            $table->index(['company_id', 'spent_at'], 'purchase_expenses_company_spent_at_idx');
            $table->index('expense_type_id', 'purchase_expenses_expense_type_id_idx');
            $table->index('spent_at', 'purchase_expenses_spent_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_expenses');
    }
};
