import { useRef, useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import AnimatedContent from '../../bits/AnimatedContent.jsx'

const SERVICE_ID  = 'service_uq48gps'
const TEMPLATE_ID = 'template_fqwyrec'
const PUBLIC_KEY  = '2Qt2Tx3B_YeZCfFWq'

export default function Contact({ isActive }) {
  const formRef = useRef(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [status,    setStatus]    = useState(null)   // null | 'sending' | 'success' | 'error'
  const [activationKey, setActivationKey] = useState(0)

  useEffect(() => {
    if (isActive) {
      setActivationKey(prev => prev + 1)
    }
  }, [isActive])

  // Validate all form inputs whenever they change
  function handleInput() {
    const form = formRef.current
    if (!form) return
    setCanSubmit(form.checkValidity())
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    setStatus('sending')
    try {
      emailjs.init({ publicKey: PUBLIC_KEY })
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form)
      setStatus('success')
      form.reset()
      setCanSubmit(false)
    } catch (err) {
      console.error('EmailJS error:', err)
      setStatus('error')
    }
  }

  return (
    <article className={`contact${isActive ? ' active' : ''}`} data-page="contact">
      <AnimatedContent
        key={`contact-title-${activationKey}`}
        distance={34}
        duration={0.5}
        ease='power3.out'
      >
        <header>
          <h2 className="h2 article-title">CONTACT</h2>
        </header>
      </AnimatedContent>

      {/* Google Map */}
      <AnimatedContent
        key={`contact-map-${activationKey}`}
        distance={42}
        duration={0.55}
        ease='power3.out'
        delay={0.05}
      >
        <section className="mapbox">
        <figure>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.1534367723884!2d105.78446927599059!3d20.986485689227777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accbc4f9620f%3A0xb7c722a4499be85a!2sChung%20c%C6%B0%20Mulberry%20Lane%20to%CC%80a%20E%20Apartment!5e0!3m2!1sen!2s!4v1777650549690!5m2!1sen!2s"
            width="400"
            height="300"
            loading="lazy"
            title="Chung cư Mulberry Lane tòa E Apartment"
          ></iframe>
        </figure>
      </section>
      </AnimatedContent>

      {/* Contact form */}
      <AnimatedContent
        key={`contact-form-${activationKey}`}
        distance={54}
        duration={0.6}
        ease='power3.out'
        delay={0.14}
      >
      <section className="contact-form">
        <h3 className="h3 form-title">Contact Form</h3>

        <form
          action="#"
          className="form"
          data-form
          ref={formRef}
          onSubmit={handleSubmit}
          onInput={handleInput}
          id="contact-form"
        >
          <div className="input-wrapper">
            <input
              type="text"
              name="fullname"
              className="form-input"
              placeholder="Full name"
              required
              data-form-input
            />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              required
              data-form-input
            />
          </div>

          <textarea
            name="message"
            className="form-input"
            placeholder="Your Message"
            required
            data-form-input
          ></textarea>

          {/* Cloudflare Turnstile */}
          <div className="cf-turnstile-wrapper">
            <div className="cf-turnstile" data-sitekey="0x4AAAAAABhVJT39qNzGLjPl"></div>
          </div>

          <button
            className="form-btn"
            type="submit"
            disabled={!canSubmit || status === 'sending'}
            data-form-btn
          >
            <ion-icon name="paper-plane-outline"></ion-icon>
            <span>{status === 'sending' ? 'Sending…' : 'Send Message'}</span>
          </button>

          {status === 'success' && (
            <p className="form-msg form-msg--success">Email sent successfully!</p>
          )}
          {status === 'error' && (
            <p className="form-msg form-msg--error">An error occurred, please try again.</p>
          )}
        </form>
      </section>
      </AnimatedContent>
    </article>
  )
}
