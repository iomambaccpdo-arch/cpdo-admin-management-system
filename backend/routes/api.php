<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\RecordController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgot']);

Route::middleware('api.auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/password', [AuthController::class, 'updatePassword']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/records/export', [RecordController::class, 'export']);
    Route::get('/records/history', [RecordController::class, 'history']);
    Route::get('/records', [RecordController::class, 'index']);
    Route::post('/records', [RecordController::class, 'store']);
    Route::match(['put', 'post'], '/records/{record}', [RecordController::class, 'update']);
    Route::delete('/records/{record}', [RecordController::class, 'destroy']);

    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);

    Route::get('/files', [DocumentController::class, 'index'])->name('files.index');
    Route::post('/files', [DocumentController::class, 'store'])->name('files.store');
    Route::get('/files/{document}/download', [DocumentController::class, 'download'])->name('files.download');
    Route::delete('/files/{document}', [DocumentController::class, 'destroy'])->name('files.destroy');
});
