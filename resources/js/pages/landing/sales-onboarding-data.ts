export type SalesModule = {
    id: string;
    name: string;
    plan: 'Free' | 'PRO' | 'Ambos';
    pitch: string;
    bullets: readonly string[];
};

export type SetupStep = {
    step: number;
    title: string;
    where: string;
    why: string;
    tips: readonly string[];
    plan: 'Free' | 'PRO';
};

export type SalesFaqItem = {
    question: string;
    answer: string;
};

export type SalesFaqGroup = {
    label: string;
    items: readonly SalesFaqItem[];
};

export const salesNavLinks = [
    { title: 'Producto', href: '#producto' },
    { title: 'Planes', href: '#planes' },
    { title: 'Módulos', href: '#modulos' },
    { title: 'Protocolo', href: '#protocolo' },
    { title: 'Pitch', href: '#pitch' },
    { title: 'FAQ', href: '#faq' },
] as const;

export const productHighlights = [
    {
        title: 'Para quién es',
        body: 'Clínicas veterinarias en Chile que quieren web pública, citas en línea y operación diaria (agenda, pacientes, ventas e inventario) en un solo sistema.',
    },
    {
        title: 'Promesa central',
        body: '“Organiza tu vida y nosotros tu clínica.” Menos WhatsApp y Excel; más citas ordenadas, historial clínico y boletas SII cuando lo necesiten.',
    },
    {
        title: 'Cómo llega el cliente',
        body: 'Se registra gratis. En minutos tiene empresa, sucursal, datos demo y una URL pública vetsap.app/clinica/su-nombre lista para recibir citas.',
    },
] as const;

export const planCompare = [
    {
        name: 'Free',
        price: '$0 CLP / mes',
        when: 'Cuando solo quieren presencia online y agenda.',
        includes: [
            'Página web de la clínica',
            'Citas en línea para dueños de mascotas',
            'Agenda y pacientes en el panel',
            '1 sucursal',
        ],
    },
    {
        name: 'PRO',
        price: '$49.990 CLP / mes',
        when: 'Cuando ya operan la clínica completa o facturan al SII.',
        includes: [
            'Todo lo del Free',
            'Boletas electrónicas SII',
            'Inventario y movimientos de stock',
            'Múltiples usuarios y roles',
            'Soporte prioritario',
        ],
    },
] as const;

export const salesModules: readonly SalesModule[] = [
    {
        id: 'web',
        name: 'Web pública',
        plan: 'Free',
        pitch: 'La clínica aparece en internet con URL propia, servicios y formulario de reserva.',
        bullets: [
            'URL: vetsap.app/clinica/{slug}',
            'Logo, colores, galería, WhatsApp y textos editables',
            'Editable en vivo cuando el dueño está logueado',
        ],
    },
    {
        id: 'agenda',
        name: 'Agenda',
        plan: 'Free',
        pitch: 'Calendario de citas, estados y feriados para organizar el día a día.',
        bullets: [
            'Calendario con crear, reprogramar y cambiar estado',
            'Estados configurables (pendiente, confirmado, en consulta…)',
            'Días feriados / no laborales',
            'Desde la cita se puede iniciar la atención clínica',
        ],
    },
    {
        id: 'medicina',
        name: 'Medicina',
        plan: 'Ambos',
        pitch: 'Pacientes, doctores, servicios, atenciones, fichas, vacunación y plantillas.',
        bullets: [
            'Pacientes (especie, foto, historial, plan de vacunas)',
            'Doctores con horarios y servicios que ofrecen',
            'Atenciones clínicas con PDF / WhatsApp',
            'Fichas médicas configurables y planes de vacunación',
            'Catálogos: especies, especialidades, plantillas',
        ],
    },
    {
        id: 'ventas',
        name: 'Ventas y POS',
        plan: 'PRO',
        pitch: 'Cobrar servicios y productos, caja, clientes y boletas SII.',
        bullets: [
            'POS: productos, servicios, descuentos y cobro',
            'Documentos de venta y pagos recibidos',
            'Apertura / cierre de caja',
            'Clientes (CRM) con mascotas y portal opcional',
            'CAF y certificación de boletas SII (Chile)',
        ],
    },
    {
        id: 'almacen',
        name: 'Almacén',
        plan: 'PRO',
        pitch: 'Catálogo de productos y control de inventario.',
        bullets: [
            'Productos (con búsqueda por código de barras)',
            'Movimientos de inventario (entrada / salida)',
            'Categorías de productos y de movimientos',
        ],
    },
    {
        id: 'compras',
        name: 'Compras',
        plan: 'PRO',
        pitch: 'Proveedores, órdenes de compra y gastos operativos.',
        bullets: [
            'Órdenes de compra y estados',
            'Proveedores',
            'Gastos y tipos de gasto',
            'Nota: documentos de compra / cuentas por cobrar aún no están activos — no venderlos como listos',
        ],
    },
    {
        id: 'config',
        name: 'Configuración',
        plan: 'Ambos',
        pitch: 'Empresa, sucursales, sitio web, calendario, integraciones, roles y usuarios.',
        bullets: [
            'Datos de empresa (RUT, slug, SII)',
            'Sucursales',
            'Horarios de reserva y bloques',
            'Integraciones: certificado SII, Google Calendar, Gmail',
            'Roles y permisos por usuario',
        ],
    },
    {
        id: 'portal',
        name: 'Portal del cliente',
        plan: 'Ambos',
        pitch: 'El dueño de la mascota ve sus mascotas y documentos de venta.',
        bullets: [
            'Mis mascotas + atenciones',
            'Mis documentos',
            'Solicitud de citas desde la web pública',
        ],
    },
] as const;

