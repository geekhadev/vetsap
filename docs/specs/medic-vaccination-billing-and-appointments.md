# Spec: Vacunación — cobro (con/sin atención) y citas

Estado: propuesta (post-MVP) — pendiente de decisiones de producto  
Última actualización: 2026-07-21  
Relacionado: [`medic-vaccination-plans.md`](./medic-vaccination-plans.md) (MVP clínico cerrado, fases 1–7)

## 1. Objetivo

Definir cómo las **dosis aplicadas en clínica** (`administered` + `administered_origin = clinic`) entran al flujo comercial del POS, tanto **junto a una atención del día** como **por separado**, y cómo se pueden **programar citas** para dosis futuras del plan — sin romper el modelo actual de borradores de venta ni el timeline clínico.

**No objetivo en este spec:** stock/lote, recordatorios WhatsApp/email, certificados, cambio de plan.

---

## 2. Situación actual (código)

### 2.1 Vacunación (clínico)

- Dosis → `store_products` tipo **Vacunas** (`product_id`).
- Sin FKs a cita, atención ni documento de venta.
- `external` = cartilla / otra clínica → **no cobrable** en esta clínica.
- Spec MVP: ventas, agenda y stock **fuera de alcance**.

### 2.2 Atención → cobro (ya existe)

```text
Cita (medic_services + precio)
  → Atención (draft|closed) + requestedServices (medic_services)
    → EnsureDraftSaleDocumentForAttention
    → SyncDraftSaleDocumentFromAttention
         └─ líneas detail_type = service (+ clinical_attention_id)
    → POS cobra borrador(es) del cliente
```

- Hay **un borrador abierto por cliente**; varias atenciones consolidan líneas `service` en el mismo documento.
- El sync de atención **solo toca servicios**; no inserta productos Store.
- El POS **sí** puede agregar productos (incl. Vacunas) a mano al borrador (`UpsertPosDraftProductAction`, sin vínculo a dosis).

### 2.3 Asimetría clave

| Concepto | Catálogo | Cómo se cobra hoy |
|----------|----------|-------------------|
| Consulta / procedimiento de agenda | `medic_services` | Línea `service` auto desde atención |
| Vacuna del plan | `store_products` (Vacunas) | Solo si alguien la agrega a mano en POS |

Por eso “aplicar vacuna” no genera cobro, aunque el producto ya exista y sea vendible.

---

## 3. Casos de uso (requeridos)

| # | Escenario | Qué debe pasar en cobro | Qué debe pasar en agenda |
|---|-----------|-------------------------|--------------------------|
| **1** | Cita → atención **y** ese día se aplica vacuna | Atención aporta línea(s) `service`; la vacuna aporta línea `product` en el **mismo borrador** del cliente, trazable a la dosis | Cita ya existe; opcional vincular dosis↔cita si la cita era “para vacunar” |
| **2** | Atención **sin** cita **y** vacuna ese día | Igual que 1: servicios de la atención + producto vacuna en el mismo borrador | — |
| **3** | Vacuna **sin** atención ni cita ese día | Crear/usar borrador del cliente y agregar solo el producto vacuna (cobro independiente) | — |
| **4** | Cita cuyo servicio es “vacuna / vacunación” **y** también se registra la dosis del plan | Evitar **doble cobro** conceptual (honorario de visita vs producto vacuna). Ver §5.3 | La cita puede estar ligada a una o más dosis programadas |
| **5** | Dosis `scheduled` / `due` / `overdue` a futuro | — | Poder **programar cita** desde la dosis (o en bloque desde el plan) |

Casos colaterales:

- Aplicación **externa** → nunca genera línea de venta.
- **Eliminar aplicación** (clear) → quitar la línea del borrador si aún no se cobró; si ya se cobró → no borrar silenciosamente (ver §5.4).
- Varias vacunas el mismo día (con o sin atención) → N líneas de producto, una por dosis.

---

## 4. Principios de diseño

1. **La dosis clínica es la fuente de verdad del acto**; el cobro es un efecto colateral trazable, no al revés.
2. **Reutilizar el borrador POS del cliente** (mismo patrón que atenciones): no inventar un checkout paralelo.
3. **Vacuna = línea `product`**; visita/consulta = línea `service` (como hoy). No convertir Vacunas en `medic_services`.
4. **Idempotencia:** aplicar dos veces la misma dosis (o re-sync) no duplica líneas.
5. **Origen clínica vs externo:** solo `clinic` es cobrable.
6. **Separabilidad:** el cobro de la vacuna no exige atención; la atención no exige vacuna.
7. **Citas de refuerzo** usan `scheduled_on` **vigente** (después de recálculos de serie).

