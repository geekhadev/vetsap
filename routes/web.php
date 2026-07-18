<?php

use App\Http\Controllers\Api\CompanyAssignableRolesController;
use App\Http\Controllers\Api\UserCompanyRoleAssignmentsController;
use App\Http\Controllers\CompanySelectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Web\ClinicSettingController;
use App\Http\Middleware\EnsureCompanySelected;
use Illuminate\Support\Facades\Route;

require __DIR__.'/public.php';

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('company-selection', [CompanySelectionController::class, 'index'])
        ->name('company-selection.index');
    Route::post('company-selection', [CompanySelectionController::class, 'store'])
        ->name('company-selection.store');

    Route::put('clinica/{slug}/settings/{key}', ClinicSettingController::class)
        ->name('clinica.settings.update');
});

Route::middleware(['auth', 'verified', EnsureCompanySelected::class])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('administration')->name('administration.')->group(function () {
        require __DIR__.'/administration.php';
    });

    Route::prefix('configuration')->name('configuration.')->group(function () {
        require __DIR__.'/configuration.php';
    });

    Route::prefix('sale')->name('sale.')->group(function () {
        require __DIR__.'/sales.php';
    });

    Route::prefix('purchase')->name('purchase.')->group(function () {
        require __DIR__.'/purchases.php';
    });

    Route::prefix('medic')->name('medic.')->group(function () {
        require __DIR__.'/medic.php';
    });

    Route::prefix('store')->name('store.')->group(function () {
        require __DIR__.'/store.php';
    });

    Route::prefix('agenda')->name('agenda.')->group(function () {
        require __DIR__.'/agenda.php';
    });

    Route::prefix('shared')->name('shared.')->group(function () {
        require __DIR__.'/shared.php';
    });

    Route::prefix('api')->name('api.')->group(function () {
        Route::get('companies/{company}/roles', CompanyAssignableRolesController::class)
            ->name('companies.roles.index');

        Route::get('users/{user}/company-role-assignments', [UserCompanyRoleAssignmentsController::class, 'index'])
            ->name('users.company-role-assignments.index');
        Route::post('users/{user}/company-role-assignments', [UserCompanyRoleAssignmentsController::class, 'store'])
            ->name('users.company-role-assignments.store');
        Route::delete('users/{user}/company-role-assignments/{assignment}', [UserCompanyRoleAssignmentsController::class, 'destroy'])
            ->whereNumber('assignment')
            ->name('users.company-role-assignments.destroy');
    });
});

require __DIR__.'/settings.php';
