<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Appointments\BuildAppointmentFormOptionsAction;
use App\Actions\Agenda\Appointments\ListAppointmentsForCalendarAction;
use App\Actions\Agenda\Holidays\ListActiveHolidaysForCalendarAction;
use App\Http\Controllers\Controller;
use App\Models\Agenda\Appointment;
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
        ListAppointmentsForCalendarAction $listAppointments,
        BuildAppointmentFormOptionsAction $buildFormOptions,
    ): Response {
        $this->authorize('viewAny', Calendar::class);

        $company = $this->resolveCompany($request);
        $user = $request->user();

        return Inertia::render('agenda/calendar/index', [
            'holidays' => $company instanceof Company
                ? $listActiveHolidays->execute($company->id)
                : [],
            'appointments' => $company instanceof Company
                ? $listAppointments->execute($company->id)
                : [],
            'formOptions' => $company instanceof Company
                ? $buildFormOptions->execute($company->id)
                : [
                    'doctors' => [],
                    'services' => [],
                    'patients' => [],
                    'offices' => [],
                ],
            'can' => [
                'create' => $user?->can('create', Appointment::class) ?? false,
            ],
        ]);
    }
}
