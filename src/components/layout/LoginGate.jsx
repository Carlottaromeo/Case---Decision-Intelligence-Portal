import { useSession } from "../../context/SessionContext"

export default function LoginGate() {
  const { login } = useSession()

  return (
    <div className="login-gate">
      <div className="login-gate__card">
        <div className="login-gate__logo">NS</div>
        <h1 className="login-gate__title">Northstar Dashboard</h1>
        <p className="login-gate__subtitle">
          Accedi per continuare a lavorare su adoption, processi e workflow.
        </p>
        <button
          type="button"
          className="login-gate__btn"
          onClick={login}
        >
          Accedi
        </button>      </div>
    </div>
  )
}
