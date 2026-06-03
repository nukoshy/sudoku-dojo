// Sudoku Dojo — bottom tab bar (shared nav across hub screens).
function TabBar({ active, onNav, onPlay }) {
  const tabs = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'leaderboard', label: 'Ranks', icon: 'trophy' },
    { key: 'techniques', label: 'Learn', icon: 'book' },
    { key: 'profile', label: 'Profile', icon: 'user' },
  ];
  return (
    <div className="tabbar">
      <button className={'tab' + (active === 'home' ? ' on' : '')} onClick={() => onNav('home')}>
        <Icon name="home" size={22} /><span>Home</span>
      </button>
      <button className={'tab' + (active === 'leaderboard' ? ' on' : '')} onClick={() => onNav('leaderboard')}>
        <Icon name="trophy" size={22} /><span>Ranks</span>
      </button>
      <button className="tab tab-play" onClick={onPlay}>
        <Icon name="play" size={22} /><span>PLAY</span>
      </button>
      <button className={'tab' + (active === 'techniques' ? ' on' : '')} onClick={() => onNav('techniques')}>
        <Icon name="book" size={22} /><span>Learn</span>
      </button>
      <button className={'tab' + (active === 'profile' ? ' on' : '')} onClick={() => onNav('profile')}>
        <Icon name="user" size={22} /><span>Profile</span>
      </button>
    </div>
  );
}

Object.assign(window, { TabBar });
