import type { FormSelectOption } from '@/components/custom/form-select';

// ---------------------------------------------------------------------------
// Paginación y query de listados
// ---------------------------------------------------------------------------

/** Default cuando no viene `per_page` en la query; alinear con `InteractsWithPaginatedListQuery` (PHP). */
export const TABLEDATA_DEFAULT_PER_PAGE = 20;

const TABLEDATA_PER_PAGE_VALUES = [20, 50, 100] as const;

export type TabledataPerPageOption = (typeof TABLEDATA_PER_PAGE_VALUES)[number];

/**
 * Valores permitidos en el selector de `per_page` (alinear con el pie de tabla).
 */
export function isTabledataPerPageOption(n: number): n is TabledataPerPageOption {
    return (TABLEDATA_PER_PAGE_VALUES as readonly number[]).includes(n);
}

/**
 * Opciones estándar de `per_page` para listados con {@link TabledataPaginationFooter}.
 */
export const TABLEDATA_PER_PAGE_OPTIONS: FormSelectOption[] =
    TABLEDATA_PER_PAGE_VALUES.map((n) => ({
        id: String(n),
        label: String(n),
    }));

/**
 * Props Inertia (`only`) típicas en índices con colección paginada `data` y `filters`.
 */
export const TABLEDATA_LIST_INERTIA_ONLY = ['data', 'filters'] as const;

// ---------------------------------------------------------------------------
// TabledataListShell — layout
// ---------------------------------------------------------------------------

export const TABLEDATA_LIST_SHELL_ROOT_CLASS = 'space-y-3 px-4 py-3';

export const TABLEDATA_LIST_SHELL_HEADER_ROW_CLASS =
    'flex flex-row items-center gap-2 sm:gap-3 lg:justify-between';

export const TABLEDATA_LIST_SHELL_TOOLBAR_OUTER_CLASS =
    'flex min-w-0 flex-1 items-center gap-2';

export const TABLEDATA_LIST_SHELL_TOOLBAR_INNER_CLASS =
    'flex shrink-0 items-center justify-end gap-2 max-sm:[&_button]:size-9 max-sm:[&_button]:shrink-0 max-sm:[&_button]:gap-0 max-sm:[&_button]:p-0 max-sm:[&_button]:has-[>svg]:px-0 max-sm:[&_button]:justify-center max-sm:[&_button]:text-[0px] max-sm:[&_button]:leading-none max-sm:[&_button_svg]:m-0 max-sm:[&_button_svg]:size-4 max-sm:[&_button_svg]:shrink-0';

export const TABLEDATA_LIST_SHELL_SEARCH_WRAPPER_CLASS =
    'min-w-0 flex-1 sm:max-w-48';

/** Botón de acciones del toolbar (Columnas / Filtros): solo icono en móvil. */
export const TABLEDATA_LIST_SHELL_ICON_BUTTON_CLASS =
    'size-9 shrink-0 gap-0 px-0 sm:h-9 sm:w-auto sm:gap-1.5 sm:px-4';

export const TABLEDATA_LIST_SHELL_ICON_BUTTON_LABEL_CLASS =
    'hidden sm:inline';

export const TABLEDATA_LIST_SHELL_TABLE_BLOCK_CLASS = 'flex flex-col gap-4';

export const TABLEDATA_LIST_SHELL_SCROLL_CONTAINER_CLASS =
    'h-[calc(100vh-215px)] overflow-auto rounded-xl border border-border bg-card';

export const TABLEDATA_CELL_PADDING_X_CLASS = 'px-4';

export const TABLEDATA_CELL_PADDING_X_COMPACT_CLASS = 'px-3';

// ---------------------------------------------------------------------------
// TabledataSearch
// ---------------------------------------------------------------------------

export const TABLEDATA_SEARCH_DEFAULT_PLACEHOLDER = 'Buscar…';

export const TABLEDATA_SEARCH_INPUT_ID = 'tabledata-search';

// ---------------------------------------------------------------------------
// Tabla vacía y visibilidad de columnas
// ---------------------------------------------------------------------------

export const TABLEDATA_EMPTY_MESSAGE_DEFAULT = 'No hay resultados.';

export const TABLEDATA_COLUMN_VISIBILITY_TRIGGER_LABEL = 'Columnas';

export const TABLEDATA_COLUMN_VISIBILITY_MENU_TITLE = 'Columnas visibles';

// ---------------------------------------------------------------------------
// localStorage — columnas ocultas
// ---------------------------------------------------------------------------

export const TABLEDATA_HIDDEN_COLUMNS_STORAGE_PREFIX = 'tabledata:hidden-columns:';

export const TABLEDATA_PER_PAGE_STORAGE_PREFIX = 'tabledata:per-page:';

// ---------------------------------------------------------------------------
// Pie de paginación
// ---------------------------------------------------------------------------

export const TABLEDATA_PER_PAGE_SELECT_ID = 'tabledata-per-page';

export const TABLEDATA_PAGINATION_SUMMARY_EMPTY =
    'No hay resultados que mostrar';

export const TABLEDATA_PAGINATION_FOOTER_LAYOUT_CLASS =
    'flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4';

export const TABLEDATA_PAGINATION_FOOTER_INNER_CLASS =
    'flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-6 items-center';

export const TABLEDATA_PAGINATION_FOOTER_PER_PAGE_WRAP_CLASS =
    'hidden w-full max-w-20 shrink-0 items-center sm:flex sm:w-40';
