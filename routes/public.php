<?php

use App\Http\Controllers\LandingController;
use App\Http\Controllers\Web\ClinicBookingController;
use App\Http\Controllers\Web\ClinicController;
use App\Http\Controllers\Web\SitemapController;
use App\Http\Middleware\ResolveClinicCompanyFromSlug;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/clinica/{slug}', ClinicController::class)->name('clinic.show');

Route::middleware([ResolveClinicCompanyFromSlug::class, 'throttle:30,1'])
    ->prefix('clinica/{slug}/booking')
    ->name('clinic.booking.')
    ->group(function (): void {
        Route::post('lookup-client', [ClinicBookingController::class, 'lookupClient'])
            ->name('lookup-client');
        Route::post('appointments', [ClinicBookingController::class, 'storeAppointment'])
            ->name('appointments.store');
    });
