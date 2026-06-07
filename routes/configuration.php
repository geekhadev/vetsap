<?php

use App\Http\Controllers\Configuration\CalendarSettingsController;
use App\Http\Controllers\Configuration\CompaniesController;
use App\Http\Controllers\Configuration\CompanyOfficesController;
use App\Http\Controllers\Configuration\CompanySiiIntegrationController;
use App\Http\Controllers\Configuration\IntegrationsSettingsController;
use App\Http\Controllers\Configuration\RolesController;
use App\Http\Controllers\Configuration\UserController;
use App\Http\Controllers\Configuration\WebsiteSettingsController;
use Illuminate\Support\Facades\Route;

Route::get('calendar-settings', [CalendarSettingsController::class, 'index'])
    ->name('calendar-settings.index');
Route::put('calendar-settings', [CalendarSettingsController::class, 'update'])
    ->name('calendar-settings.update');

Route::get('integration-settings', [IntegrationsSettingsController::class, 'index'])
    ->name('integration-settings.index');

Route::get('company-offices', [CompanyOfficesController::class, 'index'])
    ->name('company-offices.index');

Route::resource('companies', CompaniesController::class)->except(['show']);

Route::resource('companies.offices', CompanyOfficesController::class)
    ->only(['store', 'update', 'destroy']);

Route::put('companies/{company}/slug', [CompaniesController::class, 'updateSlug'])
    ->name('companies.update-slug');

Route::get('website-settings', [WebsiteSettingsController::class, 'index'])
    ->name('website-settings.index');
Route::put('website-settings', [WebsiteSettingsController::class, 'update'])
    ->name('website-settings.update');
Route::post('website-settings/logo', [WebsiteSettingsController::class, 'storeLogo'])
    ->name('website-settings.logo.store');

Route::patch('companies/{company}/integrations/sii', [CompanySiiIntegrationController::class, 'update'])
    ->name('companies.integrations.sii.update');

Route::get('companies/{company}/integrations/sii/certificate', [CompanySiiIntegrationController::class, 'download'])
    ->name('companies.integrations.sii.certificate.download');

Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);

Route::get('roles', [RolesController::class, 'index'])->name('roles.index');
Route::post('roles', [RolesController::class, 'store'])->name('roles.store');
Route::put('roles/sync', [RolesController::class, 'sync'])->name('roles.sync');
Route::delete('roles/{role}', [RolesController::class, 'destroy'])->name('roles.destroy');
