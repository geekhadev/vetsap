import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LandingBackground } from '@/pages/landing/landing-background';
import { landingCtaButtonLgClassName, landingOutlineButtonLgClassName } from '@/pages/landing/landing-theme';
import type { LandingSectionProps } from '@/pages/landing/types';
import { dashboard, login, register } from '@/routes';

export function LandingHero({ canRegister }: LandingSectionProps) {
    const { auth } = usePage().props;

    return (
        <LandingBackground>
            <section
                id="producto"
                className="relative flex min-h-[min(100svh,56rem)] items-center pt-20"
            >
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-10 px-6 py-16 lg:grid lg:grid-cols-12 lg:gap-12 lg:py-24 md:px-0">
                    <div className="lg:col-span-6">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-700">
                            Software para clínicas veterinarias
                        </p>
                        <h1 className="mb-4 max-w-xl text-4xl leading-tight font-bold tracking-tight text-balance text-cyan-500 sm:text-3xl lg:text-5xl">
                            Organiza tu vida y nosotros tu clínica.
                        </h1>
                        <p className="mb-6 max-w-xl text-balance font-light text-gray-500 md:text-base lg:mb-8 lg:text-lg">
                            Tu clínica con página web y citas en línea desde el primer día. Sin Excel, sin WhatsApp
                            manual, sin fichas en papel. Todo en un solo lugar.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {auth.user ? (
                                <Button
                                    size="lg"
                                    className={landingCtaButtonLgClassName}
                                    asChild
                                >
                                    <Link href={dashboard()}>Abrir panel</Link>
                                </Button>
                            ) : canRegister ? (
                                <Button
                                    size="lg"
                                    className={landingCtaButtonLgClassName}
                                    asChild
                                >
                                    <Link href={register()}>Crear mi cuenta gratis</Link>
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className={landingCtaButtonLgClassName}
                                    asChild
                                >
                                    <Link href={login()}>Acceder</Link>
                                </Button>
                            )}
                            <Button
                                size="lg"
                                variant="outline"
                                className={landingOutlineButtonLgClassName}
                                asChild
                            >
                                <a href="#modulos">Ver funcionalidades</a>
                            </Button>
                        </div>
                        <p className="mt-6 max-w-xl border-l-4 border-cyan-400 pl-4 text-balance text-sm font-medium text-cyan-800 md:text-base">
                            Sin tarjeta de crédito · Sin contrato · Gratis para empezar
                        </p>
                    </div>

                    <div className="w-full lg:col-span-6">
                        <img
                            src="https://cdn.prod.website-files.com/67e1b055ac6bddee954b52a0/6833bec3da7d8cb8cd94a355_29e249162acea7c708a039a6dbdcc083_Frame%201000001740.webp"
                            alt="Lo que obtienes al registrarte"
                            className="w-full h-auto object-contain"
                            width={500}
                            height={500}
                            loading="lazy" />
                    </div>
                </div>
            </section>
        </LandingBackground>
    );
}
