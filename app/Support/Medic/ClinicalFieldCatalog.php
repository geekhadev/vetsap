<?php

namespace App\Support\Medic;

final class ClinicalFieldCatalog
{
    /**
     * @return array<string, array{label: string, group: string, options?: array<string, string>}>
     */
    public static function definitions(): array
    {
        return [
            'temperature' => [
                'label' => 'Temperatura (°C)',
                'group' => 'Signos vitales',
            ],
            'heart_rate' => [
                'label' => 'Frecuencia cardíaca (lpm)',
                'group' => 'Signos vitales',
            ],
            'respiratory_rate' => [
                'label' => 'Frecuencia respiratoria',
                'group' => 'Signos vitales',
            ],
            'body_condition' => [
                'label' => 'Condición corporal (1-9)',
                'group' => 'Signos vitales',
            ],
            'muscle_condition' => [
                'label' => 'Condición muscular (1-5)',
                'group' => 'Signos vitales',
            ],
            'capillary_refill' => [
                'label' => 'Relleno capilar',
                'group' => 'Signos vitales',
                'options' => [
                    'normal' => 'Normal (< 2 seg)',
                    'slow' => 'Lento (2-4 seg)',
                    'fast' => 'Rápido (< 1 seg)',
                ],
            ],
            'anamnesis' => [
                'label' => 'Anamnesis',
                'group' => 'Datos clínicos',
            ],
            'clinical_findings' => [
                'label' => 'Hallazgos examen clínico',
                'group' => 'Datos clínicos',
            ],
            'pre_diagnosis' => [
                'label' => 'Pre-diagnóstico',
                'group' => 'Datos clínicos',
            ],
            'diagnosis' => [
                'label' => 'Diagnóstico',
                'group' => 'Datos clínicos',
            ],
            'treatment' => [
                'label' => 'Tratamiento',
                'group' => 'Datos clínicos',
            ],
            'prescription' => [
                'label' => 'Receta',
                'group' => 'Datos clínicos',
            ],
        ];
    }

    public static function groupFor(string $fieldKey): string
    {
        return self::definitions()[$fieldKey]['group'] ?? 'Datos clínicos';
    }

    public static function defaultLabel(string $fieldKey): string
    {
        return self::definitions()[$fieldKey]['label'] ?? $fieldKey;
    }

    public static function formatValue(string $fieldKey, mixed $raw): string
    {
        if ($raw === null || $raw === '') {
            return '—';
        }

        $str = is_scalar($raw) ? (string) $raw : '';

        if ($str === '') {
            return '—';
        }

        $options = self::definitions()[$fieldKey]['options'] ?? null;

        if (is_array($options) && isset($options[$str])) {
            return $options[$str];
        }

        return $str;
    }
}
