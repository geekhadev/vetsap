<?php

namespace App\Actions\Sale\CashRegisters;

use App\Enums\Sale\CashRegisterStatus;
use App\Models\Sale\CashRegister;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

final class OpenCashRegisterAction
{
    /**
     * @param  array{company_id: string, office_id: string, opened_by_user_id: string, opening_amount: int}  $data
     */
    public function execute(array $data): CashRegister
    {
        $alreadyOpen = CashRegister::query()
            ->forCompany($data['company_id'])
            ->forUser($data['opened_by_user_id'])
            ->open()
            ->orderByDesc('opened_at')
            ->first();

        if ($alreadyOpen instanceof CashRegister) {
            $message = $alreadyOpen->isFromPreviousDay()
                ? 'Debes cerrar la caja del día anterior antes de abrir una nueva. Cada caja es de un solo día.'
                : ($alreadyOpen->office_id === $data['office_id']
                    ? 'Ya tienes una caja abierta en esta sucursal.'
                    : 'Ya tienes una caja abierta. Ciérrala antes de abrir otra.');

            throw ValidationException::withMessages([
                'office_id' => $message,
            ]);
        }

        return CashRegister::query()->create([
            'company_id' => $data['company_id'],
            'office_id' => $data['office_id'],
            'opened_by_user_id' => $data['opened_by_user_id'],
            'opened_at' => Carbon::now(),
            'opening_amount' => $data['opening_amount'],
            'status' => CashRegisterStatus::Open,
        ]);
    }
}
