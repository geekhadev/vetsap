import type { UserType } from '@/types/auth';

/**
 * Etiqueta legible para el enum de tipo de usuario.
 */
export function formatUserType(value: string): string {
    switch (value as UserType) {
        case 'root':
            return 'Root';
        case 'owner':
            return 'Owner';
        case 'user':
            return 'Usuario';
        case 'customer':
            return 'Cliente';
        default:
            return value;
    }
}
