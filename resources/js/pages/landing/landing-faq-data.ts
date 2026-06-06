export type LandingFaqItem = {
    question: string;
    answer: string;
};

export type LandingFaqGroup = {
    label: string;
    items: readonly LandingFaqItem[];
};

export const landingFaqGroups: readonly LandingFaqGroup[] = [
    {
        label: 'El plan gratuito',
        items: [
            {
                question: '¿El plan gratis es realmente gratis para siempre?',
                answer:
                    'Sí. Las funciones base — web pública de tu clínica, citas en línea y la agenda — no tienen costo. No pedimos tarjeta de crédito para crear tu cuenta.',
            },
            {
                question: '¿Cuándo tendría que contratar el plan Pro?',
                answer:
                    'Cuando necesites expedientes clínicos, inventario, boletas electrónicas SII o más de un usuario en el panel. Si solo buscas aparecer en internet y recibir citas, el plan gratis cubre todo eso.',
            },
            {
                question: '¿Hay contrato de permanencia o penalidad por cancelar?',
                answer:
                    'No. El plan Pro se factura mes a mes. Puedes cancelar en cualquier momento desde tu perfil y seguir usando el plan Free sin perder tu información.',
            },
        ],
    },
    {
        label: 'Web y citas en línea',
        items: [
            {
                question: '¿Necesito contratar hosting o un diseñador para tener mi web?',
                answer:
                    'No. Al crear tu cuenta en Vetsap obtienes una página web lista en vetsap.app/clinica/tu-nombre con tu información, servicios y formulario de citas. Sin código, sin hosting aparte, sin diseñador.',
            },
            {
                question: '¿Mis clientes necesitan descargar una app?',
                answer:
                    'No. Tanto la web de tu clínica como el formulario de citas funcionan directamente desde el navegador del celular. No hay nada que instalar.',
            },
            {
                question: '¿Cómo me llegan las citas que reservan mis clientes?',
                answer:
                    'Aparecen directamente en tu agenda dentro del panel. Puedes ver el nombre del paciente, el servicio solicitado y el bloque horario. Sin WhatsApp, sin llamadas, sin anotar nada a mano.',
            },
        ],
    },
    {
        label: 'Facturación electrónica',
        items: [
            {
                question: '¿Puedo emitir boletas electrónicas desde Vetsap?',
                answer:
                    'Sí, en el plan Pro. Emites boletas directamente desde el módulo de ventas, con folios CAF y tu resolución SII configurados en un solo lugar. Disponible solo para clínicas en Chile.',
            },
            {
                question: '¿Necesito un certificado digital aparte para la facturación?',
                answer:
                    'No necesitas contratar nada externo. El certificado digital y la configuración del SII se gestionan dentro del mismo sistema, en la sección de configuración de tu empresa.',
            },
        ],
    },
    {
        label: 'Datos y soporte',
        items: [
            {
                question: '¿Qué pasa con mis datos si cancelo?',
                answer:
                    'Tu información — pacientes, citas, historial — permanece en tu cuenta mientras esta esté activa. Si decides eliminar tu cuenta, te entregamos un exportable de tus datos antes de cerrar.',
            },
            {
                question: '¿Tienen soporte en español para clínicas en Chile?',
                answer:
                    'Sí. El soporte es en español y está pensado para el mercado chileno: RUT, SII, y los flujos propios de una clínica veterinaria local. El plan Pro incluye soporte prioritario.',
            },
            {
                question: '¿Necesito saber de tecnología para usar Vetsap?',
                answer:
                    'No. Si sabes usar WhatsApp, sabes usar Vetsap. La configuración inicial toma menos de 10 minutos y hay una guía de onboarding paso a paso al crear tu cuenta.',
            },
        ],
    },
];
