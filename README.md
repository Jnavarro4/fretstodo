# FretsToDo 🎸✅

**Practice with Purpose.** Tu práctica de guitarra de hoy, tachada.

Plataforma web/PWA de entrenamiento para guitarristas. Responde tres preguntas:
**¿qué debo practicar hoy?, ¿estoy mejorando? y ¿qué debo mejorar?**

## Estado actual (v0.2)

| Módulo | Estado |
|---|---|
| **Hoy** — rutina diaria tipo to-do con progreso y resumen | ✅ |
| **Interval Trainer** — 12 intervalos, dirección asc/desc/aleatoria, auto-avance, respuesta | ✅ |
| **Metrónomo** — 30–260 BPM, tap tempo, 8 compases, subdivisiones, entrenador de pulso | ✅ |
| PWA instalable (Safari iPhone / Chrome Android) | ✅ |
| ES / EN con detección de idioma | ✅ |
| Persistencia local (localStorage, reinicio diario de rutina) | ✅ |
| Estadísticas avanzadas, FretScore, Coach IA | 🔜 roadmap |

## Stack

React 19 · TypeScript · Vite · vite-plugin-pwa · CSS con tokens de diseño propios
(sin frameworks de UI). Sin backend: todo corre en el cliente.

## Desarrollo

```bash
npm install
npm run dev       # servidor local
npm run build     # tsc + build de producción con PWA
npm run preview   # probar el build (necesario para ver el service worker)
```

## Deploy en Vercel

1. Subí este repo a GitHub.
2. En Vercel: **Add New Project** → importar el repo.
3. Framework preset: **Vite** (detecta build `npm run build`, output `dist/`).
4. Deploy. Para probar como PWA en iPhone: abrir en Safari → Compartir → **Añadir a pantalla de inicio**.

## Arquitectura

```
src/
  engine/         # lógica pura, sin UI (requisito del doc maestro)
    intervalEngine.ts   # modelo de intervalos + generador aleatorio
    metronome.ts        # Web Audio, scheduler de lookahead, gap trainer
  i18n/           # diccionarios ES/EN + contexto (ningún string hardcodeado)
  components/     # Switch, ProgressBar, Segmented, Stepper
  screens/        # TodayScreen, TrainScreen, MetronomeScreen
  hooks/          # useLocalStorage
  styles/         # tokens de diseño (Orange Tiger #FB6A1A) + estilos globales
```

**Regla visual de marca:** las barras que se llenan son Orange Tiger; los números
y porcentajes permanecen en blanco.

## Decisiones pendientes con el cliente

- Código digital exacto del Pantone Orange Tiger (hoy: `#FB6A1A` aproximado).
- Tipografía definitiva (hoy: Space Grotesk + Inter).
- Dominio: verificar `fretstodo.com` / `frets2do.com`.
- Backend (Supabase/Firebase) cuando entren cuentas y sincronización.
