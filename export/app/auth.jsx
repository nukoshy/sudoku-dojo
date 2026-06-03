// Sudoku Dojo — auth gate. Email-first (OTP) with Google second.
// Uses DojoBackend (Supabase) when configured; otherwise falls back to a
// local sign-in so the prototype still flows without a backend.
const { useState: useStateA, useRef: useRefA, useEffect: useEffectA } = React;

function deriveNick(email, user) {
  const meta = (user && user.user_metadata) || {};
  if (meta.full_name) return String(meta.full_name).split(' ')[0];
  if (meta.name) return String(meta.name).split(' ')[0];
  const n = ((email || '').split('@')[0] || '').replace(/[^a-zA-Z0-9_]/g, '');
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : 'Deshi';
}

function Auth({ onAuth }) {
  const be = window.DojoBackend || { enabled: false, googleEnabled: false };
  const [step, setStep] = useStateA('email'); // 'email' | 'otp'
  const [email, setEmail] = useStateA('');
  const [code, setCode] = useStateA('');
  const [busy, setBusy] = useStateA(false);
  const [err, setErr] = useStateA('');
  const googleRef = useRefA(null);
  const renderedRef = useRefA(false);
  const [googleFailed, setGoogleFailed] = useStateA(false);
  const validEmail = /\S+@\S+\.\S+/.test(email);
  // Real Google sign-in needs both the client id and the Supabase backend (to
  // create a session + persist data). Until then, show the local fallback.
  const realGoogle = be.enabled && be.googleEnabled;

  // Render the real Google button (Identity Services). The GIS script loads
  // async, so retry until window.google is ready (up to ~6s) instead of
  // silently rendering nothing if the effect runs first.
  useEffectA(() => {
    if (step !== 'email' || !realGoogle) return;
    renderedRef.current = false;
    setGoogleFailed(false);
    let tries = 0, timer = null;
    const attempt = () => {
      if (renderedRef.current || !googleRef.current) return;
      const ok = be.renderGoogleButton(
        googleRef.current,
        (user) => onAuth({ provider: 'google', nick: deriveNick('', user), user }),
        (e) => setErr((e && e.message) || 'Google sign-in failed'),
      );
      if (ok) { renderedRef.current = true; }
      else if (tries++ < 20) { timer = setTimeout(attempt, 300); }
      else { setGoogleFailed(true); }
    };
    attempt();
    return () => { if (timer) clearTimeout(timer); };
  }, [step]);

  async function submitEmail() {
    setErr('');
    if (!validEmail) { setErr('Enter a valid email.'); return; }
    if (!be.enabled) { onAuth({ provider: 'email', nick: deriveNick(email) }); return; }
    setBusy(true);
    try {
      await be.sendOtp(email);
      setStep('otp');
    } catch (e) { setErr((e && e.message) || 'Could not send code.'); }
    setBusy(false);
  }

  async function submitCode() {
    setErr('');
    if (code.trim().length < 6) { setErr('Enter the 6-digit code.'); return; }
    setBusy(true);
    try {
      const user = await be.verifyOtp(email, code.trim());
      onAuth({ provider: 'email', nick: deriveNick(email, user), user });
    } catch (e) { setErr((e && e.message) || 'Invalid or expired code.'); }
    setBusy(false);
  }

  return (
    <div className="screen enter auth">
      <div className="auth-inner">
        <div className="auth-mark">道場</div>
        <div className="auth-title">SUDOKU DOJO</div>
        <div className="auth-sub">Sign in to save your rating, streak, and belts.</div>

        <div className="auth-card pix-win">
          {step === 'email' ? (
            <React.Fragment>
              <label className="auth-label" htmlFor="dojo-email">EMAIL</label>
              <input
                id="dojo-email" className="auth-input" type="email" inputMode="email"
                placeholder="you@email.com" autoFocus autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitEmail(); }}
              />
              <button className="auth-btn primary" disabled={busy} onClick={submitEmail}>
                <span>{busy ? 'Sending…' : (be.enabled ? 'Send code' : 'Continue')}</span>
                <Icon name="chevron" size={15} />
              </button>

              <div className="auth-or"><span>or</span></div>

              {realGoogle ? (
                <React.Fragment>
                  <div className="auth-google" ref={googleRef} />
                  {googleFailed && (
                    <div className="auth-otp-note" style={{ textAlign: 'center' }}>
                      Google sign-in couldn't load — use email above instead.
                    </div>
                  )}
                </React.Fragment>
              ) : (
                <button
                  className="auth-btn google"
                  onClick={() => onAuth({ provider: 'google', nick: 'Deshi' })}
                >
                  <span className="ab-chip g">G</span><span>Continue with Google</span>
                </button>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <label className="auth-label">CHECK YOUR EMAIL</label>
              <div className="auth-otp-note">
                We emailed a 6-digit code to <b>{email}</b>. Enter it below to sign in.
              </div>
              <input
                className="auth-input otp" type="text" inputMode="numeric" maxLength={6}
                placeholder="••••••" autoFocus value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') submitCode(); }}
              />
              <button className="auth-btn primary" disabled={busy} onClick={submitCode}>
                <span>{busy ? 'Verifying…' : 'Verify & enter'}</span>
                <Icon name="chevron" size={15} />
              </button>
              <button className="auth-textback" onClick={() => { setStep('email'); setCode(''); setErr(''); }}>
                <Icon name="back" size={13} /><span>Use a different email</span>
              </button>
            </React.Fragment>
          )}

          {err ? <div className="auth-err" role="alert">{err}</div> : null}
        </div>

        <div className="auth-fine">By continuing you agree to the dojo's terms. No ads, ever.</div>
      </div>
    </div>
  );
}

Object.assign(window, { Auth });
