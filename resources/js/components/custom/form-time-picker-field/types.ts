export type FormTimePickerFieldProps = {
    /** Valor en formato `HH:mm` (24 h). */
    value: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
    id?: string;
    /** Intervalo de minutos en el selector (por defecto 15). */
    minuteStep?: number;
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    triggerClassName?: string;
    popoverContentClassName?: string;
    /** Lado del popover respecto al botón (por defecto `top` para evitar solapar contenido inferior). */
    popoverSide?: 'top' | 'bottom' | 'left' | 'right';
};
