<?php

use App\Http\Controllers\Medic\ClinicalAttentionsController;
use App\Http\Controllers\Medic\ClinicalTemplatesController;
use App\Http\Controllers\Medic\DoctorsController;
use App\Http\Controllers\Medic\DocumentTemplatesController;
use App\Http\Controllers\Medic\PatientsController;
use App\Http\Controllers\Medic\PatientVaccinationsController;
use App\Http\Controllers\Medic\ServicesController;
use App\Http\Controllers\Medic\SpecialtiesController;
use App\Http\Controllers\Medic\SpeciesController;
use App\Http\Controllers\Medic\VaccinationProtocolsController;
use Illuminate\Support\Facades\Route;

Route::resource('specialties', SpecialtiesController::class)->except(['show']);
Route::resource('services', ServicesController::class)->except(['show']);
Route::resource('species', SpeciesController::class)->except(['show']);
Route::resource('patients', PatientsController::class)->except(['show']);
Route::post('patients/{patient}/photo', [PatientsController::class, 'storePhoto'])
    ->name('patients.photo.store');
Route::put('patients/{patient}/draft-attention', [PatientsController::class, 'upsertDraftAttention'])
    ->name('patients.draft-attention.upsert');
Route::post('patients/{patient}/draft-attention/close', [PatientsController::class, 'closeDraftAttention'])
    ->name('patients.draft-attention.close');
Route::get('patients/{patient}/clinical-history/pdf', [PatientsController::class, 'downloadClinicalHistory'])
    ->name('patients.clinical-history.download');
Route::get('patients/{patient}/clinical-history/whatsapp', [PatientsController::class, 'whatsappClinicalHistory'])
    ->name('patients.clinical-history.whatsapp');
Route::post('patients/{patient}/vaccination-plan', [PatientVaccinationsController::class, 'storePlan'])
    ->name('patients.vaccination-plan.store');
Route::post('patients/{patient}/vaccination-doses', [PatientVaccinationsController::class, 'storeDose'])
    ->name('patients.vaccination-doses.store');
Route::post('patients/{patient}/vaccination-doses/{dose}/administer', [PatientVaccinationsController::class, 'administer'])
    ->name('patients.vaccination-doses.administer');
Route::post('patients/{patient}/vaccination-doses/{dose}/omit', [PatientVaccinationsController::class, 'omit'])
    ->name('patients.vaccination-doses.omit');
Route::post('patients/{patient}/vaccination-doses/{dose}/clear-administration', [PatientVaccinationsController::class, 'clearAdministration'])
    ->name('patients.vaccination-doses.clear-administration');
Route::put('patients/{patient}/vaccination-doses/{dose}', [PatientVaccinationsController::class, 'updateDose'])
    ->name('patients.vaccination-doses.update');
Route::resource('doctors', DoctorsController::class)->except(['show']);
Route::put('doctors/{doctor}/services', [DoctorsController::class, 'syncServices'])
    ->name('doctors.services.sync');
Route::put('doctors/{doctor}/schedule', [DoctorsController::class, 'syncSchedule'])
    ->name('doctors.schedule.sync');
Route::resource('clinical-templates', ClinicalTemplatesController::class)->except(['show']);
Route::resource('document-templates', DocumentTemplatesController::class)->except(['show']);
Route::resource('vaccination-protocols', VaccinationProtocolsController::class)->except(['show']);
Route::resource('clinical-attentions', ClinicalAttentionsController::class)->except(['show', 'create', 'edit', 'update']);
Route::get('clinical-attentions/{clinical_attention}/pdf', [ClinicalAttentionsController::class, 'download'])
    ->name('clinical-attentions.download');
Route::get(
    'clinical-attentions/{clinical_attention}/document-templates/{document_template}/pdf',
    [ClinicalAttentionsController::class, 'downloadDocumentTemplate'],
)->name('clinical-attentions.document-templates.download');
Route::get('clinical-attentions/{clinical_attention}/whatsapp', [ClinicalAttentionsController::class, 'whatsapp'])
    ->name('clinical-attentions.whatsapp');
Route::post('clinical-attentions/{clinical_attention}/exam-results/{service}', [ClinicalAttentionsController::class, 'storeExamResult'])
    ->name('clinical-attentions.exam-results.store');
Route::delete('clinical-attentions/{clinical_attention}/exam-results/{service}', [ClinicalAttentionsController::class, 'destroyExamResult'])
    ->name('clinical-attentions.exam-results.destroy');
