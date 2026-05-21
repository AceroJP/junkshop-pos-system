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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('receipt_image')->nullable()->after('reference_number');
            $table->text('rejection_reason')->nullable()->after('receipt_image');
            $table->foreignId('verified_by')->nullable()->after('rejection_reason')->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable()->after('verified_by');
        });

        Schema::table('licenses', function (Blueprint $table) {
            $table->foreignId('payment_id')->nullable()->after('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('activated_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('licenses', function (Blueprint $table) {
            $table->dropForeign(['payment_id']);
            $table->dropColumn(['payment_id', 'activated_at']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['receipt_image', 'rejection_reason', 'verified_by', 'verified_at']);
        });
    }
};
