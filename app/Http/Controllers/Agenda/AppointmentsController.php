<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Appointments\ChangeAppointmentStatusAction;
use App\Actions\Agenda\Appointments\CreateAppointmentAction;
use App\Actions\Agenda\Appointments\DeleteAppointmentAction;
use App\Actions\Agenda\Appointments\RescheduleAppointmentAction;
use App\Actions\Agenda\Appointments\ShowAppointmentAction;
use App\Actions\Medic\ClinicalAttentions\StartAttentionFromAppointmentAction;
use App\Actions\Medic\PatientVaccinations\LinkVaccinationDoseToAppointmentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\AppointmentRescheduleRequest;
use App\Http\Requests\Agenda\AppointmentStatusChangeRequest;
use App\Http\Requests\Agenda\AppointmentStoreRequest;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Patient;
use App\Models\Medic\PatientVaccinationDose;
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
        LinkVaccinationDoseToAppointmentAction $linkVaccinationDose,
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

        $vaccinationDoseId = $request->vaccinationDoseId();
        $vaccinationDose = null;

        if ($vaccinationDoseId !== null) {
            $vaccinationDose = PatientVaccinationDose::query()
                ->with('plan:id,patient_id,company_id')
                ->findOrFail($vaccinationDoseId);

            $payloadPatientId = $request->appointmentPayload()['patient_id'] ?? null;

            if (
                ! is_string($payloadPatientId)
                || $vaccinationDose->plan?->patient_id !== $payloadPatientId
            ) {
                return back()->withErrors([
                    'vaccination_dose_id' => 'La dosis no corresponde al paciente de la cita.',
                ]);
            }
        }

        $appointment = $action->execute($request->appointmentPayload(), $company->id, $user);

        if ($vaccinationDose instanceof PatientVaccinationDose) {
            $linkVaccinationDose->execute($vaccinationDose, $appointment);
        }

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
