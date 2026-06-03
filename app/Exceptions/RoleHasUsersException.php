<?php

namespace App\Exceptions;

use RuntimeException;

final class RoleHasUsersException extends RuntimeException
{
    public static function forRole(int $assignedCount): self
    {
        return new self(__('role.delete_blocked_has_users', ['count' => $assignedCount]));
    }
}
