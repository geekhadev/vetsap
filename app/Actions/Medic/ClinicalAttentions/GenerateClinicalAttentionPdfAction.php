<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\DoctorDocumentType;
use App\Enums\Medic\PatientSex;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplateField;
use App\Models\Web\ClinicWebSetting;
use App\Support\Medic\ClinicalFieldCatalog;
use App\Support\Pdf\MergePdfDocuments;
use App\Support\Pdf\StampPdfPageFooters;
use App\Support\Web\ClinicWebSettingKeys;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;
use Throwable;

final class GenerateClinicalAttentionPdfAction
{
    public function __construct(
        private readonly MergePdfDocuments $mergePdfDocuments,
        private readonly StampPdfPageFooters $stampPdfPageFooters,
    ) {}

    /**
     * @return array{content: string, filename: string}
     */
    public function execute(ClinicalAttention $attention): array
    {
        $content = $this->buildContent($attention);

        return [
            'content' => $this->stampPdfPageFooters->stampUniform(
                $content,
                $this->footerText($attention),
            ),
            'filename' => $this->filename($attention),
        ];
    }

    public function buildContent(ClinicalAttention $attention): string
    {
        $attention->loadMissing([
            'company',
            'patient.species',
            'patient.customer',
            'doctor',
            'template.fields',
            'values',
            'requestedServices:id,name',
        ]);

        $payload = $this->buildPayload($attention);
        $mainPdf = Pdf::loadView('medic.clinical-attentions.pdf', $payload)
            ->setPaper('letter')
            ->output();

        return $this->appendExamAttachments($mainPdf, $attention);
    }

    public function footerText(ClinicalAttention $attention): string
    {
        $attention->loadMissing(['patient', 'doctor', 'template']);

        $patientName = $attention->patient?->name ?: 'Paciente';
        $templateName = $attention->template?->name ?: 'Atención clínica';
        $attentionAt = $attention->closed_at ?? $attention->started_at ?? $attention->created_at;
        $date = $attentionAt
            ?->timezone(config('app.timezone'))
            ->format('d/m/Y H:i') ?? '—';

        $doctor = $attention->doctor;
        $doctorName = $doctor
            ? trim("{$doctor->first_name} {$doctor->last_name}")
            : null;

        $parts = array_filter([
            $patientName,
            $templateName,
            $date,
            $doctorName ? "Dr. {$doctorName}" : null,
        ]);

        return implode(' · ', $parts);
    }

    private function appendExamAttachments(
        string $mainPdf,
        ClinicalAttention $attention,
    ): string {
        $attachments = $this->uploadedExamAttachments($attention);

        if ($attachments === []) {
            return $mainPdf;
        }

        $logoPath = $this->resolveLogoFilePath($attention->company_id);
        $examParts = [];

        try {
            foreach ($attachments as $attachment) {
                $examPdf = $this->buildExamAttachmentPdf($attachment, $logoPath);

                if ($examPdf !== null && $this->isReadablePdf($examPdf)) {
                    $examParts[] = $examPdf;
                }
            }

            if ($examParts === []) {
                return $mainPdf;
            }

            return $this->mergePdfDocuments->merge([
                $mainPdf,
                ...$examParts,
            ]);
        } catch (Throwable) {
            return $mainPdf;
        } finally {
            $this->deleteTemporaryLogoPath($logoPath);
        }
    }

