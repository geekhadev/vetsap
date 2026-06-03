export type FormComboboxOption = {
    value: string;
    label: string;
    /** Texto adicional para filtrar; por defecto usa `label`. */
    searchText?: string;
};

export type FormComboboxProps = {
    options: FormComboboxOption[];
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
    required?: boolean;
    error?: string;
    /** Texto del trigger cuando no hay valor seleccionado. */
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
