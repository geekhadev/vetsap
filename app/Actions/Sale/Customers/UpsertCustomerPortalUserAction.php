<?php

namespace App\Actions\Sale\Customers;

use App\Enums\UserType;
use App\Models\Sale\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class UpsertCustomerPortalUserAction
{
    /**
     * @param  array{name: string, email: string, password?: string|null}  $data
     */
    public function execute(Customer $customer, array $data): User
    {
        return DB::transaction(function () use ($customer, $data): User {
            $customer->loadMissing('user');

            $existing = $customer->user;

            if ($existing instanceof User) {
                if ($existing->type !== UserType::Customer) {
                    throw ValidationException::withMessages([
                        'email' => 'El usuario vinculado no es de tipo cliente.',
                    ]);
                }

                $payload = [
                    'name' => $data['name'],
                    'email' => $data['email'],
                ];

                if (isset($data['password']) && is_string($data['password']) && $data['password'] !== '') {
                    $payload['password'] = $data['password'];
                }

                $existing->update($payload);

                return $existing->refresh();
            }

            $password = $data['password'] ?? null;

            if (! is_string($password) || $password === '') {
                throw ValidationException::withMessages([
                    'password' => 'La contraseña es obligatoria para crear el usuario.',
                ]);
            }

            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'type' => UserType::Customer,
                'password' => $password,
                'email_verified_at' => now(),
            ]);

            $customer->update(['user_id' => $user->id]);

            return $user;
        });
    }
}
