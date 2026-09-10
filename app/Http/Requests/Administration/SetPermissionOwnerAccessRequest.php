<?php

namespace App\Http\Requests\Administration;

use App\Enums\UserType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SetPermissionOwnerAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->type === UserType::Root;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
        ];
    }

    public function enabled(): bool
    {
        return (bool) $this->validated('enabled');
    }
}
