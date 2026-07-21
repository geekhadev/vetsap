export type ProductAutocompleteOption = {
    id: string;
    name: string;
    barcode: string | null;
    price: string;
    stock: number;
    tax_treatment: 'taxable' | 'exempt';
};

export type ProductAutocompleteSelected = {
    id: string;
    name: string;
    barcode: string | null;
};

export type ProductAutocompleteProps = {
    value: string;
    selected: ProductAutocompleteSelected | null;
    onSelect: (product: ProductAutocompleteOption) => void;
    onClear: () => void;
    excludeIds?: string[];
    name?: string;
    label?: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    id?: string;
    containerClassName?: string;
    /** URL del endpoint JSON de búsqueda (Wayfinder). */
    searchUrl: string;
    minChars?: number;
    debounceMs?: number;
};
