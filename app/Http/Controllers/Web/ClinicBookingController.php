<?php

namespace App\Http\Controllers\Web;

use App\Actions\Web\Clinic\CreatePublicWebAppointmentAction;
use App\Actions\Web\Clinic\LookupCustomerByPhoneForWebBookingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\ClinicBookingLookupRequest;
use App\Http\Requests\Web\ClinicBookingStoreRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

class ClinicBookingController extends Controller
{
    public function lookupClient(
        ClinicBookingLookupRequest $request,
        string $slug,
        LookupCustomerByPhoneForWebBookingAction $lookupCustomer,
    ): JsonResponse {
        $company = Company::query()->where('slug', $slug)->firstOrFail();

        $client = $lookupCustomer->execute(
            $company->id,
            (string) $request->validated('phone'),
        );

        return response()->json([
            'client' => $client,
        ]);
    }

    public function storeAppointment(
        ClinicBookingStoreRequest $request,
        string $slug,
        CreatePublicWebAppointmentAction $createAppointment,
    ): JsonResponse {
        $company = Company::query()->where('slug', $slug)->firstOrFail();

        $appointment = $createAppointment->execute(
            $company->id,
            $request->bookingPayload(),
        );

        return response()->json([
            'appointment' => [
                'id' => $appointment->id,
                'starts_at' => $appointment->starts_at->toIso8601String(),
                'ends_at' => $appointment->ends_at->toIso8601String(),
            ],
        ], 201);
    }
}
