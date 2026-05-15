import { useEffect, useState } from 'react'
import AnimatedContent from '../../bits/AnimatedContent.jsx'
import LogoLoop from '../../bits/LogoLoop.jsx'

export default function About({ isActive }) {
  const [activationKey, setActivationKey] = useState(0)

  useEffect(() => {
    if (isActive) {
      setActivationKey(prev => prev + 1)
    }
  }, [isActive])

  const clientLogos = [
    {
      src: '/assets/images/LyMedia.png',
      alt: 'Ly Media logo',
      href: 'https://www.youtube.com/@nguyenhuongly'
    },
    {
      src: '/assets/images/1967logo.png',
      alt: '1967 Music logo',
      href: 'https://www.youtube.com/c/1967music'
    },
    {
      src: '/assets/images/orinn.png',
      alt: 'Orinn Music logo',
      href: 'https://www.youtube.com/@orinnmusic'
    },
    {
      src: '/assets/images/metub.png',
      alt: 'Metub Network logo',
      href: 'https://metub.net/'
    },
    {
      src: '/assets/images/HHDMusic.png',
      alt: 'Hoa Hồng Dại Music logo',
      href: 'https://www.youtube.com/@HoaHongDaiMusicVN'
    },
    {
      src: '/assets/images/RV.png',
      alt: 'Rap Việt Underground logo',
      href: 'https://www.youtube.com/@RapVietUndergroundOfficial'
    }
  ]

  return (
    <article className={`about${isActive ? ' active' : ''}`} data-page="about">
      <AnimatedContent
        key={`about-title-${activationKey}`}
        distance={34}
        duration={0.5}
        ease='power3.out'
      >
        <header>
          <h2 className="h2 article-title">ABOUT ME</h2>
        </header>
      </AnimatedContent>

      <AnimatedContent
        key={`about-text-${activationKey}`}
        distance={40}
        duration={0.55}
        ease='power3.out'
        delay={0.05}
      >
        <section className="about-text">
        <p>
          Xin chào, tôi là Võ Tất Thành (Cryss) – một nhà sáng tạo nội dung và biên tập video đang sinh sống và làm việc tại TP. Hà Nội.
        </p>
        <p>
          Tôi đã có cơ hội hợp tác với nhiều ca sĩ, nghệ sĩ và đối tác truyền thông về Âm nhạc hàng đầu tại Việt Nam. Mỗi dự án là một trải nghiệm đáng quý giúp tôi hoàn thiện kỹ năng, đồng thời khẳng định phong cách sáng tạo riêng của mình.
        </p>
      </section>
      </AnimatedContent>

      <AnimatedContent
        key={`about-service-${activationKey}`}
        distance={48}
        duration={0.6}
        ease='power3.out'
        delay={0.12}
      >
        <section className="service">
        <h3 className="h3 service-title">What i&apos;m doing</h3>
        <ul className="service-list">
          <li className="service-item">
            <div className="service-icon-box">
              <img src="/assets/images/video.png" alt="Video Editor icon" width="70" loading="lazy" decoding="async" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Video Editor</h4>
              <p className="service-item-text">Lyrics Video, Visualizer, TVC.</p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <img src="/assets/images/content-creator.png" alt="Content Creator icon" width="70" loading="lazy" decoding="async" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Content Creator</h4>
              <p className="service-item-text">Quay dựng, phát triển nội dung đa nền tảng.</p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <img src="/assets/images/design.png" alt="Designer icon" width="70" loading="lazy" decoding="async" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Graphic Designer</h4>
              <p className="service-item-text">Poster, banner, thumbnail.</p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <img src="/assets/images/photo.png" alt="Photography icon" width="70" loading="lazy" decoding="async" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Photography</h4>
              <p className="service-item-text">Chụp ảnh, xử lý hình ảnh.</p>
            </div>
          </li>
        </ul>

        </section>
        </AnimatedContent>

        <AnimatedContent
          key={`about-clients-${activationKey}`}
          distance={44}
          duration={0.6}
          ease='power3.out'
          delay={0.2}
        >
        <section className="clients">
          <h3 className="h3 clients-title">Clients</h3>
          <LogoLoop
            logos={clientLogos}
            speed={110}
            logoHeight={100}
            gap={46}
            pauseOnHover
            className='about-logo-loop'
            ariaLabel='Client logos'
          />
        </section>
        </AnimatedContent>
    </article>
  )
}
