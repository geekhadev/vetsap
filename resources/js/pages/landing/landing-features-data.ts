export type LandingFeature = {
    id: string;
    tabLabel: string;
    windowLabel: string;
    title: string;
    description: string;
    bullets: readonly string[];
    imageSrc: string;
    imageAlt: string;
};

export const landingFeatures: readonly LandingFeature[] = [
    {
        id: 'web',
        tabLabel: 'Web pública',
        windowLabel: 'vetsap.app/clinica/tu-clinica',
        title: 'Tu clínica visible en internet',
        description:
            'Publica servicios, horarios y datos de contacto en una página profesional con tu propia URL. Sin diseñador ni hosting aparte.',
        bullets: [
            'URL personalizada: vetsap.app/clinica/tu-nombre',
            'Secciones de servicios, galería y contacto',
            'Diseño alineado a la experiencia de tus clientes',
        ],
        imageSrc: 'https://placehold.co/1200x720/e0f7fa/00838f?text=Web+p%C3%BAblica',
        imageAlt: 'Vista de la página web pública de una clínica veterinaria',
    },
    {
        id: 'citas',
        tabLabel: 'Citas en línea',
        windowLabel: 'Reserva · Servicio y horario',
        title: 'Agenda sin llamadas ni WhatsApp',
        description:
            'Tus clientes eligen servicio, día y bloque horario desde el celular. Tú recibes la cita organizada en el panel.',
        bullets: [
            'Flujo guiado en pocos pasos',
            'Bloques según disponibilidad real',
            'Confirmación clara para el dueño de la mascota',
        ],
        imageSrc: 'https://placehold.co/1200x720/b2ebf2/00838f?text=Agenda+en+l%C3%ADnea',
        imageAlt: 'Formulario de reserva de citas en línea',
    },
    {
        id: 'gestion',
        tabLabel: 'Gestión',
        windowLabel: 'Panel · Citas del día',
        title: 'Operación diaria en un solo panel',
        description:
            'Citas del día, pacientes, equipo e inventario centralizados. Menos Excel, menos papeles, más tiempo con las mascotas.',
        bullets: [
            'Agenda y estados de las citas',
            'Fichas de pacientes y historial',
            'Roles y permisos por sucursal',
        ],
        imageSrc: 'https://placehold.co/1200x720/e0f7fa/006978?text=Panel+de+gesti%C3%B3n',
        imageAlt: 'Panel de gestión de clínica veterinaria',
    },
    {
        id: 'sii',
        tabLabel: 'Boletas SII',
        windowLabel: 'Ventas · Boleta electrónica',
        title: 'Facturación electrónica integrada',
        description:
            'Emite boletas desde el mismo sistema con folios CAF y certificado digital bajo control. Pensado para clínicas en Chile.',
        bullets: [
            'Tipos de documento del SII configurables',
            'Folios y resolución en un solo lugar',
            'Menos saltos entre sistemas al cobrar',
        ],
        imageSrc: 'https://placehold.co/1200x720/b2ebf2/006978?text=Boletas+SII',
        imageAlt: 'Emisión de boletas electrónicas SII',
    },
] as const;

export const defaultLandingFeatureId = landingFeatures[0].id;
