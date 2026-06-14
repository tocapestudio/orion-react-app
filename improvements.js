/**
 * =====================================================================
 * MEJORAS DE ORION REACT APP
 * =====================================================================
 * Módulo de mejoras que agrega:
 * - Dashboard de sesión en vivo mejorado
 * - Sistema de estadísticas y reportes
 * - Modo offline con almacenamiento local
 * - Configuración avanzada de ejercicios
 */

// =====================================================================
// 1. ALMACENAMIENTO OFFLINE Y SINCRONIZACIÓN
// =====================================================================

const OfflineStorage = {
  DB_NAME: 'OrionOfflineDB',
  STORE_SESSIONS: 'sessions',
  STORE_EXERCISES: 'exercises',
  STORE_ATHLETES: 'athletes',

  // Inicializar IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        
        // Crear object stores si no existen
        ['sessions', 'exercises', 'athletes'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
          }
        });
        
        resolve(db);
      };
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        ['sessions', 'exercises', 'athletes'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
          }
        });
      };
    });
  },

  // Guardar sesión localmente
  async saveSessionLocally(sessionData) {
    try {
      const db = await this.init();
      const tx = db.transaction([this.STORE_SESSIONS], 'readwrite');
      const store = tx.objectStore(this.STORE_SESSIONS);
      const data = {
        ...sessionData,
        timestamp: new Date().toISOString(),
        synced: false  // Marcar para sincronizar después
      };
      store.add(data);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(data);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Error guardando sesión offline:', e);
      // Fallback a localStorage si IndexedDB no funciona
      const sessions = JSON.parse(localStorage.getItem('offline_sessions') || '[]');
      sessions.push({ ...sessionData, timestamp: new Date().toISOString(), synced: false });
      localStorage.setItem('offline_sessions', JSON.stringify(sessions));
    }
  },

  // Obtener sesiones sin sincronizar
  async getUnsynedSessions() {
    try {
      const db = await this.init();
      const tx = db.transaction([this.STORE_SESSIONS], 'readonly');
      const store = tx.objectStore(this.STORE_SESSIONS);
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const unsynced = request.result.filter(s => !s.synced);
          resolve(unsynced);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Error obteniendo sesiones offline:', e);
      const sessions = JSON.parse(localStorage.getItem('offline_sessions') || '[]');
      return sessions.filter(s => !s.synced);
    }
  },

  // Marcar sesión como sincronizada
  async markSessionSynced(sessionId) {
    try {
      const db = await this.init();
      const tx = db.transaction([this.STORE_SESSIONS], 'readwrite');
      const store = tx.objectStore(this.STORE_SESSIONS);
      const request = store.get(sessionId);
      
      request.onsuccess = () => {
        const data = request.result;
        data.synced = true;
        store.put(data);
      };
    } catch (e) {
      console.error('Error marcando sesión sincronizada:', e);
    }
  }
};

// =====================================================================
// 2. ESTADÍSTICAS Y REPORTES
// =====================================================================

