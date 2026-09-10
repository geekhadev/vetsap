<?php

namespace App\Http\Requests\Configuration;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Company;
use App\Models\User;
use App\Support\Administration\ModulePermissionSlugs;
use App\Support\Administration\UserHasCompanyPermission;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreWebsiteOgImageRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        $user = $this->user();
        $company = $this->selectedCompany();

        return $user instanceof User
            && $company instanceof Company
            && UserHasCompanyPermission::check(
                $user,
                ModulePermissionSlugs::for('configuration.website-settings')->update(),
            );
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public function rules(): array
    {
        return [
            'og_image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
