<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CalendarSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('configuration/calendar-settings/index');
    }
}
