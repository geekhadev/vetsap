<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Appointments\BuildAppointmentFormOptionsAction;
use App\Actions\Agenda\Appointments\ListAppointmentsForCalendarAction;
use App\Actions\Agenda\AppointmentStatuses\ListActiveAppointmentStatusesForCalendarAction;
use App\Actions\Agenda\Calendar\ListDoctorScheduleWindowsForCompanyAction;
use App\Actions\Agenda\Calendar\ListScheduledDaysOfWeekForCompanyAction;
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
        ListActiveAppointmentStatusesForCalendarAction $listAppointmentStatuses,
        ListScheduledDaysOfWeekForCompanyAction $listScheduledDaysOfWeek,
        ListDoctorScheduleWindowsForCompanyAction $listDoctorScheduleWindows,
    ): Response {
        $this->authorize('viewAny', Calendar::class);

        $company = $this->resolveCompany($request);
        $user = $request->user();

        return Inertia::render('agenda/calendar/index', [
            'holidays' => $company instanceof Company
                ? $listActiveHolidays->execute($company->id)
                : [],
            'scheduled_days_of_week' => $company instanceof Company
                ? $listScheduledDaysOfWeek->execute($company->id)
                : [],
            'schedule_windows' => $company instanceof Company
                ? $listDoctorScheduleWindows->execute($company->id)
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
            'appointmentStatuses' => $company instanceof Company
                ? $listAppointmentStatuses->execute($company->id)
                : [],
            'can' => [
                'create' => $user?->can('create', Appointment::class) ?? false,
                'view' => $user?->can('viewAny', Appointment::class) ?? false,
                'update' => $user?->can('updateAny', Appointment::class) ?? false,
            ],
        ]);
    }
}
