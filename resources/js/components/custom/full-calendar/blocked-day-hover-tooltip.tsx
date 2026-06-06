import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BLOCKED_DAY_REASON_ATTRIBUTE } from './blocked-days';

type BlockedDayHoverTooltipProps = {
    containerRef: React.RefObject<HTMLElement | null>;
};

type TooltipState = {
    message: string;
    x: number;
    y: number;
};

export function BlockedDayHoverTooltip({ containerRef }: BlockedDayHoverTooltipProps) {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return undefined;
        }

        const updateTooltip = (target: EventTarget | null, x: number, y: number) => {
            if (!(target instanceof Element)) {
                setTooltip(null);

                return;
            }

            const marked = target.closest(`[${BLOCKED_DAY_REASON_ATTRIBUTE}]`);

            if (!marked) {
                setTooltip(null);

                return;
            }

            const message = marked.getAttribute(BLOCKED_DAY_REASON_ATTRIBUTE);

            if (!message) {
                setTooltip(null);

                return;
            }

            setTooltip({ message, x, y });
        };

        const handleMouseMove = (event: MouseEvent) => {
            updateTooltip(event.target, event.clientX, event.clientY);
        };

        const handleMouseLeave = () => {
            setTooltip(null);
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [containerRef]);

    if (!tooltip) {
        return null;
    }

    return createPortal(
        <div
            role="tooltip"
            className="pointer-events-none fixed z-[100] max-w-xs rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md"
            style={{
                left: tooltip.x + 12,
                top: tooltip.y + 12,
            }}
        >
            {tooltip.message}
        </div>,
        document.body,
    );
}
