# Guion desde el user journey

El objetivo de esta fase es convertir el **código del proyecto** en un **guion de narración**
que cuente el recorrido real de una persona usando el producto. Un buen guion es la diferencia
entre un vídeo que enseña y uno que solo enumera pantallas.

## 1. Analizar el proyecto para inferir el journey

Trabaja sobre el **directorio padre** (el software a documentar). Busca, en este orden:

1. **Rutas / páginas.** Según el stack:
   - Next.js: `app/**/page.tsx` o `pages/**`.
   - React Router / Vue Router / SvelteKit: archivos de rutas.
   - Un backend con vistas: controladores + templates.
   Esto te da el **mapa de pantallas** y sus URLs (las necesitarás para capturar).
2. **Punto de entrada y navegación.** Landing, login, dashboard, menús/tabs. Revela por dónde
   empieza la gente y cómo se mueve.
3. **Acciones clave.** Formularios, botones primarios, llamadas a API, mutaciones. Son los
   "momentos" del journey (crear, editar, pagar, publicar, filtrar…).
4. **El happy path.** La secuencia mínima desde "llego" hasta "consigo mi objetivo". ESE es el hilo
   del vídeo. Lo secundario (settings, edge cases) se omite o se menciona de pasada.
5. **Tono y vocabulario de marca.** Busca `CLAUDE.md`, `MARCA.md`, `README`, constantes de `brand`.
   Reutiliza nombres propios y jerga exactos (alimentan también el `PROMPT_ES` de Whisper).

Si el journey no queda claro del código, **pregunta al usuario**: "¿cuál es la acción principal que
quieres que el espectador entienda que puede hacer?".

## 2. Estructura del guion

Cuenta una historia con forma: **gancho → recorrido → cierre**.

- **Gancho (3–6 s):** el problema o la promesa, en una frase. Sin nombre de producto largo.
- **Recorrido (el grueso):** 3–6 **escenas**, cada una = una pantalla/estado + una acción concreta.
  Cada escena responde "¿qué hace el usuario aquí y por qué le importa?". Encadena con conectores
  naturales ("ahora", "con un toque", "al instante").
- **Cierre (3–8 s):** el resultado/beneficio + CTA (URL, "empieza gratis", etc.).

Escribe en **"tú"**, frases cortas, una idea por frase. Evita superlativos sin dato y la jerga
interna que el espectador no conoce.

### Entrega doble (esto es clave para las fases siguientes)

1. **Texto corrido para ElevenLabs** — solo lo que se narra, sin acotaciones ni nombres de archivo.
2. **Tabla de escenas** — el puente entre la narración y la animación. Una fila por escena:

| # | Narración (frase) | Ruta / pantalla | Dispositivo | Elemento a señalar (hotspot) | Acción |
|---|---|---|---|---|---|
| 1 | "Entra y verás todo tu panel" | `/dashboard` | mobile | tarjeta "Resumen" | mostrar |
| 2 | "Crea uno nuevo con un toque" | `/dashboard` | mobile | botón "Nuevo" | tap |
| 3 | "Rellena y guarda" | `/new` | mobile | botón "Guardar" | tap |

Los nombres de la columna "hotspot" se convertirán en claves en `capture.config.mjs` y en
`hotspots.json`; los de "Ruta" en `path`; "Dispositivo" en `device`. **La columna "Dispositivo"
la fija el formato (Fase 1):** todo `mobile` si el vídeo es vertical, todo `desktop` si es
horizontal — no la mezcles salvo petición expresa.

### Ejemplo mínimo de entrega (vertical, app de gastos)

**Texto para ElevenLabs** (lo que oirá el espectador):
> "¿Anotas tus gastos en mil sitios? Aquí no. Abre la app y verás tu mes de un vistazo. Para
> registrar uno nuevo, toca el botón de añadir, pon el importe y guarda. Listo: tu resumen se
> actualiza al instante. Empieza gratis en tu-dominio.com."

**Tabla de escenas** (el puente a las fases 5–6):

| # | Narración | Ruta | Dispositivo | Hotspot | Acción |
|---|---|---|---|---|---|
| 1 | "Abre la app y verás tu mes de un vistazo" | `/dashboard` | mobile | `resumen-mes` | mostrar |
| 2 | "toca el botón de añadir" | `/dashboard` | mobile | `btn-nuevo` | tap |
| 3 | "pon el importe y guarda" | `/nuevo` | mobile | `btn-guardar` | tap |
| 4 | "tu resumen se actualiza al instante" | `/dashboard` | mobile | `resumen-mes` | mostrar |

Esta doble entrega (texto + tabla) es **obligatoria** antes de pasar a ElevenLabs: es lo que hace
que las fases siguientes (captura y cursor sincronizado) tengan a dónde agarrarse. No saltes a
escribir `capture.config.mjs` ni `buildSections()` sin haber confirmado el guion con el usuario.

## 3. Duración según formato

La narración define la duración del vídeo. Ajusta el ritmo al destino:

- **Vertical (Reels/Shorts/TikTok):** 20–40 s. Ritmo ágil, 3–5 escenas, una acción por escena.
  La gente lo ve en móvil y sin sonido a veces → apóyate en subtítulos (Whisper) y en el cursor.
- **Horizontal (YouTube/landing/demo):** 40–120 s. Permite más detalle, pantallas de escritorio,
  2–3 acciones por pantalla, explicaciones algo más largas.

Regla práctica: ~2.5 palabras/segundo en español. Un guion vertical de 30 s ≈ 70–80 palabras.

## 4. Checklist del guion
- [ ] Cuenta un **recorrido**, no una lista de features.
- [ ] Cada escena tiene **una** acción clara y un porqué.
- [ ] Usa el **vocabulario de marca** del proyecto.
- [ ] Duración acorde al **formato** elegido.
- [ ] Entregadas **las dos** salidas: texto para ElevenLabs + tabla de escenas.
- [ ] Confirmado con el usuario antes de pasar a ElevenLabs.
