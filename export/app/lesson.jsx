// Sudoku Dojo — Technique lessons (teaching loop). Short + interactive:
// the learner taps the cell the technique solves inside a real-board context.
const { useState: useStateL } = React;

// Place the technique's row in row 4 of a 9×9 board for real-game feel.
function buildLessonBoard(tech) {
  const board = new Array(81).fill(0);
  tech.row.forEach((v, c) => { board[4 * 9 + c] = v; });
  return board;
}

function LessonDemo({ tech }) {
  const [revealed, setRevealed] = useStateL(false);
  const [wrong, setWrong] = useStateL(null);

  // Target cell in the full 81-cell board: row 4, column = tech.target
  const targetCell = 4 * 9 + tech.target;
  const board = buildLessonBoard(tech);

  // Build a fake TUT_STEPS-style step so TutGrid can render it.
  const step = {
    board,
    houseType: 'row',
    houseIdx: 4,
    targetCell,
    answer: tech.answer,
  };

  function tapCell(flatIdx) {
    if (revealed) return;
    const col = flatIdx % 9;
    if (col === tech.target) {
      setRevealed(true); setWrong(null);
      window.DojoAudio && DojoAudio.pen();
    } else {
      setWrong(col); window.DojoAudio && DojoAudio.error();
      setTimeout(() => setWrong(w => (w === col ? null : w)), 350);
    }
  }

  // Render the board using TutGrid (exported from onboarding.jsx).
  // Patch the board to show notes in the target cell when not revealed.
  const boardWithNotes = board.slice();
  // (notes displayed via overlay after the grid — see below)

  return (
    <div className="lsn-board-wrap">
      <div className="lsn-board-label">
        {revealed ? 'HERE IS THE MOVE' : 'FIND THE CELL THIS TECHNIQUE SOLVES'}
      </div>

      {/* Full 9×9 board — technique row is row 4, rest faded */}
      <div className="lsn-tut-grid">
        {board.map((val, i) => {
          const r = Math.floor(i / 9), c = i % 9;
          const inHouse = r === 4;
          const isTarget = i === targetCell;
          const solved = isTarget && revealed;
          const isMiss = wrong === c && inHouse && !isTarget;
          const cls = ['tut-cell'];
          if (c === 2 || c === 5) cls.push('tcr');
          if (r === 2 || r === 5) cls.push('tcb');
          if (inHouse && !isTarget) cls.push('tut-house');
          if (isTarget && !solved) cls.push('tut-target', revealed ? '' : 'pulse');
          if (solved) cls.push('tut-solved');
          if (isMiss) cls.push('miss');
          return (
            <div key={i} className={cls.join(' ')} onClick={() => inHouse && !val && tapCell(i)}>
              {val !== 0 ? val
                : isTarget && solved ? <span className="lsn-ans">{tech.answer}</span>
                : isTarget && tech.notes[tech.target] && !revealed
                  ? <div className="lsn-notes">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <span key={n} className={revealed && n === tech.answer ? 'hot' : ''}>
                          {tech.notes[tech.target].includes(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                : null}
              {isTarget && !revealed && (
                <div className="tut-bubble">Tap this cell</div>
              )}
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
