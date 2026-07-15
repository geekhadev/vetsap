<?php

namespace App\Http\Requests\Configuration;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Company;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreWebsiteOgImageRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        $company = $this->selectedCompany();

        return $company instanceof Company && $this->user()?->can('update', $company) === true;
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
