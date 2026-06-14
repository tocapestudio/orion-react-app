/**
 * ORION React App - Version Info & Debug Helper
 * Copia esto en la consola para ver el estado de todos los módulos
 */

// Script de verificación
(() => {
  const versionInfo = {
    app: {
      name: 'ORION React',
      version: '1.0',
      enhancements: 'All (10)',
      releaseDate: '2026-06-15'
    },
    modules: {
      improvements: {
        loaded: typeof window.OrionImprovements !== 'undefined',
        version: '1.0',
        features: [
          'OfflineStorage (IndexedDB + localStorage)',
          'SessionStats (avg, best, worst, median, stdDev, accuracy)',
          'LiveDashboard (real-time metrics)',
          'AdvancedExerciseConfig (save/clone templates)',
          'DataExport (CSV)'
        ]
      },
      serviceWorker: {
        loaded: typeof navigator.serviceWorker !== 'undefined',
        version: '1.0',
        features: [
          'Cache strategy (network-first for GET, cache-first for POST)',
          'Offline persistence',
          'Background sync'
        ]
      },
      supabase: {
        loaded: typeof window.OrionImprovements?.SupabaseIntegration !== 'undefined',
        version: '1.0',
        configured: !!localStorage.getItem('supabase_config'),
        authenticated: !!localStorage.getItem('supabase_user'),
        features: [
          'Auth (signup/login/logout)',
          'Session sync (cloud storage)',
          'Athlete management',
          'Evaluations',
          'Real-time subscriptions',
          'Offline queue'
        ]
      },
      gamification: {
        loaded: typeof window.OrionImprovements?.Gamification !== 'undefined',
        version: '1.0',
        initialized: !!localStorage.getItem('gamification_data'),
        features: [
          'Achievements (15+ types)',
          'Challenges (daily, speed, accuracy)',
          'Level system',
          'Points (per session)',
          'Leaderboard',
          'Player profiles'
        ]
      },
      analytics: {
        loaded: typeof window.OrionImprovements?.TrendAnalysis !== 'undefined',
        version: '1.0',
        features: [
          'Progress analysis (linear trend)',
          'Period comparison',
          'Exercise breakdown',
          'Weak point detection',
          'Future prediction',
          'Chart data generation (Chart.js)',
          'Full report generation'
        ]
      }
    },
    api: {
      improvements: [
        'OfflineStorage.init()',
        'OfflineStorage.saveSessionLocally(data)',
        'OfflineStorage.getUnsynedSessions()',
        'SessionStats.calculateStats(sessionData)',
        'SessionStats.generateComparativeReport(sessions)',
        'LiveDashboard.init(sessionData)',
        'LiveDashboard.startLiveUpdates()',
        'AdvancedExerciseConfig.saveExerciseTemplate(data)',
        'AdvancedExerciseConfig.getCustomTemplates()',
        'AdvancedExerciseConfig.cloneAndModify(id, modifications)',
        'DataExport.downloadCSV(sessionData, filename)'
      ],
      supabase: [
        'SupabaseIntegration.init(apiUrl, apiKey)',
        'SupabaseIntegration.authenticate(email, password)',
        'SupabaseIntegration.signup(email, password, displayName)',
        'SupabaseIntegration.logout()',
        'SupabaseIntegration.saveTrainingSession(sessionData)',
        'SupabaseIntegration.getUserSessions(limit)',
        'SupabaseIntegration.getAthleteSessions(athleteId, limit)',
        'SupabaseIntegration.saveAthlete(athleteData)',
        'SupabaseIntegration.getUserAthletes()',
        'SupabaseIntegration.saveEvaluation(evaluationData)',
        'SupabaseIntegration.getAthleteEvaluations(athleteId)',
        'SupabaseIntegration.syncOfflineSessions()',
        'SupabaseIntegration.subscribeToSessions(callback)',
        'SupabaseIntegration.getCurrentUser()'
      ],
      gamification: [
        'Gamification.init()',
        'Gamification.processSessionCompletion(sessionData)',
        'Gamification.getUnlockedAchievements()',
        'Gamification.getPendingAchievements()',
        'Gamification.getActiveChallenges()',
        'Gamification.getCompletedChallenges()',
        'Gamification.getPlayerProfile()',
        'Gamification.createLocalLeaderboard(athletes)'
      ],
      analytics: [
        'TrendAnalysis.calculateLinearTrend(values)',
        'TrendAnalysis.predictFutureValue(values, daysAhead)',
        'TrendAnalysis.analyzeProgressOverTime(sessions)',
        'TrendAnalysis.compareTimePeriods(sessions, days)',
        'TrendAnalysis.analyzeByExerciseType(sessions)',
        'TrendAnalysis.identifyWeakPoints(sessions)',
        'TrendAnalysis.generateFullReport(sessions)',
        'TrendAnalysis.getChartData_TimeTrend(sessions)',
        'TrendAnalysis.getChartData_AccuracyTrend(sessions)',
        'TrendAnalysis.getChartData_ByExercise(sessions)',
        'TrendAnalysis.getChartData_Skills(sessions)'
      ]
    },
    system: {
      browserSupport: {
        indexedDB: typeof indexedDB !== 'undefined',
        serviceWorker: typeof navigator.serviceWorker !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined'
      },
      connectionStatus: {
        online: navigator.onLine,
        serviceWorkerRegistrations: 'Check in DevTools → Application → Service Workers'
      }
    }
  };

  // Función para mostrar info
  window.showOrionInfo = function() {
    console.clear();
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #3b82f6; font-weight: bold; font-size: 14px');
    console.log('%c           ORION REACT - VERSION INFO & DEBUG HELPER', 'color: #3b82f6; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #3b82f6; font-weight: bold; font-size: 14px');
    
    console.log('\n📱 App Info:');
    console.table(versionInfo.app);
    
    console.log('\n✅ Module Status:');
    Object.entries(versionInfo.modules).forEach(([name, info]) => {
      const status = info.loaded ? '✅' : '❌';
      console.log(`${status} ${name}: ${info.version}`);
    });
    
    console.log('\n🔧 Browser Support:');
    console.table(versionInfo.system.browserSupport);
    
    console.log('\n🌐 Connection:');
    console.log(`Online: ${navigator.onLine ? '✅' : '❌'}`);
    
    console.log('\n📚 Available APIs:');
    Object.entries(versionInfo.api).forEach(([category, apis]) => {
      console.log(`\n${category}:`);
      apis.forEach(api => console.log(`  • ${api}`));
    });
    
    console.log('\n' + '%c═══════════════════════════════════════════════════════════════', 'color: #3b82f6; font-weight: bold; font-size: 14px');
    console.log('\n💡 Useful commands:');
    console.log('  • window.OrionImprovements               - Access all modules');
    console.log('  • window.showOrionStatus()               - Show only module status');
    console.log('  • window.OrionImprovements.Gamification.getPlayerProfile()');
    console.log('  • window.OrionImprovements.TrendAnalysis.generateFullReport(sessions)');
    console.log('  • localStorage.getItem("supabase_config") - Check Supabase config');
    console.log('\n');
  };

  // Función para mostrar solo estado de módulos
  window.showOrionStatus = function() {
    console.clear();
    console.log('%c📊 ORION MODULE STATUS', 'color: #22d3a0; font-weight: bold; font-size: 12px');
    
    const modules = [
      { name: 'improvements.js', obj: window.OrionImprovements },
      { name: 'Service Worker', obj: navigator.serviceWorker },
      { name: 'Supabase', obj: window.OrionImprovements?.SupabaseIntegration },
      { name: 'Gamification', obj: window.OrionImprovements?.Gamification },
      { name: 'Analytics', obj: window.OrionImprovements?.TrendAnalysis }
    ];
    
    modules.forEach(m => {
      const status = m.obj ? '✅' : '❌';
      console.log(`${status} ${m.name}`);
    });
  };

  // Función para diagnóstico
  window.diagnoseOrion = function() {
    console.clear();
    console.log('%c🔍 ORION DIAGNOSTIC REPORT', 'color: #f59e0b; font-weight: bold; font-size: 12px');
    
    const issues = [];
    
    if (!window.OrionImprovements) {
      issues.push('❌ improvements.js no cargado');
    }
    if (!navigator.serviceWorker) {
      issues.push('⚠️ Service Worker no soportado');
    }
    if (!window.OrionImprovements?.SupabaseIntegration) {
      issues.push('❌ supabase-integration.js no cargado');
    } else if (!localStorage.getItem('supabase_config')) {
      issues.push('⚠️ Supabase no configurado (opcional)');
    }
    if (!window.OrionImprovements?.Gamification) {
      issues.push('❌ gamification.js no cargado');
    }
    if (!window.OrionImprovements?.TrendAnalysis) {
      issues.push('❌ analytics.js no cargado');
    }
    
    if (issues.length === 0) {
      console.log('%c✅ All systems operational!', 'color: #22d3a0; font-weight: bold');
    } else {
      console.log('%c❌ Issues found:', 'color: #ef4444; font-weight: bold');
      issues.forEach(issue => console.log(`  ${issue}`));
    }
  };

  // Auto-check al cargar
  console.log('%c✨ ORION REACT LOADED ✨', 'color: #3b82f6; font-weight: bold; font-size: 16px');
  console.log('Type "showOrionInfo()" to see full information');
  console.log('Type "showOrionStatus()" to see module status');
  console.log('Type "diagnoseOrion()" to run diagnostic');
})();
