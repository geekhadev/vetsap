import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { LandingFeatureCopy } from '@/pages/landing/landing-feature-copy';
import { LandingFeaturePanel } from '@/pages/landing/landing-feature-panel';
import { defaultLandingFeatureId, landingFeatures } from '@/pages/landing/landing-features-data';
import { landingOutlineButtonClassName } from '@/pages/landing/landing-theme';

export function LandingFeatures() {
    return (
        <div id="modulos" className="relative mx-auto w-full max-w-7xl overflow-visible px-6 md:px-0">
            <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-12 -top-16 bottom-0 -z-10 overflow-visible"
            >
                <div className="absolute top-1/2 left-[38%] h-[min(44rem,120%)] w-[min(72rem,140%)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(165,243,252,0.55)_0%,rgba(201,235,255,0.28)_42%,transparent_72%)]" />
                <div className="absolute -top-8 -right-16 h-80 w-80 bg-[radial-gradient(circle,rgba(103,232,249,0.45)_0%,transparent_68%)]" />
                <div className="absolute right-[8%] bottom-0 h-64 w-96 bg-[radial-gradient(circle,rgba(207,250,254,0.5)_0%,transparent_70%)]" />
            </div>

            <Tabs defaultValue={defaultLandingFeatureId} className="relative">
                <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10 xl:gap-14">
                    <div className="relative z-10 lg:py-6">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                            Todo lo que necesita tu clínica,{' '}
                            <span className="text-cyan-600">en un solo lugar</span>
                        </h2>

                        <div className="mt-6 min-h-[14rem] sm:min-h-[15rem]">
                            {landingFeatures.map((feature) => (
                                <TabsContent
                                    key={`copy-${feature.id}`}
                                    value={feature.id}
                                    className="mt-0 outline-none data-[state=inactive]:hidden"
                                >
                                    <LandingFeatureCopy feature={feature} />
                                </TabsContent>
                            ))}
                        </div>

                        <Button variant="outline" className={cn('mt-8', landingOutlineButtonClassName)} asChild>
                            <Link href="#precios">
                                Ver planes y precios
                                <ArrowUpRight className="size-4" aria-hidden />
                            </Link>
                        </Button>
                    </div>

                    <div className="relative z-10 flex flex-col gap-5 lg:-mr-6 xl:-mr-10 2xl:-mr-14">
                        <TabsList
                            className={cn(
                                'mx-auto h-auto w-full max-w-full gap-0.5 rounded-full p-1.5',
                                'inline-flex flex-nowrap items-center justify-center overflow-x-auto',
                                'border border-gray-200/90 bg-white/95 shadow-sm ring-1 ring-black/[0.04]',
                                '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                                'sm:w-fit lg:mx-0 lg:ml-auto',
                            )}
                        >
                            {landingFeatures.map((feature) => (
                                <TabsTrigger
                                    key={feature.id}
                                    value={feature.id}
                                    className={cn(
                                        'h-auto flex-none rounded-full border-0 px-3 py-2 text-sm shadow-none transition-all sm:px-4',
                                        'bg-transparent font-normal text-gray-500 hover:text-gray-800',
                                        'focus-visible:ring-cyan-400/40',
                                        'data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-gray-900',
                                        'data-[state=active]:shadow-[0_2px_10px_rgba(15,23,42,0.1)]',
                                        'dark:data-[state=active]:bg-white dark:data-[state=active]:text-gray-900',
                                    )}
                                >
                                    {feature.tabLabel}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div
                            className={cn(
                                'overflow-hidden rounded-[1.35rem]',
                                'border border-cyan-200/50 bg-white/90 ring-1 ring-cyan-100/60',
                                'shadow-[0_28px_60px_-16px_rgba(6,182,212,0.22)] backdrop-blur-sm',
                            )}
                        >
                            {landingFeatures.map((feature) => (
                                <TabsContent
                                    key={`panel-${feature.id}`}
                                    value={feature.id}
                                    className="mt-0 outline-none data-[state=inactive]:hidden"
                                >
                                    <LandingFeaturePanel feature={feature} />
                                </TabsContent>
                            ))}
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
