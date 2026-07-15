# Checklist de Migración Multiplataforma

**Propósito**: validar la calidad, claridad y cobertura de los requisitos del plan de migración a monorepo con NestJS + Expo + TypeScript.
**Creado**: 2026-07-15
**Referencia**: [plan-crossPlatformMigration.prompt.md](/Users/franco/projects/jw-service-tracker/plan-crossPlatformMigration.prompt.md)

## Compleción de Requisitos

- [ ] CHK001 ¿El plan define explícitamente el alcance completo de la migración para web, Android e iOS sin dejar plataformas implícitas? [Completeness, Plan]
- [ ] CHK002 ¿Se especifica con claridad qué partes de la app actual deben migrarse y cuáles quedan fuera de esta primera fase? [Completeness, Plan]
- [ ] CHK003 ¿Se documenta la separación entre backend, cliente y paquetes compartidos como parte obligatoria de la solución? [Completeness, Plan]
- [ ] CHK004 ¿El plan incluye autenticación, usuarios, entries y configuración como capacidades a cubrir por el backend? [Completeness, Plan]
- [ ] CHK005 ¿Se describen los entregables mínimos esperados para cada fase de migración? [Completeness, Plan]

## Claridad de Requisitos

- [ ] CHK006 ¿Está definido de forma inequívoca por qué NestJS es el backend elegido y no otra alternativa? [Clarity, Plan]
- [ ] CHK007 ¿Está definido de forma inequívoca por qué Expo es el cliente elegido y no Flutter u otra alternativa? [Clarity, Plan]
- [ ] CHK008 ¿Se aclara qué significa “reutilización real” en términos de código compartido? [Clarity, Plan]
- [ ] CHK009 ¿El documento distingue con precisión entre compartir dominio/contratos y compartir UI? [Clarity, Plan]
- [ ] CHK010 ¿La propuesta de estructura de carpetas evita ambigüedad sobre qué vive en `apps/` y qué vive en `packages/`? [Clarity, Plan]
- [ ] CHK011 ¿Se aclara si `apps/web` es opcional o parte del alcance inicial? [Clarity, Plan]

## Consistencia de Requisitos

- [ ] CHK012 ¿La decisión de usar TypeScript es consistente en backend, cliente y paquetes compartidos? [Consistency, Plan]
- [ ] CHK013 ¿La estrategia de autenticación es consistente con la separación de frontend y backend descrita en el plan? [Consistency, Plan]
- [ ] CHK014 ¿La elección de Docker para el backend es consistente con el objetivo de desacoplar el runtime del cliente? [Consistency, Plan]
- [ ] CHK015 ¿Las fases descritas siguen un orden lógico que no contradice la arquitectura objetivo? [Consistency, Plan]
- [ ] CHK016 ¿La validación por plataforma es consistente con el alcance de soporte multiplataforma definido al inicio? [Consistency, Plan]

## Calidad de Criterios de Aceptación

- [ ] CHK017 ¿Los entregables de cada fase son verificables y no dependen de interpretaciones subjetivas? [Acceptance Criteria, Plan]
- [ ] CHK018 ¿Se define cómo se sabrá que el backend Nest está listo para reemplazar los route handlers de Next? [Acceptance Criteria, Plan]
- [ ] CHK019 ¿Se define cómo se sabrá que el cliente Expo ya cubre los flujos críticos actuales? [Acceptance Criteria, Plan]
- [ ] CHK020 ¿La validación recomendada incluye resultados observables para login, CRUD de entries y dashboard? [Acceptance Criteria, Plan]

## Cobertura de Escenarios

- [ ] CHK021 ¿Se contemplan los flujos primarios de registro, inicio de sesión y renovación de sesión? [Coverage, Plan]
- [ ] CHK022 ¿Se cubren los flujos principales de listado, creación, edición y borrado de entries? [Coverage, Plan]
- [ ] CHK023 ¿Se incluye la cobertura del dashboard con datos reales y estados de carga? [Coverage, Plan]
- [ ] CHK024 ¿Se contempla explícitamente la construcción y validación para web, Android e iOS? [Coverage, Plan]
- [ ] CHK025 ¿Se incluye la cobertura del despliegue del backend en Docker como parte del plan? [Coverage, Plan]

## Casos Límite y Riesgos

- [ ] CHK026 ¿El plan define qué ocurre si la API antigua de Next y la nueva API Nest conviven temporalmente? [Edge Case, Gap]
- [ ] CHK027 ¿Se especifica el comportamiento esperado ante fallos de red o indisponibilidad del backend en el cliente Expo? [Edge Case, Gap]
- [ ] CHK028 ¿Se documenta una estrategia clara para migrar auth de NextAuth a tokens sin romper sesiones activas? [Edge Case, Gap]
- [ ] CHK029 ¿Se aclara si la web en Expo es suficiente o si más adelante habrá una app web separada? [Edge Case, Gap]
- [ ] CHK030 ¿Se define qué riesgos de compatibilidad aparecen al compartir sólo dominio/contratos y no UI? [Edge Case, Gap]

## Requisitos No Funcionales

- [ ] CHK031 ¿El plan define expectativas mínimas de rendimiento para la app móvil y la API? [NFR, Gap]
- [ ] CHK032 ¿Se especifican requisitos de seguridad para tokens, refresh y protección de endpoints? [NFR, Plan]
- [ ] CHK033 ¿Se establecen requisitos de observabilidad o logging para el backend Nest? [NFR, Gap]
- [ ] CHK034 ¿Se contempla la mantenibilidad como criterio explícito al elegir monorepo y TypeScript? [NFR, Plan]
- [ ] CHK035 ¿Se consideran requisitos de accesibilidad o usabilidad para el cliente Expo como parte del alcance? [NFR, Gap]

## Dependencias y Suposiciones

- [ ] CHK036 ¿La dependencia de MongoDB está documentada como parte del diseño y no como detalle accidental? [Dependencies, Plan]
- [ ] CHK037 ¿La necesidad de un backend separado está justificada por el alcance de web + Android + iOS? [Dependencies, Plan]
- [ ] CHK038 ¿Está claro qué paquetes compartidos se espera que existan desde el inicio y cuáles pueden esperar? [Dependencies, Plan]
- [ ] CHK039 ¿Se explicita la suposición de que el equipo prioriza reutilización de código sobre SSR/SEO avanzado? [Assumption, Plan]

## Ambigüedades y Conflictos

- [ ] CHK040 ¿Hay alguna ambigüedad sobre si el objetivo principal es migración técnica o rediseño funcional? [Ambiguity, Plan]
- [ ] CHK041 ¿El plan evita conflictos entre la promesa de un solo código base y la posible necesidad futura de una web separada? [Conflict, Plan]
- [ ] CHK042 ¿Queda claro que Flutter fue descartado por una razón de reutilización de código y no por una limitación técnica no declarada? [Ambiguity, Plan]
- [ ] CHK043 ¿Se evita la contradicción entre “un solo cliente” y la existencia opcional de `apps/web`? [Conflict, Plan]
- [ ] CHK044 ¿Está definido con suficiente precisión qué cuenta como “terminar la migración” y qué queda para iteraciones posteriores? [Ambiguity, Plan]

## Notas

- Marcar con `[x]` los puntos ya satisfechos por el plan.
- Añadir comentarios si alguna pregunta requiere aclaración antes de implementar.
- Los ítems están numerados de forma secuencial para facilitar seguimiento.
