# 🚀 API REFERENCE - Guía Rápida

## 📍 Acceso a los Módulos

Todos los módulos están disponibles bajo el namespace `window.OrionImprovements`:

```javascript
window.OrionImprovements.Gamification
window.OrionImprovements.TrendAnalysis
window.OrionImprovements.SupabaseIntegration
window.OrionImprovements.SessionStats
window.OrionImprovements.OfflineStorage
// ... etc
```

---

## 🎮 GAMIFICATION - Sistema de Logros y Puntos

### Procesar Sesión
```javascript
const result = OrionImprovements.Gamification.processSessionCompletion(sessionData);

// Retorna:
{
  newAchievements: [{ icon: '⚡', name: 'Rápido', points: 50 }, ...],
  pointsEarned: 145,
  totalPoints: 2450,
  level: 5,
  nextLevelProgress: 450
}
```

### Ver Logros
```javascript
// Desbloqueados
const unlocked = OrionImprovements.Gamification.getUnlockedAchievements();
// → [{ id: 'speed_under_300ms', name: '⚡ Rápido', points: 50, unlockedAt: '...' }, ...]

// Pendientes
const pending = OrionImprovements.Gamification.getPendingAchievements();
// → [{ id: 'perfect_score', name: '🎯 Perfecto', points: 150, ... }, ...]
```

### Ver Retos
```javascript
// Activos (con progreso)
const active = OrionImprovements.Gamification.getActiveChallenges();
// → [{ name: 'Desafío Diario', progress: 66, current: 2, target: 3, reward: 100 }, ...]

// Completados
const completed = OrionImprovements.Gamification.getCompletedChallenges();
// → [{ name: '...', reward: 100, completedAt: '...' }, ...]
```

### Perfil del Jugador
```javascript
const profile = OrionImprovements.Gamification.getPlayerProfile();

// Retorna:
{
  level: 5,
  totalPoints: 2450,
  pointsForNextLevel: 500,
  nextLevelProgress: 90,           // %
  unlockedAchievements: 8,
  totalAchievements: 15,
  activeChallenges: 2,
  completedChallenges: 5
}
```

### Leaderboard
```javascript
const athletes = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' }
];

const leaderboard = OrionImprovements.Gamification
  .createLocalLeaderboard(athletes);

// Retorna:
[
  { athlete: 'Juan', points: 3500, sessions: 35, avgAccuracy: 94.2 },
  { athlete: 'María', points: 2800, sessions: 28, avgAccuracy: 91.5 }
]
```

---

## 📊 TREND ANALYSIS - Análisis de Datos

### Progreso a lo largo del tiempo
```javascript
const progress = OrionImprovements.TrendAnalysis
  .analyzeProgressOverTime(sessions);

// Retorna:
{
  sessions: 15,
  timeTrend: 'mejora',              // 'mejora' | 'empeora' | 'estable'
  timeImprovement: '8.5%',          // Mejora en velocidad
  accuracyTrend: 'mejora',
  accuracyImprovement: '2.3%',      // Mejora en precisión
  currentAvgTime: '0.485',
  currentAccuracy: '92.5',
  details: { ... }
}
```

### Comparar Períodos
```javascript
const comparison = OrionImprovements.TrendAnalysis
  .compareTimePeriods(sessions, 7);  // últimos 7 días

// Retorna:
{
  period: '7 días',
  recent: {
    sessions: 8,
    avgTime: '0.48',
    avgAccuracy: '92.5'
  },
  older: {
    sessions: 15,
    avgTime: '0.52',
    avgAccuracy: '90.2'
  },
  improvement: {
    speed: '7.7%',
    accuracy: '2.3%',
    trend: 'mejora'
  }
}
```

### Por Tipo de Ejercicio
```javascript
const byType = OrionImprovements.TrendAnalysis
  .analyzeByExerciseType(sessions);

// Retorna:
{
  flash: {
    sessions: 5,
    avgTime: '0.45',
    avgAccuracy: '93.0',
    bestTime: '0.420',
    bestAccuracy: '100.0',
    trend: 'mejora'
  },
  stroop: { ... },
  discrimination: { ... }
}
```

