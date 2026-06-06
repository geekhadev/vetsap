<?php

namespace App\Http\Requests\Sale;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SiiCafUploadRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

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
            'xml_file' => ['required', 'file', 'mimetypes:text/xml,application/xml', 'max:512'],
        ];
    }

    public function xmlFileContents(): string
    {
        $file = $this->file('xml_file');
        assert($file !== null);

        $content = file_get_contents($file->getRealPath());
        assert(is_string($content) && $content !== '');

        return $content;
    }
}
