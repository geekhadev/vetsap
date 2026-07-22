<?php

use App\Http\Controllers\Shared\CountriesController;
use App\Http\Controllers\Shared\PaymentMethodsController;
use App\Http\Controllers\Shared\PaymentTypesController;
use App\Http\Controllers\Shared\SiiEconomicActivitiesController;
use App\Http\Controllers\Shared\SiiTaxDocumentTypesController;
use Illuminate\Support\Facades\Route;

Route::resource('countries', CountriesController::class)->except(['show']);
Route::resource('payment-types', PaymentTypesController::class)->except(['show']);
Route::resource('payment-methods', PaymentMethodsController::class)->except(['show']);
Route::resource('sii-economic-activities', SiiEconomicActivitiesController::class)->except(['show']);
Route::resource('sii-tax-document-types', SiiTaxDocumentTypesController::class)->except(['show']);
