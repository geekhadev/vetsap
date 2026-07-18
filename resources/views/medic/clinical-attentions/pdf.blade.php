<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Atención clínica — {{ $patient['name'] }}</title>
    <style>
        @page {
            margin: 20px 24px 36px 24px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            color: #1c1917;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            background: #ffffff;
        }

        .header {
            width: 100%;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: middle;
        }

        .logo {
            max-height: 44px;
            max-width: 120px;
            display: block;
            margin-bottom: 2px;
        }

        .clinic-name {
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: -0.02em;
            margin: 0;
            line-height: 1.15;
            color: #0c0a09;
        }

        .clinic-meta {
            font-size: 8.5pt;
            color: #44403c;
            margin: 0;
            line-height: 1.15;
        }

        .doc-title {
            text-align: right;
        }

        .doc-title-label {
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #78716c;
            margin: 0;
            line-height: 1.1;
        }

        .doc-title-main {
            font-size: 12pt;
            font-weight: bold;
            margin: 0;
            line-height: 1.15;
            color: #0c0a09;
        }

        .dates {
            font-size: 8.5pt;
            color: #44403c;
            margin: 0;
            line-height: 1.15;
        }

        .dates strong {
            color: #1c1917;
            font-weight: bold;
        }

        .section {
            margin-top: 16px;
        }

        .section-title {
            font-size: 8.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #0c0a09;
            border-bottom: 0.75pt solid #d6d3d1;
            padding-bottom: 3px;
            margin: 0 0 7px 0;
        }

        .section-title-plain {
            border-bottom: none;
            padding-bottom: 0;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            vertical-align: top;
            padding: 0 8px 4px 0;
            width: 25%;
        }

        .info-label {
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            color: #78716c;
            margin: 0;
        }

        .info-value {
            font-size: 10pt;
            color: #1c1917;
            margin: 0;
            font-weight: normal;
        }

        .vitals-table {
            width: 100%;
            border-collapse: collapse;
            border: 0.75pt solid #d6d3d1;
        }

        .vitals-table td {
            width: 25%;
            vertical-align: top;
            padding: 5px 7px;
            border: 0.75pt solid #d6d3d1;
        }

        .vital-card {
            padding: 0;
        }

        .vital-label {
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            color: #78716c;
            margin: 0;
        }

        .vital-value {
            font-size: 10pt;
            font-weight: bold;
            color: #0c0a09;
            margin: 0;
        }

        .clinical-table {
            width: 100%;
            border-collapse: collapse;
            border: 0.75pt solid #d6d3d1;
        }

        .clinical-table td {
            width: 50%;
            vertical-align: top;
            padding: 6px 8px;
            border: 0.75pt solid #d6d3d1;
        }

        .clinical-block {
            page-break-inside: avoid;
        }

        .clinical-label {
            font-size: 8pt;
            font-weight: bold;
            color: #44403c;
            margin: 0 0 2px 0;
        }

        .clinical-value {
            font-size: 10pt;
            color: #1c1917;
            margin: 0;
            white-space: pre-wrap;
            line-height: 1.35;
        }

        .exams-list {
            margin: 0;
            padding-left: 14px;
        }

        .exams-list li {
            margin-bottom: 1px;
            font-size: 10pt;
        }

        .empty-note {
            font-size: 9pt;
            color: #78716c;
            font-style: italic;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td style="width: 58%;">
                    @if ($clinic['logo_src'])
                        <img class="logo" src="{{ $clinic['logo_src'] }}" alt="Logo">
                    @else
                        <p class="clinic-name">{{ $clinic['name'] }}</p>
                    @endif
                    <p class="clinic-meta">
                        @if ($clinic['phone'])
                            Tel: {{ $clinic['phone'] }}@if ($clinic['email'] || $clinic['address'])<br>@endif
                        @endif
                        @if ($clinic['email'])
                            {{ $clinic['email'] }}@if ($clinic['address'])<br>@endif
                        @endif
                        @if ($clinic['address'])
                            {{ $clinic['address'] }}
                        @endif
                    </p>
                </td>
                <td class="doc-title" style="width: 42%;">
                    <p class="doc-title-label">Informe clínico</p>
                    <p class="doc-title-main">{{ $template_name ?: 'Atención clínica' }}</p>
                    <p class="dates">
                        <strong>Atención:</strong> {{ $attention_at ?? '—' }}<br>
                        <strong>Impresión:</strong> {{ $printed_at }}
                    </p>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <p class="section-title">Paciente</p>
        <table class="info-table">
            <tr>
                <td>
                    <p class="info-label">Nombre</p>
                    <p class="info-value">{{ $patient['name'] }}</p>
                </td>
                <td>
                    <p class="info-label">Ficha</p>
                    <p class="info-value">{{ $patient['record_number'] ?: '—' }}</p>
                </td>
                <td>
                    <p class="info-label">Especie</p>
                    <p class="info-value">{{ $patient['species'] ?: '—' }}</p>
                </td>
                <td>
                    <p class="info-label">Raza</p>
                    <p class="info-value">{{ $patient['breed'] ?: '—' }}</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p class="info-label">Sexo</p>
                    <p class="info-value">{{ $patient['sex'] ?: '—' }}</p>
                </td>
                <td>
                    <p class="info-label">Peso</p>
                    <p class="info-value">{{ $patient['weight_kg'] ? $patient['weight_kg'].' kg' : '—' }}</p>
                </td>
                <td>
                    <p class="info-label">Nacimiento</p>
                    <p class="info-value">{{ $patient['birth_date'] ?: '—' }}</p>
                </td>
                <td>
                    <p class="info-label">Tutor</p>
                    <p class="info-value">
                        {{ $tutor['name'] ?: '—' }}
                        @if ($tutor['phone'] || $tutor['email'])
                            <br>
                            <span style="font-size: 8.5pt; color: #57534e;">
                                {{ $tutor['phone'] ?: '' }}
                                @if ($tutor['phone'] && $tutor['email']) · @endif
                                {{ $tutor['email'] ?: '' }}
                            </span>
                        @endif
                    </p>
                </td>
            </tr>
        </table>
    </div>

    @if ($doctor)
        <div class="section">
            <p class="section-title">Médico tratante</p>
            <table class="info-table">
                <tr>
                    <td>
                        <p class="info-label">Nombre</p>
                        <p class="info-value">{{ $doctor['name'] }}</p>
                    </td>
                    <td>
                        <p class="info-label">{{ $doctor['document_type'] ?: 'Documento' }}</p>
                        <p class="info-value">{{ $doctor['document_number'] ?: '—' }}</p>
                    </td>
                    <td>
                        <p class="info-label">Teléfono</p>
                        <p class="info-value">{{ $doctor['phone'] ?: '—' }}</p>
                    </td>
                    <td>
                        <p class="info-label">Email</p>
                        <p class="info-value">{{ $doctor['email'] ?: '—' }}</p>
                    </td>
                </tr>
            </table>
        </div>
    @endif

    @if (count($vitals) > 0)
        <div class="section">
            <p class="section-title section-title-plain">Signos vitales</p>
            <table class="vitals-table">
                @foreach (array_chunk($vitals, 4) as $row)
                    <tr>
                        @foreach ($row as $field)
                            <td>
                                <div class="vital-card">
                                    <p class="vital-label">{{ $field['label'] }}</p>
                                    <p class="vital-value">{{ $field['value'] }}</p>
                                </div>
                            </td>
                        @endforeach
                        @for ($i = count($row); $i < 4; $i++)
                            <td></td>
                        @endfor
                    </tr>
                @endforeach
            </table>
        </div>
    @endif

    @if (count($clinical) > 0)
        <div class="section">
            <p class="section-title section-title-plain">Datos clínicos</p>
            <table class="clinical-table">
                @foreach (array_chunk($clinical, 2) as $row)
                    <tr>
                        @foreach ($row as $field)
                            <td>
                                <div class="clinical-block">
                                    <p class="clinical-label">{{ $field['label'] }}</p>
                                    <p class="clinical-value">{{ $field['value'] }}</p>
                                </div>
                            </td>
                        @endforeach
                        @for ($i = count($row); $i < 2; $i++)
                            <td></td>
                        @endfor
                    </tr>
                @endforeach
            </table>
        </div>
    @endif

    @if (count($exams) > 0)
        <div class="section">
            <p class="section-title">Exámenes solicitados</p>
            <ul class="exams-list">
                @foreach ($exams as $examName)
                    <li>{{ $examName }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if (count($document_templates) > 0)
        <div class="section">
            <p class="section-title">Plantillas y formatos</p>
            <ul class="exams-list">
                @foreach ($document_templates as $templateTitle)
                    <li>{{ $templateTitle }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if (count($vitals) === 0 && count($clinical) === 0 && count($exams) === 0 && count($document_templates) === 0)
        <div class="section">
            <p class="empty-note">No hay información compartible con el cliente para esta atención.</p>
        </div>
    @endif
</body>
</html>
