// Sudoku Dojo — monetization surfaces. Freemium + Dojo Pass. Pixel Dojo style.
const { useState: useStatePay } = React;

// Small inline lock badge.
function LockTag({ label }) {
  return <span className="lock-tag"><Icon name="lock" size={11} />{label || 'Dojo Pass'}</span>;
}

// Reusable overlay upgrade prompt (soft, dismissible).
function UpgradeOverlay({ title, jp, lines, onUpgrade, onDismiss, dismissLabel }) {
  return (
    <div className="done-veil show">
      <div className="done-card pix-win pay-card">
        {onDismiss && <button className="done-close" onClick={onDismiss} aria-label="Close"><Icon name="x" size={15} /></button>}
        <div className="pay-seal"><Icon name="lock" size={30} /></div>
        {jp && <div className="jp">{jp}</div>}
        <h2>{title}</h2>
        <ul className="pay-benefits">
          {lines.map((l, i) => (
            <li key={i}><Icon name="check" size={15} /><span>{l}</span></li>
          ))}
        </ul>
        <div className="cta">
          {onDismiss && <button className="pix-btn" onClick={onDismiss}>{dismissLabel || 'NOT NOW'}</button>}
          <button className="pix-btn primary" onClick={onUpgrade}><Icon name="star" size={15} /><span>GET DOJO PASS</span></button>
        </div>
      </div>
    </div>
  );
}

// First-touch soft prompt after the first solve.
function FirstSolvePrompt({ profile, onUpgrade, onDismiss }) {
  const belt = beltForRating(profile.rating || 400);
  return (
    <div className="screen enter pay-first">
      <div className="pay-first-inner">
        <div className="pf-tag">YOUR RATING IS LIVE</div>
        <div className="pf-rating">{profile.rating || 400}<small>elo</small></div>
        <div className="pf-belt">{belt.jp} {belt.en}</div>
        <div className="pf-lead">Every solve now moves this number — matched to your real skill, like a chess puzzle rating. Keep it climbing.</div>
        <div className="pay-card pix-win pf-card">
          <div className="pf-card-head">DOJO PASS UNLOCKS</div>
          <ul className="pay-benefits">
            {DOJO_PASS.benefits.map((l, i) => (
              <li key={i}><Icon name="check" size={15} /><span>{l}</span></li>
            ))}
          </ul>
          <div className="pf-price">{DOJO_PASS.yearly}/yr <span>· {DOJO_PASS.yearlyPerMo}</span></div>
        </div>
        <div className="pf-cta">
          <button className="pix-btn" onClick={onDismiss}><Icon name="play" size={15} /><span>START FREE</span></button>
          <button className="pix-btn primary" onClick={onUpgrade}><Icon name="star" size={15} /><span>GET DOJO PASS</span></button>
        </div>
        <div className="pf-note">Free includes the daily rated puzzle + unlimited Zen Mode. No ads, ever.</div>
      </div>
    </div>
  );
}

// Pricing screen.
function Paywall({ reason, onBack, onUpgrade }) {
  const [plan, setPlan] = useStatePay('yearly');
  return (
    <div className="screen enter paywall">
      <div className="prof-inner pay-inner">
        <header className="prof-top">
          <button className="pix-btn ghost prof-back" onClick={onBack}><Icon name="back" size={15} /><span>BACK</span></button>
          <div className="prof-title">DOJO PASS</div>
          <div className="prof-spacer"></div>
        </header>

        <div className="pay-hero">
          <div className="pay-hero-jp">通行証</div>
          <div className="pay-hero-lead">{reason || 'Unlock the full dojo — unlimited rated puzzles, the whole technique library, the leaderboard, and Puzzle Rush.'}</div>
        </div>

        <div className="pay-body">
          <div className="pay-benefits-card pix-win">
            <div className="pf-card-head">EVERYTHING IN DOJO PASS</div>
            <ul className="pay-benefits big">
              {DOJO_PASS.benefits.map((l, i) => (
                <li key={i}><Icon name="check" size={16} /><span>{l}</span></li>
              ))}
              <li><Icon name="check" size={16} /><span>No ads — ever</span></li>
            </ul>
          </div>

          <div className="pay-plans">
            <button className={'plan pix-win' + (plan === 'monthly' ? ' on' : '')} onClick={() => setPlan('monthly')}>
              <div className="plan-name">MONTHLY</div>
              <div className="plan-price">{DOJO_PASS.monthly}</div>
              <div className="plan-sub">per month</div>
            </button>
            <button className={'plan pix-win' + (plan === 'yearly' ? ' on' : '')} onClick={() => setPlan('yearly')}>
              <div className="plan-flag">BEST VALUE</div>
              <div className="plan-name">YEARLY</div>
              <div className="plan-price">{DOJO_PASS.yearly}</div>
              <div className="plan-sub">{DOJO_PASS.yearlyPerMo} · save 40%</div>
            </button>
            <button className="pix-btn primary pay-go" onClick={onUpgrade}>
              <Icon name="star" size={16} /><span>START DOJO PASS</span>
            </button>
            <div className="pay-fine">Secure checkout · cancel anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Puzzle Rush — locked for free (preview + upgrade), preview for premium.
function PuzzleRush({ premium, onUpgrade, onBack }) {
  return (
    <div className="screen enter puzzlerush">
      <div className="prof-inner">
        <header className="prof-top">
          <button className="pix-btn ghost prof-back" onClick={onBack}><Icon name="back" size={15} /><span>HOME</span></button>
          <div className="prof-title">PUZZLE RUSH</div>
          <div className="prof-spacer"></div>
        </header>

        <div className="pr-hero pix-win">
          <div className="pr-jp">連続勝負</div>
          <div className="pr-bolt"><Icon name="bolt" size={34} /></div>
          <div className="pr-lead">Solve as many rated puzzles as you can in <b>3 minutes</b>. Three mistakes ends the run. Climb the rush leaderboard.</div>
          <div className="pr-steps">
            <div className="pr-step"><div className="prs-n">1</div><div>Puzzles get harder as you go</div></div>
            <div className="pr-step"><div className="prs-n">2</div><div>+1 for each solve, x3 mistakes ends it</div></div>
            <div className="pr-step"><div className="prs-n">3</div><div>Beat your best — and your friends'</div></div>
          </div>
          {premium ? (
            <div className="pr-soon"><Icon name="clock" size={16} /><span>COMING SOON FOR MEMBERS</span></div>
          ) : (
            <button className="pix-btn primary pr-cta" onClick={onUpgrade}>
              <Icon name="lock" size={15} /><span>UNLOCK WITH DOJO PASS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Post-upgrade confirmation.
function WelcomeConfirm({ onDone }) {
  return (
    <div className="done-veil show">
      <div className="done-card pix-win">
        <div className="seal">承</div>
        <div className="jp">ようこそ</div>
        <h2>WELCOME TO THE DOJO</h2>
        <div className="done-sub">Dojo Pass is active. Everything's unlocked — unlimited rated puzzles, the full library, the leaderboard, and Puzzle Rush.</div>
        <div className="cta">
          <button className="pix-btn primary" onClick={onDone}><Icon name="check" size={15} /><span>LET'S GO</span></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LockTag, UpgradeOverlay, FirstSolvePrompt, Paywall, PuzzleRush, WelcomeConfirm });
