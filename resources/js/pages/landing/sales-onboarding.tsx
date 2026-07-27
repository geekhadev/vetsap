import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { landingNavLinkClassName } from '@/pages/landing/landing-theme';
import {
    pitchScripts,
    planCompare,
    productHighlights,
    salesFaqGroups,
    salesModules,
    salesNavLinks,
    setupProtocol,
} from '@/pages/landing/sales-onboarding-data';

function planBadgeClass(plan: string): string {
    if (plan === 'PRO') {
        return 'bg-cyan-700 text-white';
    }

    if (plan === 'Free') {
        return 'bg-emerald-100 text-emerald-800';
    }

    return 'bg-gray-100 text-gray-700';
}

export default function SalesOnboardingPage() {
    const [activeSectionId, setActiveSectionId] = useState<string>('producto');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const html = document.documentElement;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            html.classList.add('scroll-smooth');
        }

        return () => {
            html.classList.remove('scroll-smooth');
        };
    }, []);

    useEffect(() => {
        const sectionElements = salesNavLinks
            .map((link) => document.getElementById(link.href.slice(1)))
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
                rootMargin: '-25% 0px -55% 0px',
                threshold: [0, 0.1, 0.25, 0.5],
            },
        );

        sectionElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Head title="Onboarding de ventas" />

            <div
                id="top"
                className="flex min-h-screen flex-col bg-white text-gray-900 [&_[id]]:scroll-mt-28"
            >
                <header className="sticky top-0 z-50 border-b border-cyan-100/80 bg-white/90 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
                        <a href="#top" className="flex shrink-0 items-center">
                            <img
                                src="/logo.png"
                                alt="Vetsap"
                                width={160}
                                height={42}
                                className="h-8 w-auto object-contain"
                            />
                        </a>

                        <nav className="hidden items-center gap-5 md:flex" aria-label="Secciones">
                            {salesNavLinks.map((link) => {
                                const id = link.href.slice(1);
                                const isActive = activeSectionId === id;

                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        aria-current={isActive ? 'location' : undefined}
                                        className={cn(
                                            'text-sm transition-colors',
                                            isActive
                                                ? 'font-semibold text-cyan-700'
                                                : 'font-medium text-gray-600 hover:text-cyan-600',
                                        )}
                                    >
                                        {link.title}
                                    </a>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/" className={cn(landingNavLinkClassName, 'hidden text-sm sm:inline')}>
                                Ir al sitio
                            </Link>
                            <button
                                type="button"
                                className="text-sm font-medium text-cyan-700 md:hidden"
                                onClick={() => setIsMenuOpen((open) => !open)}
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? 'Cerrar' : 'Menú'}
                            </button>
                        </div>
                    </div>

                    {isMenuOpen ? (
                        <nav
                            className="border-t border-gray-100 px-4 py-3 md:hidden"
                            aria-label="Secciones móvil"
                        >
                            <ul className="flex flex-col gap-2">
                                {salesNavLinks.map((link) => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className="block py-1 text-sm font-medium text-gray-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ) : null}
                </header>

                <main className="flex-1">
                    <section className="border-b border-cyan-50 bg-linear-to-b from-cyan-50/80 to-white py-16">
                        <div className="mx-auto max-w-7xl">
                            <p className="mb-3 text-sm font-semibold tracking-widest text-cyan-700 uppercase">
                                Guía interna de ventas
                            </p>
                            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                                Todo lo que necesitas saber para vender Vetsap
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
                                Vista pública, sin sesión. Usa este onboarding para entender el producto,
                                el orden correcto de configuración y las respuestas que más escuchan las
                                clínicas.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3 text-sm">
                                <a
                                    href="#protocolo"
                                    className="rounded-full bg-cyan-600 px-5 py-2.5 font-semibold text-white hover:bg-cyan-700"
                                >
                                    Ver protocolo
                                </a>
                                <a
                                    href="#faq"
                                    className="rounded-full border border-cyan-200 bg-white px-5 py-2.5 font-semibold text-cyan-900 hover:border-cyan-400"
                                >
                                    Ir al FAQ
                                </a>
                            </div>
                        </div>
                    </section>

                    <section id="producto" className="px-4 py-16 lg:px-6">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Producto"
                                title="Qué es Vetsap"
                                description="ERP + web pública para clínicas veterinarias en Chile. Panel interno “ERP - Veterinario” y portal limitado para dueños de mascotas."
                            />
                            <div className="mt-12 grid gap-5 md:grid-cols-3">
                                {productHighlights.map((item) => (
                                    <article
                                        key={item.title}
                                        className="rounded-2xl border border-gray-100 bg-neutral-50/80 p-5"
                                    >
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                            {item.body}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="planes" className="bg-neutral-50/90 px-4 py-16 lg:px-6">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Planes"
                                title="Free vs PRO"
                                description="Parte siempre por Free. Sube a PRO cuando aparecen boletas SII, inventario o varios usuarios."
                            />
                            <div className="mt-10 grid gap-6 md:grid-cols-2">
                                {planCompare.map((plan) => (
                                    <article
                                        key={plan.name}
                                        className={cn(
                                            'rounded-2xl border bg-white p-6',
                                            plan.name === 'PRO'
                                                ? 'border-cyan-300 shadow-sm'
                                                : 'border-gray-100',
                                        )}
                                    >
                                        <div className="flex items-baseline justify-between gap-3">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {plan.name}
                                            </h3>
                                            <p className="text-sm font-semibold text-cyan-700">
                                                {plan.price}
                                            </p>
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-gray-700">
                                            {plan.when}
                                        </p>
                                        <ul className="mt-5 space-y-2">
                                            {plan.includes.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="text-sm leading-relaxed text-gray-600 before:mr-2 before:text-cyan-600 before:content-['•']"
                                                >
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="modulos" className="px-4 py-16 lg:px-6">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Módulos"
                                title="Mapa del sistema"
                                description="Conoce cada bloque para saber qué mostrar en una demo y qué plan lo cubre."
                            />
                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                {salesModules.map((module) => (
                                    <article
                                        key={module.id}
                                        className="rounded-2xl border border-gray-100 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {module.name}
                                            </h3>
                                            <span
                                                className={cn(
                                                    'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                                    planBadgeClass(module.plan),
                                                )}
                                            >
                                                {module.plan}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                            {module.pitch}
                                        </p>
                                        <ul className="mt-4 space-y-1.5">
                                            {module.bullets.map((bullet) => (
                                                <li
                                                    key={bullet}
                                                    className="text-sm leading-relaxed text-gray-500 before:mr-2 before:text-cyan-500 before:content-['–']"
                                                >
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="protocolo" className="bg-neutral-50/90 px-4 py-16 lg:px-6">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Protocolo"
                                title="Orden de configuración"
                                description="Sigue este orden al onboardear una clínica nueva. Los primeros pasos desbloquean web + citas; los últimos cierran PRO (stock, caja, SII)."
                            />
                            <ol className="mt-10 space-y-4">
                                {setupProtocol.map((step) => (
                                    <li
                                        key={step.step}
                                        className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6"
                                    >
                                        <div className="flex flex-wrap items-start gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-sm font-bold text-white">
                                                {step.step}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {step.title}
                                                    </h3>
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                                            planBadgeClass(step.plan),
                                                        )}
                                                    >
                                                        {step.plan}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-cyan-700">
                                                    {step.where}
                                                </p>
                                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                                    {step.why}
                                                </p>
                                                <ul className="mt-3 space-y-1">
                                                    {step.tips.map((tip) => (
                                                        <li
                                                            key={tip}
                                                            className="text-sm leading-relaxed text-gray-500 before:mr-2 before:content-['→']"
                                                        >
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <section id="pitch" className="px-4 py-16 lg:px-6">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Pitch"
                                title="Guiones y objeciones"
                                description="Frases listas para demos y conversaciones. Adáptalas a tu estilo; no leas en modo robot."
                            />
                            <div className="mt-10 space-y-4">
                                {pitchScripts.map((script) => (
                                    <article
                                        key={script.title}
                                        className="rounded-2xl border border-gray-100 bg-neutral-50/80 p-5"
                                    >
                                        <h3 className="text-base font-semibold text-cyan-800">
                                            {script.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                            {script.body}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="faq" className="bg-neutral-50/90 px-4 py-16 lg:px-6">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="FAQ"
                                title="Preguntas frecuentes"
                                description="Respuestas por módulo y por objeción. Úsalas cuando la clínica pregunte detalle operativo."
                                centered
                            />
                            <div className="mt-12 space-y-10">
                                {salesFaqGroups.map((group, groupIndex) => (
                                    <div key={group.label}>
                                        <p className="mb-2 text-xs font-semibold tracking-wide text-cyan-700 uppercase">
                                            {group.label}
                                        </p>
                                        <Accordion type="single" collapsible className="w-full">
                                            {group.items.map((item, itemIndex) => {
                                                const value = `sales-faq-${groupIndex}-${itemIndex}`;

                                                return (
                                                    <AccordionItem key={value} value={value}>
                                                        <AccordionTrigger className="text-left text-base font-medium">
                                                            {item.question}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-base leading-relaxed text-gray-600">
                                                            {item.answer}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-gray-100 px-4 py-8 lg:px-6">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>Guía de ventas Vetsap · solo referencia, sin formularios ni acciones.</p>
                        <Link href="/" className={landingNavLinkClassName}>
                            Volver al inicio →
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
    centered = false,
}: {
    eyebrow: string;
    title: string;
    description: string;
    centered?: boolean;
}) {
    return (
        <div className={cn(centered && 'text-center')}>
            <p className="mb-2 text-sm font-semibold tracking-widest text-cyan-700 uppercase">
                {eyebrow}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{title}</h2>
            <p
                className={cn(
                    'mt-3 text-base leading-relaxed text-gray-600 md:text-lg',
                    centered ? 'mx-auto max-w-2xl' : 'max-w-2xl',
                )}
            >
                {description}
            </p>
        </div>
    );
}
