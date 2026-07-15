# Plan de implementación: Migración multiplataforma

**Objetivo**: evolucionar la aplicación actual hacia una arquitectura en monorepo con un backend desacoplado y un cliente Expo, de forma que el producto pueda vivir en **web, Android e iOS** sin duplicar lógica de negocio.

## Resumen

La base actual está construida sobre **Next.js 16 + React 19 + TypeScript**, con rutas API de Next, autenticación con NextAuth/credenciales y persistencia en MongoDB. Eso funciona bien para web, pero hoy la UI y el runtime están fuertemente acoplados a Next y al DOM. Para soportar móvil de forma realista, el plan recomendado es:

- **Backend**: NestJS + TypeScript, con MongoDB, JWT y validación de entrada.
- **Cliente**: Expo + React Native + TypeScript.
- **Estructura**: monorepo con paquetes compartidos para dominio, contratos y cliente API.

La decisión clave es separar de forma explícita la capa de presentación de la capa de negocio. La reutilización real no vendrá por compartir componentes web, sino por compartir **modelos, validaciones, DTOs, reglas de negocio y contratos**.

## Contexto técnico

**Lenguaje/versión**: TypeScript en todo el ecosistema.

**Backend**: NestJS como framework principal del servidor.

**Cliente**: Expo para la app móvil y, si se decide, también para web.

**Persistencia**: MongoDB.

**Autenticación**: JWT / tokens de acceso, con refresh si se necesita una sesión más larga.

**Testing**: pruebas unitarias de dominio, pruebas de contrato para el API y smoke tests por plataforma.

**Plataformas objetivo**: web, Android e iOS.

**Tipo de proyecto**: aplicación de producto con UI + API + persistencia.

**Restricciones principales**:
- No mantener Next.js como runtime único para las 3 plataformas.
- No depender de componentes HTML/DOM en la capa compartida.
- No asumir que `package/shared` puede reutilizarse tal cual si el cliente final es Flutter; en esta decisión se descarta Flutter precisamente para maximizar reutilización real con TypeScript.

**Escala esperada**: producto pequeño a mediano, con un dominio CRUD claro y pocas entidades principales.

## Decisión de arquitectura

### Elección principal

La mejor combinación para este repositorio es:

- **Backend**: NestJS
- **Cliente**: Expo
- **Monorepo**: sí
- **Lenguaje común**: TypeScript

### Por qué esta combinación

1. El backend actual es CRUD simple con autenticación, usuarios y entradas. No necesita un framework pesado ni un runtime exótico.
2. NestJS encaja bien con MongoDB, módulos, validación, guards, DTOs y estructuración por capas.
3. Expo permite mantener el ecosistema React/TypeScript y llegar a web + Android + iOS con una sola base de cliente.
4. TypeScript permite compartir de verdad dominio, validaciones, tipos y contratos entre backend y cliente.
5. Docker encaja naturalmente con NestJS como backend separado.

### Lo que se descarta

- **Flutter + Dart**: válido para móviles, pero rompe la posibilidad de compartir código TypeScript con el cliente.
- **Backend Node simple con Express**: demasiado poco estructurado para crecer con orden.
- **Next.js como única base para móvil**: no es una ruta natural ni estable para Android/iOS.

## Estructura propuesta del monorepo

```text
apps/
├── api/                # NestJS: auth, usuarios, entries, settings
├── mobile/             # Expo: app principal para Android/iOS y web opcional
└── web/                # opcional si en el futuro se decide mantener una web separada

packages/
├── shared/             # tipos, DTOs, validaciones, utilidades de dominio
├── api-client/         # cliente HTTP tipado para consumir el backend
├── ui/                 # componentes compartidos si conviene, solo si son cross-platform
└── config/             # ESLint, TSConfig, Tailwind/tema, convenciones

docs/
└── architecture/       # decisiones técnicas, contratos, notas de migración
```

### Decisión de estructura

La estructura base recomendada para arrancar es:

- `apps/api`
- `apps/mobile`
- `packages/shared`
- `packages/api-client`

`apps/web` queda como opcional si se decide conservar una web separada en lugar de usar Expo web como target único.

## Componentes del sistema

### Backend NestJS

Responsabilidades:
- Autenticación y autorización.
- Gestión de usuarios.
- CRUD de entradas.
- Configuración de metas o preferencias.
- Validaciones de negocio.
- Exposición de endpoints REST con documentación OpenAPI.

Capas sugeridas:
- `modules/auth`
- `modules/users`
- `modules/entries`
- `modules/settings`
- `common/guards`, `common/pipes`, `common/interceptors`
- `infra/database` para MongoDB

### Cliente Expo

Responsabilidades:
- Login y registro.
- Dashboard.
- Crear, editar y eliminar entries.
- Ver resumen, actividad reciente y métricas.
- Configuración de usuario.

Capas sugeridas:
- `screens/` o `app/` según Expo Router.
- `features/` por dominio funcional.
- `components/` reutilizables.
- `services/` para llamadas API.
- `state/` o `store/` para estado local o global.

