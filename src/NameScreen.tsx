import { useState, type FormEvent } from 'react'
import { APP_NAME, APP_VERSION, DEVELOPER } from './brand'

interface NameScreenProps {
  onStart: (name: string) => void
}

export function NameScreen({ onStart }: NameScreenProps) {
  const [name, setName] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    onStart(name.trim() || 'Chickie')
  }

  return (
    <section className="screen screen--name">
      <div className="brand-block">
        <p className="brand">{APP_NAME}</p>
        <p className="tagline">Your tiny farm friend</p>
      </div>

      <form className="name-form" onSubmit={submit}>
        <label className="name-form__label" htmlFor="chick-name">
          Name your chicken
        </label>
        <input
          id="chick-name"
          className="name-form__input"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 12))}
          placeholder="Chickie"
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          maxLength={12}
        />
        <button type="submit" className="btn-primary">
          Start
        </button>
      </form>

      <footer className="developer">
        <p className="developer__by">
          Made by{' '}
          <a
            className="developer__link"
            href={DEVELOPER.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {DEVELOPER.name}
          </a>
        </p>
        <a
          className="developer__site"
          href={DEVELOPER.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {DEVELOPER.siteLabel}
        </a>
        <p className="developer__version">v{APP_VERSION}</p>
        <p className="developer__install">
          iPhone: Safari → Share → Add to Home Screen
        </p>
      </footer>
    </section>
  )
}
