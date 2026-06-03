import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { landingCtaButtonLgClassName } from '@/pages/landing/landing-theme';
import type { LandingSectionProps } from '@/pages/landing/types';
import { dashboard, login, register } from '@/routes';

export function LandingCta({ canRegister }: LandingSectionProps) {
    const { auth } = usePage().props;

    return (
        <div className="mx-auto w-full max-w-7xl px-6 md:px-0">
            <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-cyan-200/80 bg-white p-8 shadow-lg sm:flex-row sm:items-center sm:p-10 lg:p-12">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-cyan-500 sm:text-3xl lg:text-4xl">
                        Tu clínica puede funcionar mejor desde mañana.
                    </h2>
                    <p className="mt-3 max-w-xl text-balance text-gray-600 md:text-lg">
                        Configúralo hoy. Tu página web con sistema de citas queda lista en minutos.
                    </p>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
                    {auth.user ? (
                        <Button
                            size="lg"
                            className={cn('w-full sm:w-auto', landingCtaButtonLgClassName)}
                            asChild
                        >
                            <Link href={dashboard()}>Ir al panel</Link>
                        </Button>
                    ) : canRegister ? (
                        <Button
                            size="lg"
                            className={cn('w-full sm:w-auto', landingCtaButtonLgClassName)}
                            asChild
                        >
                            <Link href={register()}>Registrarse</Link>
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className={cn('w-full sm:w-auto', landingCtaButtonLgClassName)}
                            asChild
                        >
                            <Link href={login()}>Iniciar sesión</Link>
                        </Button>
                    )}
                    <p className="text-center text-xs text-gray-500 sm:text-left">
                        Sin tarjeta de crédito. Sin contrato.
                    </p>
                </div>
            </div>
        </div>
    );
}
