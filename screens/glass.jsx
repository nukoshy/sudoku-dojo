// Variant B — Liquid Glass Dojo. Game + Rank screens.

function GlassGrid() {
  return (
    <div className="glass-grid">
      {BOARD.map((m) => {
        const cls = ['glass-cell'];
        if (m.boxR) cls.push('cr');
        if (m.boxB) cls.push('cb');
        if (m.sel) cls.push('sel');
        else if (m.peer) cls.push('peer');
        if (m.type === 'given') cls.push('given');
        if (m.type === 'user') cls.push('user');
        return (
          <div key={m.r + '-' + m.c} className={cls.join(' ')}>
            {m.val ? m.val : null}
            {!m.val && m.notes ? (
              <div className="glass-notes">
                {[1,2,3,4,5,6,7,8,9].map((n) => (
                  <span key={n}>{m.notes.includes(n) ? n : ''}</span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function GameGlass() {
  return (
    <div className="glass-root">
      <div className="glass-game">
        <div className="glass-rail glass-panel">
          <div className="glass-brand">
            <div className="mark">道</div>
            <div className="latin">Sudoku<b>DOJO</b></div>
          </div>
          <div className="glass-meta">
            <div className="glass-stat">
              <div className="glass-label">Time</div>
              <div className="glass-timer">04:37</div>
            </div>
            <div className="glass-elo-card">
              <div className="glass-label">Puzzle Rating</div>
              <div className="glass-elo">1420<span>elo</span></div>
              <div className="glass-bar"><i></i></div>
              <div className="you">Matched to you · 1376</div>
            </div>
          </div>
        </div>

        <div className="glass-board-wrap"><GlassGrid /></div>

        <div className="glass-right glass-panel">
          <div className="glass-label">Enter a number</div>
          <div className="glass-pad">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <div key={n} className={'glass-key' + (n === 5 ? ' lit' : '')}>{n}</div>
            ))}
          </div>
          <div className="glass-tools">
            <div className="glass-tool"><span className="dot"></span>Undo</div>
            <div className="glass-tool"><span className="dot"></span>Erase</div>
            <div className="glass-tool on"><span className="dot"></span>Notes</div>
            <div className="glass-tool"><span className="dot"></span>Hint</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankGlass() {
  return (
    <div className="glass-root">
      <div className="glass-rank">
        <div className="head">
          <div className="sub">道を選ぶ</div>
          <h1>Choose Your Path</h1>
          <div className="lead">We seed your rating from here — every solve refines it.</div>
        </div>
        <div className="glass-cards">
          {RANKS.map((r) => (
            <div key={r.belt} className={'glass-card' + (r.selected ? ' sel' : '')}>
              <div className="ckanji">{r.kanji}</div>
              <div className={'glass-belt ' + r.belt}></div>
              <div className="romaji">{r.romaji}</div>
              <div className="level">{r.level}</div>
              <div className="desc">{r.desc}</div>
              <div className="elo">Starting Elo<b>{r.elo}</b></div>
              <div className="glass-pick">{r.selected ? '✓ Selected' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GameGlass, RankGlass });
