<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $xml = Cache::remember('sitemap_xml', 3600, function (): string {
            $slugs = Company::query()->pluck('slug');

            return view('sitemap', [
                'slugs' => $slugs,
                'updatedAt' => now()->toAtomString(),
            ])->render();
        });

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
