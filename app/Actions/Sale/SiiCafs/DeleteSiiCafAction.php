<?php

namespace App\Actions\Sale\SiiCafs;

use App\Models\Sale\SiiCaf;
use Illuminate\Support\Facades\Storage;

final class DeleteSiiCafAction
{
    public function execute(SiiCaf $caf): void
    {
        $path = $caf->xml_path;
        $caf->delete();

        if (is_string($path) && $path !== '' && Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }
    }
}
