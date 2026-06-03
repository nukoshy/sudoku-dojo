// Sudoku Dojo — interactive game screen. Every game generates a fresh unique puzzle
// via generator.jsx. No hardcoded grids.
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function fmtTime(s) { return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }

// Technique to suggest per mode on failure.
const RATED_TECHNIQUE  = { bullet: 'naked-single', blitz: 'hidden-single', rapid: 'naked-pair' };
const LEVEL_TECHNIQUE  = { beginner: 'naked-single', intermediate: 'hidden-single',
                            advanced: 'naked-pair', expert: 'x-wing' };

// MAX_MISTAKES for rated (zen has none).
const MAX_MISTAKES = 3;

function Game({ profile, onNewPuzzle, onExit, onResult, onLearn, gated, onPlayZen, onUpgrade }) {
  const zen        = !!profile.zen;
  const startHints = profile.hints != null ? profile.hints : 3;

  // ---- Puzzle (generated fresh on every mount) ----
  const solutionRef = useRefG(null);   // flat array [81] — immutable after init
  const [cells, setCells] = useStateG(() => {
    const { givens, solution } = generatePuzzle(profile.empties || 30);
    solutionRef.current = solution;
    return buildBoardFromPuzzle(givens);
  });

  // Helper: correct value for a cell.
  const sol = (r, c) => solutionRef.current[r * 9 + c];

  // ---- UI state ----
  const [sel,       setSel]       = useStateG(null);
  const [notesMode, setNotesMode] = useStateG(false);
  const [mistakes,  setMistakes]  = useStateG(0);
  const [hints,     setHints]     = useStateG(startHints);
  const [seconds,   setSeconds]   = useStateG(0);
  const [paused,    setPaused]    = useStateG(false);
  const [done,      setDone]      = useStateG(null);
  const [animTick,  setAnimTick]  = useStateG(0);
  const [glowKey,   setGlowKey]   = useStateG(null);
  const histRef = useRefG([]);

  // ---- Timer ----
  useEffectG(() => {
    if (paused || done || gated) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused, done, gated]);

  // Rated countdown timeout → fail.
  useEffectG(() => {
    if (!zen && profile.timeLimit && seconds >= profile.timeLimit && !done && !gated) {
      failPuzzle('time');
    }
  }, [seconds]);

  // ---- Keyboard ----
  useEffectG(() => {
    function onKey(e) {
      if (done) return;
      if (e.key >= '1' && e.key <= '9') place(parseInt(e.key, 10));
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') erase();
      else if (e.key === 'n' || e.key === 'N') setNotesMode((v) => !v);
      else if (e.key === 'ArrowUp')    moveSel('ArrowUp');
      else if (e.key === 'ArrowDown')  moveSel('ArrowDown');
      else if (e.key === 'ArrowLeft')  moveSel('ArrowLeft');
      else if (e.key === 'ArrowRight') moveSel('ArrowRight');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---- Navigation ----
  function moveSel(dir) {
    setSel((prev) => {
      if (!prev) return { r: 4, c: 4 };
      let { r, c } = prev;
      if (dir === 'ArrowUp')    r = Math.max(0, r - 1);
      if (dir === 'ArrowDown')  r = Math.min(8, r + 1);
      if (dir === 'ArrowLeft')  c = Math.max(0, c - 1);
      if (dir === 'ArrowRight') c = Math.min(8, c + 1);
      return { r, c };
    });
    window.DojoAudio && DojoAudio.select();
  }

  function selectCell(r, c) {
    setSel({ r, c });
    window.DojoAudio && DojoAudio.select();
  }

  // ---- Undo history ----
  function snapshot() {
    histRef.current.push({ cells: cells.map((x) => ({ ...x, notes: x.notes.slice() })), mistakes });
    if (histRef.current.length > 40) histRef.current.shift();
  }

  // ---- Completion check ----
  function finishCheck(next) {
    const solved = next.every((c) => c.value === sol(c.r, c.c));
    if (!solved) return;

    if (zen) {
      setTimeout(() => {
        setDone({ zen: true, time: seconds });
        window.DojoAudio && DojoAudio.win();
      }, 380);
      return;
    }

    const hintsUsed   = startHints - hints;
    const fromRating  = profile.rating || START_ELO;
    const puzzleElo   = PUZZLE_ELO[profile.controlKey] || 1000;
    const gamesPlayed = profile.games || 0;
    const delta       = computeEloDelta(fromRating, puzzleElo, true, mistakes, hintsUsed, gamesPlayed);
    const result = {
      failed: false, time: seconds, mistakes, hintsUsed,
      fromRating, newRating: fromRating + delta, delta,
    };
    setTimeout(() => {
      setDone(result);
      if (onResult) onResult(result);
      window.DojoAudio && DojoAudio.win();
    }, 380);
  }

  // ---- Fail puzzle ----
  function failPuzzle(reason) {
    const hintsUsed   = startHints - hints;
    const fromRating  = profile.rating || START_ELO;
    const puzzleElo   = PUZZLE_ELO[profile.controlKey] || 1000;
    const gamesPlayed = profile.games || 0;
    const delta       = computeEloDelta(fromRating, puzzleElo, false, 0, hintsUsed, gamesPlayed);
    const techKey     = zen
      ? (LEVEL_TECHNIQUE[profile.levelKey]   || 'naked-single')
      : (RATED_TECHNIQUE[profile.controlKey] || 'hidden-single');
    const result = {
      failed: true, reason: reason || 'mistakes', time: seconds,
      mistakes: reason === 'time' ? mistakes : MAX_MISTAKES,
      hintsUsed, fromRating,
      newRating: Math.max(100, fromRating + delta), delta, techKey,
    };
    setTimeout(() => {
      setDone(result);
      if (onResult) onResult(result);
      window.DojoAudio && DojoAudio.lose();
    }, 350);
  }

  // ---- Place / erase / undo / hint ----
  const idx    = (r, c) => r * 9 + c;
  const cellAt = (r, c) => cells[idx(r, c)];

  function place(n) {
    if (!sel || done) return;
    const cell = cellAt(sel.r, sel.c);
    if (cell.given) return;

    if (notesMode) {
      snapshot();
      const has  = cell.notes.includes(n);
      const next = cells.map((x) => x.key !== cell.key ? x
        : { ...x, value: 0, wrong: false, notes: has ? x.notes.filter((m) => m !== n) : [...x.notes, n].sort() });
      setCells(next);
      window.DojoAudio && DojoAudio.pencil();
      return;
    }

    snapshot();
    const correct = sol(sel.r, sel.c) === n;
    const next = cells.map((x) => x.key !== cell.key ? x
      : { ...x, value: n, notes: [], wrong: !correct });
    setCells(next);
    setAnimTick((t) => t + 1);

    if (correct) {
      window.DojoAudio && DojoAudio.pen();
      finishCheck(next);
    } else {
      window.DojoAudio && DojoAudio.error();
      if (!zen) {
        setMistakes((m) => {
          const next = m + 1;
          if (next >= MAX_MISTAKES) failPuzzle('mistakes');
          return next;
        });
      }
    }
  }

  function erase() {
    if (!sel || done) return;
    const cell = cellAt(sel.r, sel.c);
    if (cell.given || (!cell.value && cell.notes.length === 0)) return;
    snapshot();
    setCells(cells.map((x) => x.key !== cell.key ? x
      : { ...x, value: 0, wrong: false, notes: [] }));
    window.DojoAudio && DojoAudio.erase();
  }

  function undo() {
    const prev = histRef.current.pop();
    if (!prev) return;
    setCells(prev.cells);
    setMistakes(prev.mistakes);
    window.DojoAudio && DojoAudio.select();
  }

  function useHint() {
    if (hints <= 0 || done) return;
    let target = sel ? cellAt(sel.r, sel.c) : null;
    // If selected cell is already correct or given, find the first wrong cell.
    if (!target || target.given || target.value === sol(target.r, target.c)) {
      target = cells.find((x) => !x.given && x.value !== sol(x.r, x.c));
    }
    if (!target) return;
    snapshot();
    setHints((h) => h - 1);
    setSel({ r: target.r, c: target.c });
    const next = cells.map((x) => x.key !== target.key ? x
      : { ...x, value: sol(target.r, target.c), notes: [], wrong: false });
    setCells(next);
    setGlowKey(target.key);
    setAnimTick((t) => t + 1);
    window.DojoAudio && DojoAudio.hint();
    setTimeout(() => setGlowKey(null), 1100);
    finishCheck(next);
  }

  // ---- Derived display values ----
  // Count correctly placed digits to grey out number-pad keys.
  const counts = {};
  for (let n = 1; n <= 9; n++) counts[n] = 0;
  cells.forEach((x) => { if (x.value && x.value === sol(x.r, x.c)) counts[x.value]++; });

  const selCell = sel ? cellAt(sel.r, sel.c) : null;
  const selVal  = selCell ? selCell.value : 0;

  // Rated countdown or zen elapsed.
  const timeLeft    = profile.timeLimit ? Math.max(0, profile.timeLimit - seconds) : seconds;
  const timerClass  = 'g-timer' + (!zen && profile.timeLimit && timeLeft <= 30 ? ' low' : '');

  function classFor(cell) {
    const cls = ['g-cell'];
    if (cell.c === 2 || cell.c === 5) cls.push('cr');
    if (cell.r === 2 || cell.r === 5) cls.push('cb');
    const isSel = sel && sel.r === cell.r && sel.c === cell.c;
    if (isSel) {
      cls.push('sel');
    } else if (sel) {
      if (selVal && cell.value === selVal) cls.push('samenum');
      else if (sel.r === cell.r || sel.c === cell.c || SAME_BOX(sel.r, sel.c, cell.r, cell.c)) cls.push('peer');
    }
    if (cell.given) cls.push('given');
    else if (cell.value) cls.push(cell.wrong ? 'wrong' : 'user');
    if (glowKey === cell.key) cls.push('hintglow');
    return cls.join(' ');
  }

  // ---- Render ----
  return (
    <div className="screen enter game">
      <div className="dojo-sun sun"></div>

      {/* LEFT — status panel */}
      <div className="g-side pix-win">
        <button className="g-back" onClick={onExit}><Icon name="back" size={15} /><span>MENU</span></button>
        <div className="g-brand">
          <div className="kanji">道場</div>
          <div className="latin">SUDOKU DOJO</div>
        </div>

        {zen ? (
          <div className="g-zenlabel">
            <div className="zl-jp">禅</div>
            <div className="zl-en">ZEN MODE</div>
            <div className="zl-sub">No timer · no rating · just solve.</div>
          </div>
        ) : (
          <React.Fragment>
            <div className="g-stat">
              <span className="pix-label">TIME LEFT</span>
              <div className={timerClass}>{fmtTime(timeLeft)}</div>
            </div>
            <div className="g-badge">
              <div className="gb-belt-row">
                <i className={'gb-belt belt-' + beltForRating(profile.rating || 400).key}></i>
                <span className="gb-belt-name">{beltForRating(profile.rating || 400).en}</span>
              </div>
              <span className="pix-label">YOUR RATING</span>
              <div className="g-elo">{profile.rating || START_ELO}</div>
              <div className="g-vs">Puzzle · ~{profile.seed || 500} elo</div>
            </div>
          </React.Fragment>
        )}

        <div className="g-mini">
          {zen
            ? <div className="box"><div className="k">MODE</div><div className="v">禅</div></div>
            : <div className="box"><div className="k">MISTAKES</div><div className="v">{mistakes}/{MAX_MISTAKES}</div></div>}
          <div className="box"><div className="k">HINTS</div><div className="v">{hints}</div></div>
        </div>
      </div>

      {/* CENTER — board */}
      <div className="g-board-wrap">
        <div className={'g-grid' + (paused || gated ? ' paused' : '')}>
          {cells.map((cell) => (
            <div key={cell.key} className={classFor(cell)} onClick={() => selectCell(cell.r, cell.c)}>
              {cell.value
                ? <span className="num settle" key={cell.value + '-' + animTick + '-' + cell.key}>{cell.value}</span>
                : (cell.notes.length
                    ? <div className="g-notes">
                        {[1,2,3,4,5,6,7,8,9].map((m) => (
                          <span key={m} className={selVal === m ? 'hl' : ''}>
                            {cell.notes.includes(m) ? m : ''}
                          </span>
                        ))}
                      </div>
                    : null)}
            </div>
          ))}
        </div>

        {/* Rated gate (free limit hit) */}
        {gated && (
          <div className="rated-gate">
            <div className="rg-card pix-win">
              <div className="rg-icon"><Icon name="lock" size={26} /></div>
              <h3>DAILY RATED PUZZLE USED</h3>
              <p>You've used today's free rated puzzle. Keep going in Zen mode, or unlock unlimited with Dojo Pass.</p>
              <div className="rg-cta">
                <button className="pix-btn" onClick={onPlayZen}><Icon name="zen" size={15} /><span>PLAY ZEN</span></button>
                <button className="pix-btn primary" onClick={onUpgrade}><Icon name="star" size={15} /><span>DOJO PASS</span></button>
              </div>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {paused && (
          <div className="pause-veil">
            <div className="pause-card pix-win">
              <h2>PAUSED</h2>
              <div className="pause-btns">
                <button className="pix-btn primary" onClick={() => setPaused(false)}>RESUME ▶</button>
                <button className="pix-btn" onClick={onExit}>QUIT TO MENU</button>
              </div>
            </div>
          </div>
        )}

        {/* Result cards */}
        {done && (done.zen
          ? <ZenComplete data={done} onNew={onNewPuzzle} onClose={() => setDone(null)} onExit={onExit} />
          : done.failed
            ? <Failure data={done} onNew={onNewPuzzle} onExit={onExit} onLearn={onLearn} />
            : <Completion data={done} profile={profile} onNew={onNewPuzzle} onClose={() => setDone(null)} onExit={onExit} />
        )}
      </div>

      {/* RIGHT — number pad */}
      <div className="g-side pix-win">
        <span className="pix-label">ENTER NUMBER</span>
        <div className="g-pad">
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button key={n} className="g-key" disabled={counts[n] >= 9} onClick={() => place(n)}>
              {n}
              <span className="left">{9 - counts[n]}</span>
            </button>
          ))}
        </div>
        <div className="g-tools">
          <div className="g-tool" onClick={undo}><Icon name="undo" size={22} /><span>UNDO</span></div>
          <div className="g-tool" onClick={erase}><Icon name="erase" size={22} /><span>ERASE</span></div>
          <div className={'g-tool' + (notesMode ? ' on' : '')} onClick={() => setNotesMode((v) => !v)}>
            <Icon name="pencil" size={22} /><span>NOTES</span>
          </div>
          <div className={'g-tool' + (hints <= 0 ? ' disabled' : '')} onClick={useHint}>
            <Icon name="bulb" size={22} />
            <span>HINT {hints > 0 ? '(' + hints + ')' : ''}</span>
          </div>
        </div>
        <div className="g-foot">
          <button className="pix-btn ghost" onClick={() => setPaused(true)}>
            <Icon name="pause" size={15} /><span>PAUSE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Completion card (rated win) ----
function Completion({ data, profile, onNew, onClose, onExit }) {
  return (
    <div className="done-veil show">
      <div className="done-card pix-win">
        <button className="done-close" onClick={onClose} aria-label="Close"><Icon name="x" size={15} /></button>
        <div className="seal">合</div>
        <div className="jp">完成</div>
        <h2>PUZZLE SOLVED</h2>
        <div className="done-stats">
          <div className="s"><div className="k">TIME</div><div className="v">{fmtTime(data.time)}</div></div>
          <div className="s"><div className="k">MISTAKES</div><div className="v">{data.mistakes}</div></div>
          <div className="s"><div className="k">HINTS</div><div className="v">{data.hintsUsed}</div></div>
        </div>
        <div className="done-rating">
          <span>{data.fromRating}</span><span>▶</span>
          <span className="new">{data.newRating}</span>
          <span className="delta">+{data.delta}</span>
        </div>
        <div className="done-prov">
          {(profile.games || 0) < 20
            ? 'PROVISIONAL · Elo swings larger while you establish your rating'
            : 'Elo updated'}
        </div>
        <div className="cta">
          <button className="pix-btn" onClick={onExit}><Icon name="home" size={15} /><span>MENU</span></button>
          <button className="pix-btn primary" onClick={onNew}><Icon name="play" size={15} /><span>NEW PUZZLE</span></button>
        </div>
      </div>
    </div>
  );
}

// ---- Failure card (rated fail / timeout) ----
function Failure({ data, onNew, onExit, onLearn }) {
  const tech = (window.TECH_BY_KEY && TECH_BY_KEY[data.techKey]) || (window.TECHNIQUES && TECHNIQUES[0]) || {};
  return (
    <div className="done-veil show">
      <div className="done-card fail pix-win">
        <div className="seal fail">惜</div>
        <div className="jp fail">失敗</div>
        <h2>{data.reason === 'time' ? 'OUT OF TIME' : 'PUZZLE FAILED'}</h2>
        <div className="done-sub">
          {data.reason === 'time'
            ? 'The clock ran out. Your rating dips a little — try again.'
            : 'Three mistakes ends the puzzle. Your rating dips a little — you can do it.'}
        </div>
        <div className="done-rating">
          <span>{data.fromRating}</span><span>▶</span>
          <span className="new down">{data.newRating}</span>
          <span className="delta down">{data.delta}</span>
        </div>
        {tech.en && (
          <div className="teach">
            <div className="teach-k">TECHNIQUE THE DOJO SUGGESTS</div>
            <div className="teach-name"><b>{tech.jp}</b> {tech.en}</div>
            <div className="teach-blurb">{tech.blurb}</div>
            <button className="pix-btn primary teach-btn" onClick={() => onLearn(data.techKey)}>
              <Icon name="book" size={15} /><span>LEARN THIS</span>
            </button>
          </div>
        )}
        <div className="cta">
          <button className="pix-btn" onClick={onExit}><Icon name="home" size={15} /><span>MENU</span></button>
          <button className="pix-btn" onClick={onNew}><Icon name="play" size={15} /><span>TRY AGAIN</span></button>
        </div>
      </div>
    </div>
  );
}

// ---- Zen complete card ----
function ZenComplete({ data, onNew, onClose, onExit }) {
  return (
    <div className="done-veil show">
      <div className="done-card pix-win">
        <button className="done-close" onClick={onClose} aria-label="Close"><Icon name="x" size={15} /></button>
        <div className="seal">禅</div>
        <div className="jp">完成</div>
        <h2>PRACTICE COMPLETE</h2>
        <div className="done-sub">
          Solved in {fmtTime(data.time)} · no rating change · well done.
        </div>
        <div className="cta">
          <button className="pix-btn" onClick={onExit}><Icon name="home" size={15} /><span>MENU</span></button>
          <button className="pix-btn primary" onClick={onNew}><Icon name="play" size={15} /><span>NEW PUZZLE</span></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Game, Completion, Failure, ZenComplete });
