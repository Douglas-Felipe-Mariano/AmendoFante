import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
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
      <Card className="auth-card" padded={false}>
        <div className="auth-brand">
          <img className="auth-logo" src="/logo-amendofante.png" alt="AmendoFante" />
          <div>
            <h1 className="brand-title">AmendoFante</h1>
            <p className="brand-subtitle">Prototipo funcional para secagem de amendoim em silos</p>
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
      </Card>
    </section>
  )
}

