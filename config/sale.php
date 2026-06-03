<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Certificación SII (boletas) — omisiones de seguridad (solo depuración)
    |--------------------------------------------------------------------------
    |
    | Por defecto todo está desactivado. No uses estas banderas en producción:
    | el SII rechazará envíos sin firmas válidas o con CAF no verificado.
    |
    */
    'sii_boleta_certification' => [
        'skip_caf_cryptographic_verification' => env('SII_BOLETA_CERT_SKIP_CAF_VERIFY', false),
        'skip_envio_dte_xml_signature' => env('SII_BOLETA_CERT_SKIP_ENVIO_DTE_SIGN', false),
    ],

];
