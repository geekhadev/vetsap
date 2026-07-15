export type FormFileDropzoneProps = {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    accept?: string;
    emptyLabel?: string;
    changeLabel?: string;
    viewLabel?: string;
    /** Nombre del archivo ya cargado (si existe). */
    fileName?: string | null;
    /** URL del archivo cargado (para “Ver”). */
    fileUrl?: string | null;
    /** URL opcional para previsualizar imágenes. */
    previewUrl?: string | null;
    disabled?: boolean;
    processing?: boolean;
    /** Permite abrir el selector o reutilizar “Cambiar”. */
    canChange?: boolean;
    /** Muestra el icono de papelera sobre el preview. */
    canRemove?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    onFileSelect?: (file: File, input: HTMLInputElement) => void;
    onRemove?: () => void;
};
