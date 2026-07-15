<?php

use App\Http\Controllers\Medic\ClinicalAttentionsController;
use App\Http\Controllers\Medic\ClinicalTemplatesController;
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
Route::put('patients/{patient}/draft-attention', [PatientsController::class, 'upsertDraftAttention'])
    ->name('patients.draft-attention.upsert');
Route::post('patients/{patient}/draft-attention/close', [PatientsController::class, 'closeDraftAttention'])
    ->name('patients.draft-attention.close');
Route::resource('doctors', DoctorsController::class)->except(['show']);
Route::put('doctors/{doctor}/services', [DoctorsController::class, 'syncServices'])
    ->name('doctors.services.sync');
Route::put('doctors/{doctor}/schedule', [DoctorsController::class, 'syncSchedule'])
    ->name('doctors.schedule.sync');
Route::resource('clinical-templates', ClinicalTemplatesController::class)->except(['show']);
Route::resource('clinical-attentions', ClinicalAttentionsController::class)->except(['show', 'create', 'edit', 'update']);
