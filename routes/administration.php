<?php

use App\Http\Controllers\Administration\ModulesController;
use App\Http\Controllers\Administration\PermissionsController;
use App\Http\Controllers\Administration\SystemsController;
use Illuminate\Support\Facades\Route;

Route::resource('systems', SystemsController::class)->except(['show']);
Route::resource('modules', ModulesController::class)->except(['show']);

Route::put('permissions/owner-access/bulk', [PermissionsController::class, 'bulkUpdateOwnerAccess'])
    ->name('permissions.owner-access.bulk');
Route::put('permissions/{permission}/owner-access', [PermissionsController::class, 'updateOwnerAccess'])
    ->name('permissions.owner-access.update');
Route::resource('permissions', PermissionsController::class)->except(['show']);
