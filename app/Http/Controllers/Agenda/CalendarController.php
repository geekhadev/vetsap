<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Holidays\ListActiveHolidaysForCalendarAction;
use App\Http\Controllers\Controller;
use App\Models\Agenda\Calendar;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(
        Request $request,
        ListActiveHolidaysForCalendarAction $listActiveHolidays,
    ): Response {
        $this->authorize('viewAny', Calendar::class);

        $company = $this->resolveCompany($request);

        return Inertia::render('agenda/calendar/index', [
            'holidays' => $company instanceof Company
                ? $listActiveHolidays->execute($company->id)
                : [],
        ]);
    }
}
