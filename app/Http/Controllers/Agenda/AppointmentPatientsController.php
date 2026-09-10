<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Appointments\CreatePatientForAppointmentFormAction;
use App\Actions\Agenda\Appointments\LookupCustomerByDocumentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\CreatePatientForAppointmentRequest;
use App\Http\Requests\Agenda\LookupCustomerByDocumentRequest;
use App\Models\Company;
use App\Models\Medic\Patient;
use App\Models\Sale\Customer;
use Illuminate\Http\JsonResponse;

class AppointmentPatientsController extends Controller
{
    public function lookupCustomer(
        LookupCustomerByDocumentRequest $request,
        LookupCustomerByDocumentAction $lookup,
    ): JsonResponse {
        $this->authorize('create', Patient::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return response()->json(['customer' => null]);
        }

        $customer = $lookup->execute(
            $company->id,
            $request->documentType(),
            $request->documentNumber(),
        );

        return response()->json(['customer' => $customer]);
    }

    public function store(
        CreatePatientForAppointmentRequest $request,
        CreatePatientForAppointmentFormAction $action,
    ): JsonResponse {
        $this->authorize('create', Patient::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return response()->json([
                'message' => 'Debes seleccionar una empresa para crear pacientes.',
            ], 422);
        }

        $payload = $request->patientPayload();

        if ($payload['customer_id'] === null) {
            $this->authorize('create', Customer::class);
        }

        $patient = $action->execute($company->id, $payload);

        return response()->json([
            'patient' => $patient,
        ], 201);
    }
}
