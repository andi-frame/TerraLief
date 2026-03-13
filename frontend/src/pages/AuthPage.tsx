import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

type AuthMode = 'login' | 'register'

function AuthPage() {
  const navigate = useNavigate()
  const { login, register, authError } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (mode === 'register') {
        if (!username.trim()) {
          throw new Error('Username is required')
        }
        await register({ username: username.trim(), email: email.trim(), password })
      } else {
        await login({ email: email.trim(), password })
      }
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-veil" />

      <section className="auth-card" aria-label="Sign in">
        <img src="/terralieflogo.svg" alt="TerraLief logo" className="auth-logo" />

        <h1>Welcome to TerraLief</h1>
        <p>
          Access shelter information, find the best relief routes, and help deliver aid where it is needed most.
        </p>

        <div className="auth-mode-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <label>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your_username"
                autoComplete="username"
              />
            </label>
          )}

          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {(formError || authError) && <p className="auth-error">{formError ?? authError}</p>}

          <button type="submit" className="auth-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <small>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </small>
      </section>
    </main>
  )
}

export default AuthPage
