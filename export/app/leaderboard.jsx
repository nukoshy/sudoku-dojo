// Sudoku Dojo — Leaderboard. Fetches real user data from Supabase.
// No fictional roster — only real players who have completed rated games appear.
const { useState: useStateLB, useEffect: useEffectLB } = React;

function Leaderboard({ profile, onBack, onUpgrade }) {
  const [rows, setRows] = useStateLB(null); // null = loading
  const [error, setError] = useStateLB(null);

  useEffectLB(() => {
    const be = window.DojoBackend || {};
    if (!be.enabled) { setRows([]); return; }
    be.fetchLeaderboard()
      .then((entries) => {
        const ranked = entries.map((e, i) => ({
          userId: e.user_id,
          name: e.nick || 'Deshi',
          rating: e.rating || 400,
          solved: e.solved || 0,
          streak: e.streak || 0,
          rank: i + 1,
          you: e.user_id === profile.userId,
        }));
        setRows(ranked);
      })
      .catch((e) => { setError(e.message); setRows([]); });
  }, []);

  const meEntry = (rows || []).find((r) => r.you);
  const meRank = meEntry ? meEntry.rank : null;

  return (
    <div className="screen enter leaderboard">
      <div className="prof-inner">
        <header className="prof-top">
          <button className="pix-btn ghost prof-back" onClick={onBack}>
            <Icon name="back" size={15} /><span>HOME</span>
          </button>
          <div className="prof-title">LEADERBOARD</div>
          <div className="prof-spacer"></div>
        </header>

        {!profile.premium && (
          <button className="lb-banner pix-win" onClick={onUpgrade}>
            <Icon name="trophy" size={20} />
            <span className="lbb-txt">Appear on the global ranks — play rated games with <b>Dojo Pass</b>.</span>
            <span className="lbb-go"><Icon name="star" size={13} />UPGRADE</span>
          </button>
        )}

        <div className="lb-bar">
          <div className="lb-tabs">
            <button className="lb-tab on">GLOBAL</button>
          </div>
          <div className="lb-meta">
            {meRank ? 'You are #' + meRank : 'Complete a rated game to appear'}
          </div>
        </div>

        <div className="lb-table pix-win">
          <div className="lb-row lb-th">
            <span className="c-rk">#</span>
            <span className="c-nm">PLAYER</span>
            <span className="c-bt">BELT</span>
            <span className="c-rt">RATING</span>
            <span className="c-wk">SOLVED</span>
            <span className="c-st">STREAK</span>
          </div>
          <div className="lb-scroll">
            {rows === null && (
              <div className="hr-empty">Loading ranks…</div>
            )}
            {rows !== null && rows.length === 0 && (
              <div className="hr-empty">
                {error
                  ? 'Could not load leaderboard — check your connection.'
                  : 'No players yet — be the first to complete a rated game!'}
              </div>
            )}
            {(rows || []).map((r) => {
              const belt = beltForRating(r.rating);
              const medal = r.rank <= 3 ? ['①','②','③'][r.rank - 1] : r.rank;
              return (
                <div key={r.userId} className={'lb-row' + (r.you ? ' me' : '')}>
                  <span className="c-rk">{medal}</span>
                  <span className="c-nm">{r.name}{r.you ? <em> · you</em> : null}</span>
                  <span className="c-bt">
                    <i className={'lb-belt belt-' + belt.key}></i>
                    {belt.en.replace(' Belt', '')}
                  </span>
                  <span className="c-rt">{r.rating}</span>
                  <span className="c-wk">{r.solved}</span>
                  <span className="c-st">{r.streak}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Leaderboard });
