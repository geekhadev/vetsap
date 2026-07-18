<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Appointments\ChangeAppointmentStatusAction;
use App\Actions\Agenda\Appointments\CreateAppointmentAction;
use App\Actions\Agenda\Appointments\DeleteAppointmentAction;
use App\Actions\Agenda\Appointments\RescheduleAppointmentAction;
use App\Actions\Agenda\Appointments\ShowAppointmentAction;
use App\Actions\Medic\ClinicalAttentions\StartAttentionFromAppointmentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\AppointmentRescheduleRequest;
use App\Http\Requests\Agenda\AppointmentStatusChangeRequest;
use App\Http\Requests\Agenda\AppointmentStoreRequest;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function updateStatus(
        AppointmentStatusChangeRequest $request,
        Appointment $appointment,
        ChangeAppointmentStatusAction $changeStatus,
        ShowAppointmentAction $show,
    ): JsonResponse {
        $this->authorize('update', $appointment);

        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $appointment = $changeStatus->execute(
            $appointment,
            $request->appointmentStatusId(),
            $user,
            $request->statusChangeNotes(),
        );

        return response()->json($show->execute($appointment));
    }

    public function updateSchedule(
        AppointmentRescheduleRequest $request,
        Appointment $appointment,
        RescheduleAppointmentAction $reschedule,
        ShowAppointmentAction $show,
    ): JsonResponse {
        $this->authorize('update', $appointment);

        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $appointment = $reschedule->execute(
            $appointment,
            $request->reschedulePayload(),
            $user,
        );

        return response()->json($show->execute($appointment));
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

        $redirectPatientId = $request->redirectPatientId();

        if ($redirectPatientId !== null) {
            return redirect(route('medic.patients.edit', [
                'patient' => $redirectPatientId,
                'tab' => 'historial',
            ]));
        }

        return to_route('agenda.calendar.index');
    }

    public function destroy(
        Appointment $appointment,
        DeleteAppointmentAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $appointment);

        $action->execute($appointment);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cita eliminada.']);

        return back();
    }

    public function startAttention(
        Request $request,
        Appointment $appointment,
        StartAttentionFromAppointmentAction $action,
    ): RedirectResponse {
        $this->authorize('view', $appointment);
        $this->authorize('create', ClinicalAttention::class);

        $appointment->loadMissing('patient');

        $patient = $appointment->patient;

        if (! $patient instanceof Patient) {
            return back()->withErrors([
                'appointment' => 'La cita no tiene un paciente asociado.',
            ]);
        }

        $this->authorize('update', $patient);

        try {
            $action->execute($appointment, $request->user()?->id);
        } catch (\RuntimeException $exception) {
            return back()->withErrors(['appointment' => $exception->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Atención en borrador iniciada.',
        ]);

        return redirect(route('medic.patients.edit', [
            'patient' => $patient->id,
            'tab' => 'nueva-atencion',
        ]));
    }
}
