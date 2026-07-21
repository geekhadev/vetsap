<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\PatientVaccinations\AddManualPatientVaccinationDoseAction;
use App\Actions\Medic\PatientVaccinations\AdministerPatientVaccinationDoseAction;
use App\Actions\Medic\PatientVaccinations\AssignVaccinationPlanAction;
use App\Actions\Medic\PatientVaccinations\ClearPatientVaccinationDoseAdministrationAction;
use App\Actions\Medic\PatientVaccinations\OmitPatientVaccinationDoseAction;
use App\Actions\Medic\PatientVaccinations\UpdatePatientVaccinationDoseAction;
use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\AddManualPatientVaccinationDoseRequest;
use App\Http\Requests\Medic\AdministerPatientVaccinationDoseRequest;
use App\Http\Requests\Medic\AssignPatientVaccinationPlanRequest;
use App\Http\Requests\Medic\ClearPatientVaccinationDoseAdministrationRequest;
use App\Http\Requests\Medic\OmitPatientVaccinationDoseRequest;
use App\Http\Requests\Medic\UpdatePatientVaccinationDoseRequest;
use App\Models\Company;
use App\Models\Medic\Patient;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\PatientVaccinationPlan;
use App\Models\Medic\VaccinationProtocol;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use InvalidArgumentException;

class PatientVaccinationsController extends Controller
{
    public function storePlan(
        AssignPatientVaccinationPlanRequest $request,
        Patient $patient,
        AssignVaccinationPlanAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);
        $this->ensurePatientBelongsToSelectedCompany($request->selectedCompany(), $patient);

        $protocol = VaccinationProtocol::query()->findOrFail($request->validated('protocol_id'));

        try {
            $action->execute($patient, $protocol, $request->user()?->id);
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['protocol_id' => $exception->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plan de vacunación asignado.']);

        return back();
    }

    public function storeDose(
        AddManualPatientVaccinationDoseRequest $request,
        Patient $patient,
        AddManualPatientVaccinationDoseAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);
        $this->ensurePatientBelongsToSelectedCompany($request->selectedCompany(), $patient);

        $plan = $this->planForPatient($patient);

        $action->execute(
            $plan,
            (string) $request->validated('product_id'),
            CarbonImmutable::parse((string) $request->validated('scheduled_on')),
            $this->optionalNotes($request->validated('notes')),
            $request->user()?->id,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Vacuna agregada al plan.']);

        return back();
    }

    public function administer(
        AdministerPatientVaccinationDoseRequest $request,
        Patient $patient,
        PatientVaccinationDose $dose,
        AdministerPatientVaccinationDoseAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);
        $this->ensurePatientBelongsToSelectedCompany($request->selectedCompany(), $patient);
        $this->ensureDoseBelongsToPatient($patient, $dose);

        $action->execute(
            $dose,
            CarbonImmutable::parse((string) $request->validated('administered_on'))->startOfDay(),
            VaccinationAdministeredOrigin::from((string) $request->validated('administered_origin')),
            $this->optionalNotes($request->validated('notes')),
            $request->user()?->id,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Dosis registrada.']);

        return back();
    }

    public function omit(
        OmitPatientVaccinationDoseRequest $request,
        Patient $patient,
        PatientVaccinationDose $dose,
        OmitPatientVaccinationDoseAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);
        $this->ensurePatientBelongsToSelectedCompany($request->selectedCompany(), $patient);
        $this->ensureDoseBelongsToPatient($patient, $dose);

        $action->execute(
            $dose,
            $this->optionalNotes($request->validated('notes')),
            $request->user()?->id,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Dosis omitida.']);

        return back();
    }

    public function clearAdministration(
        ClearPatientVaccinationDoseAdministrationRequest $request,
        Patient $patient,
        PatientVaccinationDose $dose,
        ClearPatientVaccinationDoseAdministrationAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);
        $this->ensurePatientBelongsToSelectedCompany($request->selectedCompany(), $patient);
        $this->ensureDoseBelongsToPatient($patient, $dose);

        $action->execute($dose, $request->user()?->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Aplicación eliminada.']);

        return back();
    }

    public function updateDose(
        UpdatePatientVaccinationDoseRequest $request,
        Patient $patient,
        PatientVaccinationDose $dose,
        UpdatePatientVaccinationDoseAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);
        $this->ensurePatientBelongsToSelectedCompany($request->selectedCompany(), $patient);
        $this->ensureDoseBelongsToPatient($patient, $dose);

        $administeredOnRaw = $request->validated('administered_on');
        $originRaw = $request->validated('administered_origin');

        try {
            $action->execute(
                $dose,
                CarbonImmutable::parse((string) $request->validated('scheduled_on')),
                is_string($administeredOnRaw) && $administeredOnRaw !== ''
                    ? CarbonImmutable::parse($administeredOnRaw)->startOfDay()
                    : null,
                is_string($originRaw) && $originRaw !== ''
                    ? VaccinationAdministeredOrigin::from($originRaw)
                    : null,
                $this->optionalNotes($request->validated('notes')),
                $request->user()?->id,
            );
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['scheduled_on' => $exception->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Dosis actualizada.']);

        return back();
    }

    private function ensurePatientBelongsToSelectedCompany(?Company $company, Patient $patient): void
    {
        if (! $company instanceof Company || $patient->company_id !== $company->id) {
            abort(404);
        }
    }

    private function planForPatient(Patient $patient): PatientVaccinationPlan
    {
        $plan = PatientVaccinationPlan::query()
            ->where('patient_id', $patient->id)
            ->first();

        if (! $plan instanceof PatientVaccinationPlan) {
            abort(422, 'El paciente no tiene plan de vacunación.');
        }

        return $plan;
    }

    private function ensureDoseBelongsToPatient(Patient $patient, PatientVaccinationDose $dose): void
    {
        $belongs = PatientVaccinationPlan::query()
            ->where('id', $dose->plan_id)
            ->where('patient_id', $patient->id)
            ->exists();

        if (! $belongs) {
            abort(404);
        }
    }

    private function optionalNotes(mixed $notes): ?string
    {
        return is_string($notes) && $notes !== '' ? $notes : null;
    }
}
