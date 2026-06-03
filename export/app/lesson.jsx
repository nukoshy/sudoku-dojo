// Sudoku Dojo — Technique lessons (teaching loop). Short + interactive:
// the learner taps the cell the technique solves, then sees the reasoning.
const { useState: useStateL } = React;

function LessonDemo({ tech }) {
  const [revealed, setRevealed] = useStateL(false);
  const [wrong, setWrong] = useStateL(null);

  function tap(i) {
    if (revealed) return;
    if (tech.row[i] !== 0) return;            // a given — ignore
    if (i === tech.target) {
      setRevealed(true); setWrong(null);
      window.DojoAudio && DojoAudio.pen();
    } else {
      setWrong(i); window.DojoAudio && DojoAudio.error();
      setTimeout(() => setWrong((w) => (w === i ? null : w)), 350);
    }
  }

  return (
    <div className="lsn-demo">
      <div className="lsn-prompt">
        {revealed ? 'Here is the move ↓' : 'Tap the cell this technique solves'}
      </div>
      <div className="lsn-row">
        {tech.row.map((v, i) => {
          const isTarget = i === tech.target;
          const cls = ['lsn-cell'];
          if (v !== 0) cls.push('given');
          if (isTarget && revealed) cls.push('solved');
          if (wrong === i) cls.push('miss');
          if (isTarget && !revealed) cls.push('target');
          return (
            <div key={i} className={cls.join(' ')} onClick={() => tap(i)}>
              {v !== 0 ? v
                : (isTarget && revealed ? <span className="lsn-ans">{tech.answer}</span>
                  : (tech.notes[i]
                    ? <div className="lsn-notes">
                        {[1,2,3,4,5,6,7,8,9].map((n) => (
                          <span key={n} className={revealed && n === tech.answer && isTarget ? 'hot' : ''}>
                            {tech.notes[i].includes(n) ? n : ''}
                          </span>
                        ))}
                      </div>
                    : null))}
            </div>
          );
        })}
      </div>
      {revealed ? (
        <ol className="lsn-steps">
          {tech.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      ) : (
        <button className="pix-btn ghost lsn-show" onClick={() => { setRevealed(true); window.DojoAudio && DojoAudio.hint(); }}>
          <Icon name="bulb" size={14} /><span>Show me</span>
        </button>
      )}
    </div>
  );
}

// Full-screen lesson surface (used by the teaching-loop trigger + library).
function Lesson({ tech, fromFail, onDone, onBack }) {
  return (
    <div className="screen enter lesson">
      <div className="lsn-inner">
        <header className="lsn-top">
          <button className="pix-btn ghost prof-back" onClick={onBack}><Icon name="back" size={15} /><span>BACK</span></button>
          <div className="lsn-tag">{fromFail ? 'TECHNIQUE DOJO · SUGGESTED' : 'TECHNIQUE DOJO'}</div>
          <div className="prof-spacer"></div>
        </header>

        <div className="lsn-card pix-win">
          <div className="lsn-head">
            <div className="lsn-jp">{tech.jp}</div>
            <div className="lsn-en">{tech.en}</div>
            <div className="lsn-rank">{tech.rank} belt</div>
          </div>
          <div className="lsn-blurb">{tech.blurb}</div>
          {fromFail && <div className="lsn-why">That puzzle leaned on this pattern — learn it, then try a fresh rated puzzle.</div>}

          <LessonDemo tech={tech} />

          <div className="lsn-cta">
            <button className="pix-btn primary" onClick={onDone}><Icon name={fromFail ? 'play' : 'check'} size={15} /><span>{fromFail ? 'TRY A RATED PUZZLE' : 'DONE'}</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Technique library (the Techniques nav tile).
function Techniques({ profile, onBack, onOpen, onLocked }) {
  return (
    <div className="screen enter techlib">
      <div className="prof-inner">
        <header className="prof-top">
          <button className="pix-btn ghost prof-back" onClick={onBack}><Icon name="back" size={15} /><span>HOME</span></button>
          <div className="prof-title">TECHNIQUE DOJO</div>
          <div className="prof-spacer"></div>
        </header>
        <div className="tech-lead">Each scroll teaches one solving pattern. Fail a puzzle that needs one and the dojo points you here.{!profile.premium && ' First three are free.'}</div>
        <div className="tech-list">
          {TECHNIQUES.map((t, i) => {
            const locked = techLockedFree(i, profile.premium);
            return (
              <button key={t.key} className={'tech-row pix-win' + (locked ? ' locked' : '')}
                onClick={() => (locked ? onLocked() : onOpen(t.key))}>
                <div className="tech-jp">{t.jp}</div>
                <div className="tech-main">
                  <div className="tech-en">{t.en}</div>
                  <div className="tech-blurb">{t.blurb}</div>
                </div>
                {locked
                  ? <span className="lock-tag"><Icon name="lock" size={11} />Dojo Pass</span>
                  : <div className="tech-rank">{t.rank}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Lesson, LessonDemo, Techniques });
