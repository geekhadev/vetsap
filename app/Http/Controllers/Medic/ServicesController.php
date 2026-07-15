<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Configuration\CalendarSettings\ResolveCalendarTimeBlockMinutesAction;
use App\Actions\Medic\Services\CreateServiceAction;
use App\Actions\Medic\Services\DeleteServiceAction;
use App\Actions\Medic\Services\ListServicesForCompanyAction;
use App\Actions\Medic\Services\UpdateServiceAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\ServiceListRequest;
use App\Http\Requests\Medic\ServiceStoreRequest;
use App\Http\Requests\Medic\ServiceUpdateRequest;
use App\Models\Company;
use App\Models\Medic\Service;
use App\Models\Medic\Specialty;
use App\Support\Configuration\CalendarSettingKeys;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ServicesController extends Controller
{
    public function index(
        ServiceListRequest $request,
        ListServicesForCompanyAction $list,
        ResolveCalendarTimeBlockMinutesAction $resolveTimeBlockMinutes,
    ): Response {
        $this->authorize('viewAny', Service::class);

        $company = $this->resolveCompany($request);
        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        $user = $request->user();
        $timeBlockMinutes = $company instanceof Company
            ? $resolveTimeBlockMinutes->execute($company)
            : (int) CalendarSettingKeys::defaults()[CalendarSettingKeys::TIME_BLOCK_MINUTES];

        return Inertia::render('medic/services/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'specialties' => $company instanceof Company
                ? Specialty::query()
                    ->forCompanyOrGlobal($company->id)
                    ->orderBy('name')
                    ->get(['id', 'name', 'is_active'])
                : [],
            'time_block_minutes' => $timeBlockMinutes,
            'can' => [
                'create' => $user?->can('create', Service::class) ?? false,
                'update' => $user?->can('updateAny', Service::class) ?? false,
                'delete' => $user?->can('deleteAny', Service::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Service::class);

        return to_route('medic.services.index');
    }

    public function store(ServiceStoreRequest $request, CreateServiceAction $action): RedirectResponse
    {
        $this->authorize('create', Service::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear servicios.']);
        }

        $action->execute($request->servicePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servicio creado correctamente.']);

        return to_route('medic.services.index');
    }

    public function edit(Service $service): RedirectResponse
    {
        $this->authorize('update', $service);

        return to_route('medic.services.index');
    }

    public function update(
        ServiceUpdateRequest $request,
        Service $service,
        UpdateServiceAction $action,
    ): RedirectResponse {
        $this->authorize('update', $service);

        $action->execute($service, $request->servicePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servicio actualizado correctamente.']);

        return to_route('medic.services.index');
    }

    public function destroy(Service $service, DeleteServiceAction $action): RedirectResponse
    {
        $this->authorize('delete', $service);

        $action->execute($service);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servicio eliminado.']);

        return to_route('medic.services.index');
    }
}
