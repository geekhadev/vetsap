<?php

use App\Http\Controllers\Agenda\AppointmentsController;
use App\Http\Controllers\Agenda\AppointmentStatusesController;
use App\Http\Controllers\Agenda\CalendarController;
use App\Http\Controllers\Agenda\HolidaysController;
use Illuminate\Support\Facades\Route;

Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
Route::post('appointments', [AppointmentsController::class, 'store'])->name('appointments.store');
Route::resource('holidays', HolidaysController::class)->except(['show']);
Route::resource('appointment-statuses', AppointmentStatusesController::class)->except(['show']);
