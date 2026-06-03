// Variant A — Zen Ink. Game + Rank screens.

function ZenGrid() {
  return (
    <div className="zen-grid">
      {BOARD.map((m) => {
        const cls = ['zen-cell'];
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
              <div className="zen-notes">
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

function GameZen() {
  return (
    <div className="zen-root">
      <div className="zen-game">
        <div className="zen-rail left">
          <div className="zen-brand">
            <div className="kanji">道場</div>
            <div className="latin">Sudoku Dojo</div>
          </div>
          <div className="zen-meta">
            <div>
              <div className="zen-label">Time</div>
              <div className="zen-timer">04:37</div>
            </div>
            <div className="zen-rating">
              <div className="zen-seal">段</div>
              <div className="zen-label">Puzzle Rating</div>
              <div className="zen-elo">1420<small>elo</small></div>
              <div className="you">Your rating · 1376</div>
            </div>
          </div>
        </div>

        <div className="zen-board-wrap"><ZenGrid /></div>

        <div className="zen-rail right">
          <div className="zen-right-inner">
            <div className="zen-label">Enter a number</div>
            <div className="zen-pad">
              {[1,2,3,4,5,6,7,8,9].map((n) => (
                <div key={n} className={'zen-key' + (n === 5 ? ' lit' : '')}>{n}</div>
              ))}
            </div>
            <div className="zen-tools">
              <div className="zen-tool"><span className="jp">戻す</span><span className="en">Undo</span></div>
              <div className="zen-tool"><span className="jp">消す</span><span className="en">Erase</span></div>
              <div className="zen-tool on"><span className="jp">メモ</span><span className="en">Notes</span></div>
              <div className="zen-tool"><span className="jp">ヒント</span><span className="en">Hint</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankZen() {
  return (
    <div className="zen-root">
      <div className="zen-rank">
        <div className="head">
          <div className="sub">道を選ぶ</div>
          <h1>Choose Your Path</h1>
          <div className="lead">We seed your rating from here — every solve refines it.</div>
        </div>
        <div className="zen-cards">
          {RANKS.map((r) => (
            <div key={r.belt} className={'zen-card' + (r.selected ? ' sel' : '')}>
              <div className="ckanji">{r.kanji}</div>
              <div className={'zen-belt ' + r.belt}></div>
              <div className="romaji">{r.romaji}</div>
              <div className="level">{r.level}</div>
              <div className="desc">{r.desc}</div>
              <div className="elo">Starting Elo<b>{r.elo}</b></div>
              <div className="zen-pick">{r.selected ? '選択済 · Selected' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GameZen, RankZen });
