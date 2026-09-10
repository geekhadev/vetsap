<?php

namespace App\Http\Requests\Administration;

use App\Enums\UserType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkSetPermissionsOwnerAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->type === UserType::Root;
    }

    protected function prepareForValidation(): void
    {
        $ids = $this->input('permission_ids', []);

        if (! is_array($ids)) {
            $this->merge(['permission_ids' => []]);

            return;
        }

        $normalized = [];

        foreach ($ids as $id) {
            if (is_string($id) && $id !== '') {
                $normalized[] = $id;
            }
        }

        $this->merge(['permission_ids' => array_values(array_unique($normalized))]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
            'permission_ids' => ['required', 'array', 'min:1'],
            'permission_ids.*' => ['uuid', Rule::exists('administration_permissions', 'id')],
        ];
    }

    public function enabled(): bool
    {
        return (bool) $this->validated('enabled');
    }

    /**
     * @return list<string>
     */
    public function permissionIds(): array
    {
        /** @var list<string> */
        return $this->validated('permission_ids');
    }
}
