<?php

namespace App\Http\Requests\Store;

use App\Enums\Store\InventoryMovementType;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\InventoryMovementPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryMovementStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->selectedCompanyId();
        if ($companyId === null) {
            return ['moved_at' => ['required']];
        }

        $type = $this->movementType();
        if ($type === null) {
            return [
                'type' => ['required', 'string', Rule::in(InventoryMovementType::values())],
            ];
        }

        return InventoryMovementPayloadValidationRules::storeRules($companyId, $type);
    }

    public function movementType(): ?InventoryMovementType
    {
        $raw = $this->input('type');

        if (! is_string($raw) || $raw === '') {
            return null;
        }

        return InventoryMovementType::tryFrom($raw);
    }

    /**
     * @return array{
     *     company_id: string,
     *     type: string,
     *     moved_at: string,
     *     movement_category_id: string,
     *     user_id: string,
     *     details: list<array{product_id: string, quantity: int}>
     * }
     */
    public function inventoryMovementPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();
        $type = $this->movementType();

        return InventoryMovementPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            (string) $this->user()?->id,
            $type ?? InventoryMovementType::Entry,
            $validated,
        );
    }
}
