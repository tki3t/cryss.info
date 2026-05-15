export default function Navbar({ activePage, onNavigate }) {
  const pages = ['about', 'resume', 'contact']

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {pages.map(page => (
          <li key={page} className="navbar-item">
            <button
              className={`navbar-link${activePage === page ? ' active' : ''}`}
              onClick={() => {
                onNavigate(page)
                window.scrollTo(0, 0)
              }}
            >
              {page.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
