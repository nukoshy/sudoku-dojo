// Sudoku Dojo — auth gate. Continue with Email / Google / Apple (mock).
const { useState: useStateA } = React;

function Auth({ onAuth }) {
  const [emailMode, setEmailMode] = useStateA(false);
  const [email, setEmail] = useStateA('');
  const nickFromEmail = () => {
    const n = (email.split('@')[0] || '').replace(/[^a-zA-Z0-9_]/g, '');
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : 'Deshi';
  };
  return (
    <div className="screen enter auth">
      <div className="auth-inner">
        <div className="auth-mark">道場</div>
        <div className="auth-title">SUDOKU DOJO</div>
        <div className="auth-sub">Sign in to save your rating, streak, and belts.</div>

        <div className="auth-card pix-win">
          {!emailMode ? (
            <React.Fragment>
              <button className="auth-btn google" onClick={() => onAuth({ provider: 'google', nick: 'Deshi' })}>
                <span className="ab-chip g">G</span><span>Continue with Google</span>
              </button>
              <button className="auth-btn apple" onClick={() => onAuth({ provider: 'apple', nick: 'Deshi' })}>
                <span className="ab-chip a"><Icon name="apple" size={16} /></span><span>Continue with Apple</span>
              </button>
              <button className="auth-btn mail" onClick={() => setEmailMode(true)}>
                <span className="ab-chip m"><Icon name="mail" size={15} /></span><span>Continue with Email</span>
              </button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <label className="auth-label">EMAIL</label>
              <input className="auth-input" type="email" placeholder="you@email.com" autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="auth-btn primary" onClick={() => onAuth({ provider: 'email', nick: nickFromEmail() })}>
                <span>Continue</span><Icon name="chevron" size={15} />
              </button>
              <button className="auth-textback" onClick={() => setEmailMode(false)}><Icon name="back" size={13} /><span>Other options</span></button>
            </React.Fragment>
          )}
        </div>

        <div className="auth-fine">By continuing you agree to the dojo's terms. No ads, ever.</div>
      </div>
    </div>
  );
}

Object.assign(window, { Auth });
