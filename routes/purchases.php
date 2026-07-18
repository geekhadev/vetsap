<?php

use App\Http\Controllers\Purchase\ExpenseTypesController;
use App\Http\Controllers\Purchase\PurchaseOrderStatusesController;
use App\Http\Controllers\Purchase\SuppliersController;
use Illuminate\Support\Facades\Route;

Route::resource('suppliers', SuppliersController::class)->except(['show']);
Route::resource('purchase-order-statuses', PurchaseOrderStatusesController::class)->except(['show']);
Route::resource('expense-types', ExpenseTypesController::class)->except(['show']);
