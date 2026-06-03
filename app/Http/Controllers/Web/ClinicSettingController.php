<?php

namespace App\Http\Controllers\Web;

use App\Enums\ClinicWebSettingType;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Web\ClinicWebSetting;
use App\Support\Storage\PublicStorageUrl;
use App\Support\Web\ClinicWebSettingKeys;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClinicSettingController extends Controller
{
    public function __invoke(Request $request, string $slug, string $key): JsonResponse
    {
        $typeMap = ClinicWebSettingKeys::typeMap();

        abort_unless(isset($typeMap[$key]), 422, 'Clave no válida');

        $company = Company::query()->where('slug', $slug)->firstOrFail();

        $this->authorize('update', $company);

        $type = $typeMap[$key];

        if ($type === ClinicWebSettingType::Image) {
            $request->validate([
                'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            ]);

            $url = $this->storeImage($company, $key, $request);

            return response()->json(['url' => $url]);
        }

        $request->validate([
            'value' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->upsertText($company, $key, $type, $request->input('value'));

        return response()->json(['ok' => true]);
    }

    private function storeImage(Company $company, string $key, Request $request): string
    {
        $existing = ClinicWebSetting::query()
            ->where('company_id', $company->id)
            ->where('key', $key)
            ->first();

        if ($existing?->value) {
            Storage::disk('public')->delete($existing->value);
        }

        $file = $request->file('image');
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $path = "{$company->id}/web/{$key}.{$extension}";
        Storage::disk('public')->putFileAs(dirname($path), $file, basename($path));

        ClinicWebSetting::query()->updateOrCreate(
            ['company_id' => $company->id, 'key' => $key],
            ['type' => ClinicWebSettingType::Image, 'value' => $path],
        );

        return PublicStorageUrl::fromRelativePath($path);
    }

    private function upsertText(Company $company, string $key, ClinicWebSettingType $type, ?string $value): void
    {
        if ($value === null || $value === '') {
            ClinicWebSetting::query()
                ->where('company_id', $company->id)
                ->where('key', $key)
                ->delete();

            return;
        }

        ClinicWebSetting::query()->updateOrCreate(
            ['company_id' => $company->id, 'key' => $key],
            ['type' => $type, 'value' => $value],
        );
    }
}
