import { useSession } from "../../context/SessionContext"
import {
  LOGIN_WELCOME,
  LOGIN_HEADLINE,
  LOGIN_HINT,
  LOGIN_BUTTON,
  LOGIN_SIGNUP_BUTTON,
} from "../../data/dashboardCopy"

export default function LoginGate() {
  const { login } = useSession()

  return (
    <div className="login-gate">
      <section className="login-gate__left" aria-label="Sign in">
        <div className="login-gate__content">
          <p className="login-gate__welcome">{LOGIN_WELCOME}</p>
          <h1 className="login-gate__headline">{LOGIN_HEADLINE}</h1>
          <p className="login-gate__hint">{LOGIN_HINT}</p>
          <div className="login-gate__actions">
            <button
              type="button"
              className="login-gate__btn login-gate__btn--primary"
              onClick={login}
            >
              {LOGIN_BUTTON}
            </button>
            <button
              type="button"
              className="login-gate__btn login-gate__btn--outline"
              disabled
              title="Not available in this prototype"
            >
              {LOGIN_SIGNUP_BUTTON}
            </button>
          </div>
        </div>
      </section>

      <aside className="login-gate__right" aria-hidden="true">
        <img
          className="login-gate__hero"
          src="/login-brand-hero.png"
          width={761}
          height={1024}
          alt=""
          decoding="async"
        />
      </aside>
    </div>
  )
}
