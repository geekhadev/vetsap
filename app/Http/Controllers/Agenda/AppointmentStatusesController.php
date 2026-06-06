<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\AppointmentStatuses\CreateAppointmentStatusAction;
use App\Actions\Agenda\AppointmentStatuses\DeleteAppointmentStatusAction;
use App\Actions\Agenda\AppointmentStatuses\ListAppointmentStatusesForCompanyAction;
use App\Actions\Agenda\AppointmentStatuses\UpdateAppointmentStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\AppointmentStatusListRequest;
use App\Http\Requests\Agenda\AppointmentStatusStoreRequest;
use App\Http\Requests\Agenda\AppointmentStatusUpdateRequest;
use App\Models\Agenda\AppointmentStatus;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentStatusesController extends Controller
{
    public function index(
        AppointmentStatusListRequest $request,
        ListAppointmentStatusesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', AppointmentStatus::class);

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

        return Inertia::render('agenda/appointment-statuses/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', AppointmentStatus::class) ?? false,
                'update' => $user?->can('updateAny', AppointmentStatus::class) ?? false,
                'delete' => $user?->can('deleteAny', AppointmentStatus::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', AppointmentStatus::class);

        return to_route('agenda.appointment-statuses.index');
    }

    public function store(AppointmentStatusStoreRequest $request, CreateAppointmentStatusAction $action): RedirectResponse
    {
        $this->authorize('create', AppointmentStatus::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear estados de cita.']);
        }

        $action->execute($request->appointmentStatusPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de cita creado correctamente.']);

        return to_route('agenda.appointment-statuses.index');
    }

    public function edit(AppointmentStatus $appointmentStatus): RedirectResponse
    {
        $this->authorize('update', $appointmentStatus);

        return to_route('agenda.appointment-statuses.index');
    }

    public function update(
        AppointmentStatusUpdateRequest $request,
        AppointmentStatus $appointmentStatus,
        UpdateAppointmentStatusAction $action,
    ): RedirectResponse {
        $this->authorize('update', $appointmentStatus);

        $action->execute($appointmentStatus, $request->appointmentStatusPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de cita actualizado correctamente.']);

        return to_route('agenda.appointment-statuses.index');
    }

    public function destroy(AppointmentStatus $appointmentStatus, DeleteAppointmentStatusAction $action): RedirectResponse
    {
        $this->authorize('delete', $appointmentStatus);

        $action->execute($appointmentStatus);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de cita eliminado.']);

        return to_route('agenda.appointment-statuses.index');
    }
}
