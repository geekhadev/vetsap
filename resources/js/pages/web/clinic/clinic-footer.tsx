import { Facebook, Instagram } from 'lucide-react';
import type { ClinicCompany, ClinicSettings } from './types';

const navLinks = [
    { title: 'Inicio', href: '#hero' },
    { title: 'Servicios', href: '#servicios' },
    { title: 'Sobre nosotros', href: '#sobre-nosotros' },
    { title: 'Galería', href: '#galeria' },
    { title: 'Contacto', href: '#contacto' },
];

type ClinicFooterProps = {
    company: ClinicCompany;
    settings: ClinicSettings;
};

export function ClinicFooter({ company, settings }: ClinicFooterProps) {
    const year = new Date().getFullYear();
    const facebookUrl = settings['facebook_url'];
    const instagramUrl = settings['instagram_url'];
    const hasSocial = facebookUrl != null || instagramUrl != null;

    return (
        <footer className="mx-auto w-full max-w-7xl rounded-t-lg bg-clinic-900 shadow">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-0">
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm text-gray-200">
                        © {year} {company.name}. Todos los derechos reservados.
                    </h4>
                    <span className="text-sm text-gray-200">
                        Desarrollado con ❤️ por{' '}
                        <a href="https://vetsap.app" className="text-yellow-400 hover:text-yellow-300">
                            Vetsap
                        </a>
                    </span>
                </div>
                <div className="flex flex-col gap-4 md:flex-row">
                    <ul className="flex flex-wrap items-center text-sm font-medium text-gray-200">
                        {navLinks.map((item) => (
                            <li key={item.title}>
                                <a href={item.href} className="me-4 transition-colors hover:text-yellow-400 md:me-6">
                                    {item.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                    {hasSocial && (
                        <div className="flex gap-2">
                            {facebookUrl && (
                                <a
                                    href={facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:bg-white/10"
                                >
                                    <Facebook size={16} />
                                </a>
                            )}
                            {instagramUrl && (
                                <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:bg-white/10"
                                >
                                    <Instagram size={16} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}