### Puntos Débiles
```javascript
const weakPoints = OrionImprovements.TrendAnalysis
  .identifyWeakPoints(sessions);

// Retorna:
{
  weakAccuracy: {
    value: '82.5%',
    sessionIndex: 3,
    recommendation: 'Enfócate en discriminación visual...'
  },
  slowest: {
    value: '0.650s',
    sessionIndex: 5,
    recommendation: 'Trabaja en velocidad de reacción...'
  },
  inconsistent: {
    value: '0.120s',
    sessionIndex: 2,
    recommendation: 'Entrena consistencia con intervalos...'
  }
}
```

### Predicción
```javascript
const times = sessions.map(s => 
  parseFloat(OrionImprovements.SessionStats.calculateStats(s).average)
);

const prediction = OrionImprovements.TrendAnalysis
  .predictFutureValue(times, 7);  // 7 días adelante

// Retorna:
{
  predicted: '0.425s',
  daysAhead: 7,
  confidence: 45.2  // %
}
```

### Reporte Completo
```javascript
const fullReport = OrionImprovements.TrendAnalysis
  .generateFullReport(sessions);

// Retorna:
{
  summary: {
    totalSessions: 20,
    overallAvgTime: '0.485',
    overallBestTime: '0.320',
    totalAttempts: 200
  },
  progress: { ... },
  comparison7days: { ... },
  byExercise: { ... },
  weakPoints: { ... }
}
```

### Datos para Gráficos
```javascript
// Tendencia de tiempo (línea)
const timeChart = OrionImprovements.TrendAnalysis
  .getChartData_TimeTrend(sessions);

// Tendencia de precisión (línea)
const accuracyChart = OrionImprovements.TrendAnalysis
  .getChartData_AccuracyTrend(sessions);

// Por ejercicio (barras)
const exerciseChart = OrionImprovements.TrendAnalysis
  .getChartData_ByExercise(sessions);

// Habilidades (radar)
const skillsChart = OrionImprovements.TrendAnalysis
  .getChartData_Skills(sessions);

// Usar con Chart.js:
new Chart(document.getElementById('myChart'), {
  type: 'line',
  data: timeChart,
  options: { responsive: true }
});
```

---

## ☁️ SUPABASE INTEGRATION - Cloud Sync

### Autenticación
```javascript
// Registrarse
await OrionImprovements.SupabaseIntegration.signup(
  'email@example.com',
  'password',
  'John Doe'
);

// Iniciar sesión
await OrionImprovements.SupabaseIntegration.authenticate(
  'email@example.com',
  'password'
);

// Cerrar sesión
await OrionImprovements.SupabaseIntegration.logout();

// Obtener usuario actual
const user = OrionImprovements.SupabaseIntegration.getCurrentUser();
```

### Sesiones
```javascript
// Guardar sesión
await OrionImprovements.SupabaseIntegration.saveTrainingSession({
  athlete_id: '123',
  exerciseName: 'Reacción Flash',
  exerciseType: 'flash',
  reactionTimes: [0.45, 0.52],
  results: ['ok', 'miss'],
  notes: 'Buena sesión'
});

// Obtener historico del usuario
const mySessions = await OrionImprovements.SupabaseIntegration
  .getUserSessions(50);

// Obtener sesiones de un atleta
const athleteSessions = await OrionImprovements.SupabaseIntegration
  .getAthleteSessions('athlete-id', 100);
```

### Atletas
```javascript
// Guardar atleta
await OrionImprovements.SupabaseIntegration.saveAthlete({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  sport: 'football',
  position: 'Delantero',
  birthDate: '2005-03-15',
  dominantHand: 'Derecha'
});

// Obtener todos los atletas
const athletes = await OrionImprovements.SupabaseIntegration
  .getUserAthletes();
```

### Sincronización
```javascript
// Sincronizar sesiones offline
await OrionImprovements.SupabaseIntegration.syncOfflineSessions();

// Auto-sync al reconectar
window.addEventListener('online', () => {
  OrionImprovements.SupabaseIntegration.syncOfflineSessions();
});
```

### Real-time
```javascript
// Escuchar cambios en tiempo real
const subscription = OrionImprovements.SupabaseIntegration
  .subscribeToSessions((newSession) => {
    console.log('Nueva sesión:', newSession);
  });

// Desuscribirse cuando sea necesario
// subscription.unsubscribe();
```

