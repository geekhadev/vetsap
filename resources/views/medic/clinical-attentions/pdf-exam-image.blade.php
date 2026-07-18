<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $exam_name }}</title>
    <style>
        @page {
            margin: 28px 32px 36px 32px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            color: #1c1917;
            background: #ffffff;
        }

        .header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .header td {
            vertical-align: middle;
            border-bottom: 0.75pt solid #d6d3d1;
            padding-bottom: 6px;
        }

        .exam-name {
            font-size: 11pt;
            font-weight: bold;
            margin: 0;
            color: #0c0a09;
            text-align: left;
        }

        .logo-cell {
            text-align: right;
            width: 70px;
        }

        .logo {
            max-height: 28px;
            max-width: 60px;
        }

        .image-wrap {
            text-align: center;
        }

        .image-wrap img {
            max-width: 100%;
            max-height: 640px;
        }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td>
                <p class="exam-name">{{ $exam_name }}</p>
            </td>
            @if (! empty($logo_src))
                <td class="logo-cell">
                    <img class="logo" src="{{ $logo_src }}" alt="Logo">
                </td>
            @endif
        </tr>
    </table>
    <div class="image-wrap">
        <img src="{{ $image_src }}" alt="{{ $exam_name }}">
    </div>
</body>
</html>
