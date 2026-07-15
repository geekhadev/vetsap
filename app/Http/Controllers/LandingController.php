<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('landing/index', [
            'canRegister' => Features::enabled(Features::registration()),
            'seo' => [
                'title' => 'Vetsap — Software para clínicas veterinarias',
                'description' => 'Organiza tu clínica veterinaria con web pública, citas en línea, gestión de pacientes y boletas electrónicas SII. Plan gratuito disponible.',
                'canonical' => url('/'),
                'og_image' => url('/images/seo/og-landing.png'),
                'og_type' => 'website',
                'json_ld' => [
                    self::schemaOrganization(),
                    self::schemaSoftwareApplication(),
                    self::schemaFaqPage(),
                ],
            ],
        ]);
    }

    private static function schemaOrganization(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'Vetsap',
            'url' => 'https://vetsap.app',
            'logo' => url('/logo.png'),
            'description' => 'Software SaaS para clínicas veterinarias en Chile. Web pública, citas en línea, gestión de pacientes y boletas electrónicas SII.',
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => '+56937263654',
                'contactType' => 'customer support',
                'availableLanguage' => 'Spanish',
            ],
            'sameAs' => [
                'https://www.linkedin.com/company/vetsap',
                'https://www.facebook.com/profile.php?id=61572392994418',
                'https://www.instagram.com/hola.vetsap/',
            ],
        ];
    }

    private static function schemaSoftwareApplication(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            'name' => 'Vetsap',
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web',
            'description' => 'Software para clínicas veterinarias con página web, citas en línea, gestión de pacientes y boletas electrónicas SII.',
            'offers' => [
                [
                    '@type' => 'Offer',
                    'name' => 'Free',
                    'price' => '0',
                    'priceCurrency' => 'CLP',
                ],
                [
                    '@type' => 'Offer',
                    'name' => 'Pro',
                    'price' => '49990',
                    'priceCurrency' => 'CLP',
                ],
            ],
        ];
    }

    private static function schemaFaqPage(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => '¿El plan gratis es realmente gratis para siempre?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Sí. Las funciones base — web pública de tu clínica, citas en línea y la agenda — no tienen costo. No pedimos tarjeta de crédito para crear tu cuenta.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Cuándo tendría que contratar el plan Pro?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Cuando necesites expedientes clínicos, inventario, boletas electrónicas SII o más de un usuario en el panel. Si solo buscas aparecer en internet y recibir citas, el plan gratis cubre todo eso.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Hay contrato de permanencia o penalidad por cancelar?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'No. El plan Pro se factura mes a mes. Puedes cancelar en cualquier momento desde tu perfil y seguir usando el plan Free sin perder tu información.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Necesito contratar hosting o un diseñador para tener mi web?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'No. Al crear tu cuenta en Vetsap obtienes una página web lista en vetsap.app/clinica/tu-nombre con tu información, servicios y formulario de citas. Sin código, sin hosting aparte, sin diseñador.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Mis clientes necesitan descargar una app?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'No. Tanto la web de tu clínica como el formulario de citas funcionan directamente desde el navegador del celular. No hay nada que instalar.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Cómo me llegan las citas que reservan mis clientes?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Aparecen directamente en tu agenda dentro del panel. Puedes ver el nombre del paciente, el servicio solicitado y el bloque horario. Sin WhatsApp, sin llamadas, sin anotar nada a mano.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Puedo emitir boletas electrónicas desde Vetsap?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Sí, en el plan Pro. Emites boletas directamente desde el módulo de ventas, con folios CAF y tu resolución SII configurados en un solo lugar. Disponible solo para clínicas en Chile.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Necesito un certificado digital aparte para la facturación?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'No necesitas contratar nada externo. El certificado digital y la configuración del SII se gestionan dentro del mismo sistema, en la sección de configuración de tu empresa.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Qué pasa con mis datos si cancelo?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Tu información — pacientes, citas, historial — permanece en tu cuenta mientras esta esté activa. Si decides eliminar tu cuenta, te entregamos un exportable de tus datos antes de cerrar.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Tienen soporte en español para clínicas en Chile?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Sí. El soporte es en español y está pensado para el mercado chileno: RUT, SII, y los flujos propios de una clínica veterinaria local. El plan Pro incluye soporte prioritario.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => '¿Necesito saber de tecnología para usar Vetsap?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'No. Si sabes usar WhatsApp, sabes usar Vetsap. La configuración inicial toma menos de 10 minutos y hay una guía de onboarding paso a paso al crear tu cuenta.',
                    ],
                ],
            ],
        ];
    }
}
