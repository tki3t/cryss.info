import { useState, useEffect } from 'react'
import ShinyText   from '../bits/ShinyText.jsx'
import GradientText from '../bits/GradientText.jsx'
import CountUp     from '../bits/CountUp.jsx'


const WORKER_URL = 'https://counter-api-sable.vercel.app/v1/cryss-info/site-visits/up'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [visitCount, setVisitCount] = useState(null)
  const [showCounter, setShowCounter] = useState(true)

  // Visit counter fetch (once on mount)
  useEffect(() => {
    fetch(WORKER_URL)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(d => {
        const count = d && (d.count !== undefined ? d.count : d.value)
        if (typeof count === 'number') {
          setVisitCount(count)
        } else {
          setShowCounter(false)
        }
      })
      .catch(() => setShowCounter(false))
  }, [])

  return (
    <aside className={`sidebar${isOpen ? ' active' : ''}`} data-sidebar>

      <div className="sidebar-info">
        <figure className="avatar-box">
          <img src="/assets/images/logo.jpg" alt="Võ Tất Thành" width="80" fetchPriority="high" decoding="async" />
        </figure>

        <div className="info-content">
          <h1 className="name" title="Võ Tất Thành (Cryss)">
            <ShinyText
              text="Võ Tất Thành (Cryss)"
              color="#e0e0e0"
              shineColor="#ffe8a3"
              speed={4}
              yoyo
            />
          </h1>
          <p className="title">
            <GradientText
              colors={['#c9a55a', '#ffe8a3', '#b8860b', '#c9a55a']}
              animationSpeed={6}
              yoyo
            >
              Video Editor/Content Creator
            </GradientText>
          </p>
        </div>

        <button className="info_more-btn" onClick={() => setIsOpen(o => !o)}>
          <span>Show Contacts</span>
          <ion-icon name="chevron-down"></ion-icon>
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="mail-outline"></ion-icon>
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href="mailto:contact.cryss@gmail.com" className="contact-link" title="contact.cryss@gmail.com">
                contact.cryss@gmail.com
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="phone-portrait-outline"></ion-icon>
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href="https://zalo.me/0333577503" className="contact-link">+84 333577503</a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="calendar-outline"></ion-icon>
            </div>
            <div className="contact-info">
              <p className="contact-title">Birthday</p>
              <time dateTime="2003-07-05">July 05, 2003</time>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="location-outline"></ion-icon>
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>Ha Noi, Vietnam</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <div className="social-visit-row">
          <ul className="social-list">
            <li className="social-item">
              <a href="https://www.facebook.com/cryss.is.me" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-facebook"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://www.youtube.com/@cryss4051" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-youtube"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://www.instagram.com/cryss.is.me" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-instagram"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://www.tiktok.com/@cryss.is.me" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-tiktok"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://discord.com/users/940551064288129036" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-discord"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://steamcommunity.com/id/cryssisme/" className="social-link" target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-steam"></ion-icon>
              </a>
            </li>
          </ul>

          {showCounter && (
            <div className="visit-counter">
              <ion-icon name="eye-outline"></ion-icon>
              <span id="visit-count" className={visitCount !== null ? 'counting' : ''}>
                {visitCount !== null
                  ? <CountUp to={visitCount} from={0} duration={2} separator="." startWhen={visitCount !== null} />
                  : '—'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
