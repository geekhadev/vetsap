<?php

namespace App\Support\Medic;

/**
 * Catálogo de variables disponibles en plantillas de documentos médicos.
 * Las claves se usan como menciones `@grupo.campo` en el editor.
 */
final class DocumentTemplateVariables
{
    /**
     * @return list<array{group: string, group_label: string, items: list<array{id: string, label: string, sample: string}>}>
     */
    public static function catalog(): array
    {
        return [
            [
                'group' => 'paciente',
                'group_label' => 'Paciente',
                'items' => [
                    ['id' => 'paciente.nombre', 'label' => 'Nombre', 'sample' => 'Firulais'],
                    ['id' => 'paciente.ficha', 'label' => 'Nº de ficha', 'sample' => 'PAC-1024'],
                    ['id' => 'paciente.especie', 'label' => 'Especie', 'sample' => 'Canino'],
                    ['id' => 'paciente.raza', 'label' => 'Raza', 'sample' => 'Labrador'],
                    ['id' => 'paciente.sexo', 'label' => 'Sexo', 'sample' => 'Macho'],
                    ['id' => 'paciente.fecha_nacimiento', 'label' => 'Fecha de nacimiento', 'sample' => '12/03/2021'],
                    ['id' => 'paciente.peso', 'label' => 'Peso (kg)', 'sample' => '28.5'],
                    ['id' => 'paciente.microchip', 'label' => 'Microchip', 'sample' => '900123456789012'],
                    ['id' => 'paciente.colores', 'label' => 'Colores', 'sample' => 'Dorado'],
                    ['id' => 'paciente.esterilizado', 'label' => 'Esterilizado', 'sample' => 'Sí'],
                ],
            ],
            [
                'group' => 'clinica',
                'group_label' => 'Clínica',
                'items' => [
                    ['id' => 'clinica.nombre', 'label' => 'Nombre', 'sample' => 'Veterinaria Naranja'],
                    ['id' => 'clinica.alias', 'label' => 'Alias', 'sample' => 'VetNaranja'],
                    ['id' => 'clinica.documento', 'label' => 'Documento', 'sample' => '76.123.456-7'],
                    ['id' => 'clinica.email', 'label' => 'Email', 'sample' => 'contacto@vetnaranja.cl'],
                    ['id' => 'clinica.telefono', 'label' => 'Teléfono', 'sample' => '+56 2 2345 6789'],
                    ['id' => 'clinica.direccion', 'label' => 'Dirección', 'sample' => 'Av. Providencia 1234, Santiago'],
                ],
            ],
            [
                'group' => 'cliente',
                'group_label' => 'Cliente',
                'items' => [
                    ['id' => 'cliente.nombre', 'label' => 'Nombre', 'sample' => 'María González'],
                    ['id' => 'cliente.documento', 'label' => 'Documento', 'sample' => '12.345.678-9'],
                    ['id' => 'cliente.email', 'label' => 'Email', 'sample' => 'maria.gonzalez@email.cl'],
                    ['id' => 'cliente.telefono', 'label' => 'Teléfono', 'sample' => '+56 9 8765 4321'],
                    ['id' => 'cliente.direccion', 'label' => 'Dirección', 'sample' => 'Los Aromos 456, Ñuñoa'],
                ],
            ],
            [
                'group' => 'atencion',
                'group_label' => 'Atención',
                'items' => [
                    ['id' => 'atencion.estado', 'label' => 'Estado', 'sample' => 'Cerrada'],
                    ['id' => 'atencion.fecha_inicio', 'label' => 'Fecha de inicio', 'sample' => '18/07/2026'],
                    ['id' => 'atencion.hora_inicio', 'label' => 'Hora de inicio', 'sample' => '10:30'],
                    ['id' => 'atencion.fecha_cierre', 'label' => 'Fecha de cierre', 'sample' => '18/07/2026'],
                    ['id' => 'atencion.hora_cierre', 'label' => 'Hora de cierre', 'sample' => '11:05'],
                    ['id' => 'atencion.doctor', 'label' => 'Doctor', 'sample' => 'Dra. Ana Pérez'],
                ],
            ],
            [
                'group' => 'cita',
                'group_label' => 'Cita',
                'items' => [
                    ['id' => 'cita.fecha', 'label' => 'Fecha', 'sample' => '18/07/2026'],
                    ['id' => 'cita.hora_inicio', 'label' => 'Hora de inicio', 'sample' => '10:30'],
                    ['id' => 'cita.hora_fin', 'label' => 'Hora de fin', 'sample' => '11:00'],
                    ['id' => 'cita.estado', 'label' => 'Estado', 'sample' => 'Confirmada'],
                    ['id' => 'cita.doctor', 'label' => 'Doctor', 'sample' => 'Dra. Ana Pérez'],
                    ['id' => 'cita.servicio', 'label' => 'Servicio', 'sample' => 'Control general'],
                    ['id' => 'cita.sucursal', 'label' => 'Sucursal', 'sample' => 'Providencia'],
                    ['id' => 'cita.notas', 'label' => 'Notas', 'sample' => 'Traer carnet de vacunas'],
                ],
            ],
            [
                'group' => 'sistema',
                'group_label' => 'Sistema',
                'items' => [
                    ['id' => 'sistema.fecha', 'label' => 'Fecha actual', 'sample' => '18/07/2026'],
                    ['id' => 'sistema.hora', 'label' => 'Hora actual', 'sample' => '14:22'],
                    ['id' => 'sistema.fecha_hora', 'label' => 'Fecha y hora', 'sample' => '18/07/2026 14:22'],
                ],
            ],
        ];
    }
}
