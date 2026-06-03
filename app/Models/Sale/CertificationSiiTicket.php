<?php

namespace App\Models\Sale;

use App\Models\Company;
use App\Models\User;
use Database\Factories\Sale\CertificationSiiTicketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'user_id',
    'number',
    'dte_init',
    'dte_end',
    'file_caf',
    'file_envio_dte',
    'file_consumo_folios',
])]
class CertificationSiiTicket extends Model
{
    /** @use HasFactory<CertificationSiiTicketFactory> */
    use HasFactory, HasUuids;

    protected $table = 'sale_certification_sii_tickets';

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected static function newFactory(): CertificationSiiTicketFactory
    {
        return CertificationSiiTicketFactory::new();
    }
}
