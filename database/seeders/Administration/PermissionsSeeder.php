<?php

namespace Database\Seeders\Administration;

use App\Models\Administration\Module;
use App\Models\Administration\Permission;
use App\Models\Administration\System;
use Illuminate\Database\Seeder;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions_crud = [
            ['permission_name' => 'Listar', 'permission_slug' => 'list'],
            ['permission_name' => 'Crear', 'permission_slug' => 'create'],
            ['permission_name' => 'Actualizar', 'permission_slug' => 'update'],
            ['permission_name' => 'Eliminar', 'permission_slug' => 'delete'],
        ];

        $structure = [
            [
                'system_name' => 'Administración',
                'system_slug' => 'administration',
                'modules' => [
                    [
                        'module_name' => 'Sistemas',
                        'module_slug' => 'systems',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Módulos',
                        'module_slug' => 'modules',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Permisos',
                        'module_slug' => 'permissions',
                        'permissions' => $permissions_crud,
                    ],
                ],
            ],
            [
                'system_name' => 'Configuración',
                'system_slug' => 'configuration',
                'modules' => [
                    [
                        'module_name' => 'Roles',
                        'module_slug' => 'roles',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Empresas',
                        'module_slug' => 'companies',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Sucursales',
                        'module_slug' => 'company-offices',
                        'permissions' => $permissions_crud,
                    ],
                ],
            ],
            [
                'system_name' => 'Ventas',
                'system_slug' => 'sale',
                'modules' => [
                    [
                        'module_name' => 'SII Certificación Boletas',
                        'module_slug' => 'sii-certification-tickets',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'SII CAFs',
                        'module_slug' => 'sii-cafs',
                        'permissions' => [
                            ['permission_name' => 'Ver', 'permission_slug' => 'view'],
                            ['permission_name' => 'Subir', 'permission_slug' => 'upload'],
                            ['permission_name' => 'Eliminar', 'permission_slug' => 'delete'],
                        ],
                    ],
                    [
                        'module_name' => 'Clientes',
                        'module_slug' => 'customers',
                        'permissions' => $permissions_crud,
                    ],
                ],
            ],
            [
                'system_name' => 'Almacén',
                'system_slug' => 'store',
                'modules' => [
                    [
                        'module_name' => 'Tipos de productos',
                        'module_slug' => 'product-types',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Categorías de productos',
                        'module_slug' => 'product-categories',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Productos',
                        'module_slug' => 'products',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Categorías de movimiento',
                        'module_slug' => 'movement-categories',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Movimientos de inventario',
                        'module_slug' => 'inventory-movements',
                        'permissions' => [
                            ['permission_name' => 'Listar', 'permission_slug' => 'list'],
                            ['permission_name' => 'Crear', 'permission_slug' => 'create'],
                        ],
                    ],
                ],
            ],
            [
                'system_name' => 'Medicina',
                'system_slug' => 'medic',
                'modules' => [
                    [
                        'module_name' => 'Especialidades',
                        'module_slug' => 'specialties',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Servicios',
                        'module_slug' => 'services',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Especies',
                        'module_slug' => 'species',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Doctores',
                        'module_slug' => 'doctors',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Pacientes',
                        'module_slug' => 'patients',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Plantillas y formatos',
                        'module_slug' => 'document-templates',
                        'permissions' => $permissions_crud,
                    ],
                ],
            ],
            [
                'system_name' => 'Agenda',
                'system_slug' => 'agenda',
                'modules' => [
                    [
                        'module_name' => 'Calendario',
                        'module_slug' => 'calendar',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Días feriados',
                        'module_slug' => 'holidays',
                        'permissions' => $permissions_crud,
                    ],
                    [
                        'module_name' => 'Estados de cita',
                        'module_slug' => 'appointment-statuses',
                        'permissions' => $permissions_crud,
                    ],
                ],
            ],
            [
                'system_name' => 'Compartido',
                'system_slug' => 'shared',
                'modules' => [
                    [
                        'module_name' => 'Estados',
                        'module_slug' => 'states',
                        'permissions' => [
                            ['permission_name' => 'Listar estados', 'permission_slug' => 'list'],
                            ['permission_name' => 'Crear estados', 'permission_slug' => 'create'],
                            ['permission_name' => 'Editar estados', 'permission_slug' => 'edit'],
                            ['permission_name' => 'Eliminar estados', 'permission_slug' => 'delete'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($structure as $systemRow) {
            $system = System::firstOrCreate(
                ['slug' => $systemRow['system_slug']],
                ['name' => $systemRow['system_name']],
            );

            foreach ($systemRow['modules'] as $moduleRow) {
                $moduleStoredSlug = Module::composeStoredSlug($system, $moduleRow['module_slug']);

                $module = Module::firstOrCreate(
                    ['slug' => $moduleStoredSlug],
                    [
                        'name' => $moduleRow['module_name'],
                        'system_id' => $system->id,
                    ],
                );

                foreach ($moduleRow['permissions'] as $permissionRow) {
                    $permissionStoredSlug = Permission::composeStoredSlug(
                        $module,
                        $permissionRow['permission_slug'],
                    );

                    Permission::firstOrCreate(
                        ['slug' => $permissionStoredSlug],
                        [
                            'name' => $permissionRow['permission_name'],
                            'module_id' => $module->id,
                        ],
                    );
                }
            }
        }
    }
}
