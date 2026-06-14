/**
 * SupabaseIntegration
 * Usa el cliente _sb y currentProfessionalId ya inicializados por la app.
 * La autenticación la gestiona la app (no duplicar aquí).
 *
 * Tablas reales:
 *   sessions       – id, player_id, exercise_type, notes, professional_id, date
 *   results        – session_id, professional_id, repetition, node_id, shape, color, reaction_ms, result
 *   player_profiles – id, full_name, email, sport, position, dorsal, birth_date, gender,
 *                     dominant_hand, dominant_foot, notes, profile_image, professional_id, club_id
 */

const SupabaseIntegration = {
  _sb: null,
  _professionalId: null,

  /**
   * Llamar después del login con el cliente y el professional_id que ya tiene la app.
   */
  setup(supabaseClient, professionalId) {
    this._sb            = supabaseClient;
    this._professionalId = professionalId;
    console.log('✓ SupabaseIntegration configurado');
  },

  _ready() {
    return this._sb && this._professionalId;
  },

  // ─── SESIONES ────────────────────────────────────────────────────────────────

  /**
   * Obtener historial de sesiones del profesional actual.
   * Acepta filtro opcional por player_id.
   */
  async getSessions({ playerId = null, limit = 100 } = {}) {
    if (!this._ready()) return [];
    try {
      let query = this._sb
        .from('sessions')
        .select('*, results(*)')
        .eq('professional_id', this._professionalId)
        .order('date', { ascending: false })
        .limit(limit);
      if (playerId) query = query.eq('player_id', playerId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseIntegration.getSessions:', err);
      return [];
    }
  },

  /**
   * Sincronizar sesiones guardadas offline.
   * Escucha el evento 'orion:syncOffline' emitido por OfflineServiceWorker.
   */
  async syncOfflineSessions(sessions) {
    if (!this._ready()) return;
    let synced = 0;
    for (const session of sessions) {
      try {
        const { data: rows, error } = await this._sb
          .from('sessions')
          .insert([{
            player_id:      session.athlete?.id || null,
            exercise_type:  session.exerciseType || session.type || null,
            notes:          session.notes        || null,
            professional_id: this._professionalId,
            date:           session.timestamp    || new Date().toISOString()
          }])
          .select();
        if (error) throw error;
        const sid = rows[0].id;
        if (session.history && session.history.length) {
          await this._sb.from('results').insert(
            session.history.map(r => ({ session_id: sid, professional_id: this._professionalId, ...r }))
          );
        }
        await window.OrionImprovements.OfflineStorage.markSessionSynced(session.id);
        synced++;
      } catch (err) {
        console.error('Error sincronizando sesión offline:', err);
      }
    }
    if (synced > 0) console.log(`✓ ${synced} sesión(es) sincronizada(s) con Supabase`);
  },

  // ─── JUGADORES ───────────────────────────────────────────────────────────────

  /**
   * Obtener jugadores del profesional (usa player_profiles, compatible con Track).
   */
  async getPlayers({ clubId = null } = {}) {
    if (!this._ready()) return [];
    try {
      let query = this._sb
        .from('player_profiles')
        .select('*')
        .eq('professional_id', this._professionalId)
        .order('full_name');
      if (clubId) query = query.eq('club_id', clubId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseIntegration.getPlayers:', err);
      return [];
    }
  },

  // ─── ANALYTICS ───────────────────────────────────────────────────────────────

  /**
   * Calcular estadísticas por jugador basándose en sesiones + results de Supabase.
   * Devuelve el mismo formato que SessionStats.calculateStats.
   */
  async getPlayerStats(playerId) {
    const sessions = await this.getSessions({ playerId });
    if (!sessions.length) return null;

    const allResults = sessions.flatMap(s => s.results || []);
    const times      = allResults.filter(r => r.reaction_ms > 0).map(r => r.reaction_ms / 1000);

    if (!times.length) return null;

    return window.OrionImprovements.SessionStats.calculateStats({
      reactionTimes: times,
      results:       allResults.map(r => r.result)
    });
  },

  // ─── REAL-TIME ───────────────────────────────────────────────────────────────

  /**
   * Suscribirse a nuevas sesiones del profesional en tiempo real.
   * Devuelve la suscripción (llamar .unsubscribe() para cancelar).
   */
  subscribeToSessions(callback) {
    if (!this._ready()) return null;
    return this._sb
      .channel(`sessions:${this._professionalId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'sessions',
        filter: `professional_id=eq.${this._professionalId}`
      }, payload => callback(payload.new))
      .subscribe();
  }
};

// Escuchar el evento de sync offline
window.addEventListener('orion:syncOffline', e => {
  SupabaseIntegration.syncOfflineSessions(e.detail.sessions);
});

window.OrionImprovements.SupabaseIntegration = SupabaseIntegration;
console.log('✓ SupabaseIntegration cargado');
