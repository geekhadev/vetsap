<?php

use App\Http\Controllers\Sale\CashRegistersController;
use App\Http\Controllers\Sale\CertificationSiiTicketsController;
use App\Http\Controllers\Sale\CustomersController;
use App\Http\Controllers\Sale\PosController;
use App\Http\Controllers\Sale\ReceivedPaymentsController;
use App\Http\Controllers\Sale\SaleDocumentsController;
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

Route::resource('customers', CustomersController::class)->except(['show']);
Route::put('customers/{customer}/portal-user', [CustomersController::class, 'upsertPortalUser'])
    ->whereUuid('customer')
    ->name('customers.portal-user.upsert');
Route::delete('customers/{customer}/portal-user', [CustomersController::class, 'destroyPortalUser'])
    ->whereUuid('customer')
    ->name('customers.portal-user.destroy');

Route::get('sale-documents', [SaleDocumentsController::class, 'index'])
    ->name('sale-documents.index');
Route::get('sale-documents/{sale_document}', [SaleDocumentsController::class, 'show'])
    ->whereUuid('sale_document')
    ->name('sale-documents.show');
Route::get('sale-documents/{sale_document}/payments', [SaleDocumentsController::class, 'payments'])
    ->whereUuid('sale_document')
    ->name('sale-documents.payments');
Route::delete('sale-documents/{sale_document}', [SaleDocumentsController::class, 'destroy'])
    ->whereUuid('sale_document')
    ->name('sale-documents.destroy');

Route::get('pos/customers/search', [PosController::class, 'searchCustomers'])
    ->name('pos.customers.search');
Route::get('pos/customers/{customer}/draft-attentions', [PosController::class, 'customerDraftAttentions'])
    ->whereUuid('customer')
    ->name('pos.customers.draft-attentions');
Route::post('pos/customers/{customer}/draft-products', [PosController::class, 'upsertDraftProduct'])
    ->whereUuid('customer')
    ->name('pos.customers.draft-products');
Route::patch('pos/customers/{customer}/draft-details/{detail}', [PosController::class, 'updateDraftDetailQuantity'])
    ->whereUuid('customer')
    ->whereUuid('detail')
    ->name('pos.customers.draft-details.update');
Route::delete('pos/customers/{customer}/draft-details/{detail}', [PosController::class, 'destroyDraftDetail'])
    ->whereUuid('customer')
    ->whereUuid('detail')
    ->name('pos.customers.draft-details.destroy');
Route::patch('pos/customers/{customer}/draft-global-discount', [PosController::class, 'updateDraftGlobalDiscount'])
    ->whereUuid('customer')
    ->name('pos.customers.draft-global-discount');
Route::get('pos/options', [PosController::class, 'options'])
    ->name('pos.options');
Route::post('pos/charge', [PosController::class, 'charge'])
    ->name('pos.charge');

Route::get('cash-registers', [CashRegistersController::class, 'index'])
    ->name('cash-registers.index');
Route::post('cash-registers', [CashRegistersController::class, 'store'])
    ->name('cash-registers.store');
Route::post('cash-registers/{cash_register}/close', [CashRegistersController::class, 'close'])
    ->whereUuid('cash_register')
    ->name('cash-registers.close');

Route::get('received-payments', [ReceivedPaymentsController::class, 'index'])
    ->name('received-payments.index');

Route::get('sii-cafs', [SiiCafsController::class, 'index'])
    ->name('sii-cafs.index');
Route::post('sii-cafs', [SiiCafsController::class, 'store'])
    ->name('sii-cafs.store');
Route::delete('sii-cafs/{sii_caf}', [SiiCafsController::class, 'destroy'])
    ->whereUuid('sii_caf')
    ->name('sii-cafs.destroy');

// Prototype route — no controller, no auth checks; remove before production
Route::get('sii-certification-invoices/prototype', function () {
    return inertia('sale/sii-certification-invoices/index');
})->name('sii-certification-invoices.prototype');
