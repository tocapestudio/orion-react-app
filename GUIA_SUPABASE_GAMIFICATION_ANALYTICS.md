# 🚀 GUÍA: Supabase, Gamificación y Análisis de Tendencias

## ÍNDICE
1. [Supabase Integration](#supabase-integration)
2. [Gamification](#gamification)
3. [Trend Analysis](#trend-analysis)
4. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Supabase Integration

### ¿Qué es?
Sincronización de datos en nube. Guarda sesiones, atletas y evaluaciones en una base de datos PostgreSQL profesional.

### Instalación

**1. Crear proyecto en Supabase**
- Ir a https://supabase.com
- Crear proyecto gratuito
- Copiar `API URL` y `ANON KEY`

**2. Crear tablas en Supabase**

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
```

**3. Habilitar RLS (Row Level Security)**

```sql
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas: Cada usuario solo ve sus propios datos
CREATE POLICY "Users can view own sessions" ON training_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON training_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Uso en la App

**1. Inicializar**
```javascript
// Una sola vez al cargar la app
await window.OrionImprovements.SupabaseIntegration.init(
  'https://yourproject.supabase.co',
  'your-anon-key'
);

// O guardar configuración
localStorage.setItem('supabase_config', JSON.stringify({
  apiUrl: 'https://yourproject.supabase.co',
  apiKey: 'your-anon-key'
}));
```

**2. Autenticar usuario**
```javascript
// Registrarse
await window.OrionImprovements.SupabaseIntegration.signup(
  'paula@example.com',
  'password123',
  'Paula Coach'
);

// Iniciar sesión
await window.OrionImprovements.SupabaseIntegration.authenticate(
  'paula@example.com',
  'password123'
);
```

**3. Guardar sesión en la nube**
```javascript
const sessionData = {
  athlete_id: '123',
  exerciseName: 'Reacción Flash',
  exerciseType: 'flash',
  reactionTimes: [0.450, 0.520, 0.480],
  results: ['ok', 'ok', 'miss'],
  notes: 'Buena sesión',
  duration: 300
};

const saved = await window.OrionImprovements.SupabaseIntegration
  .saveTrainingSession(sessionData);
console.log('Sesión guardada:', saved);
```

**4. Obtener histórico**
```javascript
// Todas las sesiones del usuario (últimas 50)
const mySessions = await window.OrionImprovements.SupabaseIntegration
  .getUserSessions(50);

// Sesiones de un atleta específico
const athleteSessions = await window.OrionImprovements.SupabaseIntegration
  .getAthleteSessions('athlete-id', 100);
```

**5. Guardar atleta**
```javascript
const athlete = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  sport: 'football',
  position: 'Delantero',
  dorsal: 10,
  birthDate: '2005-03-15',
  gender: 'Masculino',
  dominantHand: 'Derecha',
  dominantFoot: 'Derecho'
};

await window.OrionImprovements.SupabaseIntegration.saveAthlete(athlete);
```

**6. Sincronización automática**
```javascript
// Se sincroniza automáticamente cuando vuelves online
// Pero puedes forzarla:
await window.OrionImprovements.SupabaseIntegration.syncOfflineSessions();
```

---

## Gamification

### ¿Qué es?
Sistema de puntos, logros, retos y niveles. Gamifica el entrenamiento.

### Características

**Logros desbloqueables:**
- ⚡ Rápido (< 300ms)
- 🔥 Velocidad de rayo (< 250ms)
- 🎯 Perfecto (100% precisión)
- ✅ Puntería (90%+ precisión)
- 🧊 Consistente
- 🚀 Comienzo (primera sesión)
- 💪 Dedicado (10 sesiones)
- 🏆 Campeón (50 sesiones)
- 👑 Leyenda (100 sesiones)

**Retos activos:**
- 📅 Desafío Diario: Completa 3 sesiones en un día
- ⚡ Desafío de Velocidad: 5 intentos bajo 400ms
- 🎯 Desafío de Precisión: 3 sesiones con 95%+

**Sistema de puntos:**
- Base: 25 puntos por sesión completa
- Bonificación velocidad: hasta 50 puntos
- Bonificación precisión: hasta 50 puntos
- Bonificación consistencia: hasta 40 puntos
- Bonificación logro: hasta 500 puntos

### Uso

**1. Procesar sesión completada**
```javascript
const result = window.OrionImprovements.Gamification
  .processSessionCompletion(sessionData);

console.log('Nuevos logros:', result.newAchievements);
console.log('Puntos ganados:', result.pointsEarned);
console.log('Puntos totales:', result.totalPoints);
console.log('Nivel:', result.level);
```

**2. Ver logros**
```javascript
// Logros desbloqueados
const unlocked = window.OrionImprovements.Gamification.getUnlockedAchievements();
console.log('Logros:', unlocked);

// Logros pendientes
const pending = window.OrionImprovements.Gamification.getPendingAchievements();
console.log('Por desbloquear:', pending);
```

**3. Ver retos**
```javascript
// Retos activos con progreso
const active = window.OrionImprovements.Gamification.getActiveChallenges();
active.forEach(c => {
  console.log(`${c.name}: ${c.progress}% (${c.current}/${c.target})`);
});

// Retos completados
const completed = window.OrionImprovements.Gamification.getCompletedChallenges();
```

**4. Perfil del jugador**
```javascript
const profile = window.OrionImprovements.Gamification.getPlayerProfile();
console.log(`Nivel ${profile.level} - ${profile.totalPoints} puntos`);
console.log(`Logros desbloqueados: ${profile.unlockedAchievements}/${profile.totalAchievements}`);
```

**5. Leaderboard local**
```javascript
const athletes = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' },
  { id: '3', name: 'Pedro' }
];

const leaderboard = window.OrionImprovements.Gamification
  .createLocalLeaderboard(athletes);

console.log(leaderboard);
// [
//   { athlete: 'Juan', points: 2500, sessions: 25, avgAccuracy: 92.3 },
//   { athlete: 'María', points: 2100, sessions: 20, avgAccuracy: 91.0 },
//   { athlete: 'Pedro', points: 1800, sessions: 18, avgAccuracy: 88.5 }
// ]
```

---

## Trend Analysis

### ¿Qué es?
Análisis estadístico de progreso, predicciones y generación de gráficos.

### Análisis disponibles

**1. Progreso a lo largo del tiempo**
```javascript
const progress = window.OrionImprovements.TrendAnalysis
  .analyzeProgressOverTime(sessions);

console.log(progress);
// {
//   sessions: 10,
//   timeTrend: 'mejora',
//   timeImprovement: '8.5%',
//   accuracyTrend: 'mejora',
//   accuracyImprovement: '2.3%',
//   currentAvgTime: '0.485',
//   currentAccuracy: '92.5'
// }
```

**2. Comparar períodos (ej: últimos 7 días vs anterior)**
```javascript
const comparison = window.OrionImprovements.TrendAnalysis
  .compareTimePeriods(sessions, 7);

console.log(comparison);
// {
//   period: '7 días',
//   recent: { sessions: 8, avgTime: '0.48', avgAccuracy: '92.5' },
//   older: { sessions: 15, avgTime: '0.52', avgAccuracy: '90.2' },
//   improvement: { speed: '7.7%', accuracy: '2.3%', trend: 'mejora' }
// }
```

**3. Análisis por tipo de ejercicio**
```javascript
const byExercise = window.OrionImprovements.TrendAnalysis
  .analyzeByExerciseType(sessions);

console.log(byExercise);
// {
//   flash: { sessions: 5, avgTime: '0.45', avgAccuracy: '93.0', ... },
//   stroop: { sessions: 3, avgTime: '0.52', avgAccuracy: '88.0', ... },
//   ...
// }
```

**4. Identificar puntos débiles**
```javascript
const weakPoints = window.OrionImprovements.TrendAnalysis
  .identifyWeakPoints(sessions);

console.log(weakPoints);
// {
//   weakAccuracy: { value: '82.5', recommendation: 'Enfócate en discriminación...' },
//   slowest: { value: '0.650', recommendation: 'Trabaja en velocidad...' },
//   inconsistent: { value: '0.120', recommendation: 'Entrena consistencia...' }
// }
```

**5. Reporte completo**
```javascript
const fullReport = window.OrionImprovements.TrendAnalysis
  .generateFullReport(sessions);

console.log(fullReport);
// Incluye: summary, progress, comparison, byExercise, weakPoints
```

**6. Predicción de futuros valores**
```javascript
const times = sessions.map(s => parseFloat(
  window.OrionImprovements.SessionStats.calculateStats(s).average
));

const prediction = window.OrionImprovements.TrendAnalysis
  .predictFutureValue(times, 7);

console.log(prediction);
// { predicted: '0.425', daysAhead: 7, confidence: 45.2 }
```

### Datos para gráficos

**Para Chart.js o similar:**

```javascript
// Gráfico de línea: Tendencia de tiempo
const timeChart = window.OrionImprovements.TrendAnalysis
  .getChartData_TimeTrend(sessions);

// Gráfico de línea: Tendencia de precisión
const accuracyChart = window.OrionImprovements.TrendAnalysis
  .getChartData_AccuracyTrend(sessions);

// Gráfico de barras: Por ejercicio
const exerciseChart = window.OrionImprovements.TrendAnalysis
  .getChartData_ByExercise(sessions);

// Gráfico radar: Habilidades actuales
const skillsChart = window.OrionImprovements.TrendAnalysis
  .getChartData_Skills(sessions);
```

---

## Ejemplos de Uso

### Ejemplo 1: Flujo completo de una sesión

```javascript
// 1. Completar sesión
const sessionData = {
  exerciseName: 'Reacción Flash',
  exerciseType: 'flash',
  reactionTimes: [0.450, 0.520, 0.480],
  results: ['ok', 'ok', 'miss'],
  notes: 'Buena sesión'
};

// 2. Procesar gamificación
const gameResult = window.OrionImprovements.Gamification
  .processSessionCompletion(sessionData);

console.log(`🎉 Ganaste ${gameResult.pointsEarned} puntos!`);
gameResult.newAchievements.forEach(a => {
  console.log(`🏆 ${a.icon} ${a.name}: ${a.points}pts`);
});

// 3. Guardar en nube
await window.OrionImprovements.SupabaseIntegration
  .saveTrainingSession(sessionData);

// 4. Actualizar análisis
const analysis = window.OrionImprovements.TrendAnalysis
  .generateFullReport(allSessions);
```

### Ejemplo 2: Dashboard con análisis

```javascript
// Obtener datos de atleta
const athleteSessions = await window.OrionImprovements.SupabaseIntegration
  .getAthleteSessions('athlete-id');

// Progreso
const progress = window.OrionImprovements.TrendAnalysis
  .analyzeProgressOverTime(athleteSessions);

// Comparación últimos 7 días
const comparison = window.OrionImprovements.TrendAnalysis
  .compareTimePeriods(athleteSessions, 7);

// Perfil gamer
const profile = window.OrionImprovements.Gamification.getPlayerProfile();

// Mostrar en HTML
document.getElementById('progress').textContent = 
  `${progress.timeImprovement} más rápido`;
document.getElementById('comparison').textContent = 
  `${comparison.improvement.speed} de mejora`;
document.getElementById('level').textContent = 
  `Nivel ${profile.level} - ${profile.totalPoints} pts`;
```

### Ejemplo 3: Panel de retos y logros

```javascript
// Retos activos
const challenges = window.OrionImprovements.Gamification
  .getActiveChallenges();

challenges.forEach(c => {
  const progressBar = `[${'█'.repeat(c.progress/10)}${' '.repeat(10-c.progress/10)}] ${c.progress}%`;
  console.log(`${c.icon} ${c.name}: ${progressBar} +${c.reward}pts`);
});

// Logros próximos
const pending = window.OrionImprovements.Gamification
  .getPendingAchievements()
  .slice(0, 5);

pending.forEach(a => {
  console.log(`${a.icon} ${a.name}: ${a.description}`);
});
```

---

## Integración HTML

Para mostrar estos datos en tu index.html, puedes actualizar secciones existentes:

```html
<!-- Dashboard de usuario -->
<div id="userProfile">
  <span id="userLevel"></span>
  <span id="userPoints"></span>
</div>

<!-- Retos -->
<div id="challenges"></div>

<!-- Logros -->
<div id="achievements"></div>

<!-- Gráficos -->
<canvas id="timeChart"></canvas>
<canvas id="accuracyChart"></canvas>
<canvas id="skillsChart"></canvas>

<script>
// Al cargar sesión
const result = Gamification.processSessionCompletion(session);
document.getElementById('userLevel').textContent = `Nivel ${result.level}`;
document.getElementById('userPoints').textContent = `${result.totalPoints}pts`;
</script>
```

---

## 📊 Resumen de Archivos

| Archivo | Funcionalidad | Líneas |
|---------|---------------|--------|
| supabase-integration.js | Cloud sync | 400+ |
| gamification.js | Logros, retos, puntos | 450+ |
| analytics.js | Análisis, gráficos, predicciones | 500+ |

---

**¿Preguntas?** Todos los módulos están bajo `window.OrionImprovements.{NombreModulo}`

Última actualización: 15 junio 2026
