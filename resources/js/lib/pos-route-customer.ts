/**
 * Cliente en contexto del formulario de clientes (modal en el índice).
 * Lo usa el botón Caja del header cuando la ruta es de clientes.
 */
let customerFormContextId: string | null = null;

export function setCustomerFormPosContext(customerId: string | null): void {
    customerFormContextId = customerId;
}

type PageLike = {
    component: string;
    props: Record<string, unknown>;
};

/**
 * Si la página actual es ficha de paciente o clientes, resuelve el customer_id
 * para abrir el POS ya personalizado.
 */
export function resolvePosCustomerIdFromCurrentPage(
    page: PageLike,
): string | null {
    if (page.component === 'medic/patients/edit') {
        const patient = page.props.patient;

        if (patient && typeof patient === 'object' && 'customer_id' in patient) {
            const id = (patient as { customer_id: unknown }).customer_id;

            return typeof id === 'string' && id.trim() !== '' ? id : null;
        }

        return null;
    }

    if (page.component === 'sale/customers/index') {
        return customerFormContextId;
    }

    return null;
}
