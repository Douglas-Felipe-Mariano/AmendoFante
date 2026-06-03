import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { Input } from '../../../design-system/components/Input.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { Select } from '../../../design-system/components/Select.tsx'
import { TextArea } from '../../../design-system/components/TextArea.tsx'

type FormState = {
  codigo: string
  nome: string
  capacidadeKg: string
  status: 'ativo' | 'atencao' | 'manutencao' | 'inativo'
  umidadeRelativaPct: string
  umidadeAmendoimPct: string
  temperaturaC: string
  tempoEstimadoMin: string
  observacoes: string
}

const DEFAULT_FORM: FormState = {
  codigo: '',
  nome: '',
  capacidadeKg: '',
  status: 'ativo',
  umidadeRelativaPct: '',
  umidadeAmendoimPct: '',
  temperaturaC: '',
  tempoEstimadoMin: '',
  observacoes: '',
}

export function SiloFormPage() {
  const { siloId } = useParams<{ siloId: string }>()
  const navigate = useNavigate()
  const silos = useAppStore((state) => state.silos)
  const addSilo = useAppStore((state) => state.addSilo)
  const updateSilo = useAppStore((state) => state.updateSilo)

  const editingSilo = silos.find((silo) => silo.id === siloId)
  const isEditing = Boolean(siloId)

  const [formState, setFormState] = useState<FormState>(() => {
    if (!editingSilo) {
      return DEFAULT_FORM
    }

    return {
      codigo: editingSilo.codigo,
      nome: editingSilo.nome,
      capacidadeKg: String(editingSilo.capacidadeKg),
      status: editingSilo.status,
      umidadeRelativaPct: String(editingSilo.umidadeRelativaPct),
      umidadeAmendoimPct: String(editingSilo.umidadeAmendoimPct),
      temperaturaC: String(editingSilo.temperaturaC),
      tempoEstimadoMin: String(editingSilo.tempoEstimadoMin),
      observacoes: editingSilo.observacoes ?? '',
    }
  })

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((state) => ({ ...state, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      codigo: formState.codigo.trim().toUpperCase(),
      nome: formState.nome.trim(),
      capacidadeKg: Number(formState.capacidadeKg),
      status: formState.status,
      umidadeRelativaPct: Number(formState.umidadeRelativaPct),
      umidadeAmendoimPct: Number(formState.umidadeAmendoimPct),
      temperaturaC: Number(formState.temperaturaC),
      tempoEstimadoMin: Number(formState.tempoEstimadoMin),
      observacoes: formState.observacoes.trim(),
    }

    if (isEditing && siloId) {
      updateSilo(siloId, payload)
    } else {
      addSilo(payload)
    }

    navigate('/silos')
  }

  if (isEditing && !editingSilo) {
    return (
      <Card>
        <h3 className="section-title">Silo nao encontrado</h3>
        <p className="small-text">O silo solicitado nao existe mais na base mockada.</p>
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => navigate('/silos')}>Voltar</Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <PageHeader
        title={isEditing ? 'Editar Silo' : 'Cadastrar Silo'}
        description="Configuracao basica da operacao com dados mockados."
      />

      <Card>
        <form className="form-grid two-columns" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Codigo do silo</span>
            <Input
              value={formState.codigo}
              onChange={(event) => handleChange('codigo', event.target.value)}
              placeholder="S-01"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Nome do silo</span>
            <Input
              value={formState.nome}
              onChange={(event) => handleChange('nome', event.target.value)}
              placeholder="Silo Norte"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Capacidade (KG)</span>
            <Input
              type="number"
              min={1}
              value={formState.capacidadeKg}
              onChange={(event) => handleChange('capacidadeKg', event.target.value)}
              placeholder="200000"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <Select
              value={formState.status}
              onChange={(event) => handleChange('status', event.target.value as FormState['status'])}
            >
              <option value="ativo">Ativo</option>
              <option value="atencao">Atencao</option>
              <option value="manutencao">Manutencao</option>
              <option value="inativo">Inativo</option>
            </Select>
          </label>

          <label className="field">
            <span className="field-label">Umidade relativa do ar (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={formState.umidadeRelativaPct}
              onChange={(event) => handleChange('umidadeRelativaPct', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Umidade do amendoim (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={formState.umidadeAmendoimPct}
              onChange={(event) => handleChange('umidadeAmendoimPct', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Temperatura (C)</span>
            <Input
              type="number"
              step="0.1"
              value={formState.temperaturaC}
              onChange={(event) => handleChange('temperaturaC', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Tempo estimado (min)</span>
            <Input
              type="number"
              min={0}
              value={formState.tempoEstimadoMin}
              onChange={(event) => handleChange('tempoEstimadoMin', event.target.value)}
              required
            />
          </label>

          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span className="field-label">Observacoes</span>
            <TextArea
              value={formState.observacoes}
              onChange={(event) => handleChange('observacoes', event.target.value)}
              placeholder="Detalhes operacionais"
            />
          </label>

          <div className="inline-actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => navigate('/silos')}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Salvar alteracoes' : 'Cadastrar silo'}</Button>
          </div>
        </form>
      </Card>
    </>
  )
}

