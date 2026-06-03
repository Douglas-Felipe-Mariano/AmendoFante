import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Badge } from '../../../design-system/components/Badge.tsx'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { Input } from '../../../design-system/components/Input.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { formatPercent } from '../../../shared/utils/formatters.ts'

export function FinalizationPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()

  const batches = useAppStore((state) => state.batches)
  const analysisAlerts = useAppStore((state) => state.analysisAlerts)
  const finalizeBatch = useAppStore((state) => state.finalizeBatch)

  const batch = useMemo(
    () => batches.find((current) => current.id === batchId),
    [batches, batchId],
  )

  const pendingAlerts = useMemo(
    () => analysisAlerts.filter((alert) => alert.batchId === batchId && alert.status !== 'realizado'),
    [analysisAlerts, batchId],
  )

  const [umidadeFinalPct, setUmidadeFinalPct] = useState('')
  const [tempoTotalMin, setTempoTotalMin] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')

  if (!batch || !batchId) {
    return (
      <Card>
        <h3 className="section-title">Lote nao encontrado</h3>
        <p className="small-text">Nao foi possivel localizar o lote para finalizacao.</p>
      </Card>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const finalHumidity = Number(umidadeFinalPct)
    const totalMinutes = Number(tempoTotalMin)

    if (Number.isNaN(finalHumidity) || Number.isNaN(totalMinutes)) {
      setError('Preencha os campos numericos corretamente.')
      return
    }

    if (finalHumidity >= batch.umidadeChegadaPct) {
      setError('A umidade final precisa ser menor que a umidade de chegada.')
      return
    }

    const ok = finalizeBatch(batchId, {
      umidadeFinalPct: finalHumidity,
      tempoTotalMin: totalMinutes,
      observacoes,
    })

    if (!ok) {
      setError('Finalize todas as analises pendentes antes de encerrar o lote.')
      return
    }

    navigate(`/lotes/${batchId}/resumo`)
  }

  return (
    <>
      <PageHeader
        title={`Finalizacao do lote ${batch.numero}`}
        description="Encerramento com umidade final, tempo total e observacoes finais."
        actions={(
          <Button variant="secondary" onClick={() => navigate(`/lotes/${batch.id}/analises`)}>
            Voltar para analises
          </Button>
        )}
      />

      <Card>
        <div className="data-list">
          <div className="data-row">
            <span>Status atual</span>
            <Badge variant={batch.status === 'finalizado' ? 'success' : 'warning'}>{batch.status}</Badge>
          </div>
          <div className="data-row">
            <span>Umidade de chegada</span>
            <strong>{formatPercent(batch.umidadeChegadaPct)}</strong>
          </div>
          <div className="data-row">
            <span>Alertas pendentes</span>
            <strong>{pendingAlerts.length}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">Registrar fechamento</h3>
        <p className="small-text" style={{ marginTop: 8 }}>
          Ao finalizar, o consumo de gas do secador e consolidado em KG para o resumo do lote.
        </p>
        <form className="form-grid two-columns" style={{ marginTop: 12 }} onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Umidade final (%)</span>
            <Input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={umidadeFinalPct}
              onChange={(event) => setUmidadeFinalPct(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Tempo total (min)</span>
            <Input
              type="number"
              min={1}
              value={tempoTotalMin}
              onChange={(event) => setTempoTotalMin(event.target.value)}
              required
            />
          </label>

          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span className="field-label">Observacoes finais</span>
            <Input
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              placeholder="Resumo tecnico do encerramento"
            />
          </label>

          {error ? <p className="form-error" style={{ gridColumn: '1 / -1' }}>{error}</p> : null}

          <div className="inline-actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <Button type="submit">Finalizar lote</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
