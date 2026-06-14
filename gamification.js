/**
 * Sistema de Gamificación
 * Logros, retos, leaderboards y puntos
 */

const Gamification = {
  // Definición de logros (Achievements)
  achievements: {
    // Logros de velocidad
    'speed_under_300ms': {
      id: 'speed_under_300ms',
      name: '⚡ Rápido',
      description: 'Completa un intento en menos de 300ms',
      icon: '⚡',
      points: 50,
      unlocked: false,
      unlockedAt: null,
      category: 'speed'
    },
    'speed_under_400ms': {
      id: 'speed_under_400ms',
      name: '⚡⚡ Muy Rápido',
      description: 'Completa un intento en menos de 400ms',
      icon: '⚡⚡',
      points: 100,
      unlocked: false,
      unlockedAt: null,
      category: 'speed'
    },
    'speed_under_250ms': {
      id: 'speed_under_250ms',
      name: '🔥 Velocidad de rayo',
      description: 'Completa un intento en menos de 250ms',
      icon: '🔥',
      points: 200,
      unlocked: false,
      unlockedAt: null,
      category: 'speed'
    },

    // Logros de precisión
    'perfect_score': {
      id: 'perfect_score',
      name: '🎯 Perfecto',
      description: 'Completa una sesión con 100% de precisión',
      icon: '🎯',
      points: 150,
      unlocked: false,
      unlockedAt: null,
      category: 'accuracy'
    },
    'high_accuracy': {
      id: 'high_accuracy',
      name: '✅ Puntería',
      description: 'Logra 90% de precisión en una sesión',
      icon: '✅',
      points: 75,
      unlocked: false,
      unlockedAt: null,
      category: 'accuracy'
    },

    // Logros de consistencia
    'consistency_master': {
      id: 'consistency_master',
      name: '🧊 Consistente',
      description: 'Logra desviación estándar menor a 0.05s en 10 intentos',
      icon: '🧊',
      points: 125,
      unlocked: false,
      unlockedAt: null,
      category: 'consistency'
    },

    // Logros de volumen
    'first_session': {
      id: 'first_session',
      name: '🚀 Comienzo',
      description: 'Completa tu primera sesión',
      icon: '🚀',
      points: 10,
      unlocked: false,
      unlockedAt: null,
      category: 'volume'
    },
    '10_sessions': {
      id: '10_sessions',
      name: '💪 Dedicado',
      description: 'Completa 10 sesiones',
      icon: '💪',
      points: 50,
      unlocked: false,
      unlockedAt: null,
      category: 'volume'
    },
    '50_sessions': {
      id: '50_sessions',
      name: '🏆 Campeón',
      description: 'Completa 50 sesiones',
      icon: '🏆',
      points: 200,
      unlocked: false,
      unlockedAt: null,
      category: 'volume'
    },
    '100_sessions': {
      id: '100_sessions',
      name: '👑 Leyenda',
      description: 'Completa 100 sesiones',
      icon: '👑',
      points: 500,
      unlocked: false,
      unlockedAt: null,
      category: 'volume'
    },

    // Logros de mejora
    'improvement_10percent': {
      id: 'improvement_10percent',
      name: '📈 En Forma',
      description: 'Mejora tu tiempo promedio en 10%',
      icon: '📈',
      points: 100,
      unlocked: false,
      unlockedAt: null,
      category: 'improvement'
    },
    'improvement_25percent': {
      id: 'improvement_25percent',
      name: '🎢 Progreso',
      description: 'Mejora tu tiempo promedio en 25%',
      icon: '🎢',
      points: 250,
      unlocked: false,
      unlockedAt: null,
      category: 'improvement'
    },

    // Logros de variedad
    'all_exercises': {
      id: 'all_exercises',
      name: '🎭 Versátil',
      description: 'Completa todos los tipos de ejercicios',
      icon: '🎭',
      points: 300,
      unlocked: false,
      unlockedAt: null,
      category: 'variety'
    }
  },

  // Sistema de puntos
  totalPoints: 0,
  level: 1,
  pointsForNextLevel: 500,

  // Retos activos
  challenges: {
    'daily_challenge': {
      id: 'daily_challenge',
      name: '📅 Desafío Diario',
      description: 'Completa 3 sesiones en un día',
      icon: '📅',
      target: 3,
      current: 0,
      reward: 100,
      active: true,
      endsAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    'speed_challenge': {
      id: 'speed_challenge',
      name: '⚡ Desafío de Velocidad',
      description: 'Logra 5 intentos bajo 400ms',
      icon: '⚡',
      target: 5,
      current: 0,
      reward: 150,
      active: true,
      endsAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    'accuracy_challenge': {
      id: 'accuracy_challenge',
      name: '🎯 Desafío de Precisión',
      description: '3 sesiones con 95%+ de precisión',
      icon: '🎯',
      target: 3,
      current: 0,
      reward: 200,
      active: true,
      endsAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    }
  },

  /**
   * Inicializar gamificación desde localStorage
   */
  init() {
    const saved = localStorage.getItem('gamification_data');
    if (saved) {
      const data = JSON.parse(saved);
      this.achievements = data.achievements || this.achievements;
      this.totalPoints = data.totalPoints || 0;
      this.level = data.level || 1;
      this.pointsForNextLevel = data.pointsForNextLevel || 500;
      this.challenges = data.challenges || this.challenges;
    }
    this.save();
  },

  /**
   * Guardar estado a localStorage
   */
  save() {
    localStorage.setItem('gamification_data', JSON.stringify({
      achievements: this.achievements,
      totalPoints: this.totalPoints,
      level: this.level,
      pointsForNextLevel: this.pointsForNextLevel,
      challenges: this.challenges
    }));
  },

  /**
   * Procesar sesión completada
   */
  processSessionCompletion(sessionData) {
    const stats = window.OrionImprovements.SessionStats.calculateStats(sessionData);
    const newAchievements = [];

    // Verificar logros de velocidad
    if (sessionData.reactionTimes) {
      const bestTime = Math.min(...sessionData.reactionTimes);
      
      if (bestTime < 0.25) this._unlockAchievement('speed_under_250ms', newAchievements);
      if (bestTime < 0.30) this._unlockAchievement('speed_under_300ms', newAchievements);
      if (bestTime < 0.40) this._unlockAchievement('speed_under_400ms', newAchievements);
    }

    // Verificar logros de precisión
    const accuracy = parseFloat(stats.accuracy);
    if (accuracy === 100) this._unlockAchievement('perfect_score', newAchievements);
    if (accuracy >= 90) this._unlockAchievement('high_accuracy', newAchievements);

    // Verificar logros de consistencia
    if (parseFloat(stats.stdDev) < 0.05 && sessionData.reactionTimes.length >= 10) {
      this._unlockAchievement('consistency_master', newAchievements);
    }

    // Verificar logros de volumen
    const sessionCount = this._getSessionCount();
    if (sessionCount === 1) this._unlockAchievement('first_session', newAchievements);
    if (sessionCount === 10) this._unlockAchievement('10_sessions', newAchievements);
    if (sessionCount === 50) this._unlockAchievement('50_sessions', newAchievements);
    if (sessionCount === 100) this._unlockAchievement('100_sessions', newAchievements);

    // Actualizar retos
    this._updateChallenges(sessionData, stats);

    // Sumar puntos
    const sessionPoints = this._calculateSessionPoints(stats);
    this.totalPoints += sessionPoints;
    this._checkLevelUp();

    // Guardar
    this.save();

    return {
      newAchievements,
      pointsEarned: sessionPoints,
      totalPoints: this.totalPoints,
      level: this.level,
      nextLevelProgress: this.totalPoints % this.pointsForNextLevel
    };
  },

  /**
   * Desbloquear logro
   */
  _unlockAchievement(achievementId, newList) {
    if (this.achievements[achievementId] && !this.achievements[achievementId].unlocked) {
      this.achievements[achievementId].unlocked = true;
      this.achievements[achievementId].unlockedAt = new Date().toISOString();
      
      // Sumar puntos del logro
      this.totalPoints += this.achievements[achievementId].points;
      
      newList.push(this.achievements[achievementId]);
      console.log(`🎉 Logro desbloqueado: ${this.achievements[achievementId].name}`);
    }
  },

  /**
   * Actualizar progreso de retos
   */
  _updateChallenges(sessionData, stats) {
    // Desafío diario: completar 3 sesiones
    if (this.challenges['daily_challenge'].active) {
      this.challenges['daily_challenge'].current++;
      if (this.challenges['daily_challenge'].current >= this.challenges['daily_challenge'].target) {
        this.challenges['daily_challenge'].completed = true;
        this.totalPoints += this.challenges['daily_challenge'].reward;
      }
    }

    // Desafío de velocidad: 5 intentos bajo 400ms
    if (this.challenges['speed_challenge'].active && sessionData.reactionTimes) {
      const fastTimes = sessionData.reactionTimes.filter(t => t < 0.4).length;
      this.challenges['speed_challenge'].current += fastTimes;
      if (this.challenges['speed_challenge'].current >= this.challenges['speed_challenge'].target) {
        this.challenges['speed_challenge'].completed = true;
        this.totalPoints += this.challenges['speed_challenge'].reward;
      }
    }

    // Desafío de precisión: 3 sesiones con 95%+
    if (this.challenges['accuracy_challenge'].active) {
      const accuracy = parseFloat(stats.accuracy);
      if (accuracy >= 95) {
        this.challenges['accuracy_challenge'].current++;
        if (this.challenges['accuracy_challenge'].current >= this.challenges['accuracy_challenge'].target) {
          this.challenges['accuracy_challenge'].completed = true;
          this.totalPoints += this.challenges['accuracy_challenge'].reward;
        }
      }
    }
  },

  /**
   * Calcular puntos de una sesión
   */
  _calculateSessionPoints(stats) {
    let points = 25; // Base por completar sesión

    // Bonificación por rapidez
    const avgTime = parseFloat(stats.average);
    if (avgTime < 0.3) points += 50;
    else if (avgTime < 0.4) points += 30;
    else if (avgTime < 0.5) points += 10;

    // Bonificación por precisión
    const accuracy = parseFloat(stats.accuracy);
    if (accuracy === 100) points += 50;
    else if (accuracy >= 95) points += 30;
    else if (accuracy >= 90) points += 15;

    // Bonificación por consistencia
    const stdDev = parseFloat(stats.stdDev);
    if (stdDev < 0.05) points += 40;
    else if (stdDev < 0.1) points += 20;

    return points;
  },

  /**
   * Verificar cambio de nivel
   */
  _checkLevelUp() {
    while (this.totalPoints >= this.pointsForNextLevel) {
      this.totalPoints -= this.pointsForNextLevel;
      this.level++;
      this.pointsForNextLevel = Math.floor(this.pointsForNextLevel * 1.2);
      console.log(`🎊 ¡Subes a nivel ${this.level}!`);
    }
  },

  /**
   * Obtener contador de sesiones
   */
  _getSessionCount() {
    const sessions = JSON.parse(localStorage.getItem('offline_sessions') || '[]');
    return sessions.length;
  },

  /**
   * Obtener logros desbloqueados
   */
  getUnlockedAchievements() {
    return Object.values(this.achievements).filter(a => a.unlocked);
  },

  /**
   * Obtener logros pendientes
   */
  getPendingAchievements() {
    return Object.values(this.achievements).filter(a => !a.unlocked);
  },

  /**
   * Obtener retos activos
   */
  getActiveChallenges() {
    return Object.values(this.challenges)
      .filter(c => c.active && !c.completed)
      .map(c => ({
        ...c,
        progress: Math.floor((c.current / c.target) * 100)
      }));
  },

  /**
   * Obtener retos completados
   */
  getCompletedChallenges() {
    return Object.values(this.challenges).filter(c => c.completed);
  },

  /**
   * Obtener perfil de jugador
   */
  getPlayerProfile() {
    return {
      level: this.level,
      totalPoints: this.totalPoints,
      pointsForNextLevel: this.pointsForNextLevel,
      nextLevelProgress: Math.floor((this.totalPoints / this.pointsForNextLevel) * 100),
      unlockedAchievements: this.getUnlockedAchievements().length,
      totalAchievements: Object.keys(this.achievements).length,
      activeChallenges: this.getActiveChallenges().length,
      completedChallenges: this.getCompletedChallenges().length
    };
  },

  /**
   * Crear leaderboard local
   */
  createLocalLeaderboard(athletes) {
    const leaderboard = athletes.map(athlete => {
      const sessions = JSON.parse(localStorage.getItem(`sessions_${athlete.id}`) || '[]');
      const totalPoints = sessions.reduce((sum, s) => {
        const stats = window.OrionImprovements.SessionStats.calculateStats(s);
        return sum + this._calculateSessionPoints(stats);
      }, 0);

      return {
        athlete: athlete.name,
        points: totalPoints,
        sessions: sessions.length,
        avgAccuracy: sessions.length > 0
          ? (sessions.reduce((sum, s) => sum + parseFloat(window.OrionImprovements.SessionStats.calculateStats(s).accuracy), 0) / sessions.length).toFixed(1)
          : 0
      };
    });

    return leaderboard.sort((a, b) => b.points - a.points);
  }
};

// Inicializar al cargar
window.addEventListener('load', () => {
  Gamification.init();
  console.log('✓ Sistema de gamificación cargado');
});

window.OrionImprovements.Gamification = Gamification;