---

## 5. Decisiones propuestas (a cerrar)

### 5.1 Momento de encolar el cobro — **propuesta: al aplicar en clínica**

Al confirmar `Administer` con `administered_origin = clinic`:

1. Resolver cliente del paciente (`patient.customer_id`; si falta → error claro, no se aplica o se aplica sin cobro según política §5.5).
2. Asegurar borrador abierto del cliente (extender patrón `EnsureDraftSaleDocumentForAttention` a un ensure-by-customer reutilizable).
3. Upsert línea `detail_type = product` con:
   - `product_id` = dosis.product_id  
   - `quantity` = 1  
   - precio = precio vigente del producto (lista Store)  
   - `patient_vaccination_dose_id` = dosis.id (**único** en detalles no anulados)  
   - `clinical_attention_id` = atención draft/cerrada del paciente **del mismo día calendario** si existe; si no, `null` (caso 3)

Al **cerrar** o **sincronizar** atención: el sync actual de servicios **no debe borrar** líneas `product` (hoy ya las respeta). Opcionalmente, al sync, **adjuntar** `clinical_attention_id` a líneas de vacuna del mismo paciente/día que aún no lo tengan (mejora de trazabilidad casos 1–2).

**Alternativa descartada para v1:** solo encolar al cerrar la atención — deja fuera el caso 3 y retrasa el cobro walk-in.

### 5.2 Vínculo atención ↔ dosis

| Enfoque | Pros | Contras |
|---------|------|---------|
| **A. Soft same-day** (propuesto v1) | Cero UI extra; cubre 1 y 2 | Ambiguo si hay 2 atenciones el mismo día |
| **B. Explicit** al aplicar (“vincular a atención abierta”) | Preciso | Más fricción |
| **C. FK `clinical_attention_id` en la dosis** | Auditoría fuerte | Hay que mantenerla al clear |

**Propuesta v1:** A + opcional C al aplicar si hay exactamente una atención draft del paciente ese día; si hay varias, pedir selección (mini-dialogo) o dejar `null` y cobrar igual.

### 5.3 Caso 4 — cita de “servicio vacuna” + producto vacuna (doble cobro)

Hoy agenda cobra **servicio médico**; el plan cobra **producto**. Pueden coexistir legítimamente:

- Servicio = acto / consulta / aplicación  
- Producto = fármaco / dosis

**Propuesta:**

1. Siempre cobrar el **producto** al aplicar la dosis en clínica (regla única).
2. El **servicio de la cita/atención** se cobra como hoy (sync).
3. Documentar en UI del POS: nombres claros (“Vacuna X” vs “Consulta / aplicación”).
4. **No** auto-omitir el servicio aunque se llame “Vacunación” (demasiado frágil por nombre).

**Decisión abierta (producto):** ¿algunas clínicas quieren “pack” (solo servicio o solo producto)? Diferir a configuración posterior (`bill_vaccine_product`, `bill_application_service`).

### 5.4 Eliminar aplicación / anular cobro

| Estado del documento | Al clear administration |
|----------------------|-------------------------|
| Línea en **borrador** | Eliminar detalle con ese `patient_vaccination_dose_id` y recalcular totales |
| Documento **ya cobrado / emitido** | No borrar la línea. Bloquear clear **o** exigir nota de crédito / anulación de venta (fuera de v1; mensaje: “Ya fue cobrada; gestiona en Ventas”) |

### 5.5 Paciente sin cliente / sin precio

- Sin `customer_id`: permitir aplicar clínicamente pero **no** encolar cobro + toast de advertencia (o bloquear cobro automático — preferencia: **aplicar + advertir**).
- Producto sin precio / precio 0: encolar igual (el cajero ajusta en POS) **o** exigir precio > 0 — preferencia: encolar y permitir editar en POS.

### 5.6 Citas para dosis programadas

**Propuesta v1:**

1. Desde la dosis (o menú Vacunación): **Programar cita**.
2. Abre `AppointmentForm` con:
   - `patient_id` / `customer_id` fijos  
   - `starts_at` sugerido = `scheduled_on` (hora por default de la clínica o primer slot libre — reutilizar defaults del calendario)  
   - `service_id` = servicio configurable “Vacunación” de la clínica **o** el que el usuario elija (obligatorio como hoy)
