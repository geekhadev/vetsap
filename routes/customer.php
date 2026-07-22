<?php

use App\Http\Controllers\Customer\AppointmentsController;
use App\Http\Controllers\Customer\DocumentsController;
use App\Http\Controllers\Customer\PetsController;
use Illuminate\Support\Facades\Route;

Route::get('pets', [PetsController::class, 'index'])->name('pets.index');
Route::get('pets/{patient}/attentions', [PetsController::class, 'attentions'])
    ->whereUuid('patient')
    ->name('pets.attentions');

Route::get('documents', [DocumentsController::class, 'index'])->name('documents.index');
Route::get('documents/{saleDocument}', [DocumentsController::class, 'show'])
    ->whereUuid('saleDocument')
    ->name('documents.show');

Route::get('appointments/form-options', [AppointmentsController::class, 'formOptions'])
    ->name('appointments.form-options');
Route::post('appointments', [AppointmentsController::class, 'store'])
    ->name('appointments.store');
