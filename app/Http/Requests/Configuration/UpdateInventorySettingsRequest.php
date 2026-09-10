<?php

namespace App\Http\Requests\Configuration;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\User;
use App\Support\Administration\ModulePermissionSlugs;
use App\Support\Administration\UserHasCompanyPermission;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInventorySettingsRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User
            && UserHasCompanyPermission::check(
                $user,
                ModulePermissionSlugs::for('configuration.inventory-settings')->update(),
            );
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'validate_stock_on_sales' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{validate_stock_on_sales: bool}
     */
    public function inventorySettingsPayload(): array
    {
        /** @var array{validate_stock_on_sales: bool} $validated */
        $validated = $this->validated();

        return [
            'validate_stock_on_sales' => (bool) $validated['validate_stock_on_sales'],
        ];
    }
}