const SessionStats = {
  // Calcular estadísticas de sesión.
  // Acepta dos formatos:
  //   { reactionTimes: [0.345, ...], results: ['ok', 'miss', ...] }  (segundos)
  //   { history: [{ reaction_ms: 345, result: 'ok' }, ...] }         (formato real de la app)
  calculateStats(sessionData) {
    let times   = sessionData.reactionTimes ? [...sessionData.reactionTimes] : [];
    let results = sessionData.results       ? [...sessionData.results]       : [];

    if (!times.length && sessionData.history && sessionData.history.length) {
      const validEntries = sessionData.history.filter(r => r.reaction_ms > 0);
      times   = validEntries.map(r => r.reaction_ms / 1000); // ms → s
      results = validEntries.map(r => r.result);
    }

    if (times.length === 0) {
      return { average: '0.000', best: '0.000', worst: '0.000', median: '0.000', stdDev: '0.000', correct: 0, incorrect: 0, accuracy: '0.0' };
    }

    // Promedio
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    
    // Mejor y peor
    const best = Math.min(...times);
    const worst = Math.max(...times);
    
    // Mediana
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    // Desviación estándar
    const variance = times.reduce((sum, x) => sum + Math.pow(x - average, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    
    // Aciertos / Fallos
    const correct   = results.filter(r => r === 'ok').length;
    const incorrect = results.filter(r => r === 'miss').length;
    const accuracy  = results.length > 0 ? (correct / results.length) * 100 : 100;
    
    return {
      average: average.toFixed(3),
      best: best.toFixed(3),
      worst: worst.toFixed(3),
      median: median.toFixed(3),
      stdDev: stdDev.toFixed(3),
      correct,
      incorrect,
      accuracy: accuracy.toFixed(1)
    };
  },

  // Generar reporte comparativo
  generateComparativeReport(sessions) {
    if (sessions.length < 2) return null;

    const stats = sessions.map(s => this.calculateStats(s));
    const latest = stats[stats.length - 1];
    const previous = stats[stats.length - 2];

    return {
      improvement: {
        speed: ((parseFloat(previous.average) - parseFloat(latest.average)) / parseFloat(previous.average) * 100).toFixed(1),
        accuracy: (parseFloat(latest.accuracy) - parseFloat(previous.accuracy)).toFixed(1),
        consistency: ((parseFloat(previous.stdDev) - parseFloat(latest.stdDev)) / parseFloat(previous.stdDev) * 100).toFixed(1)
      },
      trend: latest.average < previous.average ? 'mejora' : 'empeora',
      sessions: sessions.length
    };
  }
};

// =====================================================================
// 3. DASHBOARD EN VIVO MEJORADO
// =====================================================================

const LiveDashboard = {
  currentSession: null,
  updateInterval: null,

  // Inicializar dashboard
  init(sessionData) {
    this.currentSession = sessionData;
    this.startLiveUpdates();
    this.renderLiveStats();
  },

  // Actualizar estadísticas en vivo
  startLiveUpdates() {
    this.updateInterval = setInterval(() => {
      if (this.currentSession && this.currentSession.reactionTimes) {
        this.updateLiveMetrics();
      }
    }, 1000);
  },

  // Renderizar métricas en vivo
  updateLiveMetrics() {
    const stats = SessionStats.calculateStats(this.currentSession);
    
    // Actualizar elementos del DOM si existen
    const avgEl = document.getElementById('statAvg');
    const bestEl = document.getElementById('statBest');
    const progressEl = document.getElementById('statProgress');
    
    if (avgEl) avgEl.textContent = stats.average + 's';
    if (bestEl) bestEl.textContent = stats.best + 's';
    if (progressEl) {
      const total = this.currentSession.config?.reps || this.currentSession.reactionTimes.length;
      progressEl.textContent = `${this.currentSession.reactionTimes.length}/${total}`;
    }

    // Animación de mejoría
    if (this.currentSession.reactionTimes.length > 1) {
      const last = this.currentSession.reactionTimes[this.currentSession.reactionTimes.length - 1];
      const prev = this.currentSession.reactionTimes[this.currentSession.reactionTimes.length - 2];
      
      if (last < prev) {
        if (bestEl) {
          bestEl.style.color = '#22d3a0';
          bestEl.style.animation = 'pulse 0.3s ease';
        }
      }
    }
  },

  // Renderizar estadísticas iniciales
  renderLiveStats() {
    const stats = SessionStats.calculateStats(this.currentSession);
    
    const summaryStats = document.getElementById('summaryStats');
    if (summaryStats) {
      summaryStats.innerHTML = `
        <div class="stat-tile">
          <span class="val">${stats.average}s</span>
          <span class="lbl">Promedio</span>
        </div>
        <div class="stat-tile">
          <span class="val">${stats.best}s</span>
          <span class="lbl">Mejor</span>
        </div>
        <div class="stat-tile">
          <span class="val">${stats.worst}s</span>
          <span class="lbl">Peor</span>
        </div>
        <div class="stat-tile">
          <span class="val">${stats.accuracy}%</span>
          <span class="lbl">Precisión</span>
        </div>
      `;
    }
  },

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
};

// =====================================================================
// 4. CONFIGURACIÓN AVANZADA DE EJERCICIOS
// =====================================================================

const AdvancedExerciseConfig = {
  // Guardar template de ejercicio personalizado
  saveExerciseTemplate(exerciseData) {
    const templates = JSON.parse(localStorage.getItem('custom_exercise_templates') || '[]');
    const template = {
      id: Date.now(),
      name: exerciseData.name,
      description: exerciseData.description,
      config: exerciseData.config,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      successRate: 0
    };
    
    templates.push(template);
    localStorage.setItem('custom_exercise_templates', JSON.stringify(templates));
    return template;
  },

  // Obtener templates personalizados
  getCustomTemplates() {
    return JSON.parse(localStorage.getItem('custom_exercise_templates') || '[]');
  },

  // Duplicar y modificar template
  cloneAndModify(templateId, modifications) {
    const templates = this.getCustomTemplates();
    const original = templates.find(t => t.id === templateId);
    
    if (!original) return null;

    const cloned = {
      ...original,
      id: Date.now(),
      name: `${original.name} (Copia)`,
      config: { ...original.config, ...modifications },
      createdAt: new Date().toISOString()
    };

    templates.push(cloned);
    localStorage.setItem('custom_exercise_templates', JSON.stringify(templates));
    return cloned;
  },

  // Actualizar estadísticas de template
  updateTemplateStats(templateId, sessionStats) {
    const templates = JSON.parse(localStorage.getItem('custom_exercise_templates') || '[]');
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return;

    template.usageCount++;
    const oldSuccess = template.successRate;
    const newSuccess = parseFloat(sessionStats.accuracy) || 0;
    template.successRate = (oldSuccess * (template.usageCount - 1) + newSuccess) / template.usageCount;
    
    const idx = templates.findIndex(t => t.id === templateId);
    templates[idx] = template;
    localStorage.setItem('custom_exercise_templates', JSON.stringify(templates));
  }
};

// =====================================================================
// 5. SERVICE WORKER PARA MODO OFFLINE
// =====================================================================

const OfflineServiceWorker = {
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado para modo offline');
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
      }
    }
  },

  // Detectar conexión
  isOnline() {
    return navigator.onLine;
  },

  // Sincronizar datos cuando se reconecta.
  // Despacha 'orion:syncOffline' para que el manejador de Supabase lo procese.
  async syncOfflineData() {
    if (!this.isOnline()) return;
    const unsynced = await OfflineStorage.getUnsynedSessions();
    if (unsynced.length === 0) return;
    window.dispatchEvent(new CustomEvent('orion:syncOffline', { detail: { sessions: unsynced } }));
  }
};

