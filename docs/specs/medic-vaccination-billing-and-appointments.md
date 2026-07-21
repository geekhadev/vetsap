# Spec: Vacunación — cobro (con/sin atención) y citas

Estado: Fases A–B implementadas (cobro al aplicar en clínica + citas desde dosis)  
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
| **1** | Cita de consulta → atención **y** ese día se aplica vacuna | Atención aporta línea(s) `service`; la vacuna aporta línea `product` en el **mismo borrador** (sin depender de la atención) | Cita de consulta; dosis puede tener otra cita de refuerzo aparte |
| **2** | Atención **sin** cita **y** vacuna ese día | Igual: servicios de la atención + producto vacuna | — |
| **3** | Vacuna **sin** atención ni cita ese día | Solo producto vacuna en borrador del cliente | — |
| **4** | Cita ligada a dosis del plan (vacunación) | Línea `product` + línea `service` de la cita al aplicar; **sin** formulario de atención | Al completar dosis → cita Atendido |
| **5** | Dosis `scheduled` / `due` / `overdue` a futuro | — | Poder **programar cita** desde la dosis (manual; no auto al asignar plan) |

Casos colaterales:

- Aplicación **externa** → nunca genera línea de venta.
- **Eliminar aplicación** (clear) → en v1 **no modifica la venta** (ni borrador ni cobrada). Conciliación venta↔acto clínico: ver TODO (post-v1).
- Varias vacunas el mismo día (con o sin atención) → N líneas de producto, una por dosis.
- Todo paciente tiene `customer_id` (invariant del dominio); el cobro siempre tiene cliente.

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

## 5. Decisiones cerradas (2026-07-21)

### 5.1 Momento de encolar el cobro — **al aplicar en clínica**

Al confirmar `Administer` con `administered_origin = clinic`:

1. Resolver cliente del paciente (`patient.customer_id` — siempre existe; ver §5.5).
2. Asegurar borrador abierto del cliente (extender patrón `EnsureDraftSaleDocumentForAttention` a ensure-by-customer).
3. Upsert línea `detail_type = product` con:
   - `product_id` = dosis.product_id  
   - `quantity` = 1  
   - precio = precio vigente del producto Store (**0 si no tiene precio**)  
   - `patient_vaccination_dose_id` = dosis.id (**único**)  
   - `clinical_attention_id` = según §5.2  

Al sincronizar atención: el sync de servicios **no borra** líneas `product` de vacunas.

### 5.2 Vínculo atención ↔ dosis — **sin dependencia**

La vacuna **no depende** de una atención clínica:

1. Al aplicar en clínica, la línea de producto se encola en el borrador del cliente **sin** `clinical_attention_id`.
2. No se abre ni se exige el formulario de atención para vacunar.
3. Si la dosis tiene cita vinculada: al completar las dosis abiertas de esa cita se marca **Atendido** automáticamente (sin crear atención ni líneas `service` de agenda).

Si el mismo día hay una atención de consulta (walk-in o cita no de vacunación), sus servicios se cobran aparte; la vacuna sigue siendo solo el producto.

### 5.3 Caso 4 — cita de vacunación + producto

Para citas **ligadas a dosis del plan**:

1. Al aplicar en clínica se cobran **ambas** cosas en el borrador: línea `product` (vacuna) + línea `service` (servicio de la cita), sin abrir atención.
2. Idempotencia: una línea de producto por dosis; una línea de servicio por cita (`appointment_id` único en detalle).
3. «Iniciar atención» no aplica a esas citas; el sync de atención **no** vuelve a encolar el servicio de agenda (evita duplicar).

Si se necesita consulta + vacuna el mismo día: atención de consulta (otros servicios) **y** aplicar dosis (producto + servicio de la cita de vacuna si está ligada).

### 5.4 Eliminar aplicación / venta — **v1 no toca la venta**

Al `ClearPatientVaccinationDoseAdministration`:

- Se revierte el acto clínico (estado abierto, series, etc.) como hoy.
- **No** se elimina ni modifica ninguna línea de `sale_document_details`, esté en borrador o ya cobrada.

**Post-v1 (TODO):** reconciliar clear ↔ borrador/cobrado (quitar de borrador; bloquear o NC si ya cobrado).

### 5.5 Cliente y precio

- **Paciente sin cliente:** no es un caso válido del dominio (“no puede existir un paciente sin cliente”). El cobro asume `customer_id` presente.
- **Producto sin precio / precio 0:** se agrega igual a la venta con **monto 0**; el cajero puede ajustar en POS.

### 5.6 Citas para dosis programadas

