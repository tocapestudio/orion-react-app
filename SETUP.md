# ⚙️ GUÍA DE INSTALACIÓN Y SETUP

## Archivos a incluir en index.html

Agrega estos scripts antes del cierre de `</body>`:

```html
<!-- Módulos de mejoras -->
<script src="improvements.js"></script>
<script src="sw.js"></script>
<script src="supabase-integration.js"></script>
<script src="gamification.js"></script>
<script src="analytics.js"></script>

<!-- Opcional: Chart.js para gráficos -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</body>
```

---

## Setup Inicial (Una sola vez)

### 1. Configurar Supabase (opcional pero recomendado)

**En la consola del navegador:**

```javascript
// Guardar credenciales de Supabase
localStorage.setItem('supabase_config', JSON.stringify({
  apiUrl: 'https://YOUR_PROJECT.supabase.co',
  apiKey: 'YOUR_ANON_KEY'
}));

// Verificar que cargó correctamente
console.log(window.OrionImprovements.SupabaseIntegration);
```

**Dónde obtener las credenciales:**
1. Ir a https://supabase.com
2. Crear proyecto gratuito
3. Ir a Settings → API
4. Copiar "Project URL" y "Anon Key"

### 2. Ejecutar Scripts de Supabase (una sola vez)

En el editor SQL de Supabase, ejecutar:

```sql
-- Tabla de sesiones
CREATE TABLE training_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  athlete_id TEXT,
  exercise_name TEXT,
  exercise_type TEXT,
  reaction_times JSONB,
  results JSONB,
  statistics JSONB,
  notes TEXT,
  session_duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de atletas
CREATE TABLE athletes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  sport TEXT,
  position TEXT,
  dorsal INTEGER,
  birth_date DATE,
  gender TEXT,
  dominant_hand TEXT,
  dominant_foot TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de evaluaciones
CREATE TABLE evaluations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  athlete_id BIGINT REFERENCES athletes(id),
  template_name TEXT,
  test_type TEXT,
  values JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own sessions" ON training_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON training_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own athletes" ON athletes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own athletes" ON athletes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations" ON evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Flujo de Uso (Día a día)

### 1. Al iniciar la app

```javascript
// Los módulos se cargan automáticamente
console.log(window.OrionImprovements); // Verificar que están disponibles

// Si quieres usar Supabase, autenticarse
await window.OrionImprovements.SupabaseIntegration.authenticate(
  'email@example.com',
  'password'
);
```

### 2. Después de completar una sesión

```javascript
const sessionData = {
  athlete_id: 'john-doe-123',
  exerciseName: 'Reacción Flash',
  exerciseType: 'flash',
  reactionTimes: [0.450, 0.520, 0.480],
  results: ['ok', 'ok', 'miss'],
  notes: 'Sesión buena',
  duration: 300
};

// 1. Procesar gamificación (automático de logros/puntos)
const gameResult = window.OrionImprovements.Gamification
  .processSessionCompletion(sessionData);
console.log(`Ganaste ${gameResult.pointsEarned} puntos!`);

// 2. Guardar en nube (si hay conexión)
await window.OrionImprovements.SupabaseIntegration
  .saveTrainingSession(sessionData);

// 3. Actualizar análisis
const analysis = window.OrionImprovements.TrendAnalysis
  .generateFullReport(allSessions);
```

### 3. Ver análisis

```javascript
// Obtener sesiones de atleta
const sessions = await window.OrionImprovements.SupabaseIntegration
  .getAthleteSessions('athlete-id');

// Análisis
const progress = window.OrionImprovements.TrendAnalysis
  .analyzeProgressOverTime(sessions);

// Generar gráficos (si tienes Chart.js)
const chartData = window.OrionImprovements.TrendAnalysis
  .getChartData_TimeTrend(sessions);

// Crear gráfico
new Chart(document.getElementById('myChart'), {
  type: 'line',
  data: chartData,
  options: { responsive: true }
});
```

---

## Verificación de Instalación

Ejecutar en consola del navegador:

```javascript
// Verificar módulos cargados
const modules = [
  'OfflineStorage',
  'SessionStats', 
  'LiveDashboard',
  'AdvancedExerciseConfig',
  'DataExport',
  'SupabaseIntegration',
  'Gamification',
  'TrendAnalysis'
];

modules.forEach(mod => {
  if (window.OrionImprovements[mod]) {
    console.log(`✅ ${mod}`);
  } else {
    console.error(`❌ ${mod} no cargado`);
  }
});

// Resultado esperado:
// ✅ OfflineStorage
// ✅ SessionStats
// ✅ LiveDashboard
// ✅ AdvancedExerciseConfig
// ✅ DataExport
// ✅ SupabaseIntegration
// ✅ Gamification
// ✅ TrendAnalysis
```

---

## Troubleshooting

### Problema: "SupabaseIntegration is not defined"
**Solución:** Verificar que supabase-integration.js se cargó correctamente en index.html

### Problema: "Gamification data not persisting"
**Solución:** Verificar que localStorage no está deshabilitado en el navegador

### Problema: "Sessions not syncing to Supabase"
**Solución:** 
1. Verificar que tiene conexión a internet
2. Verificar que se autenticó antes de guardar
3. Ver la consola del navegador para errores de red

### Problema: "Chart not showing"
**Solución:** Verificar que Chart.js está cargado (`window.Chart` debe existir)

---

## Estructura de Carpetas (Recomendada)

```
Orion React APP/
├── index.html
├── improvements.js
├── sw.js
├── supabase-integration.js
├── gamification.js
├── analytics.js
├── GUIA_SUPABASE_GAMIFICATION_ANALYTICS.md
├── SETUP.md (este archivo)
└── assets/
    └── (imágenes, fuentes, etc)
```

---

## Notas Importantes

### Sobre privacidad y seguridad
- Las credenciales de Supabase están en localStorage (seguro en HTTPS)
- RLS está habilitado: cada usuario solo ve sus propios datos
- No se guarda información sensible en localStorage

### Sobre rendimiento
- Los módulos son ligeros (no agrega más de 100KB)
- Trabajan offline sin problemas
- Sincronización en background no bloquea la UI

### Sobre compatibilidad
- Chrome, Firefox, Safari, Edge (últimas versiones)
- Service Worker requiere HTTPS en producción
- IndexedDB disponible en todos los navegadores modernos

---

## Recursos

- 📖 [Guía completa de módulos](GUIA_SUPABASE_GAMIFICATION_ANALYTICS.md)
- 🔐 [Supabase docs](https://supabase.com/docs)
- 📊 [Chart.js docs](https://www.chartjs.org/docs/latest/)
- 📱 [Service Worker docs](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Última actualización:** 15 junio 2026
