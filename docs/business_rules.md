# Reglas de Negocio: Registro de Tiempo y Reporte Mensual

Este documento define la lógica de negocio para la gestión de sesiones de servicio y la generación de reportes mensuales en **JW Service Tracker**.

---

## 1. Atributos de una Sesión de Servicio

En cada sesión de predicación registrada, **únicamente** se registran y procesan los siguientes datos de actividad:

- **Tiempo de Servicio:**
  - `hours` (Horas): Número entero mayor o igual a 0.
  - `minutes` (Minutos): Número entero entre 0 y 59.
  - _Restricción:_ El tiempo total de la sesión (`hours * 60 + minutes`) debe ser mayor a 0. No se permiten registros vacíos (0 horas y 0 minutos).
- **Tipo de Sesión (`type`):**
  Clasificación obligatoria que define el canal o modalidad del servicio. Los tipos permitidos son:
  - `house_to_house` (Predicación de casa en casa / pública)
  - `revisits` (Revisitas)
  - `bible_study` (Estudios bíblicos)
  - `other` (Otros tipos de servicio, ej. LDC, metropolitano, etc.)
- **Notas:**
  - `notes` (Opcional): Comentario adicional limitado a un máximo de 1000 caracteres.
- **Fecha (`preachingDate`):**
  - Fecha de la actividad representada como timestamp en milisegundos UTC (enviado por el FE). No puede ser una fecha futura.

> [!NOTE]
> De acuerdo con las pautas vigentes, se han eliminado del registro detallado del día las métricas secundarias como publicaciones (libros/folletos), videos reproducidos, número de revisitas individuales o número de cursos bíblicos iniciados/activos.

---

## 2. Lógica del Reporte a Fin de Mes

Al final de cada mes, se consolidan todos los registros correspondientes a dicho período bajo las siguientes reglas:

### 2.1. Suma de Tiempos

Para obtener el tiempo acumulado de todas las sesiones de un mes:

1.  Se suman todos los minutos de las sesiones del mes: $M_{total} = \sum (\text{minutes})$.
2.  Se suman todas las horas de las sesiones del mes: $H_{total} = \sum (\text{hours})$.
3.  Se calcula el total de minutos absolutos del mes:
    $$T_{minutos} = (H_{total} \times 60) + M_{total}$$

### 2.2. Redondeo Hacia Abajo (Horas Completas)

El reporte formal a fin de mes **solo requiere e informa horas completas**. Los minutos remanentes se descartan en el cálculo final:

- El total de horas reportadas se calcula aplicando la función de redondeo hacia abajo (piso entero):
  $$H_{reportadas} = \lfloor \frac{T_{minutos}}{60} \rfloor$$

#### Ejemplo de Cálculo:

Si durante el mes de Mayo un publicador registra las siguientes sesiones:

- Sesión 1: 1 hora y 45 minutos.
- Sesión 2: 2 horas y 30 minutos.
- Sesión 3: 45 minutos.

1.  **Suma total de horas:** $1 + 2 + 0 = 3\text{ hrs}$.
2.  **Suma total de minutos:** $45 + 30 + 45 = 120\text{ min}$ (equivalente a $2\text{ hrs}$ y $0\text{ min}$).
3.  **Tiempo acumulado real:** $5\text{ horas y } 0\text{ minutos}$.
4.  **Horas reportadas:** $5$.

Si el acumulado total hubiera sido **48 horas y 55 minutos**, el cálculo de reporte formal descarta los 55 minutos:

- $$T_{minutos} = (48 \times 60) + 55 = 2935\text{ minutos}$$
- $$H_{reportadas} = \lfloor \frac{2935}{60} \rfloor = 48\text{ horas}$$

---

## 3. Formato de Exportación del Reporte (WhatsApp)

El reporte rápido a fin de mes generado para enviar al secretario de congregación adopta el siguiente formato minimalista simplificado:

```text
📖 *Informe de Actividad*
📅 *Mes:* [Nombre del Mes] [Año]
👤 *Publicador:* [Nombre del Usuario]

⏱️ *Total de horas:* [Ej: 48]

Generado por *JW Service Tracker*
```
