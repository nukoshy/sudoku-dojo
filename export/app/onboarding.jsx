// Sudoku Dojo — onboarding screens. Welcome / Choose Path / Personalize / Tutorial.
const { useState, useEffect: useEffectOnb } = React;

// ---- Interactive tutorial (shown to players who have never played Sudoku) ----

// Build a flat 81-cell board given a list of [row, col, value] entries.
function makeTutBoard(entries) {
  const board = new Array(81).fill(0);
  entries.forEach(([r, c, v]) => { board[r * 9 + c] = v; });
  return board;
}

// Three steps: row → column → box. Each teaches one Sudoku rule interactively.
const TUT_STEPS = [
  {
    title: 'COMPLETE THE ROW',
    rule: 'Each row must contain the numbers 1–9 exactly once.',
    houseType: 'row', houseIdx: 4,
    board: makeTutBoard([[4,0,8],[4,1,7],[4,2,5],[4,3,9],[4,4,6],[4,6,3],[4,7,4],[4,8,1]]),
    targetCell: 4 * 9 + 5, answer: 2,
  },
  {
    title: 'COMPLETE THE COLUMN',
    rule: 'Each column must contain the numbers 1–9 exactly once.',
    houseType: 'col', houseIdx: 4,
    board: makeTutBoard([[0,4,7],[1,4,6],[3,4,8],[4,4,2],[5,4,5],[6,4,4],[7,4,1],[8,4,9]]),
    targetCell: 2 * 9 + 4, answer: 3,
  },
  {
    title: 'COMPLETE THE BOX',
    rule: 'Each 3×3 box must contain the numbers 1–9 exactly once.',
    houseType: 'box', houseIdx: 4,
    board: makeTutBoard([[3,3,2],[3,4,9],[4,3,5],[4,4,7],[4,5,3],[5,3,6],[5,4,4],[5,5,8]]),
    targetCell: 3 * 9 + 5, answer: 1,
  },
];

function TutGrid({ step, phase, onCellTap, gridClass }) {
  const { board, houseType, houseIdx, targetCell } = step;
  return (
    <div className={gridClass || 'tut-grid'}>
      {board.map((val, i) => {
        const r = Math.floor(i / 9), c = i % 9;
        let inHouse = false;
        if (houseType === 'row') inHouse = r === houseIdx;
        if (houseType === 'col') inHouse = c === houseIdx;
        if (houseType === 'box') {
          const br = Math.floor(houseIdx / 3) * 3, bc = (houseIdx % 3) * 3;
          inHouse = r >= br && r < br + 3 && c >= bc && c < bc + 3;
        }
        const isTarget = i === targetCell;
        const solved = isTarget && phase === 'done';
        const cls = ['tut-cell'];
        if (c === 2 || c === 5) cls.push('tcr');
        if (r === 2 || r === 5) cls.push('tcb');
        if (inHouse && !isTarget) cls.push('tut-house');
        if (isTarget && !solved) cls.push('tut-target', 'pulse');
        if (solved) cls.push('tut-solved');
        const canTap = isTarget && phase === 'cell';
        return (
          <div key={i} className={cls.join(' ')} onClick={() => canTap && onCellTap()}>
            {val !== 0 ? val : solved ? step.answer : null}
            {isTarget && phase === 'cell' && (
              <div className={'tut-bubble' + (houseType === 'col' ? ' side' : '')}>Tap this cell</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Tutorial({ onDone }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState('cell'); // 'cell' | 'number' | 'done'
  const [shake, setShake] = useState(null);
  const step = TUT_STEPS[stepIdx];

  function tapCell() {
    setPhase('number');
    window.DojoAudio && DojoAudio.select();
  }

  function tapNumber(n) {
    if (n !== step.answer) {
      setShake(n);
      window.DojoAudio && DojoAudio.error();
      setTimeout(() => setShake(null), 380);
      return;
    }
    setPhase('done');
    window.DojoAudio && DojoAudio.pen();
    setTimeout(() => {
      if (stepIdx + 1 < TUT_STEPS.length) {
        setStepIdx(s => s + 1);
        setPhase('cell');
      } else {
        onDone();
      }
    }, 1000);
  }

  return (
    <div className="screen enter tut">
      <div className="tut-inner">
        <div className="tut-step-dots">
          {TUT_STEPS.map((_, i) => (
            <div key={i} className={'tut-dot' + (i === stepIdx ? ' on' : '')} />
          ))}
        </div>

        <div className="tut-instr">{step.title}</div>

        <TutGrid step={step} phase={phase} onCellTap={tapCell} />

        {phase === 'number' && (
          <div className="tut-rule">{step.rule}</div>
        )}
        {phase !== 'number' && (
          <div className="tut-sub">
            {phase === 'cell' ? 'Find the empty cell in the highlighted ' + step.houseType + ' and tap it.' : '✓ Correct!'}
          </div>
        )}

        <div className="tut-pad">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button
              key={n}
              className={'tut-num' + (phase !== 'number' ? ' dim' : '') + (phase === 'number' && n === step.answer ? ' highlight' : '') + (shake === n ? ' wrong' : '')}
              onClick={() => phase === 'number' && tapNumber(n)}
            >{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

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

Object.assign(window, { Welcome, Familiarity, Tutorial, TutGrid, TUT_STEPS, makeTutBoard });