---

## 📈 SESSION STATS - Estadísticas

### Calcular Estadísticas
```javascript
const stats = OrionImprovements.SessionStats.calculateStats(sessionData);

// Retorna:
{
  average: '0.485',         // s
  best: '0.420',            // s
  worst: '0.650',           // s
  median: '0.480',          // s
  stdDev: '0.065',          // Desviación estándar
  correct: 18,              // Aciertos
  incorrect: 2,             // Fallos
  accuracy: '90.0'          // %
}
```

### Comparar Sesiones
```javascript
const comparison = OrionImprovements.SessionStats
  .generateComparativeReport([session1, session2]);

// Retorna:
{
  improvement: {
    speed: '5.2%',          // mejora en velocidad
    accuracy: '2.5%',       // mejora en precisión
    consistency: '8.1%'     // mejora en consistencia
  },
  trend: 'mejora',
  sessions: 2
}
```

---

## 🗄️ OFFLINE STORAGE - Almacenamiento Local

### Guardar Localmente
```javascript
await OrionImprovements.OfflineStorage.saveSessionLocally({
  reactionTimes: [0.45, 0.52],
  results: ['ok', 'miss'],
  // Se agrega automáticamente: timestamp, synced: false
});
```

### Obtener Sin Sincronizar
```javascript
const unsynced = await OrionImprovements.OfflineStorage
  .getUnsynedSessions();

// Retorna sesiones con synced: false
```

### Marcar Sincronizada
```javascript
await OrionImprovements.OfflineStorage
  .markSessionSynced(sessionId);
```

---

## 🎬 LIVE DASHBOARD - Dashboard en Vivo

### Inicializar
```javascript
OrionImprovements.LiveDashboard.init({
  reactionTimes: [0.45, 0.52],
  results: ['ok', 'miss'],
  config: { reps: 10 }
});
```

### Actualizar
```javascript
// Se actualiza automáticamente cada segundo
```

### Detener
```javascript
OrionImprovements.LiveDashboard.stop();
```

---

## 🛠️ ADVANCED EXERCISE CONFIG - Configuración Avanzada

### Guardar Template
```javascript
const template = OrionImprovements.AdvancedExerciseConfig
  .saveExerciseTemplate({
    name: 'Mi rutina especial',
    description: 'Para entrenamientos intensos',
    config: { reps: 20, duration: 1.5 }
  });

// Retorna: { id, name, description, config, usageCount, successRate, ... }
```

### Obtener Templates
```javascript
const templates = OrionImprovements.AdvancedExerciseConfig
  .getCustomTemplates();
```

### Clonar y Modificar
```javascript
const cloned = OrionImprovements.AdvancedExerciseConfig
  .cloneAndModify(templateId, {
    reps: 30,
    duration: 2.0
  });
```

### Actualizar Estadísticas
```javascript
OrionImprovements.AdvancedExerciseConfig
  .updateTemplateStats(templateId, stats);
```

---

## 📊 DATA EXPORT - Exportación

### Descargar CSV
```javascript
OrionImprovements.DataExport.downloadCSV(
  sessionData,
  'sesion_15jun.csv'
);
```

---

## 🔍 DEBUG HELPER

```javascript
// Ver toda la info
window.showOrionInfo();

// Ver solo estado de módulos
window.showOrionStatus();

// Diagnóstico automático
window.diagnoseOrion();
```

---

## 📚 Tipos de Datos

### SessionData
```javascript
{
  athlete_id: 'string',
  exerciseName: 'string',
  exerciseType: 'flash' | 'stroop' | 'discrimination' | 'chrono' | 'parimpar',
  reactionTimes: number[],
  results: ('ok' | 'miss')[],
  notes: 'string',
  duration: number  // segundos
}
```

### StatsData
```javascript
{
  average: 'string',        // '0.485'
  best: 'string',           // '0.420'
  worst: 'string',          // '0.650'
  median: 'string',         // '0.480'
  stdDev: 'string',         // '0.065'
  correct: number,
  incorrect: number,
  accuracy: 'string'        // '90.0'
}
```

---

**Última actualización:** 15 junio 2026