    private function isReadablePdf(string $content): bool
    {
        try {
            $pdf = new Fpdi;
            $pdf->setSourceFile(StreamReader::createByString($content));

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * @return list<array{name: string, path: string, mime: string}>
     */
    private function uploadedExamAttachments(ClinicalAttention $attention): array
    {
        $attachments = [];

        foreach ($attention->requestedServices as $service) {
            $path = $service->pivot->result_path ?? null;
            $mime = $service->pivot->result_mime_type ?? null;

            if (! is_string($path) || $path === '') {
                continue;
            }

            $absolutePath = Storage::disk('public')->path($path);

            if (! is_file($absolutePath)) {
                continue;
            }

            $resolvedMime = is_string($mime) && $mime !== ''
                ? $mime
                : (mime_content_type($absolutePath) ?: '');

            $attachments[] = [
                'name' => (string) $service->name,
                'path' => $absolutePath,
                'mime' => strtolower($resolvedMime),
            ];
        }

        return $attachments;
    }

    /**
     * @param  array{name: string, path: string, mime: string}  $attachment
     */
    private function buildExamAttachmentPdf(array $attachment, ?string $logoPath): ?string
    {
        if ($this->isPdfMime($attachment['mime'], $attachment['path'])) {
            $contents = file_get_contents($attachment['path']);

            if ($contents === false) {
                return null;
            }

            return $this->stampClinicLogoOnPdfPages($contents, $logoPath);
        }

        if (! $this->isImageMime($attachment['mime'], $attachment['path'])) {
            return null;
        }

        $imageSrc = $this->imageDataUri($attachment['path'], $attachment['mime']);

        if ($imageSrc === null) {
            return null;
        }

        return Pdf::loadView('medic.clinical-attentions.pdf-exam-image', [
            'exam_name' => $attachment['name'],
            'image_src' => $imageSrc,
            'logo_src' => $this->filePathToDataUri($logoPath),
        ])
            ->setPaper('letter')
            ->output();
    }

    private function stampClinicLogoOnPdfPages(string $pdfContent, ?string $logoPath): string
    {
        if ($logoPath === null || ! is_file($logoPath)) {
            return $pdfContent;
        }

        try {
            $pdf = new Fpdi;
            $pageCount = $pdf->setSourceFile(StreamReader::createByString($pdfContent));

            for ($page = 1; $page <= $pageCount; $page++) {
                $templateId = $pdf->importPage($page);
                $size = $pdf->getTemplateSize($templateId);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
                $pdf->SetAutoPageBreak(false);

                $logoWidth = min(20.0, $size['width'] * 0.11);
                $margin = 7.0;
                $x = $size['width'] - $logoWidth - $margin;
                $y = $margin;
                $pdf->Image($logoPath, $x, $y, $logoWidth);
            }

            return $pdf->Output('S');
        } catch (Throwable) {
            return $pdfContent;
        }
    }

    private function resolveLogoFilePath(string $companyId): ?string
    {
        $relativePath = ClinicWebSetting::query()
            ->where('company_id', $companyId)
            ->where('key', ClinicWebSettingKeys::LOGO)
            ->value('value');

        if (! is_string($relativePath) || $relativePath === '') {
            return null;
        }

        $absolutePath = Storage::disk('public')->path($relativePath);

        if (! is_file($absolutePath)) {
            return null;
        }

        $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));

        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'], true)) {
            return $absolutePath;
        }

