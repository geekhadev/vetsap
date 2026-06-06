<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Appointments\CreateAppointmentAction;
use App\Actions\Agenda\Appointments\ShowAppointmentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\AppointmentStoreRequest;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class AppointmentsController extends Controller
{
    public function show(
        Appointment $appointment,
        ShowAppointmentAction $action,
    ): JsonResponse {
        $this->authorize('view', $appointment);

        return response()->json($action->execute($appointment));
    }

    public function store(
        AppointmentStoreRequest $request,
        CreateAppointmentAction $action,
    ): RedirectResponse {
        $this->authorize('create', Appointment::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['customer_id' => 'Debes seleccionar una empresa para agendar citas.']);
        }

        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $action->execute($request->appointmentPayload(), $company->id, $user);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cita creada correctamente.']);

        return to_route('agenda.calendar.index');
    }
}
