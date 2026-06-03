import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
    { title: 'Inicio', href: '#hero', id: 'hero' },
    { title: 'Servicios', href: '#servicios', id: 'servicios' },
    { title: 'Sobre nosotros', href: '#sobre-nosotros', id: 'sobre-nosotros' },
    { title: 'Galería', href: '#galeria', id: 'galeria' },
    { title: 'Contacto', href: '#contacto', id: 'contacto' },
] as const;

type ClinicHeaderProps = {
    logo: string | null;
    companyName: string;
};

export function ClinicHeader({ logo, companyName }: ClinicHeaderProps) {
    const [isAtTop, setIsAtTop] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<string>('hero');

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

    useEffect(() => {
        const syncFromHash = () => {
            const hash = window.location.hash.replace('#', '');

            if (hash && navLinks.some((link) => link.id === hash)) {
                setActiveSectionId(hash);
            }
        };

        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);

        return () => window.removeEventListener('hashchange', syncFromHash);
    }, []);

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
                isAtTop ? 'bg-transparent' : 'bg-white/80 shadow-sm backdrop-blur-sm',
            )}
        >
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 py-4 lg:flex-row lg:px-6">
                <div className="flex w-full flex-row items-center justify-between lg:w-auto">
                    <a href="#hero" className="flex items-center">
                        {logo ? (
                            <img
                                src={logo}
                                alt={companyName}
                                className="h-10 w-auto object-contain md:h-11"
                            />
                        ) : (
                            <span className="text-lg font-semibold text-cyan-700">{companyName}</span>
                        )}
                    </a>
                    <button
                        type="button"
                        className="block lg:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="size-8" /> : <Menu className="size-8" />}
                    </button>
                </div>
                <nav
                    className={cn(
                        'w-full transition-all duration-300 lg:w-auto',
                        isMenuOpen ? 'block' : 'hidden',
                        'lg:flex',
                    )}
                    aria-label="Secciones"
                >
                    <ul className="mt-4 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:items-center lg:gap-8">
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
                    </ul>
                </nav>
            </div>
        </header>
    );
}
