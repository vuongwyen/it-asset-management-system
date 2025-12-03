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
        Schema::table('assets', function (Blueprint $table) {
            $table->decimal('current_value', 10, 2)->default(0)->after('purchase_cost');
            $table->integer('useful_life_months')->default(36)->after('current_value');
            $table->decimal('residual_value', 10, 2)->default(0)->after('useful_life_months');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['current_value', 'useful_life_months', 'residual_value']);
        });
    }
};