        return $this->convertImageToJpegTemp($absolutePath);
    }

    private function convertImageToJpegTemp(string $absolutePath): ?string
    {
        if (! function_exists('imagecreatefromstring') || ! function_exists('imagejpeg')) {
            return null;
        }

        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return null;
        }

        $image = @imagecreatefromstring($contents);

        if ($image === false) {
            return null;
        }

        $tempPath = tempnam(sys_get_temp_dir(), 'clinic-logo-');

        if ($tempPath === false) {
            imagedestroy($image);

            return null;
        }

        $jpegPath = $tempPath.'.jpg';
        @unlink($tempPath);

        $written = imagejpeg($image, $jpegPath, 90);
        imagedestroy($image);

        if (! $written) {
            @unlink($jpegPath);

            return null;
        }

        return $jpegPath;
    }

    private function deleteTemporaryLogoPath(?string $logoPath): void
    {
        if ($logoPath === null) {
            return;
        }

        if (! str_contains($logoPath, sys_get_temp_dir())) {
            return;
        }

        if (is_file($logoPath)) {
            @unlink($logoPath);
        }
    }

    private function isPdfMime(string $mime, string $path): bool
    {
        if (str_contains($mime, 'pdf')) {
            return true;
        }

        return strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'pdf';
    }

    private function isImageMime(string $mime, string $path): bool
    {
        if (str_starts_with($mime, 'image/')) {
            return true;
        }

        return in_array(
            strtolower(pathinfo($path, PATHINFO_EXTENSION)),
            ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            true,
        );
    }

    private function filePathToDataUri(?string $absolutePath): ?string
    {
        if ($absolutePath === null || ! is_file($absolutePath)) {
            return null;
        }

        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return null;
        }

        $mime = mime_content_type($absolutePath) ?: 'image/jpeg';

        return 'data:'.$mime.';base64,'.base64_encode($contents);
    }

    private function imageDataUri(string $absolutePath, string $mime): ?string
    {
        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return null;
        }

        $resolvedMime = $mime !== '' ? $mime : (mime_content_type($absolutePath) ?: 'image/jpeg');

        if ($resolvedMime === 'image/webp' || str_ends_with(strtolower($absolutePath), '.webp')) {
            $converted = $this->webpToJpegDataUri($contents);

            if ($converted !== null) {
                return $converted;
            }
        }

        return 'data:'.$resolvedMime.';base64,'.base64_encode($contents);
    }

    private function webpToJpegDataUri(string $webpContents): ?string
    {
        if (! function_exists('imagecreatefromstring') || ! function_exists('imagejpeg')) {
            return null;
        }

        $image = @imagecreatefromstring($webpContents);

        if ($image === false) {
            return null;
        }

        ob_start();
        imagejpeg($image, null, 90);
        imagedestroy($image);
        $jpeg = ob_get_clean();

        if ($jpeg === false || $jpeg === '') {
            return null;
        }

        return 'data:image/jpeg;base64,'.base64_encode($jpeg);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPayload(ClinicalAttention $attention): array
    {
        $company = $attention->company;
        $patient = $attention->patient;
        $doctor = $attention->doctor;
        $customer = $patient?->customer;

        $sharedFields = $this->sharedClientFields($attention);
        $vitals = array_values(array_filter(
            $sharedFields,
            fn (array $field): bool => $field['group'] === 'Signos vitales',
        ));
        $clinical = array_values(array_filter(
            $sharedFields,
            fn (array $field): bool => $field['group'] !== 'Signos vitales',
        ));

        $attentionAt = $attention->closed_at ?? $attention->started_at ?? $attention->created_at;

        return [
            'clinic' => [
                'name' => $company?->name ?? 'Clínica',
                'phone' => $company?->phone,
                'email' => $company?->email,
                'address' => $company?->address,
                'logo_src' => $this->resolveLogoSrc($attention->company_id),
            ],
            'attention_at' => $attentionAt?->timezone(config('app.timezone'))->format('d/m/Y H:i'),
            'printed_at' => now()->timezone(config('app.timezone'))->format('d/m/Y H:i'),
            'template_name' => $attention->template?->name,
            'doctor' => $doctor ? [
                'name' => trim("{$doctor->first_name} {$doctor->last_name}"),
                'document_type' => match ($doctor->document_type) {
                    DoctorDocumentType::Rut => 'RUT',
                    DoctorDocumentType::Pasaporte => 'Pasaporte',
                    default => null,
                },
                'document_number' => $doctor->document_number,
                'phone' => $doctor->phone,
                'email' => $doctor->email,
            ] : null,
            'patient' => [
                'name' => $patient?->name ?? '—',
                'record_number' => $patient?->record_number,
                'species' => $patient?->species?->name,
                'breed' => $patient?->breed,
                'sex' => $this->formatSex($patient?->sex),
                'weight_kg' => $patient?->weight_kg,
                'birth_date' => $patient?->birth_date?->format('d/m/Y'),
            ],
            'tutor' => [
                'name' => $customer?->name,
                'phone' => $customer?->phone,
                'email' => $customer?->email,
            ],
            'vitals' => $vitals,
            'clinical' => $clinical,
            'exams' => $attention->requestedServices
                ->map(fn ($service): string => (string) $service->name)
                ->values()
                ->all(),
        ];
    }

    /**
     * @return list<array{field_key: string, label: string, group: string, value: string}>
     */
    private function sharedClientFields(ClinicalAttention $attention): array
    {
        $valuesByKey = $attention->values
            ->mapWithKeys(fn ($value) => [$value->field_key => $value->value])
            ->all();

        /** @var Collection<int, ClinicalTemplateField> $fields */
        $fields = ($attention->template?->fields ?? collect())
            ->sortBy('field_order')
            ->values();

        $rows = [];

        foreach ($fields as $field) {
            if (! $field->is_shared_with_client) {
                continue;
            }

            $raw = $valuesByKey[$field->field_key] ?? null;

            if ($raw === null || $raw === '') {
                continue;
            }

            $rows[] = [
                'field_key' => $field->field_key,
                'label' => $field->label !== ''
                    ? $field->label
                    : ClinicalFieldCatalog::defaultLabel($field->field_key),
                'group' => ClinicalFieldCatalog::groupFor($field->field_key),
                'value' => ClinicalFieldCatalog::formatValue($field->field_key, $raw),
            ];
        }

        return $rows;
    }

    private function resolveLogoSrc(string $companyId): ?string
    {
        $relativePath = ClinicWebSetting::query()
            ->where('company_id', $companyId)
            ->where('key', ClinicWebSettingKeys::LOGO)
            ->value('value');

        if (! is_string($relativePath) || $relativePath === '') {
            return null;
        }

        $absolutePath = Storage::disk('public')->path($relativePath);

        if (! is_file($absolutePath)) {
            return null;
        }

        $mime = mime_content_type($absolutePath) ?: 'image/png';
        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return null;
        }

        return 'data:'.$mime.';base64,'.base64_encode($contents);
    }

    private function formatSex(?PatientSex $sex): ?string
    {
        return match ($sex) {
            PatientSex::Male => 'Macho',
            PatientSex::Female => 'Hembra',
            PatientSex::Unknown => 'Desconocido',
            null => null,
        };
    }

    private function filename(ClinicalAttention $attention): string
    {
        $patientSlug = Str::slug($attention->patient?->name ?? 'paciente');
        $date = ($attention->closed_at ?? $attention->started_at ?? $attention->created_at)
            ?->timezone(config('app.timezone'))
            ->format('Y-m-d') ?? now()->format('Y-m-d');

        return "atencion-{$patientSlug}-{$date}.pdf";
    }
}
