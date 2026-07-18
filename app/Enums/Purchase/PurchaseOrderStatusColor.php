<?php

namespace App\Enums\Purchase;

enum PurchaseOrderStatusColor: string
{
    case Slate = 'slate';
    case Blue = 'blue';
    case Sky = 'sky';
    case Cyan = 'cyan';
    case Teal = 'teal';
    case Green = 'green';
    case Emerald = 'emerald';
    case Lime = 'lime';
    case Amber = 'amber';
    case Orange = 'orange';
    case Rose = 'rose';
    case Pink = 'pink';
    case Purple = 'purple';
    case Violet = 'violet';
    case Indigo = 'indigo';
    case Red = 'red';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
