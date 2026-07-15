/** Chips de selección (servicio, día, mascota, horario) — esquinas suaves, no pill. */
export const CLINIC_BOOKING_SELECTION_ROUNDED = 'rounded-lg';

/** Primary CTA (Continuar, Confirmar). */
export const CLINIC_BOOKING_ACTION_BUTTON =
    'h-12 min-w-[9rem] rounded-full px-7 text-base font-semibold bg-cyan-600 text-white shadow-sm hover:bg-cyan-700';

export const CLINIC_BOOKING_BACK_BUTTON =
    'h-12 rounded-full px-5 text-base text-cyan-800 hover:bg-cyan-50 hover:text-cyan-900';

export const CLINIC_BOOKING_OUTLINE_BUTTON =
    'h-12 shrink-0 rounded-full border-cyan-200 bg-white px-6 text-base font-semibold text-cyan-900 shadow-xs hover:border-cyan-500 hover:bg-cyan-50';

/** Google Calendar CTA — white surface, brand mark. */
export const CLINIC_BOOKING_GOOGLE_CALENDAR_BUTTON =
    'inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-[#DADCE0] bg-white px-2.5 text-sm font-semibold text-[#3C4043] shadow-xs transition-colors hover:bg-[#F8F9FA] hover:border-[#BDC1C6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]/40';

/** Apple Calendar CTA — light surface for the iOS calendar mark. */
export const CLINIC_BOOKING_APPLE_CALENDAR_BUTTON =
    'inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-2.5 text-sm font-semibold text-[#1C1C1E] shadow-xs transition-colors hover:bg-[#F5F5F7] hover:border-[#AEAEB2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B30]/40';

/** Hero / external link CTA on the clinic landing. */
export const CLINIC_HERO_CTA_BUTTON =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-cyan-100 bg-cyan-100 px-7 text-base font-semibold text-cyan-900 shadow-xs transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-200';

/** Selection and action styles aligned with the public clinic web (cyan palette). */

export const CLINIC_BOOKING_SELECTED_FILLED =
    'border-cyan-600 bg-cyan-600 text-white shadow-sm';

export const CLINIC_BOOKING_SELECTED_FILLED_MUTED = 'text-white/85';

export const CLINIC_BOOKING_SELECTED_RING = 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-200';

export const CLINIC_BOOKING_UNSELECTED = 'border-gray-200 bg-white';

export const CLINIC_BOOKING_HOVER = 'hover:border-cyan-500 hover:bg-cyan-50';

export const CLINIC_BOOKING_HIGHLIGHT_SURFACE = 'border-cyan-200 bg-cyan-50/60';

export const CLINIC_BOOKING_ACCENT_ICON = 'text-cyan-600';

export const CLINIC_BOOKING_SELECTED_ACCENT_ICON = 'text-cyan-700';

export const CLINIC_BOOKING_STEP_COMPLETE = 'border-cyan-600 bg-cyan-600 text-white';

export const CLINIC_BOOKING_STEP_CURRENT = 'border-cyan-600 text-cyan-700';

export const CLINIC_BOOKING_STEP_LABEL_CURRENT = 'text-cyan-700';

export const CLINIC_BOOKING_INPUT = 'h-11 text-base md:text-base';

export const CLINIC_BOOKING_SELECT_TRIGGER =
    'h-11! min-h-11 w-full bg-transparent py-0 text-base md:text-base data-[size=default]:h-11! data-[size=sm]:h-11! dark:bg-transparent dark:hover:bg-transparent';

/** Scrollable horizontal slider (touch, drag, trackpad). */
export const CLINIC_BOOKING_SLIDER_SCROLL =
    'flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const CLINIC_BOOKING_SLIDER_ITEM_SERVICE =
    'snap-start shrink-0 w-[calc((100%-0.5rem)/2)] md:w-[calc((100%-1rem)/3)]';

export const CLINIC_BOOKING_SLIDER_ITEM_DAY =
    'snap-start shrink-0 w-[calc((100%-1rem)/3)] md:w-[calc((100%-2rem)/5)]';

export const CLINIC_BOOKING_SLIDER_ITEM_SCHEDULE =
    'snap-start shrink-0 w-[calc((100%-0.5rem)/2)] md:w-[calc((100%-1rem)/3)]';