// =====================================================================
// 6. INTEGRACIÓN CON PÁGINA DE DATOS
// =====================================================================

const DataPageEnhancements = {
  // Mejorar cálculo de métricas del jugador
  calculateAthleteMetrics(sessions) {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgAccuracy: 0,
        improvementTrend: 'sin datos',
        recentPerformance: []
      };
    }

    const stats = sessions.map(s => SessionStats.calculateStats(s));
    const accuracies = stats.map(s => parseFloat(s.accuracy));
    const avgAccuracy = (accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(1);

    // Calcular tendencia
    let improvementTrend = 'estable';
    if (accuracies.length >= 3) {
      const recent = accuracies.slice(-3);
      const older = accuracies.slice(-6, -3);
      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        improvementTrend = recentAvg > olderAvg ? 'mejora' : 'empeora';
      }
    }

    return {
      totalSessions: sessions.length,
      avgAccuracy,
      improvementTrend,
      recentPerformance: stats.slice(-5)
    };
  }
};

// =====================================================================
// 7. EXPORTACIÓN DE DATOS
// =====================================================================

const DataExport = {
  // Exportar sesión a CSV
  exportSessionToCSV(sessionData) {
    const stats = SessionStats.calculateStats(sessionData);
    const headers = ['Métrica', 'Valor'];
    const rows = [
      ['Promedio (s)', stats.average],
      ['Mejor (s)', stats.best],
      ['Peor (s)', stats.worst],
      ['Mediana (s)', stats.median],
      ['Desviación Estándar', stats.stdDev],
      ['Aciertos', stats.correct],
      ['Fallos', stats.incorrect],
      ['Precisión (%)', stats.accuracy]
    ];

    if (sessionData.reactionTimes && sessionData.reactionTimes.length > 0) {
      rows.push(['--- Tiempos individuales ---', '']);
      sessionData.reactionTimes.forEach((time, idx) => {
        rows.push([`Intento ${idx + 1}`, time]);
      });
    }

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  },

  // Descargar CSV
  downloadCSV(sessionData, filename = 'sesion.csv') {
    const csv = this.exportSessionToCSV(sessionData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// =====================================================================
// 8. INICIALIZACIÓN AL CARGAR
// =====================================================================

window.addEventListener('load', async () => {
  try {
    // Inicializar almacenamiento offline
    await OfflineStorage.init();
    
    // Registrar Service Worker para modo offline
    OfflineServiceWorker.registerServiceWorker();
    
    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
      console.log('Conexión restaurada - sincronizando datos...');
      OfflineServiceWorker.syncOfflineData();
    });
    
    console.log('✓ Mejoras de ORION React cargadas correctamente');
  } catch (error) {
    console.error('Error inicializando mejoras:', error);
  }
});

// Exportar para uso global
window.OrionImprovements = {
  OfflineStorage,
  SessionStats,
  LiveDashboard,
  AdvancedExerciseConfig,
  OfflineServiceWorker,
  DataPageEnhancements,
  DataExport
};
