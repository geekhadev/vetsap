import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="bottom-right"
            richColors
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--border-radius': 'var(--radius)',
                    '--success-bg': 'var(--toast-success-bg)',
                    '--success-border': 'var(--toast-success-border)',
                    '--success-text': 'var(--toast-success-text)',
                    '--error-bg': 'var(--toast-error-bg)',
                    '--error-border': 'var(--toast-error-border)',
                    '--error-text': 'var(--toast-error-text)',
                    '--warning-bg': 'var(--toast-warning-bg)',
                    '--warning-border': 'var(--toast-warning-border)',
                    '--warning-text': 'var(--toast-warning-text)',
                    '--info-bg': 'var(--toast-info-bg)',
                    '--info-border': 'var(--toast-info-border)',
                    '--info-text': 'var(--toast-info-text)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
