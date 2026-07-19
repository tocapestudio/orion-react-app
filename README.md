# Orion React

App web (PWA) para entrenamiento de tiempo de reacción y capacidades cognitivas mediante nodos físicos con LEDs, conectados por Bluetooth Low Energy (BLE).

## Qué es

Un profesional (entrenador/preparador físico) conecta uno o varios nodos ESP32 (matriz de LEDs 8x8 + buzzer + sensores) al móvil/PC por BLE, configura un ejercicio y el deportista reacciona a los estímulos (colores, formas, números, flechas) que se muestran en los nodos. La app registra los tiempos de reacción, guarda el historial por deportista/club en Supabase y calcula estadísticas y logros (gamificación).

## Stack

- Frontend: un único `index.html` (HTML/CSS/JS vanilla, sin build step), PWA con Service Worker (`sw.js`) y manifest.
- Backend: Supabase (Postgres + Auth), acceso vía REST (`db.get/post/patch/delete` en `index.html`, no se usa el SDK JS de Supabase).
- Hardware: nodos ESP32 por BLE (Web Bluetooth API) — el firmware vive en un repo aparte, ver más abajo.

## Repos relacionados

| Repo | Qué es | Remoto |
|---|---|---|
| Este (`orion-react-app`) | App web, repo público | `origin` → `github.com/tocapestudio/orion-react-app` |
| `orion-react-vercel` | Espejo usado solo para desplegar en Vercel | remoto `vercel` en este mismo working copy |
| `OrionNode` (privado) | Firmware ESP32 de los nodos | repo aparte |

## Ejecutar en local

Es una PWA con Service Worker y Web Bluetooth, así que **no vale abrir el `index.html` con `file://`** — hace falta servirlo por HTTP:

```bash
npx http-server . -p 8934
# o: python -m http.server 8934
```

Luego abrir `http://localhost:8934/index.html`. Web Bluetooth solo funciona en `localhost` o HTTPS.

## Desplegar

Dos remotos, hay que subir a los dos:

```bash
git push origin main
git push vercel main --force
```

`origin` es el repo "fuente" en GitHub; `vercel` es un espejo que Vercel vigila para desplegar automáticamente.

## Acceso / login

El login es una única "clave de acceso" (sin email visible) que mapea internamente a un email fijo + contraseña de Supabase Auth. La clave en sí **no está en este repo** (es público) — está documentada en el repo privado del firmware (`OrionNode`).

## Estructura de la app (resumen)

- **Ejercicios**: Reacción Flash, Discriminación (buscar objetivo / buscar el diferente), Par/Impar, Stroop, Se Busca (patrón), Simón dice, Chrono, y ejercicios "Avanzado" (paso a paso configurable a mano).
  - Todos los ejercicios con valores "Aleatorio" (Flash, Discriminación, Se Busca) permiten restringir qué valores concretos pueden salir (checkboxes junto al selector de valor).
- **Datos**: histórico por deportista/club, gráficas de tendencia, progreso/gamificación.
- **Configuración**: conexión BLE a nodos, brillo, volumen del buzzer, actualización OTA del firmware.

## Notas de BLE

Los nodos exponen un servicio BLE con una característica de comandos (`cmd`, JSON) y una de eventos. Comandos principales: `show` (mostrar estímulo), `off`, `identify`, `preview` (solo pintar, sin sonar ni contar como estímulo), `brightness`, `volume`, `buzzer`, `ping`, `cancel`, `ota_enable`/`ota_disable`. El detalle completo del protocolo está en el firmware (`OrionNode`).