1. Desde la dosis: CTA **Programar cita** (manual).
2. Prefill `AppointmentForm`: paciente/cliente, `starts_at` ≈ `scheduled_on`, servicio a elección (como hoy).
3. Persistir `appointment_id` en la(s) dosis; una cita puede agrupar varias dosis del mismo día.
4. **No** generar citas automáticamente al asignar el plan.
5. Al **recalcular serie:** **no** mover citas; avisar desfase en UI + CTA “Actualizar cita”.

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
   clinical_attention_id = draft del paciente o última atención
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
| Diálogo de dosis (aplicar clinic) | Toast: “Agregada al cobro pendiente del cliente” |
| Diálogo de dosis (aplicada) | Badge “En cobro” / “Cobrada” / “Sin cobro (externa)” según detalle y estado doc |
| Diálogo clear | Revierte solo el acto clínico; **no** menciona quitar de la venta (v1) |
| Filtro Vacunación / Acciones | “Programar cita” en dosis abiertas; “Ver cita” si `appointment_id`; aviso si cita desfasada tras recálculo |
| POS | Líneas de vacuna (precio puede ser 0); servicios + productos conviven |
| Calendario | Citas con dosis ligadas: chip “Vacunación (N dosis)” (nice-to-have) |

---

## 9. Reglas de negocio (checklist)

1. Solo `administered` + `origin = clinic` genera/actualiza línea de venta.
2. Una dosis ↔ a lo sumo una línea activa de detalle (unique `patient_vaccination_dose_id`).
3. Sync de servicios de atención **no elimina** líneas de producto de vacunas.
4. Clear administration **no modifica** la venta en v1 (acto clínico sí se revierte).
5. Cita vinculada es opcional; cobro no depende de cita.
6. Atención vinculada es automática si hay draft o última atención; cobro no exige atención.
7. Fechas de cita sugeridas usan `scheduled_on` post-recálculo de serie; citas existentes no se mueven solas.
8. Productos tipo Vacunas; precio Store o **0** si falta.
9. Paciente siempre tiene cliente.

---

## 10. Fases de implementación sugeridas

### Fase A — Cobro automático al aplicar (casos 1–3)

1. Migración `patient_vaccination_dose_id` en `sale_document_details` (+ FKs opcionales en dosis).
2. Action `EnsureDraftSaleDocumentForCustomer`.
3. Action `SyncVaccinationDoseToDraftSaleAction` (**solo upsert** al aplicar clinic / cambiar a clinic; **sin delete** en clear v1).
4. Enganchar en Administer (y Update si origin pasa a/desde clinic).
5. Resolver `clinical_attention_id`: draft del paciente → si no, última atención.
6. UI toasts + estados de cobro en diálogo de dosis.

### Fase B — Citas desde dosis (caso 5 + refuerzo de 4)

1. `appointment_id` en dosis.
2. CTA Programar cita + prefill AppointmentForm.
3. Indicadores de desalineación cita vs `scheduled_on` tras recálculo (sin auto-mover).
4. (Opcional) agrupar varias dosis del mismo día en una cita.

### Fase C — Pulido / deuda

1. **Reconciliar clear ↔ venta** (ver TODO): quitar de borrador; política si ya cobrado.
2. Stock/lote al cobrar o al aplicar (spec aparte).
3. Reportes: vacunas aplicadas vs cobradas.
4. Recordatorios de citas de vacuna.

---

## 11. Decisiones cerradas (resumen)

| # | Decisión |
|---|----------|
| D1 | Paciente **siempre** tiene cliente; no hay flujo “sin cliente”. |
| D2 | Cita de vacunación (ligada a dosis): cobrar **producto + servicio de la cita** al aplicar; sin atención obligatoria. |
| D3 | Vacuna **independiente** de atención: sin auto-vínculo `clinical_attention_id` al aplicar. |
| D4 | Clear aplicación v1: **no tocar la venta**; conciliación en TODO post-v1. |
| D5 | Citas **manuales** desde dosis; no auto al asignar plan. |
| D6 | Recálculo de serie: **no** mover citas; avisar desfase. |
| D7 | Precio faltante / 0 → línea con **monto 0**. |

---

## 12. Criterios de aceptación (cuando se implemente)

- [ ] Caso 1: atención con cita + vacuna clinic → POS muestra service(s) + product; una sola línea por dosis.
- [ ] Caso 2: atención sin cita + vacuna → igual.
- [ ] Caso 3: solo vacuna → borrador con product, sin exigir atención.
- [ ] Caso 4: cita de vacunación + dosis → service + product visibles; sin duplicar la misma dosis.
- [ ] Externa: no crea línea de venta.
- [ ] Clear aplicación: revierte el acto clínico y **no** modifica la venta (v1).
- [ ] Producto sin precio → línea con monto 0.
- [ ] Vínculo atención: draft del paciente si existe; si no, última atención; si no hay, null.
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
