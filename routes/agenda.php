<?php

use App\Http\Controllers\Agenda\CalendarController;
use Illuminate\Support\Facades\Route;

Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
