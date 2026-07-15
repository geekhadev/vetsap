export type FormMultiSelectOption = {
    value: string;
    label: string;
    /** Texto adicional para filtrar; por defecto usa `label`. */
    searchText?: string;
};

export type FormMultiSelectProps = {
    options: FormMultiSelectOption[];
    values: string[];
    onValuesChange: (values: string[]) => void;
    label?: string;
    required?: boolean;
    error?: string;
    /** Texto del trigger cuando no hay valores seleccionados. */
    placeholder?: string;
    /** Placeholder del campo de búsqueda dentro del popover. */
    searchPlaceholder?: string;
    emptyMessage?: string;
    id?: string;
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    triggerClassName?: string;
    popoverContentClassName?: string;
};
