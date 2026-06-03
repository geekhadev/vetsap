import { Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { landingPlans } from '@/pages/landing/landing-pricing-data';
import {
    landingCtaButtonLgClassName,
    landingOutlineButtonClassName,
} from '@/pages/landing/landing-theme';
import type { LandingSectionProps } from '@/pages/landing/types';
import { dashboard, login, register } from '@/routes';

export function LandingPricing({ canRegister }: LandingSectionProps) {
    const { auth } = usePage().props;

    return (
        <div id="precios" className="mx-auto w-full max-w-7xl px-6 md:px-0">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-cyan-500 sm:text-4xl lg:text-5xl">
                    Planes simples, sin sorpresas
                </h2>
                <p className="mt-4 text-balance text-gray-600 md:text-lg">
                    Empieza gratis con tu web y citas en línea. Escala cuando necesites facturación SII y más
                    herramientas para tu equipo.
                </p>
            </div>

            <ul className="mx-auto mt-14 grid max-w-4xl gap-6 pt-2 sm:grid-cols-2 sm:items-end sm:gap-8 lg:gap-10">
                {landingPlans.map((plan) => (
                    <li
                        key={plan.id}
                        className={cn(
                            'flex flex-col rounded-2xl border bg-white shadow-sm',
                            plan.highlighted
                                ? 'border-gray-200/80 p-6 sm:mb-3 sm:p-8 -ml-14 -mb-8 z-10 relative shadow-lg h-[480px]'
                                : 'border-gray-200/80 p-6 sm:mb-3 sm:p-8',
                        )}
                    >
                        {plan.badge ? (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                {plan.badge}
                            </span>
                        ) : null}

                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>

                        <div className="mt-6">
                            <p className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</p>
                            {plan.priceNote ? (
                                <p className="mt-1 text-sm text-gray-500">{plan.priceNote}</p>
                            ) : null}
                        </div>

                        <ul className="mt-6 flex flex-1 flex-col gap-3">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <Check className="mt-0.5 size-4 shrink-0 text-cyan-600" aria-hidden />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8">
                            {auth.user ? (
                                <Button
                                    size="lg"
                                    className={cn(
                                        'w-full',
                                        plan.highlighted
                                            ? landingCtaButtonLgClassName
                                            : landingOutlineButtonClassName,
                                    )}
                                    asChild
                                >
                                    <Link href={dashboard()}>Ir al panel</Link>
                                </Button>
                            ) : canRegister ? (
                                <Button
                                    size="lg"
                                    className={cn(
                                        'w-full',
                                        plan.highlighted || plan.id === 'free'
                                            ? landingCtaButtonLgClassName
                                            : landingOutlineButtonClassName,
                                    )}
                                    asChild
                                >
                                    <Link href={register()}>{plan.ctaLabel}</Link>
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className={cn('w-full', landingCtaButtonLgClassName)}
                                    asChild
                                >
                                    <Link href={login()}>Iniciar sesión</Link>
                                </Button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <p className="mt-8 text-center text-sm text-gray-500">
                Sin tarjeta de crédito para empezar · Sin contrato de permanencia · Precios en pesos chilenos
            </p>
        </div>
    );
}
