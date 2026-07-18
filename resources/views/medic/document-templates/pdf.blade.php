<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 0.75in;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            color: #171717;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11pt;
            line-height: 1.45;
            background: #ffffff;
        }

        p {
            margin: 0 0 0.75em 0;
            min-height: 1.25em;
        }

        ul, ol {
            margin: 0 0 0.75em 1.25em;
            padding: 0;
        }

        strong {
            font-weight: bold;
        }

        em {
            font-style: italic;
        }
    </style>
</head>
<body>
{!! $content !!}
</body>
</html>
