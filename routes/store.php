<?php

use App\Http\Controllers\Store\InventoryMovementsController;
use App\Http\Controllers\Store\MovementCategoriesController;
use App\Http\Controllers\Store\ProductCategoriesController;
use App\Http\Controllers\Store\ProductMovementsController;
use App\Http\Controllers\Store\ProductsController;
use App\Http\Controllers\Store\ProductTypesController;
use Illuminate\Support\Facades\Route;

Route::resource('product-types', ProductTypesController::class)->except(['show']);
Route::resource('product-categories', ProductCategoriesController::class)->except(['show']);
Route::get('products/search', [ProductsController::class, 'search'])->name('products.search');
Route::get('products/barcode', [ProductsController::class, 'lookupByBarcode'])->name('products.barcode');
Route::resource('products', ProductsController::class)->except(['show']);
Route::resource('movement-categories', MovementCategoriesController::class)->except(['show']);
Route::resource('inventory-movements', InventoryMovementsController::class)->only(['index', 'create', 'store']);
Route::get('product-movements', [ProductMovementsController::class, 'index'])->name('product-movements.index');
