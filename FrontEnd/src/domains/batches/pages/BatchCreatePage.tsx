import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { Input } from '../../../design-system/components/Input.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { Select } from '../../../design-system/components/Select.tsx'
import { TextArea } from '../../../design-system/components/TextArea.tsx'

type BatchFormState = {
  numero: string
  operador: string
  siloId: string
  data: string
  umidadeChegadaPct: string
  observacoes: string
}

export function BatchCreatePage() {
  const navigate = useNavigate()
  const silos = useAppStore((state) => state.silos)
  const selectedSiloId = useAppStore((state) => state.selectedSiloId)
  const userName = useAppStore((state) => state.session.userName)
  const addBatch = useAppStore((state) => state.addBatch)

  const [formState, setFormState] = useState<BatchFormState>({
    numero: '',
    operador: userName || 'Operador',
    siloId: selectedSiloId ?? silos[0]?.id ?? '',
    data: new Date().toISOString().slice(0, 10),
    umidadeChegadaPct: '',
    observacoes: '',
  })

  const handleChange = (field: keyof BatchFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const batchId = addBatch({
      numero: formState.numero.trim().toUpperCase(),
      operador: formState.operador.trim(),
      siloId: formState.siloId,
      data: formState.data,
      umidadeChegadaPct: Number(formState.umidadeChegadaPct),
      observacoes: formState.observacoes.trim(),
    })

    navigate(`/lotes/${batchId}/inicio`)
  }

  if (silos.length === 0) {
    return (
      <Card>
        <h3 className="section-title">Sem silos para vincular</h3>
        <p className="small-text">Cadastre um silo antes de criar um lote.</p>
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => navigate('/silos/novo')}>Cadastrar silo</Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <PageHeader
        title="Cadastro de Lote"
        description="Registro inicial para iniciar o processo de secagem."
      />

      <Card>
        <form className="form-grid two-columns" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Numero do lote</span>
            <Input
              value={formState.numero}
              onChange={(event) => handleChange('numero', event.target.value)}
              placeholder="LT-2026-201"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Operador</span>
            <Input
              value={formState.operador}
              onChange={(event) => handleChange('operador', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Silo</span>
            <Select
              value={formState.siloId}
              onChange={(event) => handleChange('siloId', event.target.value)}
              required
            >
              {silos.map((silo) => (
                <option key={silo.id} value={silo.id}>{`${silo.codigo} - ${silo.nome}`}</option>
              ))}
            </Select>
          </label>

          <label className="field">
            <span className="field-label">Data</span>
            <Input
              type="date"
              value={formState.data}
              onChange={(event) => handleChange('data', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Umidade de chegada (%)</span>
            <Input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={formState.umidadeChegadaPct}
              onChange={(event) => handleChange('umidadeChegadaPct', event.target.value)}
              required
            />
          </label>

          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span className="field-label">Observacoes</span>
            <TextArea
              value={formState.observacoes}
              onChange={(event) => handleChange('observacoes', event.target.value)}
              placeholder="Anotacoes iniciais do lote"
            />
          </label>

          <div className="inline-actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => navigate('/silos')}>
              Cancelar
            </Button>
            <Button type="submit">Salvar e seguir para inicio</Button>
          </div>
        </form>
      </Card>
    </>
  )
}

