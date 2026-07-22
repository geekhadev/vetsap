<?php

namespace App\Http\Controllers\Customer;

use App\Actions\Customer\Appointments\BuildCustomerAppointmentFormOptionsAction;
use App\Actions\Customer\Appointments\CreateCustomerAppointmentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AppointmentStoreRequest;
use App\Models\User;
use App\Support\SelectedCompanySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AppointmentsController extends Controller
{
    public function formOptions(
        Request $request,
        BuildCustomerAppointmentFormOptionsAction $buildFormOptions,
    ): JsonResponse {
        $user = $request->user();
        assert($user instanceof User);

        $companyId = $this->requireSelectedCompanyId($request);

        return response()->json(
            $buildFormOptions->execute($user, $companyId),
        );
    }

    public function store(
        AppointmentStoreRequest $request,
        CreateCustomerAppointmentAction $createAppointment,
    ): JsonResponse {
        $user = $request->user();
        assert($user instanceof User);

        $companyId = $this->requireSelectedCompanyId($request);

        $appointment = $createAppointment->execute(
            $user,
            $companyId,
            $request->appointmentPayload(),
        );

        return response()->json([
            'appointment' => [
                'id' => $appointment->id,
                'starts_at' => $appointment->starts_at->toIso8601String(),
                'ends_at' => $appointment->ends_at->toIso8601String(),
            ],
        ], 201);
    }

    private function requireSelectedCompanyId(Request $request): string
    {
        $companyId = SelectedCompanySession::selectedCompanyId($request);

        if ($companyId === null) {
            throw new HttpException(422, 'Debes seleccionar una clínica.');
        }

        return $companyId;
    }
}
