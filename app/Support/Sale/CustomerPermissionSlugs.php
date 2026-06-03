<?php

namespace App\Support\Sale;

final class CustomerPermissionSlugs
{
    public const MODULE_STORED_SLUG = 'sale.customers';

    public const SEGMENT_LIST = 'list';

    public const SEGMENT_CREATE = 'create';

    public const SEGMENT_UPDATE = 'update';

    public const SEGMENT_DELETE = 'delete';

    public static function list(): string
    {
        return self::MODULE_STORED_SLUG.'.'.self::SEGMENT_LIST;
    }

    public static function create(): string
    {
        return self::MODULE_STORED_SLUG.'.'.self::SEGMENT_CREATE;
    }

    public static function update(): string
    {
        return self::MODULE_STORED_SLUG.'.'.self::SEGMENT_UPDATE;
    }

    public static function delete(): string
    {
        return self::MODULE_STORED_SLUG.'.'.self::SEGMENT_DELETE;
    }
}
