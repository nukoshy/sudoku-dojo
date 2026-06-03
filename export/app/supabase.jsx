// Sudoku Dojo — real backend layer (Supabase auth + per-user data).
// Activates only when window.__DOJO_CONFIG provides SUPABASE_URL + key. When
// unconfigured, DojoBackend.enabled is false and the app uses local-only flow.

const DojoBackend = (function () {
  const cfg = (window.__DOJO_CONFIG) || {};
  const hasConfig = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const hasGoogle = !!cfg.GOOGLE_CLIENT_ID;

  // The supabase-js UMD loads async, so create the client lazily on first use
  // rather than at module load. This keeps the app rendering even if the CDN is
  // slow/unreachable, and avoids a load-order race.
  let client = null;
  function getClient() {
    if (client) return client;
    if (hasConfig && window.supabase) {
      client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    }
    return client;
  }

  // ---- Auth: email OTP ----
  async function sendOtp(email) {
    const client = getClient();
    if (!client) throw new Error('Backend not configured');
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
    return true;
  }

  async function verifyOtp(email, token) {
    const client = getClient();
    if (!client) throw new Error('Backend not configured');
    const { data, error } = await client.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    return data.user;
  }

  // ---- Auth: Google (Identity Services → Supabase id-token sign-in) ----
  // Renders Google's button into `el`; on success exchanges the credential for
  // a Supabase session, then calls onSuccess(user).
  function renderGoogleButton(el, onSuccess, onError) {
    if (!hasGoogle || !window.google || !window.google.accounts || !el) return false;
    try {
      window.google.accounts.id.initialize({
        client_id: cfg.GOOGLE_CLIENT_ID,
        callback: async (resp) => {
          try {
            const client = getClient();
            if (!client) {
              // No Supabase: still surface the verified Google identity locally.
              onSuccess({ provider: 'google', credential: resp.credential });
              return;
            }
            const { data, error } = await client.auth.signInWithIdToken({
              provider: 'google',
              token: resp.credential,
            });
            if (error) throw error;
            onSuccess(data.user);
          } catch (e) {
            onError && onError(e);
          }
        },
      });
      window.google.accounts.id.renderButton(el, {
        type: 'standard', theme: 'outline', size: 'large',
        text: 'continue_with', shape: 'rectangular', width: 300,
      });
      return true;
    } catch (e) {
      onError && onError(e);
      return false;
    }
  }

  async function getSession() {
    const client = getClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  }

  function onAuthChange(cb) {
    const client = getClient();
    if (!client) return () => {};
    const { data } = client.auth.onAuthStateChange((_e, session) => cb(session));
    return () => data.subscription.unsubscribe();
  }

  async function signOut() {
    const client = getClient();
    if (client) await client.auth.signOut();
  }

  // ---- Data: per-user profile (jsonb) ----
  async function loadProfile(userId) {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client
      .from('dojo_profiles').select('data').eq('id', userId).maybeSingle();
    if (error) { console.warn('loadProfile', error.message); return null; }
    return data ? data.data : null;
  }

  let saveTimer = null;
  function saveProfile(userId, data) {
    const client = getClient();
    if (!client || !userId) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const { error } = await client.from('dojo_profiles').upsert(
        { id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      );
      if (error) console.warn('saveProfile', error.message);
    }, 600);
  }

  // ---- Leaderboard ----
  // Fetch all entries sorted by rating descending (public read — no auth required).
  async function fetchLeaderboard() {
    const client = getClient();
    if (!client) return [];
    const { data, error } = await client
      .from('leaderboard_entries')
      .select('user_id, nick, rating, solved, streak')
      .order('rating', { ascending: false })
      .limit(100);
    if (error) { console.warn('fetchLeaderboard', error.message); return []; }
    return data || [];
  }

  // Upsert the current user's public stats after a rated game.
  async function upsertLeaderboard(userId, { nick, rating, solved, streak }) {
    const client = getClient();
    if (!client || !userId) return;
    const { error } = await client.from('leaderboard_entries').upsert(
      { user_id: userId, nick, rating, solved, streak, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
    if (error) console.warn('upsertLeaderboard', error.message);
  }

  return {
    enabled: hasConfig,
    googleEnabled: hasGoogle,
    sendOtp, verifyOtp, renderGoogleButton,
    getSession, onAuthChange, signOut,
    loadProfile, saveProfile,
    fetchLeaderboard, upsertLeaderboard,
  };
})();

Object.assign(window, { DojoBackend });
