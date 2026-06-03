// Sudoku Dojo — Home dashboard. Rated = chess-style time controls (Bullet/Blitz/
// Rapid, each its own rating + clock); Zen = relaxed difficulty levels.
const { useState: useStateH } = React;

function Avatar({ nick, size, className }) {
  const ch = (nick || 'D').trim().charAt(0).toUpperCase();
  return <div className={'avatar' + (className ? ' ' + className : '')} style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>{ch}</div>;
}

function Home({ profile, onPlayRated, onPlayZen, onProfile, onPuzzleRush, onUpgrade }) {
  // Restore the last tab the user was on so returning from a Zen game lands back on Zen.
  const [mode, setMode] = useStateH(profile.zen ? 'zen' : 'rated');
  const [ctrl, setCtrl] = useStateH(profile.homeCtrl || 'blitz');
  const [lvlIdx, setLvlIdx] = useStateH(profile.homeLevelIdx != null ? profile.homeLevelIdx : 1);
  const ratings = profile.ratings || makeRatings(profile.rating);
  const belt = beltForRating(profile.rating || 400);
  const hist = profile.history || [];
  const ratedLeft = profile.premium ? null : Math.max(0, FREE_DAILY_RATED - (profile.dailyRatedUsed || 0));

  return (
    <div className="screen enter home">
      <div className="home-inner">

        <header className="home-top">
          <div className="home-brand">
            <div className="kanji">道場</div>
            <div className="latin">SUDOKU DOJO</div>
          </div>
          <div className="home-headright">
            {profile.premium
              ? <div className="pass-badge"><Icon name="star" size={13} />DOJO PASS</div>
              : <button className="pass-upgrade" onClick={onUpgrade}><Icon name="star" size={13} /><span>Dojo Pass</span></button>}
            <button className="home-user" onClick={onProfile}>
              <Avatar nick={profile.nick} size={42} />
              <div className="home-user-txt">
                <div className="hu-nick">{profile.nick || 'Deshi'}</div>
                <div className="hu-rank">{belt.en} · {profile.rating || 400}</div>
              </div>
            </button>
          </div>
        </header>

        <div className="home-deck">
          <div className="home-col">
            <div className="home-play pix-win">
              <div className="play-modes">
                <button className={'play-mode' + (mode === 'rated' ? ' on' : '')} onClick={() => setMode('rated')}>
                  <Icon name="target" size={16} /><span>RATED</span>
                </button>
                <button className={'play-mode zen' + (mode === 'zen' ? ' on' : '')} onClick={() => setMode('zen')}>
                  <span className="pm-jp">禅</span><span>ZEN</span>
                </button>
              </div>

              {mode === 'rated' ? (
                <React.Fragment>
                  <div className="play-grid rated">
                    {TIME_CONTROLS.map((t) => (
                      <button key={t.key} className={'opt-card' + (ctrl === t.key ? ' on' : '')} onClick={() => { setCtrl(t.key); window.DojoAudio && DojoAudio.select(); }}>
                        <div className="oc-top"><Icon name={t.icon} size={18} /><span className="oc-name">{t.en}</span></div>
                        <div className="oc-rating">{ratings[t.key]}</div>
                        <div className="oc-sub">{Math.round(t.limit / 60)} min · {t.empties} blanks</div>
                      </button>
                    ))}
                  </div>
                  <button className="pix-btn primary hp-play" onClick={() => onPlayRated(ctrl)}>
                    <Icon name="play" size={16} /><span>PLAY {CONTROL_BY_KEY[ctrl].en.toUpperCase()}</span>
                  </button>
                  {ratedLeft != null && (
                    <div className="hp-freeline">
                      {ratedLeft > 0
                        ? <React.Fragment><b>{ratedLeft}</b> free rated game today · Zen unlimited</React.Fragment>
                        : <React.Fragment>Daily rated used · <button className="hp-freeup" onClick={onUpgrade}>go unlimited</button> · Zen still free</React.Fragment>}
                    </div>
                  )}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div className="play-grid zen">
                    {LEVELS.map((l, i) => (
                      <button key={l.key} className={'opt-card' + (lvlIdx === i ? ' on' : '')} onClick={() => { setLvlIdx(i); window.DojoAudio && DojoAudio.select(); }}>
                        <div className="oc-name solo">{l.en}</div>
                        <div className="oc-sub">{l.empties} blanks · {l.hints} hints</div>
                      </button>
                    ))}
                  </div>
                  <button className="pix-btn primary hp-play" onClick={() => onPlayZen(lvlIdx)}>
                    <span className="pm-jp">禅</span><span>BEGIN ZEN · {LEVELS[lvlIdx].en.toUpperCase()}</span>
                  </button>
                  <div className="hp-freeline">No timer, no rating — practice freely.</div>
                </React.Fragment>
              )}
            </div>

            <div className="home-recent pix-win">
              <div className="hr-head"><span>RECENT GAMES</span></div>
              {hist.length === 0 ? (
                <div className="hr-empty">No rated games yet — play one to start your record.</div>
              ) : (
                <div className="hr-list">
                  <div className="hr-row hr-th"><span className="c-lv">MODE</span><span className="c-rs">RESULT</span><span className="c-tm">TIME</span><span className="c-dl">ELO</span></div>
                  {hist.slice(0, 4).map((g, i) => (
                    <div key={i} className="hr-row">
                      <span className="c-lv">{g.label || 'Rated'}</span>
                      <span className="c-rs">{g.failed ? 'FAILED' : (g.mistakes === 0 ? 'CLEAN' : g.mistakes + ' miss')}</span>
                      <span className="c-tm">{fmtClock(g.time)}</span>
                      <span className={'c-dl' + (g.delta < 0 ? ' dn' : '')}>{g.delta < 0 ? g.delta : '+' + g.delta}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="home-rail">
            <div className="rail-streak pix-win">
              <div className="rs-flame">炎</div>
              <div className="rs-num">{profile.streak || 0}</div>
              <div className="rs-lbl">DAY STREAK</div>
              <div className="rs-best">Best · {profile.bestStreak || 0}</div>
            </div>
            <div className="rail-stats pix-win">
              <div className="rstat"><span className="k"><Icon name="check" size={16} className="rs-ic" />Solved</span><span className="v">{profile.solved || 0}</span></div>
              <div className="rstat"><span className="k"><Icon name="grid" size={16} className="rs-ic" />Games</span><span className="v">{profile.games || 0}</span></div>
              <div className="rstat last"><span className="k"><Icon name="flame" size={16} className="rs-ic" />Best streak</span><span className="v">{profile.bestStreak || 0}</span></div>
            </div>
            <button className="rail-rush pix-win" onClick={onPuzzleRush}>
              <div className="rr-icon"><Icon name="bolt" size={22} /></div>
              <div className="rr-main"><div className="rr-name">Puzzle Rush</div><div className="rr-sub">3-minute sprint</div></div>
              {profile.premium ? <Icon name="chevron" size={16} className="rr-go" /> : <span className="lock-tag"><Icon name="lock" size={11} />Pass</span>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { Home, Avatar });
