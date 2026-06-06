import type { Matcher } from 'react-day-picker';

type FormDatePickerFieldBaseProps = {
    label?: string;
    /** Muestra " (*)" en el label; debe coincidir con `required` en el disparador cuando el campo sea obligatorio. */
    required?: boolean;
    error?: string;
    placeholder?: string;
    /** Si se omite, se genera con `useId`. */
    id?: string;
    /**
     * Si es `true`, deshabilita días posteriores al día de hoy (comparación por fecha local a medianoche).
     */
    disableFutureDates?: boolean;
    /** Matchers adicionales para pasar al `Calendar` (react-day-picker). */
    disabled?: Matcher | Matcher[];
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    triggerClassName?: string;
    /** Clases extra del contenido del popover (p. ej. `z-[60]` dentro de otro overlay). */
    popoverContentClassName?: string;
    /**
     * Si es `false`, el calendario se renderiza dentro del árbol del diálogo padre.
     * Por defecto `true`: portal en `body` con `z-[100]`, por encima de diálogos (`z-50`).
     */
    portalled?: boolean;
};

/** Modo controlado (p. ej. `useForm` con `value` / `onChange`). */
type FormDatePickerFieldControlledProps = FormDatePickerFieldBaseProps & {
    /** Valor en formato `yyyy-MM-dd` (vacío = sin fecha). */
    value: string;
    onChange: (value: string) => void;
    name?: never;
    defaultValue?: never;
};

/**
 * Modo formulario HTML (p. ej. `InertiaFormDialog`): estado interno + `<input type="hidden">`.
 * Mismo patrón que `FormBooleanSwitch`.
 */
type FormDatePickerFieldNamedProps = FormDatePickerFieldBaseProps & {
    /** Nombre del campo enviado al backend (`yyyy-MM-dd` o vacío). */
    name: string;
    /** Valor inicial al montar el componente. */
    defaultValue?: string;
    value?: never;
    onChange?: never;
};

export type FormDatePickerFieldProps =
    | FormDatePickerFieldControlledProps
    | FormDatePickerFieldNamedProps;
