// Sudoku Dojo — onboarding screens. Welcome / Choose Path / Personalize.
const { useState } = React;

function Welcome({ onBegin }) {
  return (
    <div className="screen enter welcome">
      <div className="dojo-sun sun"></div>
      <div className="seal">道</div>
      <div className="stack">
        <div className="welcome-plate">
          <div className="jp">数独道場</div>
          <div className="en">SUDOKU DOJO</div>
        </div>
        <div className="tag">The art of mindful numbers.</div>
        <div className="go">
          <button className="pix-btn primary" onClick={onBegin}>ENTER ▶</button>
        </div>
      </div>
    </div>
  );
}

function ChooseLevel({ initial, onBack, onNext }) {
  const [sel, setSel] = useState(initial != null ? initial : null);
  function pick(i) {
    if (i === sel) return;
    setSel(i);
    window.DojoAudio && DojoAudio.select();
  }
  return (
    <div className="screen enter onb level">
      <div className="onb-head">
        <div className="onb-step">STEP 2 / 3</div>
        <div className="onb-sub">あなたの実力は</div>
        <h1 className="onb-title">WHAT'S YOUR LEVEL?</h1>
        <div className="onb-lead">This sets how tough your puzzles start — fewer hints and more blanks as you climb. Everyone begins at 400 Elo and earns the rest by solving.</div>
      </div>

      <div className="level-list">
        {LEVELS.map((lv, i) => (
          <div key={lv.key}
            className={'level-row' + (sel === i ? ' sel' : '')}
            onClick={() => pick(i)}>
            <div className={'level-belt ' + lv.belt}></div>
            <div className="level-main">
              <div className="level-name">{lv.en}</div>
              <div className="level-blurb">{lv.blurb}</div>
            </div>
            <div className="level-meta">
              <div className="lm-top">{lv.empties} blanks · {lv.hints} hints</div>
              <div className="lm-sub">~{lv.seed} Elo puzzles</div>
            </div>
            <div className="level-radio">{sel === i ? '◉' : '◯'}</div>
          </div>
        ))}
      </div>

      <div className="onb-foot">
        <button className="pix-btn ghost" onClick={onBack}>◀ BACK</button>
        <button className="pix-btn primary" disabled={sel == null}
          onClick={() => onNext(sel)}>CONTINUE ▶</button>
      </div>
    </div>
  );
}

function Familiarity({ initial, onNext }) {
  const [sel, setSel] = useState(initial != null ? initial : null);
  function pick(i) { setSel(i); window.DojoAudio && DojoAudio.select(); }
  return (
    <div className="screen enter onb level">
      <div className="onb-head">
        <div className="onb-sub">ようこそ</div>
        <h1 className="onb-title">HOW WELL DO YOU KNOW SUDOKU?</h1>
        <div className="onb-lead">Just so we start you at the right level — your rating adjusts from here as you play.</div>
      </div>

      <div className="fam-list">
        {FAMILIARITY.map((f, i) => (
          <button key={f.key} className={'fam-row pix-win' + (sel === i ? ' sel' : '')} onClick={() => pick(i)}>
            <div className="fam-jp">{f.jp}</div>
            <div className="fam-main">
              <div className="fam-name">{f.en}</div>
              <div className="fam-blurb">{f.blurb}</div>
            </div>
            <div className="level-radio">{sel === i ? '◉' : '◯'}</div>
          </button>
        ))}
      </div>

      <div className="onb-foot" style={{ justifyContent: 'center' }}>
        <button className="pix-btn primary" disabled={sel == null}
          onClick={() => onNext(sel)}><span>ENTER THE DOJO</span><Icon name="chevron" size={15} /></button>
      </div>
    </div>
  );
}

Object.assign(window, { Welcome, Familiarity });
