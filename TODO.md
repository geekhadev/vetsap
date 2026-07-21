# TODO

Pendientes acumulados para retomar después.

## Agenda / calendario

- [ ] **Compartir cita por correo**: en el detalle de cita, la opción «Correo» del dropdown «Compartir» aún no envía nada. Implementar el envío del recordatorio al email del cliente (plantilla similar a la de WhatsApp).
- [ ] **Iniciar atención**: el botón «Iniciar atención» del detalle de cita aún no tiene flujo conectado.

## Ventas / caja registradora

- [ ] **Anulaciones y notas de crédito en caja**: definir cómo restan (o no) del resumen/cuadre de una sesión abierta o ya cerrada (p. ej. si una anulación posterior al cierre debe ajustar el histórico, generar movimiento en la caja actual, o solo quedar fuera del arqueo).
- [ ] **Vacuna: clear aplicación vs venta**: tras implementar cobro automático al aplicar, reconciliar «Eliminar aplicación» con la línea de venta (hoy v1 no toca la venta). Definir: quitar del borrador si sigue draft; si ya cobrada, bloquear clear o exigir NC/anulación.

## Medicina / plan de vacunación (post-MVP)

Spec clínico MVP: `docs/specs/medic-vaccination-plans.md`  
Spec cobro + citas (decisiones cerradas): `docs/specs/medic-vaccination-billing-and-appointments.md`

- [ ] **Integraciones cobro/citas**: implementar según spec (Fase A cobro al aplicar, Fase B citas desde dosis); stock/lote y recordatorios siguen aparte.
- [ ] **Integraciones**: recordatorios (email/WhatsApp), stock/lote al aplicar.
- [ ] **Cambiar o migrar de plan** luego de asignado; política al publicar protocolo v2 (alerta vs migración de dosis futuras).
- [ ] **Campos específicos de productos tipo Vacunas** (extender ficha de producto: p. ej. enfermedades cubiertas, especie sugerida, ficha técnica).
- [ ] **Cobertura formal polivalente**: modelar que un producto cumple N ítems/antígenos sin omitir/agregar a mano.
- [ ] **Protocolos globales** Vetsap (`is_global`) clonables/adaptables por clínica.
- [ ] **Filtro por raza** (requiere catálogo de razas; hoy `breed` es texto libre).
- [ ] **Edad estimada** sin `birth_date` exacta (hoy el módulo exige fecha de nacimiento).
- [ ] **Carnet / certificado PDF** y trazabilidad legal (lote, firmante, exportación).
- [ ] **Titulación (titers)** como alternativa a refuerzo.
- [ ] **Vacunas por estilo de vida** (core / no-core / riesgo) además del plan base.
- [ ] **Ventana de “due”** (cuántos días antes/después de `scheduled_on` se considera vigente vs vencida).
- [ ] **Ancla exacta de reglas `periodic`**: después de última dosis vs calendario fijo anual — cerrar en implementación si queda ambiguo.
- [ ] **Dosis omitidas en filtro Todo**: confirmar si se ocultan por defecto o se muestran atenuadas (preferencia actual en spec: ocultas salvo filtro Vacunación).
