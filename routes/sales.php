<?php

use App\Http\Controllers\Sale\CertificationSiiTicketsController;
use App\Http\Controllers\Sale\SiiCafsController;
use Illuminate\Support\Facades\Route;

Route::get('sii-certification-tickets', [CertificationSiiTicketsController::class, 'index'])
    ->name('sii-certification-tickets.index');
Route::post('sii-certification-tickets', [CertificationSiiTicketsController::class, 'store'])
    ->name('sii-certification-tickets.store');
Route::get('sii-certification-tickets/{certificationSiiTicket}/download/{kind}', [CertificationSiiTicketsController::class, 'download'])
    ->whereUuid('certificationSiiTicket')
    ->whereIn('kind', ['caf', 'envio_dte', 'consumo_folios'])
    ->name('sii-certification-tickets.download');

Route::get('sii-cafs', [SiiCafsController::class, 'index'])
    ->name('sii-cafs.index');
Route::post('sii-cafs', [SiiCafsController::class, 'store'])
    ->name('sii-cafs.store');
Route::delete('sii-cafs/{sii_caf}', [SiiCafsController::class, 'destroy'])
    ->name('sii-cafs.destroy');

// Prototype route — no controller, no auth checks; remove before production
Route::get('sii-certification-invoices/prototype', function () {
    return inertia('sale/sii-certification-invoices/index');
})->name('sii-certification-invoices.prototype');
