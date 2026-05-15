import { useEffect, useState } from 'react'
import AnimatedContent from '../../bits/AnimatedContent.jsx'

export default function Resume({ isActive }) {
  const [activationKey, setActivationKey] = useState(0)

  useEffect(() => {
    if (isActive) {
      setActivationKey(prev => prev + 1)
    }
  }, [isActive])

  return (
    <article className={`resume${isActive ? ' active' : ''}`} data-page="resume">
      <AnimatedContent
        key={`resume-title-${activationKey}`}
        distance={34}
        duration={0.5}
        ease='power3.out'
      >
        <header>
          <h2 className="h2 article-title">RESUME</h2>
        </header>
      </AnimatedContent>

      {/* Education */}
      <AnimatedContent
        key={`resume-education-${activationKey}`}
        distance={44}
        duration={0.58}
        ease='power3.out'
        delay={0.05}
      >
      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <ion-icon name="book-outline"></ion-icon>
          </div>
          <h3 className="h3">Education</h3>
        </div>

        <ol className="timeline-list">
          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">Vietnam National University (VNU)</h4>
            <span>2021 — 2025</span>
            <p className="timeline-text">
              VNU University of Engineering and Technology
            </p>
          </li> 
        </ol>
      </section>
      </AnimatedContent>

      {/* Experience */}
      <AnimatedContent
        key={`resume-experience-${activationKey}`}
        distance={52}
        duration={0.6}
        ease='power3.out'
        delay={0.12}
      >
      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <ion-icon name="book-outline"></ion-icon>
          </div>
          <h3 className="h3">Experience</h3>
        </div>

        <ol className="timeline-list">
          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">Freelancer</h4>
                <span>2017 — Present</span>
                <p className="timeline-text">
                  Video Editor, Designer, Content Creator, Manager,...
                </p>
              </li>

              <li className="timeline-item">
                <h4 className="h4 timeline-item-title">Ly Media</h4>
                <span>2021 — Present</span>
                <p className="timeline-text">
                  Leader, Manager &amp; Video Editor
                </p>
              </li>

              <li className="timeline-item">
                <h4 className="h4 timeline-item-title">Orinn Music</h4>
                <span>2022 — 2023</span>
                <p className="timeline-text">
                  Manager &amp; Video Editor
                </p>
              </li>

              <li className="timeline-item">
                <h4 className="h4 timeline-item-title">1967 Entertainment</h4>
                <span>2021 — 2022</span>
                <p className="timeline-text">
                  Manager &amp; Video Editor
                </p>
              </li>

              <li className="timeline-item">
                <h4 className="h4 timeline-item-title">Hoa Hồng Dại Music</h4>
                <span>2018 — 2022</span>
                <p className="timeline-text">
                  Video Editor
                </p>
              </li>

              <li className="timeline-item">
                <h4 className="h4 timeline-item-title">Rap Việt Underground</h4>
                <span>2017 — 2020</span>
                <p className="timeline-text">
                  Video Editor
                </p>
              </li>
        </ol>
      </section>
      </AnimatedContent>
    </article>
  )
}
