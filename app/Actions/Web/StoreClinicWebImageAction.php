<?php

namespace App\Actions\Web;

use App\Enums\ClinicWebSettingType;
use App\Models\Company;
use App\Models\Web\ClinicWebSetting;
use App\Support\Storage\PublicStorageUrl;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StoreClinicWebImageAction
{
    /**
     * Stores an image in public storage and upserts the key-value row.
     * Deletes the previous file if one existed.
     */
    public function execute(Company $company, string $key, UploadedFile $file): string
    {
        $existing = ClinicWebSetting::query()
            ->where('company_id', $company->id)
            ->where('key', $key)
            ->first();

        if ($existing?->value) {
            Storage::disk('public')->delete($existing->value);
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $path = "{$company->id}/web/{$key}.{$extension}";
        Storage::disk('public')->putFileAs(dirname($path), $file, basename($path));

        ClinicWebSetting::query()->updateOrCreate(
            ['company_id' => $company->id, 'key' => $key],
            ['type' => ClinicWebSettingType::Image, 'value' => $path],
        );

        return PublicStorageUrl::fromRelativePath($path);
    }
}
