import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type SettingsSwitchFieldProps = {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
};

export function SettingsSwitchField({
    label,
    checked,
    onCheckedChange,
    className,
}: SettingsSwitchFieldProps) {
    const baseId = useId();
    const controlId = `${baseId}-switch`;

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-md border border-transparent py-1',
                className,
            )}
        >
            <Switch
                id={controlId}
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
            <Label htmlFor={controlId} className="text-sm font-normal">
                {label}
            </Label>
        </div>
    );
}
