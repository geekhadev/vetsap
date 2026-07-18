<?php

namespace App\Enums\Purchase;

enum SupplierDocumentType: string
{
    case Rut = 'rut';
    case Pasaporte = 'pasaporte';
}
