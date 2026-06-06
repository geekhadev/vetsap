<?php

namespace App\Http\Controllers\Agenda;

use App\Actions\Agenda\Holidays\CreateHolidayAction;
use App\Actions\Agenda\Holidays\DeleteHolidayAction;
use App\Actions\Agenda\Holidays\ListHolidaysForCompanyAction;
use App\Actions\Agenda\Holidays\UpdateHolidayAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\HolidayListRequest;
use App\Http\Requests\Agenda\HolidayStoreRequest;
use App\Http\Requests\Agenda\HolidayUpdateRequest;
use App\Models\Agenda\Holiday;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class HolidaysController extends Controller
{
    public function index(
        HolidayListRequest $request,
        ListHolidaysForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Holiday::class);

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

        return Inertia::render('agenda/holidays/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', Holiday::class) ?? false,
                'update' => $user?->can('updateAny', Holiday::class) ?? false,
                'delete' => $user?->can('deleteAny', Holiday::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Holiday::class);

        return to_route('agenda.holidays.index');
    }

    public function store(HolidayStoreRequest $request, CreateHolidayAction $action): RedirectResponse
    {
        $this->authorize('create', Holiday::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear días feriados.']);
        }

        $action->execute($request->holidayPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Día feriado creado correctamente.']);

        return to_route('agenda.holidays.index');
    }

    public function edit(Holiday $holiday): RedirectResponse
    {
        $this->authorize('update', $holiday);

        return to_route('agenda.holidays.index');
    }

    public function update(
        HolidayUpdateRequest $request,
        Holiday $holiday,
        UpdateHolidayAction $action,
    ): RedirectResponse {
        $this->authorize('update', $holiday);

        $action->execute($holiday, $request->holidayPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Día feriado actualizado correctamente.']);

        return to_route('agenda.holidays.index');
    }

    public function destroy(Holiday $holiday, DeleteHolidayAction $action): RedirectResponse
    {
        $this->authorize('delete', $holiday);

        $action->execute($holiday);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Día feriado eliminado.']);

        return to_route('agenda.holidays.index');
    }
}
