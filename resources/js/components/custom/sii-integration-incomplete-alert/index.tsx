import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export type SiiIntegrationIncompleteAlertProps = {
    className?: string;
};

export function SiiIntegrationIncompleteAlert({
    className,
}: SiiIntegrationIncompleteAlertProps) {
    return (
        <Alert
            variant="destructive"
            className={cn(
                'border-red-600/50 [&>svg]:text-current',
                className,
            )}
        >
            <AlertTriangle className="size-5 shrink-0" />
            <AlertTitle>Integración SII incompleta</AlertTitle>
            <AlertDescription>
                Completa la configuración de integración SII de la empresa
                seleccionada antes de continuar.
            </AlertDescription>
        </Alert>
    );
}
