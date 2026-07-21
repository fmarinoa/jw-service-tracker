# Manifiesto de Estilos y Paleta de Colores

Este documento establece la identidad visual oficial de **JW Service Tracker** (`@jw-tracker/client`). Define la paleta de colores oficial, los tokens de diseño y las reglas que **deben respetarse obligatoriamente** en todos los componentes y pantallas futuras de la aplicación.

---

## 🎨 Filosofía de Diseño: *Warm Minimalist (Terracotta & Cream)*

La interfaz de la aplicación busca transmitir calidez, serenidad, elegancia y limpieza visual. Se basa en una paleta orgánica con tonos crema cálidos, texto marrón profundo y un acento Terracota distinguido.

---

## 🖌️ Paleta de Colores Oficial (Tokens de Tailwind / NativeWind)

La fuente de la verdad de los colores de la aplicación se encuentra en `apps/client/tailwind.config.js`:

| Token | Código Hexadecimal | Propósito / Uso | Clase Tailwind / NativeWind |
| :--- | :--- | :--- | :--- |
| **`background`** | `#fdfbf7` | Fondo principal de la aplicación (Crema cálido) | `bg-background` |
| **`foreground`** | `#2d241e` | Texto principal y títulos (Marrón café profundo) | `text-foreground` |
| **`card`** | `#faf6f0` | Fondo de tarjetas, paneles y contenedores elevados | `bg-card` |
| **`card-foreground`** | `#2d241e` | Texto primario sobre tarjetas | `text-card-foreground` |
| **`primary`** | `#b86a3d` | Color de acento de marca y botones primarios (Terracota) | `bg-primary` |
| **`primary-foreground`** | `#fdfbf7` | Texto o iconos sobre elementos `primary` | `text-primary-foreground` |
| **`muted`** | `#e8e2d9` | Fondos de botones secundarios, elementos desactivados o divisores | `bg-muted` |
| **`muted-foreground`** | `#7b726c` | Texto secundario, subtítulos, etiquetas y descripciones | `text-muted-foreground` |
| **`border`** | `#e8e2d9` | Bordes de tarjetas, modales y campos de formulario | `border-border` |

---

## 🚦 Colores Auxiliares de Estado

Para estados del sistema (alertas, errores y éxito), se utilizan los siguientes tonos coordinados:

* **Error / Eliminar**: `#dc2626` (`bg-red-600` / `text-red-600`)
* **Éxito / Progreso**: `#059669` (`bg-emerald-600` / `text-emerald-600`)

---

## 📐 Reglas Visuales Obligatorias para Futuros Desarrollos

1. **Uso Exclusivo de Tokens Semánticos**:
   * **Prohibido** usar colores genéricos o fríos de Tailwind (ej. `bg-gray-100`, `bg-blue-500`, `text-black`, `bg-white`).
   * **Siempre** se deben usar los tokens semánticos: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`.

2. **Radios de Borde (Border Radius)**:
   * **Tarjetas, Modales y Contenedores**: Usar `rounded-2xl` o `rounded-3xl`.
   * **Botones e Insumos (Inputs)**: Usar `rounded-xl` o `rounded-2xl`.
   * **Badges e Iconos circulares**: Usar `rounded-full`.

3. **Sombras y Elevación**:
   * Usar sombras suaves y sutiles (`shadow-sm` o `shadow-md`) para mantener la interfaz plana pero estructurada.

4. **Interactividad**:
   * Todos los componentes interactivos (`Pressable`) deben contar con estado activo suave utilizando opacidad reducida o variante equivalente (`active:bg-primary/90`, `active:bg-muted/80`).
