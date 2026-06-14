/**
 * Análisis de Tendencias
 * Análisis temporal, predicciones y gráficos
 */

const TrendAnalysis = {
  /**
   * Calcular tendencia linear de una serie
   */
  calculateLinearTrend(values, lowerIsBetter = false) {
    if (values.length < 2) return null;

    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Para tiempos de reacción: bajar = mejorar (lowerIsBetter=true)
    // Para precisión: subir = mejorar (lowerIsBetter=false)
    const improving = lowerIsBetter ? slope < -0.001 : slope > 0.001;
    const worsening = lowerIsBetter ? slope > 0.001  : slope < -0.001;

    return {
      slope: slope.toFixed(6),
      intercept: intercept.toFixed(3),
      trend: improving ? 'mejora' : worsening ? 'empeora' : 'estable',
      confidence: Math.abs(slope) * 100
    };
  },

  /**
   * Predecir valor futuro basado en tendencia
   */
  predictFutureValue(values, daysAhead = 7) {
    const trend = this.calculateLinearTrend(values);
    if (!trend) return null;

    const lastValue = values[values.length - 1];
    const slope = parseFloat(trend.slope);
    const predicted = lastValue + slope * daysAhead;

    return {
      predicted: Math.max(predicted, 0).toFixed(3),
      daysAhead,
      confidence: trend.confidence
    };
  },

  /**
   * Analizar mejora a lo largo del tiempo
   */
  analyzeProgressOverTime(sessions) {
    if (sessions.length < 2) {
      return { message: 'Necesitas al menos 2 sesiones para análisis' };
    }

    const stats = sessions.map(s => window.OrionImprovements.SessionStats.calculateStats(s));
    const times = stats.map(s => parseFloat(s.average));
    const accuracies = stats.map(s => parseFloat(s.accuracy));

    const timeTrend = this.calculateLinearTrend(times, true);       // bajar tiempo = mejorar
    const accuracyTrend = this.calculateLinearTrend(accuracies, false); // subir precisión = mejorar

    // Calcular mejora porcentual
    const firstTime = times[0];
    const lastTime = times[times.length - 1];
    const timeImprovement = ((firstTime - lastTime) / firstTime * 100).toFixed(1);

    const firstAccuracy = accuracies[0];
    const lastAccuracy = accuracies[accuracies.length - 1];
    const accuracyImprovement = (lastAccuracy - firstAccuracy).toFixed(1);

    return {
      sessions: sessions.length,
      timeTrend: timeTrend.trend,
      timeImprovement: `${timeImprovement}%`,
      accuracyTrend: accuracyTrend.trend,
      accuracyImprovement: `${accuracyImprovement}%`,
      currentAvgTime: lastTime.toFixed(3),
      currentAccuracy: lastAccuracy.toFixed(1),
      details: {
        timeTrendSlope: timeTrend.slope,
        accuracyTrendSlope: accuracyTrend.slope,
        consistency: (stats[stats.length - 1].stdDev)
      }
    };
  },

  /**
   * Comparar rendimiento entre períodos
   */
  compareTimePeriods(sessions, days = 7) {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const recentSessions = sessions.filter(s => {
      const date = new Date(s.created_at || new Date());
      return date > cutoffDate;
    });

    const olderSessions = sessions.filter(s => {
      const date = new Date(s.created_at || new Date());
      return date <= cutoffDate;
    });

    if (recentSessions.length === 0 || olderSessions.length === 0) {
      return { message: 'No hay suficientes datos en ambos períodos' };
    }

    const recentStats = recentSessions.map(s => window.OrionImprovements.SessionStats.calculateStats(s));
    const olderStats = olderSessions.map(s => window.OrionImprovements.SessionStats.calculateStats(s));

    const recentAvgTime = recentStats.reduce((sum, s) => sum + parseFloat(s.average), 0) / recentStats.length;
    const olderAvgTime = olderStats.reduce((sum, s) => sum + parseFloat(s.average), 0) / olderStats.length;

    const recentAvgAccuracy = recentStats.reduce((sum, s) => sum + parseFloat(s.accuracy), 0) / recentStats.length;
    const olderAvgAccuracy = olderStats.reduce((sum, s) => sum + parseFloat(s.accuracy), 0) / olderStats.length;

    const timeImprovement = ((olderAvgTime - recentAvgTime) / olderAvgTime * 100).toFixed(1);
    const accuracyImprovement = (recentAvgAccuracy - olderAvgAccuracy).toFixed(1);

    return {
      period: `${days} días`,
      recent: {
        sessions: recentSessions.length,
        avgTime: recentAvgTime.toFixed(3),
        avgAccuracy: recentAvgAccuracy.toFixed(1)
      },
      older: {
        sessions: olderSessions.length,
        avgTime: olderAvgTime.toFixed(3),
        avgAccuracy: olderAvgAccuracy.toFixed(1)
      },
      improvement: {
        speed: `${timeImprovement}%`,
        accuracy: `${accuracyImprovement}%`,
        trend: parseFloat(timeImprovement) > 0 ? 'mejora' : 'empeora'
      }
    };
  },

  /**
   * Análisis por tipo de ejercicio
   */
  analyzeByExerciseType(sessions) {
    const groupedByType = {};

    sessions.forEach(session => {
      const type = session.exerciseType || 'unknown';
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(session);
    });

    const analysis = {};

    for (const [type, typeSessions] of Object.entries(groupedByType)) {
      const stats = typeSessions.map(s => window.OrionImprovements.SessionStats.calculateStats(s));
      
      const avgTime = stats.reduce((sum, s) => sum + parseFloat(s.average), 0) / stats.length;
      const avgAccuracy = stats.reduce((sum, s) => sum + parseFloat(s.accuracy), 0) / stats.length;
      const bestTime = Math.min(...stats.map(s => parseFloat(s.best)));
      const bestAccuracy = Math.max(...stats.map(s => parseFloat(s.accuracy)));

      analysis[type] = {
        sessions: typeSessions.length,
        avgTime: avgTime.toFixed(3),
        avgAccuracy: avgAccuracy.toFixed(1),
        bestTime: bestTime.toFixed(3),
        bestAccuracy: bestAccuracy.toFixed(1),
        trend: this.calculateLinearTrend(stats.map(s => parseFloat(s.average)), true).trend
      };
    }

    return analysis;
  },

  /**
   * Identificar puntos débiles
   */
  identifyWeakPoints(sessions) {
    if (sessions.length < 3) {
      return { message: 'Necesitas al menos 3 sesiones para análisis' };
    }

    const stats = sessions.map(s => window.OrionImprovements.SessionStats.calculateStats(s));

    // Ejercicios con peor precisión promedio
    const avgAccuracies = stats.map(s => parseFloat(s.accuracy));
    const worstAccuracy = Math.min(...avgAccuracies);
    const worstAccuracyIndex = avgAccuracies.indexOf(worstAccuracy);

    // Ejercicios más lentos
    const avgTimes = stats.map(s => parseFloat(s.average));
    const slowestTime = Math.max(...avgTimes);
    const slowestIndex = avgTimes.indexOf(slowestTime);

    // Inconsistencia
    const stdDevs = stats.map(s => parseFloat(s.stdDev));
    const worstConsistency = Math.max(...stdDevs);
    const worstConsistencyIndex = stdDevs.indexOf(worstConsistency);

    return {
      weakAccuracy: {
        value: worstAccuracy.toFixed(1),
        sessionIndex: worstAccuracyIndex,
        recommendation: 'Enfócate en mejorar la precisión en ejercicios de discriminación'
      },
      slowest: {
        value: slowestTime.toFixed(3),
        sessionIndex: slowestIndex,
        recommendation: 'Trabaja en velocidad de reacción. Practica ejercicios más rápidos'
      },
      inconsistent: {
        value: worstConsistency.toFixed(3),
        sessionIndex: worstConsistencyIndex,
        recommendation: 'Entrena consistencia con intervalos controlados'
      }
    };
  },

  /**
   * Generar reporte completo
   */
  generateFullReport(sessions) {
    if (sessions.length === 0) {
      return { message: 'Sin datos de sesiones' };
    }

    const progress = this.analyzeProgressOverTime(sessions);
    const comparison7days = this.compareTimePeriods(sessions, 7);
    const byExercise = this.analyzeByExerciseType(sessions);
    const weakPoints = this.identifyWeakPoints(sessions);

    const stats = sessions.map(s => window.OrionImprovements.SessionStats.calculateStats(s));
    const allTimes = [];
    sessions.forEach(s => {
      if (s.reactionTimes) allTimes.push(...s.reactionTimes);
    });

    const overallAvgTime = (allTimes.reduce((a, b) => a + b, 0) / allTimes.length).toFixed(3);
    const overallBestTime = Math.min(...allTimes).toFixed(3);

    return {
      summary: {
        totalSessions: sessions.length,
        overallAvgTime,
        overallBestTime,
        totalAttempts: allTimes.length
      },
      progress,
      comparison7days: comparison7days.message ? null : comparison7days,
      byExercise,
      weakPoints: weakPoints.message ? null : weakPoints
    };
  },

  /**
   * Datos para gráfico de línea (tiempo promedio)
   */
  getChartData_TimeTrend(sessions) {
    if (sessions.length === 0) return null;

    const stats = sessions.map((s, i) => ({
      index: i + 1,
      date: new Date(s.created_at || Date.now()).toLocaleDateString(),
      avgTime: parseFloat(window.OrionImprovements.SessionStats.calculateStats(s).average)
    }));

    return {
      labels: stats.map(s => s.date),
      datasets: [{
        label: 'Tiempo Promedio (s)',
        data: stats.map(s => s.avgTime),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  },

  /**
   * Datos para gráfico de línea (precisión)
   */
  getChartData_AccuracyTrend(sessions) {
    if (sessions.length === 0) return null;

    const stats = sessions.map((s, i) => ({
      index: i + 1,
      date: new Date(s.created_at || Date.now()).toLocaleDateString(),
      accuracy: parseFloat(window.OrionImprovements.SessionStats.calculateStats(s).accuracy)
    }));

    return {
      labels: stats.map(s => s.date),
      datasets: [{
        label: 'Precisión (%)',
        data: stats.map(s => s.accuracy),
        borderColor: '#22d3a0',
        backgroundColor: 'rgba(34, 211, 160, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  },

  /**
   * Datos para gráfico de barras (por ejercicio)
   */
  getChartData_ByExercise(sessions) {
    const analysis = this.analyzeByExerciseType(sessions);
    
    return {
      labels: Object.keys(analysis),
      datasets: [
        {
          label: 'Tiempo Promedio (s)',
          data: Object.values(analysis).map(v => parseFloat(v.avgTime)),
          backgroundColor: '#3b82f6'
        },
        {
          label: 'Precisión (%)',
          data: Object.values(analysis).map(v => parseFloat(v.avgAccuracy)),
          backgroundColor: '#22d3a0'
        }
      ]
    };
  },

  /**
   * Datos para gráfico de radar (habilidades)
   */
  getChartData_Skills(sessions) {
    if (sessions.length === 0) return null;

    const stats = sessions.map(s => window.OrionImprovements.SessionStats.calculateStats(s));
    
    // Normalizar a escala 0-100
    const avgTimes = stats.map(s => parseFloat(s.average));
    const minTime = Math.min(...avgTimes);
    const maxTime = Math.max(...avgTimes);
    
    const range = maxTime - minTime;
    const speedScore = range > 0
      ? 100 - ((parseFloat(stats[stats.length - 1].average) - minTime) / range * 100)
      : 100;
    const accuracyScore = parseFloat(stats[stats.length - 1].accuracy);
    const consistencyScore = 100 - (parseFloat(stats[stats.length - 1].stdDev) / 0.2 * 100);

    return {
      labels: ['Velocidad', 'Precisión', 'Consistencia'],
      datasets: [{
        label: 'Habilidades Actuales',
        data: [
          Math.max(0, Math.min(100, speedScore)),
          accuracyScore,
          Math.max(0, Math.min(100, consistencyScore))
        ],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderWidth: 2
      }]
    };
  }
};

window.OrionImprovements.TrendAnalysis = TrendAnalysis;
console.log('✓ Sistema de análisis de tendencias cargado');
