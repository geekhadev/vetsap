<?php

namespace App\Support\Sale;

final class SiiCafPermissionSlugs
{
    public const MODULE_STORED_SLUG = 'sale.sii-cafs';

    public const SEGMENT_VIEW = 'view';

    public const SEGMENT_UPLOAD = 'upload';

    public const SEGMENT_DELETE = 'delete';

    public static function view(): string
    {
        return self::MODULE_STORED_SLUG.'.'.self::SEGMENT_VIEW;
    }

    public static function upload(): string
    {
        return self::MODULE_STORED_SLUG.'.'.self::SEGMENT_UPLOAD;
    }

    public static function delete(): string
    {
        return self::MODULE_STORED_SLUG.'.'.self::SEGMENT_DELETE;
    }
}
