<?php

use App\Http\Controllers\Configuration\CalendarSettingsController;
use App\Http\Controllers\Configuration\CompaniesController;
use App\Http\Controllers\Configuration\CompanyOfficesController;
use App\Http\Controllers\Configuration\CompanySiiIntegrationController;
use App\Http\Controllers\Configuration\RolesController;
use App\Http\Controllers\Configuration\UserController;
use Illuminate\Support\Facades\Route;

Route::get('calendar-settings', [CalendarSettingsController::class, 'index'])
    ->name('calendar-settings.index');

Route::resource('companies', CompaniesController::class)->except(['show']);

Route::resource('companies.offices', CompanyOfficesController::class)
    ->only(['store', 'update', 'destroy']);

Route::put('companies/{company}/slug', [CompaniesController::class, 'updateSlug'])
    ->name('companies.update-slug');

Route::put('companies/{company}/web-settings', [CompaniesController::class, 'updateWebSettings'])
    ->name('companies.web-settings.update');

Route::post('companies/{company}/web-settings/logo', [CompaniesController::class, 'storeWebLogo'])
    ->name('companies.web-settings.logo.store');

Route::patch('companies/{company}/integrations/sii', [CompanySiiIntegrationController::class, 'update'])
    ->name('companies.integrations.sii.update');

Route::get('companies/{company}/integrations/sii/certificate', [CompanySiiIntegrationController::class, 'download'])
    ->name('companies.integrations.sii.certificate.download');

Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);

Route::get('roles', [RolesController::class, 'index'])->name('roles.index');
Route::post('roles', [RolesController::class, 'store'])->name('roles.store');
Route::put('roles/sync', [RolesController::class, 'sync'])->name('roles.sync');
Route::delete('roles/{role}', [RolesController::class, 'destroy'])->name('roles.destroy');
