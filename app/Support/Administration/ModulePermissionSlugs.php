<?php

namespace App\Support\Administration;

final readonly class ModulePermissionSlugs
{
    public function __construct(private string $moduleStoredSlug) {}

    public static function for(string $moduleStoredSlug): self
    {
        return new self($moduleStoredSlug);
    }

    public function moduleStoredSlug(): string
    {
        return $this->moduleStoredSlug;
    }

    public function segment(string $segment): string
    {
        return "{$this->moduleStoredSlug}.{$segment}";
    }

    public function list(): string
    {
        return $this->segment('list');
    }

    public function create(): string
    {
        return $this->segment('create');
    }

    public function update(): string
    {
        return $this->segment('update');
    }

    public function delete(): string
    {
        return $this->segment('delete');
    }
}
