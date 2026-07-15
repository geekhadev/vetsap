import { Link } from '@inertiajs/react';
import { LandingFooter } from '@/pages/landing/landing-footer';
import { LandingHeader } from '@/pages/landing/landing-header';
import { LandingWhatsappButton } from '@/pages/landing/landing-whatsapp-button';
import { landingNavLinkClassName } from '@/pages/landing/landing-theme';

const members = [
    {
        name: 'Irwing',
        initials: 'IR',
        role: 'Fundador & Desarrollo',
        description:
            'Responsable del desarrollo del producto, la arquitectura del sistema y la estrategia del negocio.',
    },
    {
        name: 'Anderson Malave',
        initials: 'AM',
        role: 'Soporte & Operaciones',
        description:
            'Cubre soporte técnico, pruebas del sistema, reuniones con clientes y demostraciones del producto.',
    },
] as const;

export default function TeamPage({ canRegister = true }: { canRegister?: boolean }) {
    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-900">
            <LandingHeader canRegister={canRegister} />

            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-32 lg:px-6">
                <div className="mb-2 text-sm font-medium uppercase tracking-widest text-cyan-600">
                    El equipo
                </div>
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                    Las personas detrás de Vetsap
                </h1>
                <p className="mb-12 max-w-xl text-lg text-gray-500">
                    Somos un equipo pequeño con foco en construir el mejor software para clínicas
                    veterinarias en Chile.
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {members.map((member) => (
                        <div
                            key={member.name}
                            className="rounded-2xl border border-gray-100 bg-neutral-50 p-6"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                                {member.initials}
                            </div>
                            <p className="text-xl font-semibold text-gray-900">{member.name}</p>
                            <p className="mb-3 text-sm font-medium text-cyan-600">{member.role}</p>
                            <p className="text-sm leading-relaxed text-gray-500">
                                {member.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 border-t border-gray-100 pt-10 text-center">
                    <p className="mb-4 text-gray-500">¿Quieres saber más sobre el producto?</p>
                    <Link href="/" className={landingNavLinkClassName}>
                        Volver al inicio →
                    </Link>
                </div>
            </main>

            <LandingFooter />
            <LandingWhatsappButton />
        </div>
    );
}
