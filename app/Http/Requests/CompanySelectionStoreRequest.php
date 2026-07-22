<?php

namespace App\Http\Requests;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Sale\Customer;
use App\Models\UserCompanyRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanySelectionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $user = $this->user();
        assert($user !== null);

        $companyIds = match ($user->type) {
            UserType::Root => Company::query()->pluck('id'),
            UserType::Customer => Customer::query()
                ->where('user_id', $user->id)
                ->pluck('company_id')
                ->unique(),
            default => UserCompanyRole::query()
                ->where('user_id', $user->id)
                ->pluck('company_id')
                ->unique(),
        };

        return [
            'company_id' => [
                'required',
                'uuid',
                Rule::in($companyIds),
            ],
        ];
    }
}
