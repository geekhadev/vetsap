<?php

namespace App\Http\Requests\Sale;

use App\Models\Sale\Customer;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CustomerPortalUserUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        $customer = $this->route('customer');

        return $customer instanceof Customer
            && $this->user()?->can('update', $customer) === true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('password') === '' || $this->input('password') === null) {
            $this->merge([
                'password' => null,
                'password_confirmation' => null,
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $customer = $this->route('customer');
        assert($customer instanceof Customer);

        $customer->loadMissing('user');
        $linkedUser = $customer->user;
        $isCreating = ! $linkedUser instanceof User;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class, 'email')->ignore($linkedUser?->id),
            ],
            'password' => [
                Rule::requiredIf($isCreating),
                'nullable',
                'string',
                Password::defaults(),
                'confirmed',
            ],
        ];
    }

    /**
     * @return array{name: string, email: string, password: string|null}
     */
    public function portalUserPayload(): array
    {
        /** @var array{name: string, email: string, password?: string|null} $validated */
        $validated = $this->validated();

        return [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'] ?? null,
        ];
    }
}
