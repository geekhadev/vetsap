<?php

namespace App\Http\Requests\Sale;

use App\Enums\CompanyDocumentType;
use App\Models\Company;
use App\Models\Sale\CertificationSiiTicket;
use App\Support\Sale\ChileRut;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use InvalidArgumentException;

class CertificationSiiTicketsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public function rules(): array
    {
        return [
            'caf' => ['required', 'file', 'extensions:xml', 'max:10240'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $file = $this->file('caf');
            if ($file === null) {
                return;
            }

            $content = @file_get_contents($file->getRealPath());
            if (! is_string($content) || $content === '') {
                $validator->errors()->add('caf', 'No se pudo leer el archivo CAF.');

                return;
            }

            try {
                $nodes = caf_xml_to_nodes($content);
            } catch (InvalidArgumentException $e) {
                $validator->errors()->add('caf', $e->getMessage());

                return;
            }

            if ($nodes['TD'] !== '39') {
                $validator->errors()->add('caf', 'El CAF debe ser de boleta electrónica (TD 39).');
            }

            $company = $this->selectedCompany();
            if ($company === null) {
                $validator->errors()->add('caf', 'Debes seleccionar una empresa para certificar.');

                return;
            }

            if ($company->document_type !== CompanyDocumentType::Rut) {
                $validator->errors()->add('caf', 'La empresa debe tener RUT chileno para certificar boletas.');
            }

            if (ChileRut::normalize((string) $nodes['RE']) !== ChileRut::normalize((string) $company->document_number)) {
                $validator->errors()->add('caf', 'El RUT del CAF no coincide con el RUT de la empresa seleccionada.');
            }

            if (CertificationSiiTicket::query()
                ->where('company_id', $company->id)
                ->where('dte_init', $nodes['RNG']['D'])
                ->where('dte_end', $nodes['RNG']['H'])
                ->exists()) {
                $validator->errors()->add('caf', 'Ya existe una certificación con el mismo rango de folios del CAF para esta empresa.');
            }
        });
    }

    public function cafXml(): string
    {
        $file = $this->file('caf');
        assert($file !== null);

        $content = file_get_contents($file->getRealPath());
        assert(is_string($content) && $content !== '');

        return $content;
    }

    /**
     * @return array<string, mixed>
     */
    public function parsedCaf(): array
    {
        return caf_xml_to_nodes($this->cafXml());
    }

    public function selectedCompany(): ?Company
    {
        $id = data_get($this->session()->get('company_selected'), 'id');

        if (! is_string($id) || $id === '') {
            return null;
        }

        return Company::query()->find($id);
    }
}