export const setupProtocol: readonly SetupStep[] = [
    {
        step: 1,
        title: 'Crear cuenta y empresa',
        where: 'Registro público',
        why: 'Genera el dueño, la empresa, la sucursal principal y datos demo (servicios, doctor, productos) para probar de inmediato.',
        tips: [
            'Pedir RUT y nombre de la clínica correctos: definen identidad fiscal y slug de la web.',
            'Después del registro ya pueden entrar al panel ERP.',
        ],
        plan: 'Free',
    },
    {
        step: 2,
        title: 'Revisar sucursal principal',
        where: 'Configuración → Sucursales',
        why: 'Toda la operación (agenda, stock, caja) cuelga de una sucursal. Confirmar nombre, dirección y datos de contacto.',
        tips: [
            'En Free hay 1 sucursal; en PRO se pueden agregar más.',
            'Si la clínica tiene varias sedes, este es el momento de mapearlas.',
        ],
        plan: 'Free',
    },
    {
        step: 3,
        title: 'Personalizar el sitio web',
        where: 'Configuración → Sitio web',
        why: 'Es la cara pública y el canal de captación de citas. Sin esto, el Free pierde su gancho principal.',
        tips: [
            'Logo, colores, textos, galería y WhatsApp.',
            'Confirmar el slug: vetsap.app/clinica/su-nombre.',
            'Mostrar la página al prospecto en el celular: impacta más.',
        ],
        plan: 'Free',
    },
    {
        step: 4,
        title: 'Configurar calendario de reservas',
        where: 'Configuración → Calendario',
        why: 'Define horarios, tamaño de bloques y qué se puede reservar online. Evita citas imposibles.',
        tips: [
            'Horario de atención realista.',
            'Activar / desactivar reserva web según estén listos.',
        ],
        plan: 'Free',
    },
    {
        step: 5,
        title: 'Catálogos médicos base',
        where: 'Medicina → Especies, Especialidades, Servicios',
        why: 'Sin especies y servicios no hay pacientes ni citas con sentido. Los servicios son lo que el cliente reserva y lo que se cobra.',
        tips: [
            'Marcar qué servicios son visibles en la web.',
            'Duración y precio claros desde el inicio.',
            'El registro ya deja demos: editarlos es más rápido que partir de cero.',
        ],
        plan: 'Free',
    },
    {
        step: 6,
        title: 'Doctores y horarios',
        where: 'Medicina → Doctores',
        why: 'Cada veterinario tiene agenda y servicios. La disponibilidad online depende de esto.',
        tips: [
            'Asociar servicios que realmente ofrece cada doctor.',
            'Cargar horarios por día para que la reserva web respete la disponibilidad.',
        ],
        plan: 'Free',
    },
    {
        step: 7,
        title: 'Estados de cita y feriados',
        where: 'Agenda → Estados / Días feriados',
        why: 'Estandariza el flujo del día (pendiente → confirmado → en consulta) y bloquea días no laborales.',
        tips: [
            'Hay estados semilla al crear la cuenta; ajustar nombres al lenguaje de la clínica.',
            'Cargar feriados chilenos o vacaciones de la clínica.',
        ],
        plan: 'Free',
    },
    {
        step: 8,
        title: 'Clientes y pacientes reales',
        where: 'Ventas → Clientes / Medicina → Pacientes',
        why: 'El historial clínico y las ventas viven sobre clientes y mascotas. También llegan solos desde la web pública.',
        tips: [
            'Pueden partir con citas web y completar fichas después.',
            'Un cliente puede tener varias mascotas.',
        ],
        plan: 'Free',
    },
    {
        step: 9,
        title: 'Fichas médicas y plantillas',
        where: 'Medicina → Fichas / Plantillas y formatos',
        why: 'Define qué campos llena el veterinario en cada atención y documentos (certificados, etc.).',
        tips: [
            'Partir de la ficha demo y agregar solo lo que usan de verdad.',
            'Plantillas aceleran certificados y formatos repetidos.',
        ],
        plan: 'PRO',
    },
    {
        step: 10,
        title: 'Planes de vacunación',
        where: 'Medicina → Planes de vacunación',
        why: 'Protocolos de dosis y seguimiento por paciente. Diferencia a clínicas que hacen medicina preventiva seria.',
        tips: [
            'Crear el protocolo una vez y asignarlo a pacientes.',
            'Útil como argumento PRO frente a Excel o papel.',
        ],
        plan: 'PRO',
    },
    {
        step: 11,
        title: 'Inventario inicial',
        where: 'Almacén → Categorías → Productos → Movimientos',
        why: 'Sin productos y stock inicial el POS no puede vender inventario ni descontar stock.',
        tips: [
            'Orden: categorías → productos → movimiento de entrada inicial.',
            'Códigos de barras ayudan en el mostrador.',
        ],
        plan: 'PRO',
    },
    {
        step: 12,
        title: 'Ventas, caja y SII',
        where: 'Ventas → POS / Caja / CAF / Integraciones',
        why: 'Cierra el ciclo comercial: cobrar, registrar caja y emitir boleta electrónica en Chile.',
        tips: [
            'Abrir caja antes de vender.',
            'Configurar certificado SII e integrar CAF antes de emitir boletas reales.',
            'Probar primero en ambiente de certificación si aplica.',
        ],
        plan: 'PRO',
    },
    {
        step: 13,
        title: 'Compras y proveedores',
        where: 'Compras',
        why: 'Ordena reposición y gastos. Completa el ciclo de inventario.',
        tips: [
            'Alta de proveedores y tipos de gasto primero.',
            'No prometer documentos de compra / cuentas por cobrar: aún no están activos.',
        ],
        plan: 'PRO',
    },
    {
        step: 14,
        title: 'Usuarios, roles e integraciones',
        where: 'Configuración → Roles / Usuarios / Integraciones',
        why: 'El dueño no debe ser el único en el sistema. Permisos por rol protegen datos clínicos y caja.',
        tips: [
            'Crear roles (recepción, veterinario, caja) antes de invitar gente.',
            'Google Calendar / Gmail si la clínica ya vive en Google.',
        ],
        plan: 'PRO',
    },
] as const;

