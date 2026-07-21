<?php

namespace App\Http\Requests\Sale;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\CompanyOffice;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CashRegisterOpenRequest extends FormRequest
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
            return [
                'office_id' => ['required'],
            ];
        }

        return [
            'office_id' => [
                'required',
                'uuid',
                Rule::exists(CompanyOffice::class, 'id')->where(
                    fn ($query) => $query->where('company_id', $companyId),
                ),
            ],
            'opening_amount' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array{company_id: string, office_id: string, opened_by_user_id: string, opening_amount: int}
     */
    public function openPayload(): array
    {
        /** @var array{office_id: string, opening_amount?: int|null} $validated */
        $validated = $this->validated();

        return [
            'company_id' => (string) $this->selectedCompanyId(),
            'office_id' => $validated['office_id'],
            'opened_by_user_id' => (string) $this->user()?->id,
            'opening_amount' => (int) ($validated['opening_amount'] ?? 0),
        ];
    }
}
