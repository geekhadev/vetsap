import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    landingCtaButtonClassName,
    landingCtaButtonSmClassName,
    landingNavLinkClassName,
} from '@/pages/landing/landing-theme';
import type { LandingSectionProps } from '@/pages/landing/types';
import { dashboard, login, register } from '@/routes';

const navLinks = [
    { title: 'Producto', href: '#producto', id: 'producto' },
    { title: 'Funcionalidades', href: '#modulos', id: 'modulos' },
    { title: 'Precios', href: '#precios', id: 'precios' },
    { title: 'FAQ', href: '#faq', id: 'faq' },
] as const;

export function LandingHeader({ canRegister }: LandingSectionProps) {
    const [isAtTop, setIsAtTop] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<string>('producto');

    useEffect(() => {
        const handleScroll = () => setIsAtTop(window.scrollY === 0);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const sectionElements = navLinks
            .map((link) => document.getElementById(link.id))
            .filter((element): element is HTMLElement => element !== null);

        if (sectionElements.length === 0) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                const topmost = visible[0];

                if (topmost?.target.id) {
                    setActiveSectionId(topmost.target.id);
                }
            },
            {
                rootMargin: '-30% 0px -55% 0px',
                threshold: [0, 0.1, 0.25, 0.5],
            },
        );

        sectionElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
                isMenuOpen
                    ? 'bg-white shadow-sm'
                    : isAtTop
                      ? 'bg-transparent'
                      : 'bg-white/80 shadow-sm backdrop-blur-sm',
            )}
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
                <div className="flex w-full items-center justify-between gap-3">
                    <a
                        href="#top"
                        className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                    >
                        <img
                            src="/logo.png"
                            alt="Vetsap"
                            width={180}
                            height={48}
                            className="h-9 w-auto object-contain md:h-10"
                        />
                    </a>
                    <div className="flex items-center gap-2">
                        <div className="hidden items-center gap-2 sm:flex lg:hidden">
                            <AuthButtons canRegister={canRegister} compact />
                        </div>
                        <button
                            type="button"
                            className="block text-gray-700 lg:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-expanded={isMenuOpen}
                            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            {isMenuOpen ? <X className="size-8" /> : <Menu className="size-8" />}
                        </button>
                    </div>
                </div>

                <nav
                    className={cn(
                        'w-full transition-all duration-300 lg:w-auto',
                        isMenuOpen ? 'block max-lg:border-t max-lg:border-gray-100 max-lg:bg-white max-lg:pt-4 max-lg:pb-2' : 'hidden',
                        'lg:block',
                    )}
                    aria-label="Secciones"
                >
                    <ul className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
                        {navLinks.map((link) => {
                            const isActive = activeSectionId === link.id;

                            return (
                                <li key={link.title}>
                                    <a
                                        href={link.href}
                                        aria-current={isActive ? 'location' : undefined}
                                        onClick={() => {
                                            setActiveSectionId(link.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className={cn(
                                            'inline-block text-base transition-colors',
                                            isActive
                                                ? 'font-bold text-cyan-700'
                                                : 'font-medium text-gray-600 hover:text-cyan-600',
                                        )}
                                    >
                                        {link.title}
                                    </a>
                                </li>
                            );
                        })}
                        <li>
                            <Link
                                href="/equipo"
                                onClick={() => setIsMenuOpen(false)}
                                className="inline-block text-base font-medium text-gray-600 transition-colors hover:text-cyan-600"
                            >
                                Equipo
                            </Link>
                        </li>
                    </ul>
                    <div className="mt-4 flex flex-col gap-2 sm:hidden">
                        <AuthButtons canRegister={canRegister} />
                    </div>
                </nav>

                <div className="hidden items-center gap-2 lg:flex">
                    <AuthButtons canRegister={canRegister} />
                </div>
            </div>
        </header>
    );
}

function AuthButtons({
    canRegister,
    compact = false,
}: LandingSectionProps & { compact?: boolean }) {
    const { auth } = usePage().props;
    const ctaClassName = compact ? landingCtaButtonSmClassName : landingCtaButtonClassName;

    if (auth.user) {
        return (
            <Button size={compact ? 'sm' : 'default'} className={ctaClassName} asChild>
                <Link href={dashboard()}>Ir al panel</Link>
            </Button>
        );
    }

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-auto min-w-60 ml-2">
            <Link href={login()} className={landingNavLinkClassName}>
                Iniciar sesión
            </Link>
            {canRegister ? (
                <Button size={compact ? 'sm' : 'default'} className={ctaClassName} asChild>
                    <Link href={register()}>Crear cuenta</Link>
                </Button>
            ) : (
                <Button size={compact ? 'sm' : 'default'} className={ctaClassName} asChild>
                    <Link href={login()}>Acceder</Link>
                </Button>
            )}
        </div>
    );
}
