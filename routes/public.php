<?php

use App\Http\Controllers\LandingController;
use App\Http\Controllers\Web\ClinicController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');
Route::get('/clinica/{slug}', ClinicController::class)->name('clinic.show');
