<?php

use App\Http\Controllers\Agenda\AppointmentsController;
use App\Http\Controllers\Agenda\AppointmentStatusesController;
use App\Http\Controllers\Agenda\CalendarController;
use App\Http\Controllers\Agenda\HolidaysController;
use Illuminate\Support\Facades\Route;

Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
Route::get('appointments/{appointment}', [AppointmentsController::class, 'show'])->name('appointments.show');
Route::patch('appointments/{appointment}/status', [AppointmentsController::class, 'updateStatus'])->name('appointments.update-status');
Route::patch('appointments/{appointment}/schedule', [AppointmentsController::class, 'updateSchedule'])->name('appointments.update-schedule');
Route::delete('appointments/{appointment}', [AppointmentsController::class, 'destroy'])->name('appointments.destroy');
Route::post('appointments', [AppointmentsController::class, 'store'])->name('appointments.store');
Route::resource('holidays', HolidaysController::class)->except(['show']);
Route::resource('appointment-statuses', AppointmentStatusesController::class)->except(['show']);
