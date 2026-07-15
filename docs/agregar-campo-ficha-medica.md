# Agregar un nuevo campo a las fichas médicas

El catálogo de campos disponibles para las plantillas de fichas médicas vive en código (no en base de datos). Esto permite mantener el control sobre los tipos de campo y su renderizado en el formulario de atención.

## Archivo a editar

```
resources/js/pages/medic/clinical-templates/types.ts
```

## Pasos

### 1. Agregar la entrada al catálogo

Dentro del array `CLINICAL_FIELD_CATALOG`, agrega un objeto con la siguiente estructura:

```ts
{ key: 'nombre_unico', label: 'Etiqueta visible', group: 'Signos vitales', type: 'number' },
```

**Reglas:**
- `key` debe ser único en todo el catálogo y en snake_case.
- `group` agrupa visualmente los campos en la UI de configuración. Usa un grupo existente (`'Signos vitales'`, `'Datos clínicos'`) o crea uno nuevo escribiendo un nombre distinto.
- `type` determina cómo se renderiza el campo en el formulario de atención (ver tabla de tipos más abajo).

### Ejemplo: agregar "Peso"

```ts
export const CLINICAL_FIELD_CATALOG = [
    // Signos vitales
    { key: 'temperature',      label: 'Temperatura (°C)',          group: 'Signos vitales', type: 'number' },
    { key: 'weight',           label: 'Peso (kg)',                 group: 'Signos vitales', type: 'number' }, // <-- nuevo
    { key: 'heart_rate',       label: 'Frecuencia cardíaca (lpm)', group: 'Signos vitales', type: 'number' },
    // ...
] as const;
```

### 2. No se requiere ningún otro cambio (para tipos existentes)

El `field_key` se guarda como string en `medic_clinical_template_fields` y los valores en `medic_clinical_attention_values`. No hay migración de base de datos.

El tipo `ClinicalFieldKey` se deriva automáticamente del array:

```ts
export type ClinicalFieldKey = (typeof CLINICAL_FIELD_CATALOG)[number]['key'];
```

TypeScript lo infiere solo — el nuevo `key` queda disponible en toda la aplicación.

---

## Tipos de campo disponibles

| `type`        | Renderizado en el formulario de atención | Ejemplo de uso |
|---------------|------------------------------------------|----------------|
| `number`      | Input numérico                           | Temperatura, peso, frecuencia cardíaca |
| `text`        | Input de texto corto                     | Diagnóstico, pre-diagnóstico |
| `textarea`    | Área de texto multilínea                 | Anamnesis, hallazgos clínicos |
| `scale_1_9`   | Escala numérica del 1 al 9               | Condición corporal |
| `scale_1_5`   | Escala numérica del 1 al 5               | Condición muscular |
| `select`      | Selector con opciones fijas              | Relleno capilar |
| `prescription`| Campo especial de receta                 | Receta médica |

### Tipo `select`

Requiere además el array `options`:

```ts
{
    key: 'mucosas',
    label: 'Color de mucosas',
    group: 'Signos vitales',
    type: 'select',
    options: [
        { id: 'rosadas',    label: 'Rosadas (normal)' },
        { id: 'palidas',    label: 'Pálidas'           },
        { id: 'cianoticas', label: 'Cianóticas'        },
        { id: 'ictericas',  label: 'Ictéricas'         },
    ],
},
```

---

## Agregar un tipo de campo nuevo

Si el campo requiere un tipo de renderizado que no existe en la tabla anterior (por ejemplo, una escala diferente o un selector dinámico), además de editar `types.ts` hay que actualizar el renderizado en el formulario de atención:

```
resources/js/pages/medic/clinical-attentions/form.tsx
```

Busca el `switch (field.type)` o equivalente y agrega el caso correspondiente.

---

## Grupos disponibles actualmente

| Grupo           | Campos |
|-----------------|--------|
| Signos vitales  | Temperatura, frecuencia cardíaca, frecuencia respiratoria, condición corporal, condición muscular, relleno capilar |
| Datos clínicos  | Anamnesis, hallazgos clínicos, pre-diagnóstico, diagnóstico, tratamiento, receta |

Para crear un grupo nuevo basta con usar un nombre distinto en `group`. La UI lo mostrará automáticamente como una sección separada.
