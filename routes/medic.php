<?php

use App\Http\Controllers\Medic\SpecialtiesController;
use Illuminate\Support\Facades\Route;

Route::resource('specialties', SpecialtiesController::class)->except(['show']);
