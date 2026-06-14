/**
 * Integración con Supabase
 * Sincronización de sesiones, atletas y evaluaciones a la nube
 */

const SupabaseIntegration = {
  supabase: null,
  apiUrl: 'https://YOUR_PROJECT.supabase.co',
  apiKey: 'YOUR_ANON_KEY', // Cambiar con tu clave pública de Supabase
  currentUser: null,

  /**
   * Inicializar Supabase
   * Llamar una vez al cargar la app
   */
  async init(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;

    try {
      // Cargar script de Supabase si no está presente
      if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
        document.head.appendChild(script);
        
        await new Promise(resolve => {
          script.onload = resolve;
          setTimeout(resolve, 2000);
        });
      }

      // Inicializar cliente
      const { createClient } = window.supabase;
      this.supabase = createClient(apiUrl, apiKey);

      console.log('✓ Supabase conectado');
      return true;
    } catch (error) {
      console.error('Error conectando Supabase:', error);
      return false;
    }
  },

  /**
   * Autenticar usuario
   */
  async authenticate(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      localStorage.setItem('supabase_user', JSON.stringify(data.user));
      console.log('✓ Usuario autenticado:', email);
      return data;
    } catch (error) {
      console.error('Error autenticando:', error.message);
      return null;
    }
  },

  /**
   * Registrar nuevo usuario
   */
  async signup(email, password, displayName) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      });

      if (error) throw error;

      this.currentUser = data.user;
      console.log('✓ Usuario registrado:', email);
      return data;
    } catch (error) {
      console.error('Error registrando:', error.message);
      return null;
    }
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await this.supabase.auth.signOut();
      this.currentUser = null;
      localStorage.removeItem('supabase_user');
      console.log('✓ Sesión cerrada');
      return true;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      return false;
    }
  },

  /**
   * Guardar sesión de entrenamiento en Supabase
   */
  async saveTrainingSession(sessionData) {
    if (!this.currentUser) {
      console.warn('No hay usuario autenticado. Guardando localmente...');
      return await window.OrionImprovements.OfflineStorage.saveSessionLocally(sessionData);
    }

    try {
      const { data, error } = await this.supabase
        .from('training_sessions')
        .insert([
          {
            user_id: this.currentUser.id,
            athlete_id: sessionData.athlete_id,
            exercise_name: sessionData.exerciseName,
            exercise_type: sessionData.exerciseType,
            reaction_times: sessionData.reactionTimes,
            results: sessionData.results,
            statistics: JSON.stringify(window.OrionImprovements.SessionStats.calculateStats(sessionData)),
            notes: sessionData.notes,
            session_duration: sessionData.duration,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      console.log('✓ Sesión guardada en Supabase');
      return data[0];
    } catch (error) {
      console.error('Error guardando sesión:', error);
      // Fallback a almacenamiento local
      return await window.OrionImprovements.OfflineStorage.saveSessionLocally(sessionData);
    }
  },

  /**
   * Obtener histórico de sesiones del usuario
   */
  async getUserSessions(limit = 50) {
    if (!this.currentUser) return [];

    try {
      const { data, error } = await this.supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      return [];
    }
  },

  /**
   * Obtener sesiones de un atleta específico
   */
  async getAthleteSessions(athleteId, limit = 100) {
    if (!this.currentUser) return [];

    try {
      const { data, error } = await this.supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error obteniendo sesiones del atleta:', error);
      return [];
    }
  },

  /**
   * Guardar perfil de atleta
   */
  async saveAthlete(athleteData) {
    if (!this.currentUser) {
      console.warn('No hay usuario autenticado');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('athletes')
        .insert([
          {
            user_id: this.currentUser.id,
            name: athleteData.name,
            email: athleteData.email,
            sport: athleteData.sport,
            position: athleteData.position,
            dorsal: athleteData.dorsal,
            birth_date: athleteData.birthDate,
            gender: athleteData.gender,
            dominant_hand: athleteData.dominantHand,
            dominant_foot: athleteData.dominantFoot,
            notes: athleteData.notes,
            photo_url: athleteData.photoUrl,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      console.log('✓ Atleta guardado en Supabase');
      return data[0];
    } catch (error) {
      console.error('Error guardando atleta:', error);
      return null;
    }
  },

  /**
   * Obtener todos los atletas del usuario
   */
  async getUserAthletes() {
    if (!this.currentUser) return [];

    try {
      const { data, error } = await this.supabase
        .from('athletes')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error obteniendo atletas:', error);
      return [];
    }
  },

  /**
   * Guardar evaluación / test
   */
  async saveEvaluation(evaluationData) {
    if (!this.currentUser) return null;

    try {
      const { data, error } = await this.supabase
        .from('evaluations')
        .insert([
          {
            user_id: this.currentUser.id,
            athlete_id: evaluationData.athlete_id,
            template_name: evaluationData.template_name,
            test_type: evaluationData.test_type,
            values: JSON.stringify(evaluationData.values),
            notes: evaluationData.notes,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      console.log('✓ Evaluación guardada en Supabase');
      return data[0];
    } catch (error) {
      console.error('Error guardando evaluación:', error);
      return null;
    }
  },

  /**
   * Obtener evaluaciones de un atleta
   */
  async getAthleteEvaluations(athleteId) {
    if (!this.currentUser) return [];

    try {
      const { data, error } = await this.supabase
        .from('evaluations')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error);
      return [];
    }
  },

  /**
   * Sincronizar sesiones offline con Supabase
   */
  async syncOfflineSessions() {
    if (!this.currentUser) {
      console.warn('No hay usuario autenticado, no se puede sincronizar');
      return;
    }

    try {
      const unsynced = await window.OrionImprovements.OfflineStorage.getUnsynedSessions();

      for (const session of unsynced) {
        const result = await this.saveTrainingSession(session);
        if (result) {
          await window.OrionImprovements.OfflineStorage.markSessionSynced(session.id);
        }
      }

      console.log(`✓ ${unsynced.length} sesiones sincronizadas`);
      return true;
    } catch (error) {
      console.error('Error sincronizando sesiones:', error);
      return false;
    }
  },

  /**
   * Escuchar cambios en tiempo real (Real-Time Subscriptions)
   */
  subscribeToSessions(callback) {
    if (!this.currentUser) return null;

    const subscription = this.supabase
      .channel(`sessions:${this.currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'training_sessions',
          filter: `user_id=eq.${this.currentUser.id}`
        },
        (payload) => {
          console.log('Nueva sesión recibida:', payload.new);
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    const stored = localStorage.getItem('supabase_user');
    return stored ? JSON.parse(stored) : null;
  }
};

// Auto-inicializar si hay credenciales en localStorage
window.addEventListener('load', async () => {
  const supabaseConfig = localStorage.getItem('supabase_config');
  if (supabaseConfig) {
    const { apiUrl, apiKey } = JSON.parse(supabaseConfig);
    await SupabaseIntegration.init(apiUrl, apiKey);

    // Intentar sincronizar sesiones offline
    window.addEventListener('online', () => {
      SupabaseIntegration.syncOfflineSessions();
    });
  }
});

window.OrionImprovements.SupabaseIntegration = SupabaseIntegration;
