<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Support\Storage\PublicStorageUrl;
use App\Support\Web\ClinicWebSettingKeys;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function __invoke(Request $request, string $slug): Response
    {
        $company = Company::query()->where('slug', $slug)->firstOrFail();

        $settings = $this->resolveSettings($company);

        $canEdit = $request->user()?->can('update', $company) ?? false;

        return Inertia::render('web/clinic/show', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'slug' => $company->slug,
                'email' => $company->email,
                'phone' => $company->phone,
                'address' => $company->address,
            ],
            'settings' => $settings,
            'canEdit' => $canEdit,
        ]);
    }

    /**
     * Loads all web settings for the company and resolves image keys to public URLs.
     *
     * @return array<string, string|null>
     */
    private function resolveSettings(Company $company): array
    {
        $rows = $company->webSettings()->get()->keyBy('key');

        $result = [];

        foreach (ClinicWebSettingKeys::typeMap() as $key => $type) {
            $row = $rows->get($key);

            if ($row === null) {
                $result[$key] = null;
                continue;
            }

            if ($type->value === 'image') {
                $result[$key] = PublicStorageUrl::fromRelativePath($row->value);
            } else {
                $result[$key] = $row->value;
            }
        }

        return $result;
    }
}
