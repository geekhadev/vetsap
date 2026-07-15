<?php

namespace App\Http\Requests\Store;

use App\Models\Store\MovementCategory;
use App\Support\Validation\MovementCategoryPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MovementCategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $movementCategory = $this->route('movement_category');
        if (! $movementCategory instanceof MovementCategory) {
            return ['name' => ['required']];
        }

        return MovementCategoryPayloadValidationRules::updateRules(
            $movementCategory->company_id,
            $movementCategory->id,
            is_string($this->input('type')) ? $this->input('type') : null,
        );
    }

    /**
     * @return array{name: string, type: string, is_active: bool}
     */
    public function movementCategoryPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return MovementCategoryPayloadValidationRules::updatePayload($validated);
    }
}
