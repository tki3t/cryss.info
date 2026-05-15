import './LogoLoop.css'

const toCssLength = value => (typeof value === 'number' ? `${value}px` : value)

export default function LogoLoop({
  logos = [],
  speed = 10,
  gap = 32,
  logoHeight = 28,
  width = '100%',
  pauseOnHover = true,
  className = '',
  ariaLabel = 'Partner logos'
}) {
  const safeSpeed = Math.max(20, Math.abs(speed))
  const duration = Math.max(8, (logos.length * 220) / safeSpeed)

  const rootClassName = [
    'logoloop',
    pauseOnHover && 'logoloop--pause-on-hover',
    className
  ]
    .filter(Boolean)
    .join(' ')

  const style = {
    width: toCssLength(width) || '100%',
    '--logoloop-gap': `${gap}px`,
    '--logoloop-logo-height': `${logoHeight}px`,
    '--logoloop-duration': `${duration}s`
  }

  const renderItem = (item, idx) => {
    const content = (
      <img
        src={item.src}
        alt={item.alt || ''}
        loading='lazy'
        decoding='async'
        draggable={false}
      />
    )

    return (
      <li className='logoloop__item' key={idx}>
        {item.href ? (
          <a
            className='logoloop__link'
            href={item.href}
            target='_blank'
            rel='noreferrer noopener'
            aria-label={item.alt || 'logo link'}
          >
            {content}
          </a>
        ) : (
          content
        )}
      </li>
    )
  }

  return (
    <div className={rootClassName} style={style} role='region' aria-label={ariaLabel}>
      <div className='logoloop__track'>
        <ul className='logoloop__list'>{logos.map(renderItem)}</ul>
        <ul className='logoloop__list' aria-hidden='true'>
          {logos.map((item, idx) => renderItem(item, `${idx}-clone`))}
        </ul>
      </div>
    </div>
  )
}