3. Persistir `appointment_id` en la(s) dosis vinculadas (`medic_patient_vaccination_doses.appointment_id`).
4. Una cita puede agrupar **varias dosis del mismo día** (mismo `appointment_id`).
5. Al **iniciar atención** desde esa cita: flujo actual; las vacunas del día se aplican desde el timeline y encolan producto (§5.1).

**No en v1:** generar citas automáticamente al asignar el plan; recordatorios.

**Decisión abierta:** al recalcular fechas de serie, ¿reprogramar citas futuras ligadas? Propuesta: **no mover citas automáticamente**; marcar desalineación en UI (“Cita el 10; dosis recalculada al 17”) y CTA “Actualizar cita”.

---

## 6. Modelo de datos (borrador)

### 6.1 Extensiones

```text
medic_patient_vaccination_doses
  + appointment_id          nullable FK → agenda_appointments (nullOnDelete)
  + clinical_attention_id   nullable FK → medic_clinical_attentions (nullOnDelete)  -- opcional v1.1
  + sale_document_detail_id nullable FK → sale_document_details (nullOnDelete)     -- o solo índice inverso

sale_document_details
  + patient_vaccination_dose_id  nullable UUID unique (donde no null)
```

Índices: `(patient_vaccination_dose_id)` unique; `(appointment_id)` en dosis.

### 6.2 Relaciones conceptuales

```text
PatientVaccinationDose
  ├─ product (Vacunas)           -- ya existe
  ├─ appointment?                -- cita de refuerzo / aplicación
  ├─ clinicalAttention?          -- atención del acto (opcional)
  └─ saleDocumentDetail?         -- línea de cobro (si clinic)

SaleDocumentDetail (product)
  └─ patientVaccinationDose?     -- idempotencia + auditoría
```

---

## 7. Flujos por caso

### Caso 1 — Cita + atención + vacuna el mismo día

```text
1. Usuario inicia atención desde cita → draft attention + sync service lines
2. En timeline, aplica dosis (clinic)
3. Ensure draft sale (ya existe) + upsert product line
   clinical_attention_id = atención abierta del día
4. Cajero cobra en POS: servicios + vacuna(s)
```

### Caso 2 — Atención walk-in + vacuna

```text
Igual que 1 sin appointment_id en la atención.
```

### Caso 3 — Solo vacuna

```text
1. Aplica dosis (clinic) sin atención ese día
2. Ensure draft sale by customer (sin clinical_attention_id en header/línea)
3. Product line con clinical_attention_id = null
4. Cobro en POS solo de producto(s)
```

### Caso 4 — Cita “Vacunación” + dosis

```text
1. Cita con medic_service (p. ej. “Vacunación”) → al atender, línea service
2. Aplicar dosis → línea product
3. POS muestra ambas; clínica decide precio de cada una
```

### Caso 5 — Programar cita para dosis futura

```text
1. Dosis scheduled/due/overdue → “Programar cita”
2. Crea appointment + dose.appointment_id = …
3. Día de la cita: caso 1 o 4
```

---

## 8. UX (superficies)

| Superficie | Cambio |
|------------|--------|
| Diálogo de dosis (aplicar clinic) | Toast: “Agregada al cobro pendiente del cliente” / advertencia sin cliente |
| Diálogo de dosis (aplicada) | Badge “En cobro” / “Cobrada” / “Sin cobro (externa)” según detalle y estado doc |
| Diálogo clear | Si cobrada → bloquear; si en borrador → confirma quitar del cobro |
| Filtro Vacunación / Acciones | “Programar cita” en dosis abiertas; “Ver cita” si `appointment_id` |
| POS | Líneas de vacuna identificables (nombre producto + paciente si el borrador mezcla); no requiere UI nueva si el sync es automático |
| Calendario | Citas con dosis ligadas: chip o subtítulo “Vacunación (N dosis)” (nice-to-have) |

---

## 9. Reglas de negocio (checklist)

1. Solo `administered` + `origin = clinic` genera/actualiza línea de venta.
2. Una dosis ↔ a lo sumo una línea activa de detalle (unique `patient_vaccination_dose_id`).
3. Sync de servicios de atención **no elimina** líneas de producto de vacunas.
4. Clear administration solo si la línea está en documento `draft` (o no existe línea).
5. Cita vinculada es opcional; cobro no depende de cita.
6. Atención vinculada es opcional; cobro no depende de atención.
7. Fechas de cita sugeridas usan `scheduled_on` post-recálculo de serie.
8. Productos deben seguir siendo tipo Vacunas; precio desde Store.

