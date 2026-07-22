<?php

namespace App\Http\Controllers\Customer;

use App\Actions\Customer\Pets\BuildCustomerPetTimelineAction;
use App\Actions\Customer\Pets\ListPetsForCustomerUserAction;
use App\Http\Controllers\Controller;
use App\Models\Medic\Patient;
use App\Models\User;
use App\Support\SelectedCompanySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PetsController extends Controller
{
    public function index(
        Request $request,
        ListPetsForCustomerUserAction $listPets,
    ): Response {
        $user = $request->user();
        assert($user instanceof User);

        $pets = $listPets->execute(
            $user,
            SelectedCompanySession::selectedCompanyId($request),
        );

        return Inertia::render('customer/pets/index', [
            'pets' => $pets,
        ]);
    }

    public function attentions(
        Request $request,
        Patient $patient,
        BuildCustomerPetTimelineAction $buildTimeline,
    ): JsonResponse {
        $user = $request->user();
        assert($user instanceof User);

        $timeline = $buildTimeline->execute(
            $user,
            $patient,
            SelectedCompanySession::selectedCompanyId($request),
        );

        return response()->json($timeline);
    }
}
