<?php

namespace App\Support\Medic;

final class SpecialtyPermissionSlugs
{
    public const MODULE_STORED_SLUG = 'medic.specialties';

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