---

## 10. Fases de implementación sugeridas

### Fase A — Cobro automático al aplicar (casos 1–3)

1. Migración `patient_vaccination_dose_id` en `sale_document_details`.
2. Action `EnsureDraftSaleDocumentForCustomer` (extraer/reutilizar ensure actual).
3. Action `SyncVaccinationDoseToDraftSaleAction` (upsert/delete línea).
4. Enganchar en Administer / Clear (y Update si cambia origin clinic↔external).
5. Soft-link `clinical_attention_id` same-day.
6. UI toasts + estados de cobro en diálogo de dosis.

### Fase B — Citas desde dosis (caso 5 + refuerzo de 4)

1. `appointment_id` en dosis.
2. CTA Programar cita + prefill AppointmentForm.
3. Indicadores de desalineación cita vs `scheduled_on` tras recálculo.
4. (Opcional) agrupar varias dosis del mismo día en una cita.

### Fase C — Pulido comercial

1. Config clínica: ¿forzar cliente para aplicar? ¿bloquear clear si cobrado?
2. Pack servicio+producto / precios especiales.
3. Stock/lote al cobrar o al aplicar (spec aparte).
4. Reportes: vacunas aplicadas vs cobradas.

---

## 11. Decisiones abiertas (necesitan respuesta de producto)

| # | Pregunta | Opciones | Impacto |
|---|----------|----------|---------|
| D1 | ¿Aplicar vacuna sin cliente? | (a) Sí + advertencia (b) Bloquear | Caso 3 walk-in mal cargado |
| D2 | ¿Doble cobro servicio+producto en cita “Vacunación”? | (a) Ambos siempre (b) Config (c) Solo producto | Caso 4 |
| D3 | ¿Vínculo atención? | (a) Soft same-day (b) Explícito (c) FK en dosis | Trazabilidad POS |
| D4 | ¿Clear si ya cobrado? | (a) Bloquear (b) Exigir NC | Contabilidad |
| D5 | ¿Auto-citas al asignar plan? | (a) No v1 (b) Sí opt-in | Alcance agenda |
| D6 | ¿Mover citas al recalcular serie? | (a) No + warning (b) Sí auto | UX agenda |

**Recomendación de arranque:** D1=a, D2=a, D3=a, D4=a, D5=a, D6=a → Fase A luego B.

---

## 12. Criterios de aceptación (cuando se implemente)

- [ ] Caso 1: atención con cita + vacuna clinic → POS muestra service(s) + product; una sola línea por dosis.
- [ ] Caso 2: atención sin cita + vacuna → igual.
- [ ] Caso 3: solo vacuna → borrador con product, sin exigir atención.
- [ ] Caso 4: cita de vacunación + dosis → service + product visibles; sin duplicar la misma dosis.
- [ ] Externa: no crea línea de venta.
- [ ] Clear en borrador: quita línea; clear con doc cobrado: bloqueado con mensaje.
- [ ] Programar cita desde dosis: crea appointment y deja `appointment_id`; `starts_at` anclado a `scheduled_on`.
- [ ] Recálculo de serie no mueve citas solas; UI avisa desfase.

---

## 13. Referencias en el codebase

| Área | Ruta |
|------|------|
| Spec clínico MVP | `docs/specs/medic-vaccination-plans.md` |
| Dosis / apply | `app/Actions/Medic/PatientVaccinations/*` |
| Sync atención → venta | `app/Actions/Sale/SaleDocuments/SyncDraftSaleDocumentFromAttentionAction.php` |
| Ensure draft | `app/Actions/Sale/SaleDocuments/EnsureDraftSaleDocumentForAttentionAction.php` |
| POS productos | `app/Actions/Sale/Pos/UpsertPosDraftProductAction.php` |
| Cobro | `app/Actions/Sale/SaleDocuments/ChargePosSaleAction.php` |
| Detalle venta | `app/Models/Sale/SaleDocumentDetail.php` |
| Timeline / diálogos | `resources/js/pages/medic/patients/patient-clinical-timeline.tsx`, `patient-vaccination-dialogs.tsx` |
| Citas | `app/Models/Agenda/Appointment.php`, `resources/js/pages/agenda/calendar/appointment-form.tsx` |
| Backlog | `TODO.md` § Medicina / plan de vacunación |
