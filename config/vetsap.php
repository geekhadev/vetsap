<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Impuesto a las ventas (IVA)
    |--------------------------------------------------------------------------
    |
    | Tasa por defecto usada en documentos de venta. Puede variar en el futuro;
    | los documentos guardan tax_percent como snapshot al emitir/recalcular.
    |
    */

    'sale' => [
        'default_tax_percent' => (float) 19,

        /*
        | Redondeo de efectivo (Chile): moneda mínima práctica 10 CLP.
        | Si el residuo al múltiplo de 10 es < cash_round_threshold → hacia abajo;
        | si es >= threshold → hacia arriba.
        */
        'cash_round_to' => 10,
        'cash_round_threshold' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Atención clínica
    |--------------------------------------------------------------------------
    |
    | Ventana para iniciar una atención (orden) desde una cita, en minutos
    | relativos a starts_at:
    | - minutes_before: cuánto antes del inicio se puede iniciar
    | - minutes_after: cuánto después del inicio se puede iniciar
    |
    */

    'clinical_attention' => [
        'start_from_appointment_minutes_before' => 6000,
        'start_from_appointment_minutes_after' => 240,
    ],

];
