import { usePage } from '@inertiajs/react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { landingFaqGroups } from '@/pages/landing/landing-faq-data';

function faqItemValue(groupIndex: number, itemIndex: number): string {
    return `faq-${groupIndex}-${itemIndex}`;
}

export function LandingFaq() {
    const { vetsap } = usePage().props;
    const showPricing = vetsap.landing.show_pricing;
    const visibleGroups = landingFaqGroups.filter(
        (group) => showPricing || group.pricingRelated !== true,
    );

    return (
        <div id="faq" className="mx-auto w-full max-w-3xl px-6 md:px-0">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-cyan-500 sm:text-4xl lg:text-5xl">
                    Preguntas frecuentes
                </h2>
                <p className="mt-4 text-balance text-gray-600 md:text-lg">
                    {showPricing
                        ? 'Respuestas claras sobre planes, tu web pública, facturación y tus datos antes de registrarte.'
                        : 'Respuestas claras sobre tu web pública, facturación y tus datos antes de registrarte.'}
                </p>
            </div>

            <div className="mt-12 w-full space-y-10">
                {visibleGroups.map((group, groupIndex) => (
                    <div key={group.label}>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-cyan-700 uppercase">
                            {group.label}
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            {group.items.map((item, itemIndex) => (
                                <AccordionItem
                                    key={faqItemValue(groupIndex, itemIndex)}
                                    value={faqItemValue(groupIndex, itemIndex)}
                                >
                                    <AccordionTrigger className="text-base font-medium">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-base leading-relaxed">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>
        </div>
    );
}
