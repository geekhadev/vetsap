<?php

use App\Http\Controllers\Medic\DoctorsController;
use App\Http\Controllers\Medic\PatientsController;
use App\Http\Controllers\Medic\ServicesController;
use App\Http\Controllers\Medic\SpecialtiesController;
use App\Http\Controllers\Medic\SpeciesController;
use Illuminate\Support\Facades\Route;

Route::resource('specialties', SpecialtiesController::class)->except(['show']);
Route::resource('services', ServicesController::class)->except(['show']);
Route::resource('species', SpeciesController::class)->except(['show']);
Route::resource('patients', PatientsController::class)->except(['show']);
Route::resource('doctors', DoctorsController::class)->except(['show']);
Route::put('doctors/{doctor}/services', [DoctorsController::class, 'syncServices'])
    ->name('doctors.services.sync');
Route::put('doctors/{doctor}/schedule', [DoctorsController::class, 'syncSchedule'])
    ->name('doctors.schedule.sync');
