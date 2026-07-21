<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Agenda\Appointments\BuildAppointmentFormOptionsAction;
use App\Actions\Agenda\AppointmentStatuses\ListActiveAppointmentStatusesForCalendarAction;
use App\Actions\Agenda\Holidays\ListActiveHolidaysForCalendarAction;
use App\Actions\Medic\ClinicalAttentions\BuildPatientClinicalHistoryWhatsappShareUrlAction;
use App\Actions\Medic\ClinicalAttentions\ClosePatientDraftAttentionAction;
use App\Actions\Medic\ClinicalAttentions\GeneratePatientClinicalHistoryPdfAction;
use App\Actions\Medic\ClinicalAttentions\UpsertPatientDraftAttentionAction;
use App\Actions\Medic\Patients\CreatePatientAction;
use App\Actions\Medic\Patients\DeletePatientAction;
use App\Actions\Medic\Patients\ListPatientsForCompanyAction;
use App\Actions\Medic\Patients\StorePatientPhotoAction;
use App\Actions\Medic\Patients\UpdatePatientAction;
use App\Actions\Medic\PatientVaccinations\BuildPatientVaccinationEditPropsAction;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\PatientDraftAttentionCloseRequest;
use App\Http\Requests\Medic\PatientDraftAttentionUpsertRequest;
use App\Http\Requests\Medic\PatientListRequest;
use App\Http\Requests\Medic\PatientStoreRequest;
use App\Http\Requests\Medic\PatientUpdateRequest;
use App\Http\Requests\Medic\StorePatientPhotoRequest;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Doctor;
use App\Models\Medic\DocumentTemplate;
use App\Models\Medic\Patient;
use App\Models\Medic\Service;
use App\Models\Medic\Species;
use App\Models\Sale\Customer;
use App\Support\Storage\PublicStorageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class PatientsController extends Controller
{
    public function index(
        PatientListRequest $request,
        ListPatientsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Patient::class);

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

        return Inertia::render('medic/patients/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompanyOrGlobal($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
            'customers' => $company instanceof Company
                ? Customer::query()
                    ->forCompany($company->id)
                    ->orderBy('name')
                    ->get(['id', 'name', 'document_type', 'document_number'])
                : [],
            'can' => [
                'create' => $user?->can('create', Patient::class) ?? false,
                'update' => $user?->can('updateAny', Patient::class) ?? false,
                'delete' => $user?->can('deleteAny', Patient::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Patient::class);

        return to_route('medic.patients.index');
    }

    public function store(PatientStoreRequest $request, CreatePatientAction $action): RedirectResponse
    {
        $this->authorize('create', Patient::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear pacientes.']);
        }

        $action->execute($request->patientPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente creado correctamente.']);

        return $this->redirectAfterSave($request->redirectTarget());
    }

    public function edit(
        Patient $patient,
        Request $request,
        BuildAppointmentFormOptionsAction $buildAppointmentFormOptions,
        ListActiveHolidaysForCalendarAction $listActiveHolidays,
        ListActiveAppointmentStatusesForCalendarAction $listAppointmentStatuses,
        BuildPatientVaccinationEditPropsAction $buildVaccinationEditProps,
    ): Response {
        $this->authorize('update', $patient);

        $company = $this->resolveCompany($request);
        $patient->load([
            'species:id,name',
            'customer:id,name,document_type,document_number,email,phone,address',
        ]);
        $patient->append('photo_url');

        $user = $request->user();

        $activeTab = in_array($request->query('tab'), ['historial', 'nueva-atencion'], true)
            ? $request->query('tab')
            : 'historial';

        $draftAttention = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->draft()
            ->with(['values', 'template.fields', 'requestedServices:id,name', 'documentTemplates:id,title'])
            ->first();

        if (! $request->has('tab') && $draftAttention instanceof ClinicalAttention) {
            $activeTab = 'nueva-atencion';
        }

        $attentions = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->whereIn('status', [
                ClinicalAttentionStatus::Draft,
                ClinicalAttentionStatus::Closed,
            ])
            ->with([
                'template:id,name',
                'doctor:id,first_name,last_name',
                'values',
                'requestedServices:id,name',
                'documentTemplates:id,title',
            ])
            ->orderByRaw('CASE WHEN status = ? THEN 0 ELSE 1 END', [ClinicalAttentionStatus::Draft->value])
            ->orderByDesc('closed_at')
            ->orderByDesc('started_at')
            ->get();

        $linkedAppointmentIds = $attentions
            ->pluck('appointment_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $appointments = Appointment::query()
            ->where('patient_id', $patient->id)
            ->whereHas(
                'appointmentStatus',
                static fn ($query) => $query->where('is_terminal', false),
            )
            ->when(
                $linkedAppointmentIds !== [],
                static fn ($query) => $query->whereNotIn('id', $linkedAppointmentIds),
            )
            ->with([
                'service:id,name',
                'doctor:id,first_name,last_name',
                'appointmentStatus:id,name',
            ])
            ->orderByDesc('starts_at')
            ->get();

        $appointmentFormOptions = $company instanceof Company
            ? $buildAppointmentFormOptions->execute($company->id)
            : [
                'doctors' => [],
                'services' => [],
                'patients' => [],
                'offices' => [],
            ];

        $appointmentFormOptions['patients'] = collect($appointmentFormOptions['patients'])
            ->filter(static fn (array $option): bool => $option['id'] === $patient->id)
            ->values()
            ->all();

        $vaccinationProps = $buildVaccinationEditProps->execute(
            $patient,
            $company instanceof Company ? $company : null,
        );

        return Inertia::render('medic/patients/edit', [
            'patient' => $patient,
            'redirectTo' => $request->query('redirect_to') === 'customers' ? 'customers' : 'patients',
            'activeTab' => $activeTab,
            'draftAttention' => $draftAttention instanceof ClinicalAttention
                ? $this->mapDraftAttention($draftAttention)
                : null,
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompanyOrGlobal($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
            'customers' => $company instanceof Company
                ? Customer::query()
                    ->forCompany($company->id)
                    ->orderBy('name')
                    ->get(['id', 'name', 'document_type', 'document_number', 'email', 'phone', 'address'])
                : [],
            'templates' => $company instanceof Company
                ? ClinicalTemplate::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderByDesc('is_default')
                    ->orderBy('name')
                    ->with('fields')
                    ->get(['id', 'name', 'is_default'])
                : [],
            'doctors' => $company instanceof Company
                ? Doctor::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('first_name')
                    ->get(['id', 'first_name', 'last_name'])
                : [],
            'examServices' => $company instanceof Company
                ? $this->examServicesForCompany($company->id)
                : [],
            'documentTemplates' => $company instanceof Company
                ? DocumentTemplate::query()
                    ->forCompany($company->id)
                    ->orderBy('title')
                    ->get(['id', 'title'])
                    ->map(static fn (DocumentTemplate $template): array => [
                        'id' => $template->id,
                        'title' => $template->title,
                    ])
                    ->values()
                    ->all()
                : [],
            'attentions' => $attentions->map(fn (ClinicalAttention $attention): array => [
                'id' => $attention->id,
                'status' => $attention->status instanceof ClinicalAttentionStatus
                    ? $attention->status->value
                    : (string) $attention->status,
                'template_id' => $attention->template_id,
                'template_name' => $attention->template?->name,
                'doctor_name' => $attention->doctor
                    ? "{$attention->doctor->first_name} {$attention->doctor->last_name}"
                    : null,
                'started_at' => $attention->started_at,
                'closed_at' => $attention->closed_at,
                'created_at' => $attention->created_at,
                'values' => $attention->values
                    ->mapWithKeys(fn ($value) => [
                        $value->field_key => $value->value,
                    ])
                    ->all(),
                'requested_exams' => $attention->requestedServices
                    ->map(fn (Service $service): array => $this->mapRequestedExam($service))
                    ->values()
                    ->all(),
                'document_templates' => $attention->documentTemplates
                    ->map(static fn (DocumentTemplate $template): array => [
                        'id' => $template->id,
                        'title' => $template->title,
                    ])
                    ->values()
                    ->all(),
            ]),
            'appointments' => $appointments->map(static fn (Appointment $appointment): array => [
                'id' => $appointment->id,
                'service_name' => $appointment->service?->name,
                'doctor_name' => $appointment->doctor
                    ? "{$appointment->doctor->first_name} {$appointment->doctor->last_name}"
                    : null,
                'starts_at' => $appointment->starts_at,
                'ends_at' => $appointment->ends_at,
                'status_name' => $appointment->appointmentStatus?->name,
            ]),
            'appointmentFormOptions' => $appointmentFormOptions,
            'appointmentHolidays' => $company instanceof Company
                ? $listActiveHolidays->execute($company->id)
                : [],
            'appointmentStatuses' => $company instanceof Company
                ? $listAppointmentStatuses->execute($company->id)
                : [],
            ...$vaccinationProps,
            'can' => [
                'attentions' => [
                    'create' => $user?->can('create', ClinicalAttention::class) ?? false,
                    'update' => $user?->can('updateAny', ClinicalAttention::class) ?? false,
                    'delete' => $user?->can('deleteAny', ClinicalAttention::class) ?? false,
                ],
                'appointments' => [
                    'create' => $user?->can('create', Appointment::class) ?? false,
                    'update' => $user?->can('updateAny', Appointment::class) ?? false,
                    'delete' => $user?->can('deleteAny', Appointment::class) ?? false,
                ],
            ],
        ]);
    }

    /**
     * @return array{
     *     id: string,
     *     company_id: string,
     *     appointment_id: string|null,
     *     template_id: string,
     *     patient_id: string,
     *     doctor_id: string|null,
     *     status: string,
     *     values: mixed,
     *     requested_services: list<array{
     *         id: string,
     *         name: string,
     *         is_uploaded: bool,
     *         file_url: string|null,
     *         file_name: string|null,
     *         mime_type: string|null
     *     }>,
     *     document_templates: list<array{id: string, title: string}>,
     *     started_at: mixed,
     *     closed_at: mixed,
     *     created_at: mixed,
     *     updated_at: mixed
     * }
     */
    protected function mapDraftAttention(ClinicalAttention $draft): array
    {
        return [
            'id' => $draft->id,
            'company_id' => $draft->company_id,
            'appointment_id' => $draft->appointment_id,
            'template_id' => $draft->template_id,
            'patient_id' => $draft->patient_id,
            'doctor_id' => $draft->doctor_id,
            'status' => $draft->status instanceof ClinicalAttentionStatus
                ? $draft->status->value
                : (string) $draft->status,
            'values' => $draft->values,
            'requested_services' => $draft->requestedServices
                ->map(fn (Service $service): array => $this->mapRequestedExam($service))
                ->values()
                ->all(),
            'document_templates' => $draft->documentTemplates
                ->map(static fn (DocumentTemplate $template): array => [
                    'id' => $template->id,
                    'title' => $template->title,
                ])
                ->values()
                ->all(),
            'started_at' => $draft->started_at,
            'closed_at' => $draft->closed_at,
            'created_at' => $draft->created_at,
            'updated_at' => $draft->updated_at,
        ];
    }

    /**
     * @return array{
     *     id: string,
     *     name: string,
     *     is_uploaded: bool,
     *     file_url: string|null,
     *     file_name: string|null,
     *     mime_type: string|null,
     * }
     */
    protected function mapRequestedExam(Service $service): array
    {
        $path = $service->pivot->result_path;
        $isUploaded = is_string($path) && $path !== '';

        return [
            'id' => $service->id,
            'name' => $service->name,
            'is_uploaded' => $isUploaded,
            'file_url' => $isUploaded ? PublicStorageUrl::fromRelativePath($path) : null,
            'file_name' => $isUploaded ? ($service->pivot->result_original_name ?: null) : null,
            'mime_type' => $isUploaded ? ($service->pivot->result_mime_type ?: null) : null,
        ];
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    protected function examServicesForCompany(string $companyId): array
    {
        return Service::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->whereHas(
                'specialty',
                static fn ($query) => $query
                    ->where('is_active', true)
                    ->where(static function ($specialtyQuery): void {
                        $specialtyQuery
                            ->whereRaw('LOWER(name) = ?', ['exámenes'])
                            ->orWhereRaw('LOWER(name) = ?', ['examenes']);
                    }),
            )
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static fn (Service $service): array => [
                'id' => $service->id,
                'name' => $service->name,
            ])
            ->values()
            ->all();
    }

    public function upsertDraftAttention(
        PatientDraftAttentionUpsertRequest $request,
        Patient $patient,
        UpsertPatientDraftAttentionAction $action,
    ): JsonResponse {
        $this->authorize('update', $patient);
        $this->authorize('create', ClinicalAttention::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            abort(422, 'Debes seleccionar una empresa.');
        }

        if ($patient->company_id !== $company->id) {
            abort(404);
        }

        try {
            $draft = $action->execute(
                $patient,
                $company->id,
                $request->draftPayload(),
                $request->user()?->id,
            );
        } catch (\RuntimeException $exception) {
            abort(422, $exception->getMessage());
        }

        return response()->json($this->mapDraftAttention($draft));
    }

    public function closeDraftAttention(
        PatientDraftAttentionCloseRequest $request,
        Patient $patient,
        ClosePatientDraftAttentionAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['template_id' => 'Debes seleccionar una empresa.']);
        }

        if ($patient->company_id !== $company->id) {
            abort(404);
        }

        $draft = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->where('status', ClinicalAttentionStatus::Draft)
            ->first();

        if (! $draft instanceof ClinicalAttention) {
            return back()->withErrors(['template_id' => 'No hay una atención en borrador para cerrar.']);
        }

        $this->authorize('update', $draft);

        $action->execute($draft, $request->closePayload($patient->id));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Atención completada correctamente.']);

        return redirect(route('medic.patients.edit', [
            'patient' => $patient->id,
            'tab' => 'historial',
        ]));
    }

    public function update(
        PatientUpdateRequest $request,
        Patient $patient,
        UpdatePatientAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);

        $action->execute($patient, $request->patientPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente actualizado correctamente.']);

        if ($request->redirectTarget() === 'customers') {
            return to_route('sale.customers.index');
        }

        return to_route('medic.patients.edit', $patient);
    }

    public function storePhoto(
        StorePatientPhotoRequest $request,
        Patient $patient,
        StorePatientPhotoAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);

        /** @var UploadedFile $file */
        $file = $request->file('photo');
        $action->execute($patient, $file);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Foto del paciente actualizada.']);

        return back();
    }

    public function downloadClinicalHistory(
        Patient $patient,
        GeneratePatientClinicalHistoryPdfAction $action,
    ): HttpResponse {
        $this->authorize('update', $patient);

        try {
            $pdf = $action->execute($patient);
        } catch (\RuntimeException $exception) {
            abort(404, $exception->getMessage());
        }

        return response($pdf['content'], 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$pdf['filename'].'"',
        ]);
    }

    public function whatsappClinicalHistory(
        Patient $patient,
        BuildPatientClinicalHistoryWhatsappShareUrlAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);

        try {
            return redirect()->away($action->execute($patient));
        } catch (\RuntimeException $exception) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $exception->getMessage()]);

            return back();
        }
    }

    public function destroy(Patient $patient, DeletePatientAction $action, Request $request): RedirectResponse
    {
        $this->authorize('delete', $patient);

        $action->execute($patient);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente eliminado.']);

        $target = $request->input('redirect_to') === 'customers' ? 'customers' : 'patients';

        return $this->redirectAfterSave($target);
    }

    protected function redirectAfterSave(string $target): RedirectResponse
    {
        if ($target === 'customers') {
            return to_route('sale.customers.index');
        }

        return to_route('medic.patients.index');
    }
}
