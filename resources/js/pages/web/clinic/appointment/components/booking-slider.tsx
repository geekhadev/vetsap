import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState  } from 'react';
import type {ReactNode} from 'react';
import { cn } from '@/lib/utils';
import { CLINIC_BOOKING_SLIDER_SCROLL } from '../clinic-booking-theme';

const DRAG_CLICK_THRESHOLD_PX = 6;

type BookingSliderProps = {
    label: string;
    itemCount: number;
    activeItemKey?: string | null;
    className?: string;
    trackClassName?: string;
    children: ReactNode;
};

export function BookingSlider({
    label,
    itemCount,
    activeItemKey,
    className,
    trackClassName,
    children,
}: BookingSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragState = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0, pointerId: -1 });
    const [canScrollBack, setCanScrollBack] = useState(false);
    const [canScrollForward, setCanScrollForward] = useState(false);

    const updateScrollButtons = useCallback(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        setCanScrollBack(track.scrollLeft > 4);
        setCanScrollForward(track.scrollLeft < maxScrollLeft - 4);
    }, []);

    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return undefined;
        }

        updateScrollButtons();
        track.addEventListener('scroll', updateScrollButtons, { passive: true });

        const resizeObserver = new ResizeObserver(updateScrollButtons);
        resizeObserver.observe(track);

        return () => {
            track.removeEventListener('scroll', updateScrollButtons);
            resizeObserver.disconnect();
        };
    }, [itemCount, updateScrollButtons]);

    useEffect(() => {
        if (!activeItemKey || !trackRef.current) {
            return;
        }

        const selected = trackRef.current.querySelector<HTMLElement>(`[data-slider-item="${activeItemKey}"]`);

        selected?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }, [activeItemKey]);

    const scrollByPage = (direction: -1 | 1) => {
        const track = trackRef.current;
        const firstItem = track?.firstElementChild as HTMLElement | null;

        if (!track || !firstItem) {
            return;
        }

        const gap = 8;
        const step = firstItem.offsetWidth + gap;

        track.scrollBy({ left: direction * step, behavior: 'smooth' });
    };

    const isInteractiveSliderTarget = (target: EventTarget | null): boolean => {
        if (!(target instanceof HTMLElement)) {
            return false;
        }

        return Boolean(target.closest('button, a, [role="button"], input, select, textarea, label'));
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || isInteractiveSliderTarget(event.target)) {
            return;
        }

        const track = trackRef.current;

        if (!track) {
            return;
        }

        dragState.current = {
            active: true,
            moved: false,
            startX: event.clientX,
            scrollLeft: track.scrollLeft,
            pointerId: event.pointerId,
        };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const track = trackRef.current;
        const drag = dragState.current;

        if (!track || !drag.active || event.pointerId !== drag.pointerId) {
            return;
        }

        const deltaX = event.clientX - drag.startX;

        if (Math.abs(deltaX) <= DRAG_CLICK_THRESHOLD_PX) {
            return;
        }

        if (!drag.moved) {
            drag.moved = true;
            track.setPointerCapture(event.pointerId);
        }

        track.scrollLeft = drag.scrollLeft - deltaX;
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        const track = trackRef.current;
        const drag = dragState.current;

        if (!track || !drag.active || event.pointerId !== drag.pointerId) {
            return;
        }

        drag.active = false;

        if (track.hasPointerCapture(event.pointerId)) {
            track.releasePointerCapture(event.pointerId);
        }

        updateScrollButtons();
    };

    const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!dragState.current.moved) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        dragState.current.moved = false;
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                {itemCount > 0 && (
                    <div className="flex gap-1">
                        <button
                            type="button"
                            disabled={!canScrollBack}
                            onClick={() => scrollByPage(-1)}
                            className="inline-flex size-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                            aria-label={`Ver ${label.toLowerCase()} anteriores`}
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            disabled={!canScrollForward}
                            onClick={() => scrollByPage(1)}
                            className="inline-flex size-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                            aria-label={`Ver ${label.toLowerCase()} siguientes`}
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={trackRef}
                className={cn(CLINIC_BOOKING_SLIDER_SCROLL, 'cursor-grab active:cursor-grabbing', trackClassName)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClickCapture={handleClickCapture}
            >
                {children}
            </div>
        </div>
    );
}
