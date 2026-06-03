<?php

namespace App\Http\Controllers\Shared;

use App\Actions\Shared\SiiEconomicActivities\CreateSiiEconomicActivityAction;
use App\Actions\Shared\SiiEconomicActivities\DeleteSiiEconomicActivityAction;
use App\Actions\Shared\SiiEconomicActivities\ListSiiEconomicActivitiesAction;
use App\Actions\Shared\SiiEconomicActivities\UpdateSiiEconomicActivityAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shared\SiiEconomicActivitiesRequest;
use App\Http\Requests\Shared\SiiEconomicActivityListRequest;
use App\Models\Shared\SiiEconomicActivity;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiiEconomicActivitiesController extends Controller
{
    public function index(SiiEconomicActivityListRequest $request, ListSiiEconomicActivitiesAction $action): Response
    {
        $this->authorize('viewAny', SiiEconomicActivity::class);

        $activities = $action->execute($request->filtersForAction());

        return Inertia::render('shared/sii-economic-activities/index', [
            'data' => $activities,
            'filters' => $request->filtersForFrontend(),
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', SiiEconomicActivity::class);

        return to_route('shared.sii-economic-activities.index');
    }

    public function store(SiiEconomicActivitiesRequest $request, CreateSiiEconomicActivityAction $action): RedirectResponse
    {
        $this->authorize('create', SiiEconomicActivity::class);

        $action->execute($request->siiEconomicActivityPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Actividad económica creada.']);

        return to_route('shared.sii-economic-activities.index');
    }

    public function edit(SiiEconomicActivity $siiEconomicActivity): RedirectResponse
    {
        $this->authorize('update', $siiEconomicActivity);

        return to_route('shared.sii-economic-activities.index');
    }

    public function update(SiiEconomicActivitiesRequest $request, SiiEconomicActivity $siiEconomicActivity, UpdateSiiEconomicActivityAction $action): RedirectResponse
    {
        $this->authorize('update', $siiEconomicActivity);

        $action->execute($siiEconomicActivity, $request->siiEconomicActivityPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Actividad económica actualizada.']);

        return to_route('shared.sii-economic-activities.index');
    }

    public function destroy(SiiEconomicActivity $siiEconomicActivity, DeleteSiiEconomicActivityAction $action): RedirectResponse
    {
        $this->authorize('delete', $siiEconomicActivity);

        $action->execute($siiEconomicActivity);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Actividad económica eliminada.']);

        return to_route('shared.sii-economic-activities.index');
    }
}
