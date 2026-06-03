// Sudoku Dojo — Profile & Stats. Circular avatar + chess.com-style per-control
// rating list (Rapid/Blitz/Bullet) + hanko-stamp achievements.
const { useState: useStateP } = React;

function Sparkline({ series }) {
  if (!series || series.length < 2) {
    return <div className="spark empty">Play rated games to build your history</div>;
  }
  const min = Math.min(...series), max = Math.max(...series);
  const span = Math.max(1, max - min);
  return (
    <div className="spark">
      {series.map((v, i) => (
        <i key={i} style={{ height: (18 + ((v - min) / span) * 82) + '%' }}
          className={i === series.length - 1 ? 'hot' : ''}></i>
      ))}
    </div>
  );
}

function Profile({ profile, onBack, onUpgrade, onLogout }) {
  const [open, setOpen] = useStateP('rapid');
  const stats = profile.byLevel || makeStats();
  const ratings = profile.ratings || makeRatings(profile.rating);
  const rating = profile.rating || 400;
  const belt = beltForRating(rating);
  const provisional = (profile.solved || 0) < 5;
  const earnedBeltIdx = profile.premium ? BELT_RANKS.indexOf(belt) : 0;

  const hist = (profile.history || []).slice().reverse();
  const series = [profile.startRating || 400].concat(hist.filter((h) => !h.failed).map((h) => h.newRating));

  return (
    <div className="screen enter profile">
      <div className="prof-inner">

        <header className="prof-top">
          <button className="pix-btn ghost prof-back" onClick={onBack}><Icon name="back" size={15} /><span>HOME</span></button>
          <div className="prof-title">PROFILE</div>
          <button className="pix-btn ghost prof-logout" onClick={onLogout}><Icon name="back" size={14} /><span>SIGN OUT</span></button>
        </header>

        {/* hero */}
        <div className="prof-hero pix-win">
          <Avatar nick={profile.nick} size={68} className="prof-av" />
          <div className="prof-id">
            <div className="prof-nick">{profile.nick || 'Deshi'}</div>
            <div className="prof-rank">{belt.jp} {belt.en} · {provisional ? 'Provisional' : 'Rated'}</div>
            <div className="belt-path">
              {BELT_RANKS.map((b, i) => (
                <i key={b.key} className={'bp-pip belt-' + (i <= earnedBeltIdx ? b.key : 'lock') + (i === earnedBeltIdx ? ' cur' : '')}></i>
              ))}
              {!profile.premium && <button className="bp-lock" onClick={onUpgrade}><Icon name="lock" size={11} />belt path</button>}
            </div>
          </div>
          <div className="prof-rating"><div className="pr-k">RATING</div><div className="pr-v">{rating}</div></div>
          <div className="prof-spark-wrap">
            <div className="pr-k">RATING HISTORY</div>
            <div className={'spark-gate' + (profile.premium ? '' : ' locked')}>
              <Sparkline series={series} />
              {!profile.premium && <button className="spark-lock" onClick={onUpgrade}><Icon name="lock" size={14} /><span>Dojo Pass</span></button>}
            </div>
          </div>
        </div>

        {/* summary */}
        <div className="prof-summary">
          <div className="psum pix-win"><div className="ps-k">SOLVED</div><div className="ps-v">{profile.solved || 0}</div></div>
          <div className="psum pix-win"><div className="ps-k">STREAK</div><div className="ps-v">{profile.streak || 0}</div></div>
          <div className="psum pix-win"><div className="ps-k">BEST STREAK</div><div className="ps-v">{profile.bestStreak || 0}</div></div>
          <div className="psum pix-win"><div className="ps-k">GAMES</div><div className="ps-v">{profile.games || 0}</div></div>
        </div>

        <div className="prof-lower">
          {/* per-control ratings (chess.com style) */}
          <div className="ratings-list pix-win">
            <div className="rl-head">RATINGS</div>
            {TIME_CONTROLS.map((t) => {
              const s = stats[t.key] || { played: 0, solved: 0, noMistake: 0, bestTime: null };
              const wr = s.played ? Math.round((s.solved / s.played) * 100) : 0;
              const isOpen = open === t.key;
              return (
                <div key={t.key} className={'rl-item' + (isOpen ? ' open' : '')}>
                  <button className="rl-row" onClick={() => setOpen(isOpen ? null : t.key)}>
                    <span className="rl-ic"><Icon name={t.icon} size={20} /></span>
                    <span className="rl-name">{t.en}</span>
                    <span className="rl-val">{ratings[t.key]}</span>
                    <span className={'rl-chev' + (isOpen ? ' up' : '')}><Icon name="chevron" size={15} /></span>
                  </button>
                  {isOpen && (
                    <div className="rl-detail">
                      <div className="rld"><span>Games</span><b>{s.played}</b></div>
                      <div className="rld"><span>Win rate</span><b>{wr}%</b></div>
                      <div className="rld"><span>Clean</span><b>{s.noMistake}</b></div>
                      <div className="rld"><span>Best time</span><b>{fmtClock(s.bestTime)}</b></div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="rl-item static">
              <div className="rl-row"><span className="rl-ic puz"><Icon name="grid" size={20} /></span><span className="rl-name">Puzzles solved</span><span className="rl-val">{profile.solved || 0}</span></div>
            </div>
            <div className="rl-item static">
              <div className="rl-row"><span className="rl-ic ins"><Icon name="bulb" size={20} /></span><span className="rl-name">Insights</span><span className="rl-chev"><Icon name="chevron" size={15} /></span></div>
            </div>
          </div>

          {/* hanko stamps */}
          <div className="prof-stamps pix-win">
            <div className="stamps-head">ACHIEVEMENTS · 判子</div>
            <div className="stamps-grid">
              {STAMPS.map((st) => {
                const earned = st.cond(profile);
                return (
                  <div key={st.key} className={'stamp' + (earned ? ' earned' : '')} title={st.hint}>
                    <div className="stamp-seal">{st.jp}</div>
                    <div className="stamp-name">{st.en}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { Profile, Sparkline });