export const pitchScripts = [
    {
        title: 'Apertura (30 segundos)',
        body: 'Vetsap es el sistema para clínicas veterinarias en Chile: te damos la página web, las citas en línea y el panel para agenda, pacientes y ventas. El plan Free es gratis para siempre en lo básico; el PRO suma boletas SII, inventario y varios usuarios.',
    },
    {
        title: 'Demo mínima que conviene mostrar',
        body: '1) Abrir su web pública en el celular. 2) Reservar una cita como si fueras el dueño de la mascota. 3) Mostrar esa cita en el calendario del panel. Con eso entienden el valor del Free en menos de 5 minutos.',
    },
    {
        title: 'Cuándo empujar PRO',
        body: 'Cuando digan “necesito historial clínico”, “quiero boleta electrónica”, “tengo recepcionista y veterinarios” o “no sé cuánto stock tengo”. Ahí Free se queda corto.',
    },
    {
        title: 'Objeción: “Ya uso WhatsApp / Excel”',
        body: 'WhatsApp no guarda historial ni stock. Excel no recibe citas solos ni emite boletas. Vetsap concentra eso y la web pública sin pagar diseñador ni hosting.',
    },
    {
        title: 'Objeción: “Es caro”',
        body: 'Pueden partir en $0. El PRO ($49.990) reemplaza varias herramientas (web, agenda, POS, boletas). Sin permanencia: cancelan y bajan a Free sin perder datos.',
    },
    {
        title: 'Cierre',
        body: '“Creemos la cuenta ahora (gratis, sin tarjeta). En 10 minutos tienes tu link público. Si después necesitas boletas o inventario, activamos PRO.” WhatsApp comercial: +56 9 3726 3654.',
    },
] as const;

