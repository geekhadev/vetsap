<?php

use App\Http\Controllers\Purchase\ExpensesController;
use App\Http\Controllers\Purchase\ExpenseTypesController;
use App\Http\Controllers\Purchase\PurchaseOrdersController;
use App\Http\Controllers\Purchase\PurchaseOrderStatusesController;
use App\Http\Controllers\Purchase\SuppliersController;
use Illuminate\Support\Facades\Route;

Route::resource('suppliers', SuppliersController::class)->except(['show']);
Route::resource('purchase-order-statuses', PurchaseOrderStatusesController::class)->except(['show']);
Route::get('purchase-orders/products/search', [PurchaseOrdersController::class, 'searchProducts'])
    ->name('purchase-orders.products.search');
Route::get('purchase-orders/products/barcode', [PurchaseOrdersController::class, 'lookupProductByBarcode'])
    ->name('purchase-orders.products.barcode');
Route::resource('purchase-orders', PurchaseOrdersController::class)->except(['show']);
Route::resource('expense-types', ExpenseTypesController::class)->except(['show']);
Route::resource('expenses', ExpensesController::class)->except(['show']);
