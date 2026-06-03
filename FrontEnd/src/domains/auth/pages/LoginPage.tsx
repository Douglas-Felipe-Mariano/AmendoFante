import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Input } from '../../../design-system/components/Input.tsx'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)
  const [accessId, setAccessId] = useState('operador@amendofante.com')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login(accessId)
    navigate('/perfil')
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="login-split">
          <div className="login-brand">
            <img className="auth-logo" src="/logo-amendofante.png" alt="AmendoFante" />
            <h2>
              Monitoramento Inteligente da <em>Secagem de Amendoim</em>
            </h2>
            <p>
              Acompanhe sensores, previsao operacional e alertas de secagem em uma jornada unica
              para operadores e gestores.
            </p>
          </div>

          <div className="login-form-side">
            <div className="auth-brand" style={{ marginBottom: 18 }}>
              <div>
                <h1 className="brand-title">AmendoFante</h1>
                <p className="brand-subtitle">Acesse sua conta para iniciar o turno.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <label className="field">
                <span className="field-label">Matricula ou e-mail</span>
                <Input
                  value={accessId}
                  onChange={(event) => setAccessId(event.target.value)}
                  placeholder="operador@amendofante.com"
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">Senha</span>
                <Input type="password" placeholder="Digite qualquer senha para o mock" required />
              </label>

              <Button type="submit" fullWidth>
                Entrar na plataforma
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

