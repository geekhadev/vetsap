export type LandingPlan = {
    id: string;
    name: string;
    description: string;
    price: string;
    priceNote?: string;
    features: readonly string[];
    highlighted?: boolean;
    badge?: string;
    ctaLabel: string;
};

export const landingPlans: readonly LandingPlan[] = [
    {
        id: 'free',
        name: 'Free',
        description: 'Para arrancar con web pública y agenda sin costo inicial.',
        price: '$0',
        priceNote: 'CLP / mes · para siempre en funciones base',
        features: [
            'Página web de tu clínica',
            'Citas en línea para tus clientes',
            'Agenda y pacientes en el panel',
            '1 sucursal',
        ],
        ctaLabel: 'Crear cuenta gratis',
    },
    {
        id: 'pro',
        name: 'PRO',
        description: 'Operación completa con facturación SII y más usuarios.',
        price: '$49.990',
        priceNote: 'CLP / mes · facturación mensual',
        features: [
            'Todo lo del plan Free',
            'Boletas electrónicas SII',
            'Inventario y múltiples usuarios',
            'Soporte prioritario',
        ],
        highlighted: true,
        badge: 'Más popular',
        ctaLabel: 'Empezar con PRO',
    },
] as const;