export const salesFaqGroups: readonly SalesFaqGroup[] = [
    {
        label: 'Producto y mercado',
        items: [
            {
                question: '¿Qué es Vetsap en una frase?',
                answer:
                    'Software SaaS para clínicas veterinarias en Chile: web pública, citas en línea y ERP (agenda, medicina, ventas, inventario y boletas SII).',
            },
            {
                question: '¿A quién le vendemos?',
                answer:
                    'Dueños y administradores de clínicas veterinarias en Chile. También veterinarios independientes que quieren ordenar agenda y presencia online. No es un marketplace de mascotas ni una app solo para dueños de perros.',
            },
            {
                question: '¿El dueño de la mascota también usa Vetsap?',
                answer:
                    'Sí, pero distinto: reserva en la web pública y, si le crean usuario, entra al Portal del cliente (mascotas y documentos). El panel “ERP - Veterinario” es para el staff de la clínica.',
            },
            {
                question: '¿Funciona en celular?',
                answer:
                    'Sí. Web pública, reserva y panel se usan desde el navegador. No hay app de tienda que instalar.',
            },
            {
                question: '¿Necesitan hosting o diseñador?',
                answer:
                    'No. La web vive en vetsap.app/clinica/{slug}. Sin hosting aparte ni agencia.',
            },
        ],
    },
    {
        label: 'Planes y precios',
        items: [
            {
                question: '¿El Free es realmente gratis?',
                answer:
                    'Sí, para siempre en funciones base (web, citas, agenda/pacientes, 1 sucursal). No pedimos tarjeta al registrarse.',
            },
            {
                question: '¿Cuánto cuesta el PRO?',
                answer:
                    '$49.990 CLP al mes, facturación mensual, sin permanencia. Incluye Free + boletas SII, inventario, múltiples usuarios y soporte prioritario.',
            },
            {
                question: '¿Pueden cancelar el PRO?',
                answer:
                    'Sí, cuando quieran. Bajan a Free y mantienen su información. Si eliminan la cuenta, se puede entregar un exportable de datos.',
            },
            {
                question: '¿Qué plan recomiendo primero?',
                answer:
                    'Siempre Free para que vean valor (web + citas). Sube a PRO cuando aparezcan boletas, stock o más de un usuario trabajando en paralelo.',
            },
            {
                question: '¿Hay descuento anual?',
                answer:
                    'Hoy el mensaje comercial es mes a mes. Si en la conversación piden anual, escalar al equipo (no inventar precios).',
            },
        ],
    },
    {
        label: 'Web pública y citas',
        items: [
            {
                question: '¿Cómo es la URL de la clínica?',
                answer:
                    'vetsap.app/clinica/{slug}. El slug se define al crear la empresa y se puede ajustar en Configuración → Sitio web.',
            },
            {
                question: '¿Qué ve el cliente en la web?',
                answer:
                    'Información de la clínica, servicios, galería, contacto y el flujo para pedir cita (servicio, día, bloque horario).',
            },
            {
                question: '¿Dónde caen las citas reservadas online?',
                answer:
                    'Directo en la Agenda del panel. Nombre del paciente/cliente, servicio y horario. Sin depender de WhatsApp.',
            },
            {
                question: '¿Pueden apagar las reservas online?',
                answer:
                    'Sí, desde la configuración del calendario / sitio. Útil si aún están armando horarios o doctores.',
            },
            {
                question: '¿La clínica puede editar la web sin técnico?',
                answer:
                    'Sí. Desde Configuración → Sitio web, y también en vivo cuando el dueño está logueado en la página pública.',
            },
        ],
    },
    {
        label: 'Agenda',
        items: [
            {
                question: '¿Qué se hace en el calendario?',
                answer:
                    'Ver el día/semana, crear citas internas, reprogramar, cambiar estado e iniciar atención clínica desde la cita.',
            },
            {
                question: '¿Para qué sirven los estados de cita?',
                answer:
                    'Para que recepción y veterinarios hablen el mismo idioma: pendiente, confirmado, en consulta, etc. Son configurables.',
            },
            {
                question: '¿Cómo se bloquean feriados?',
                answer:
                    'En Agenda → Días feriados. Esos días no quedan disponibles para atención / reserva según la configuración.',
            },
            {
                question: '¿La agenda respeta el horario del doctor?',
                answer:
                    'Sí: la disponibilidad se arma con horarios del doctor, bloques del calendario y servicios asociados.',
            },
        ],
    },
    {
        label: 'Medicina (pacientes y clínica)',
        items: [
            {
                question: '¿Qué es un paciente en Vetsap?',
                answer:
                    'La mascota. Tiene especie, datos, foto, historial de atenciones y, si aplica, plan de vacunación. El dueño es el Cliente.',
            },
            {
                question: '¿Qué es una atención?',
                answer:
                    'El registro clínico de una consulta. Se puede iniciar desde la cita, completar la ficha y compartir PDF o WhatsApp.',
            },
            {
                question: '¿Las fichas médicas son fijas?',
                answer:
                    'No. La clínica configura los campos de la ficha según su protocolo (Medicina → Fichas médicas).',
            },
            {
                question: '¿Sirve para vacunación?',
                answer:
                    'Sí. Se definen planes/protocolos y se administran dosis por paciente. Buen argumento frente a controles en papel.',
            },
            {
                question: '¿Qué son servicios vs especialidades?',
                answer:
                    'Servicios = lo que se agenda y se cobra (consulta, vacunación, baño…). Especialidades = catálogo médico (cirugía, dermatología…) asociado a doctores.',
            },
            {
                question: '¿Pueden varios doctores?',
                answer:
                    'Sí. Cada uno con horarios y servicios. En Free la limitación fuerte es 1 sucursal / alcance del plan; el trabajo multi-usuario completo es argumento PRO.',
            },
        ],
    },
    {
        label: 'Ventas, POS y SII',
        items: [
            {
                question: '¿Qué es el POS?',
                answer:
                    'El punto de venta: cobra productos y servicios, aplica descuentos y genera el documento de venta.',
            },
            {
                question: '¿Para qué es la caja?',
                answer:
                    'Abrir y cerrar turnos de caja, con registro de lo cobrado. Evita “plata suelta” sin control.',
            },
            {
                question: '¿Emiten boleta electrónica?',
                answer:
                    'Sí, en PRO, para Chile. Se configuran certificado SII y CAF (folios). Emisión desde el flujo de ventas.',
            },
            {
                question: '¿Necesitan un proveedor externo de facturación?',
                answer:
                    'No. Certificado y configuración SII se gestionan dentro de Vetsap (Configuración / módulo SII).',
            },
            {
                question: '¿Qué es un CAF?',
                answer:
                    'Archivo de folios autorizados por el SII. Sin CAF cargado no se pueden emitir boletas con folio válido.',
            },
            {
                question: '¿Los clientes del CRM son lo mismo que usuarios del portal?',
                answer:
                    'Cliente = ficha comercial (dueño). Opcionalmente se le puede dar acceso al Portal del cliente. No todo cliente necesita login.',
            },
        ],
    },
    {
        label: 'Almacén e inventario',
        items: [
            {
                question: '¿El inventario está en Free?',
                answer:
                    'No. Es parte del valor PRO junto con boletas y multi-usuario.',
            },
            {
                question: '¿Cómo se carga el stock inicial?',
                answer:
                    'Crear categorías y productos, luego un movimiento de entrada. Después las ventas descuentan según la configuración de inventario.',
            },
            {
                question: '¿Soporta código de barras?',
                answer:
                    'Sí, hay búsqueda / lectura por código de barras en productos, pensado para el mostrador.',
            },
            {
                question: '¿Se ve el historial de movimientos?',
                answer:
                    'Sí: movimientos de inventario y de productos para auditar entradas y salidas.',
            },
        ],
    },
    {
        label: 'Compras',
        items: [
            {
                question: '¿Qué hay hoy en Compras?',
                answer:
                    'Órdenes de compra, estados, proveedores, gastos y tipos de gasto.',
            },
            {
                question: '¿Qué NO debo vender todavía?',
                answer:
                    'Documentos de compra, cuentas por cobrar y pagos realizados aparecen como placeholders: no están activos. Sé transparente si preguntan.',
            },
        ],
    },
    {
        label: 'Configuración, usuarios y seguridad',
        items: [
            {
                question: '¿Una cuenta puede tener varias clínicas?',
                answer:
                    'El modelo es por empresa/compañía con sucursales. Hay selector de empresa cuando el usuario pertenece a más de una.',
            },
            {
                question: '¿Cómo se controla quién ve qué?',
                answer:
                    'Roles y permisos por empresa. Recepción puede ver agenda sin tocar configuración SII, por ejemplo.',
            },
            {
                question: '¿Qué integraciones hay?',
                answer:
                    'Certificado SII, Google Calendar y Gmail, además de la web pública y WhatsApp de contacto en el sitio.',
            },
            {
                question: '¿Los datos están en Chile / son seguros?',
                answer:
                    'Hablar de prácticas reales del equipo (soporte en español, flujos SII/RUT). No inventar certificaciones ISO u otras si no están confirmadas.',
            },
        ],
    },
    {
        label: 'Portal del cliente',
        items: [
            {
                question: '¿Qué ve el dueño de la mascota en el portal?',
                answer:
                    'Sus mascotas, atenciones asociadas y documentos de venta. Es un portal limitado, no el ERP completo.',
            },
            {
                question: '¿Es obligatorio el portal?',
                answer:
                    'No. Muchas clínicas solo usan la reserva web. El portal es un plus cuando quieren que el cliente revise historial o documentos.',
            },
        ],
    },
    {
        label: 'Objeciones y proceso de venta',
        items: [
            {
                question: '“Ya tengo Instagram / Facebook”',
                answer:
                    'Las redes no agendan con horarios reales ni guardan ficha clínica. Vetsap convierte la visita en cita dentro del panel.',
            },
            {
                question: '“No sé de tecnología”',
                answer:
                    'Si usan WhatsApp, pueden usar Vetsap. El setup Free toma minutos y hay datos demo al registrarse.',
            },
            {
                question: '“¿Me migran mis datos?”',
                answer:
                    'Depende del caso (Excel, otro software). No prometas migración masiva automática: ofrece revisión con el equipo técnico.',
            },
            {
                question: '¿Cuál es el CTA principal?',
                answer:
                    'Crear cuenta gratis (sin tarjeta) o escribir por WhatsApp +56 9 3726 3654. Cierra siempre con un siguiente paso concreto.',
            },
            {
                question: '¿Dónde está esta guía?',
                answer:
                    'URL pública /onboarding-ventas. No requiere sesión. Úsala antes de demos y para refrescar módulos.',
            },
        ],
    },
] as const;
