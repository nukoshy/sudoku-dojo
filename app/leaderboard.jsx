// Sudoku Dojo — Leaderboard. Global (weekly reset) + Friends. The player is
// slotted into a fictional dojo roster by rating.
const { useState: useStateLB } = React;

function Leaderboard({ profile, onBack, onUpgrade }) {
  const [scope, setScope] = useStateLB('global');
  const rows = buildLeaderboard(profile, scope);
  const meRank = (rows.find((r) => r.you) || {}).rank;

  return (
    <div className="screen enter leaderboard">
      <div className="prof-inner">
        <header className="prof-top">
          <button className="pix-btn ghost prof-back" onClick={onBack}><Icon name="back" size={15} /><span>HOME</span></button>
          <div className="prof-title">LEADERBOARD</div>
          <div className="prof-spacer"></div>
        </header>

        {!profile.premium && (
          <button className="lb-banner pix-win" onClick={onUpgrade}>
            <Icon name="trophy" size={20} />
            <span className="lbb-txt">Join the leaderboard — appear on the global ranks with <b>Dojo Pass</b>.</span>
            <span className="lbb-go"><Icon name="star" size={13} />UPGRADE</span>
          </button>
        )}

        <div className="lb-bar">
          <div className="lb-tabs">
            <button className={'lb-tab' + (scope === 'global' ? ' on' : '')} onClick={() => setScope('global')}>GLOBAL</button>
            <button className={'lb-tab' + (scope === 'friends' ? ' on' : '')} onClick={() => setScope('friends')}>FRIENDS</button>
          </div>
          <div className="lb-meta">Weekly · resets Mon{profile.premium ? ' · you are #' + meRank : ' · viewing only'}</div>
        </div>

        <div className="lb-table pix-win">
          <div className="lb-row lb-th">
            <span className="c-rk">#</span>
            <span className="c-nm">PLAYER</span>
            <span className="c-bt">BELT</span>
            <span className="c-rt">RATING</span>
            <span className="c-wk">WEEK</span>
            <span className="c-st">STREAK</span>
          </div>
          <div className="lb-scroll">
            {rows.map((r) => {
              const belt = beltForRating(r.rating);
              return (
                <div key={r.name + r.rank} className={'lb-row' + (r.you ? ' me' : '')}>
                  <span className="c-rk">{r.rank <= 3 ? ['①','②','③'][r.rank - 1] : r.rank}</span>
                  <span className="c-nm">{r.name}{r.you ? <em> · you</em> : null}</span>
                  <span className="c-bt"><i className={'lb-belt belt-' + belt.key}></i>{belt.en.replace(' Belt', '')}</span>
                  <span className="c-rt">{r.rating}</span>
                  <span className="c-wk">{r.week}</span>
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
