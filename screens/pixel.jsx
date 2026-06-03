// Variant C — Pixel Dojo. Game + Rank screens.

function PixelGrid() {
  return (
    <div className="pixel-grid">
      {BOARD.map((m) => {
        const cls = ['pixel-cell'];
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
              <div className="pixel-notes">
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

function GamePixel() {
  return (
    <div className="pixel-root">
      <div className="pixel-sun"></div>
      <div className="pixel-game">
        <div className="pixel-rail pixel-win">
          <div className="pixel-brand">
            <div className="kanji">道場</div>
            <div className="latin">SUDOKU DOJO</div>
          </div>
          <div>
            <div className="pixel-label">TIME</div>
            <div className="pixel-timer">04:37</div>
          </div>
          <div className="pixel-elobox">
            <div className="pixel-label">PUZZLE ELO</div>
            <div className="pixel-elo">1420<small>elo</small></div>
            <div className="pixel-hp"><i></i></div>
            <div className="you">YOU · 1376</div>
          </div>
        </div>

        <div className="pixel-board-wrap"><PixelGrid /></div>

        <div className="pixel-right pixel-win">
          <div className="pixel-label">ENTER NUMBER</div>
          <div className="pixel-pad">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <div key={n} className={'pixel-key' + (n === 5 ? ' lit' : '')}>{n}</div>
            ))}
          </div>
          <div className="pixel-tools">
            <div className="pixel-tool">UNDO</div>
            <div className="pixel-tool">ERASE</div>
            <div className="pixel-tool on">NOTES</div>
            <div className="pixel-tool">HINT</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankPixel() {
  return (
    <div className="pixel-root">
      <div className="pixel-rank">
        <div className="head">
          <div className="sub">道を選ぶ</div>
          <h1>CHOOSE YOUR PATH</h1>
          <div className="lead">We seed your rating from here — every solve refines it.</div>
        </div>
        <div className="pixel-cards">
          {RANKS.map((r) => (
            <div key={r.belt} className={'pixel-card' + (r.selected ? ' sel' : '')}>
              <div className="ckanji">{r.kanji}</div>
              <div className={'pixel-belt ' + r.belt}></div>
              <div className="romaji">{r.romaji}</div>
              <div className="level">{r.level}</div>
              <div className="desc">{r.desc}</div>
              <div className="elo">START ELO<b>{r.elo}</b></div>
              <div className="pixel-pick">{r.selected ? '▶ SELECTED' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GamePixel, RankPixel });