### Paquete compartido

Responsabilidades:
- Entidades de dominio.
- Tipos de request/response.
- Validaciones compartidas.
- Constantes de negocio.
- Reglas puras que no dependan de runtime.

Lo que no debería vivir ahí:
- Componentes DOM.
- Lógica que dependa de React web o React Native.
- Acceso directo a MongoDB o a infraestructura.

## Migración por fases

### Fase 0: Preparación técnica

Objetivo: dejar la base lista para dividir responsabilidades sin romper el producto.

Tareas:
- Definir el monorepo.
- Separar paquetes compartidos.
- Identificar dependencias que hoy están pegadas a Next.
- Marcar lo que se mantiene y lo que se reescribe.

Entregables:
- Estructura de carpetas nueva.
- Primer paquete `shared`.
- Primer cliente API tipado.

### Fase 1: Backend NestJS

Objetivo: sacar la lógica del backend de los route handlers de Next y llevarla a un servidor NestJS.

Tareas:
- Migrar auth.
- Migrar usuarios.
- Migrar entries.
- Migrar settings o metadatos de usuario.
- Exponer documentación de API.

Entregables:
- API Nest funcional.
- Endpoints equivalentes a los actuales.
- Contratos documentados.

### Fase 2: Cliente Expo

Objetivo: reconstruir la UI principal sobre Expo sin perder el comportamiento funcional.

Tareas:
- Login y registro.
- Dashboard principal.
- Formularios de entradas.
- Diálogos y estados de carga.
- Navegación entre pantallas.

Entregables:
- App Expo navegable.
- Flujos críticos funcionando.
- UI consistente en móvil.

### Fase 3: Compartición real de código

Objetivo: mover lo reusable a paquetes compartidos y evitar duplicación.

Tareas:
- Extraer DTOs y validaciones.
- Compartir constantes.
- Compartir normalización de datos.
- Compartir cliente API.

Entregables:
- `packages/shared` estable.
- Menos duplicación entre backend y cliente.

### Fase 4: Hardening y despliegue

Objetivo: dejar la solución lista para operar.

Tareas:
- Configurar Docker para el backend.
- Definir variables de entorno por app.
- Validar build de web, Android e iOS.
- Añadir smoke tests o checks de despliegue.

Entregables:
- Backend containerizable.
- Cliente listo para compilación por plataforma.
- Guía de arranque y validación.

## Riesgos y decisiones abiertas

### Riesgo 1: auth acoplada a NextAuth

La autenticación actual depende de supuestos de Next. Al migrar, conviene pasar a un esquema explícito de API tokenizada.

### Riesgo 2: web versus móvil

Si se quiere una web muy SEO/SSR-first, Expo no siempre será la mejor capa única. En ese caso, se puede mantener `apps/web` aparte, pero eso rompe parte de la promesa de un único cliente.

### Riesgo 3: exceso de compartición

No intentar compartir UI web a toda costa. Lo razonable es compartir dominio y contratos, no necesariamente componentes visuales.

### Riesgo 4: Docker y despliegue

Docker tiene sentido para el backend NestJS. Vercel es más natural para frontend web que para un backend independiente containerizado.

## Validación recomendada

Antes de cerrar la migración, validar estos escenarios:

1. Registro de usuario.
2. Login y renovación de sesión.
3. Listado de entries.
4. Creación, edición y borrado de entries.
5. Carga del dashboard con datos reales.
6. Build de Expo para web.
7. Build de Android.
8. Build de iOS.
9. Arranque del backend Nest en Docker.

## Referencias del repo actual

- [package.json](/Users/franco/projects/jw-service-tracker/package.json)
- [app/layout.tsx](/Users/franco/projects/jw-service-tracker/app/layout.tsx)
- [app/api/entries/route.ts](/Users/franco/projects/jw-service-tracker/app/api/entries/route.ts)
- [app/api/user/route.ts](/Users/franco/projects/jw-service-tracker/app/api/user/route.ts)
- [lib/auth-options.ts](/Users/franco/projects/jw-service-tracker/lib/auth-options.ts)
- [domain/Entry.ts](/Users/franco/projects/jw-service-tracker/domain/Entry.ts)
- [domain/User.ts](/Users/franco/projects/jw-service-tracker/domain/User.ts)
- [repositories/index.ts](/Users/franco/projects/jw-service-tracker/repositories/index.ts)
- [components/dashboard/DashboardProvider.tsx](/Users/franco/projects/jw-service-tracker/components/dashboard/DashboardProvider.tsx)

## Resultado esperado

Al finalizar esta migración, el proyecto debería quedar con:

- Un backend NestJS desacoplado.
- Un cliente Expo para web/móvil.
- Tipos y contratos compartidos en TypeScript.
- Despliegue backend en Docker.
- Una base técnica más clara para seguir creciendo sin arrastrar el acoplamiento actual a Next.js.
