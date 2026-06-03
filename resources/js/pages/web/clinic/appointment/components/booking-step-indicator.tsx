import { cn } from '@/lib/utils';
import {
    CLINIC_BOOKING_STEP_COMPLETE,
    CLINIC_BOOKING_STEP_CURRENT,
    CLINIC_BOOKING_STEP_LABEL_CURRENT,
} from '../clinic-booking-theme';
import type { BookingStep } from '../types';

const steps: { id: BookingStep; label: string }[] = [
    { id: 'service', label: 'Servicio y horario' },
    { id: 'details', label: 'Datos' },
];

type BookingStepIndicatorProps = {
    currentStep: BookingStep;
};

function stepIndex(step: BookingStep): number {
    if (step === 'success') {
        return steps.length;
    }

    if (step === 'details') {
        return 1;
    }

    return 0;
}

export function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
    const currentIndex = stepIndex(currentStep);

    return (
        <ol className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            {steps.map((step, index) => {
                const isComplete = index < currentIndex;
                const isCurrent =
                    (step.id === 'service' && currentStep === 'service') ||
                    (step.id === 'details' && currentStep === 'details');

                return (
                    <li key={step.id} className="flex items-center gap-2 sm:gap-3">
                        <span
                            className={cn(
                                'flex size-7 items-center justify-center rounded-full border text-xs font-semibold sm:size-8',
                                isComplete && CLINIC_BOOKING_STEP_COMPLETE,
                                isCurrent && !isComplete && CLINIC_BOOKING_STEP_CURRENT,
                                !isComplete && !isCurrent && 'border-gray-300 text-gray-400',
                            )}
                        >
                            {index + 1}
                        </span>
                        <span
                            className={cn(
                                'hidden font-medium sm:inline',
                                isCurrent ? CLINIC_BOOKING_STEP_LABEL_CURRENT : 'text-gray-500',
                            )}
                        >
                            {step.label}
                        </span>
                        {index < steps.length - 1 && (
                            <span className="hidden h-px w-6 bg-gray-200 sm:block" aria-hidden />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
