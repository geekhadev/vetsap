<?php

use App\Http\Controllers\Store\ProductCategoriesController;
use App\Http\Controllers\Store\ProductsController;
use App\Http\Controllers\Store\ProductTypesController;
use Illuminate\Support\Facades\Route;

Route::resource('product-types', ProductTypesController::class)->except(['show']);
Route::resource('product-categories', ProductCategoriesController::class)->except(['show']);
Route::resource('products', ProductsController::class)->except(['show']);
