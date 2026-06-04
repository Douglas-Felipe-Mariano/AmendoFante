import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { differenceInMinutes } from 'date-fns'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Badge } from '../../../design-system/components/Badge.tsx'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { Input } from '../../../design-system/components/Input.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { Select } from '../../../design-system/components/Select.tsx'
import type { AlertType } from '../model.ts'

const ALERT_LABEL: Record<AlertType, string> = {
  inicial: 'Analise inicial',
  intermediaria: 'Analise intermediaria',
  final: 'Analise final',
}

function getStatusVariant(status: 'pendente' | 'realizado' | 'atrasado') {
  if (status === 'realizado') {
    return 'success'
  }

  if (status === 'atrasado') {
    return 'danger'
  }

  return 'warning'
}

export function AnalysesPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()

  const batches = useAppStore((state) => state.batches)
  const analysisAlerts = useAppStore((state) => state.analysisAlerts)
  const analysisRecords = useAppStore((state) => state.analysisRecords)
  const recordAnalysis = useAppStore((state) => state.recordAnalysis)
  const refreshBatchAlerts = useAppStore((state) => state.refreshBatchAlerts)

  const batch = useMemo(
    () => batches.find((current) => current.id === batchId),
    [batches, batchId],
  )

  const batchAlerts = useMemo(
    () => analysisAlerts
      .filter((alert) => alert.batchId === batchId)
      .sort((a, b) => a.dueMinutes - b.dueMinutes),
    [analysisAlerts, batchId],
  )

  const batchRecords = useMemo(
    () => analysisRecords
      .filter((record) => record.batchId === batchId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [analysisRecords, batchId],
  )

  const [alertType, setAlertType] = useState<AlertType>('inicial')
  const [resultado, setResultado] = useState<'Conforme' | 'Atencao' | 'Critico'>('Conforme')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (!batch) {
      return
    }

    const elapsed = batch.startedAt
      ? Math.max(0, differenceInMinutes(new Date(), new Date(batch.startedAt)))
      : 0

    refreshBatchAlerts(batch.id, elapsed)
  }, [batch, refreshBatchAlerts])

  if (!batch || !batchId) {
    return (
      <Card>
        <h3 className="section-title">Lote nao encontrado</h3>
        <p className="small-text">Selecione um lote valido para registrar analises.</p>
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => navigate('/historico')}>Ir para historico</Button>
        </div>
      </Card>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    recordAnalysis({
      batchId,
      alertType,
      resultado,
      observacoes,
    })

    setObservacoes('')
  }

  const pendingCount = batchAlerts.filter((alert) => alert.status !== 'realizado').length

  return (
    <>
      <PageHeader
        title={`Analises do lote ${batch.numero}`}
        description="Registre analises inicial, intermediaria e final para liberar a finalizacao."
        actions={(
          <>
            <Button variant="secondary" onClick={() => navigate(`/lotes/${batch.id}/monitoramento`)}>
              Monitoramento
            </Button>
            <Button onClick={() => navigate(`/lotes/${batch.id}/finalizacao`)}>
              Ir para finalizacao
            </Button>
          </>
        )}
      />

      <Card>
        <h3 className="section-title">Agenda de alertas</h3>
        <p className="small-text" style={{ marginTop: 8 }}>
          Pendencias atuais: {pendingCount}
        </p>
        <div className="alert-list" style={{ marginTop: 12 }}>
          {batchAlerts.map((alert) => (
            <article className="alert-item" key={alert.id}>
              <div className="inline-actions" style={{ justifyContent: 'space-between', width: '100%' }}>
                <strong>{ALERT_LABEL[alert.type]}</strong>
                <Badge variant={getStatusVariant(alert.status)}>{alert.status}</Badge>
              </div>
              <p className="small-text" style={{ marginTop: 4 }}>
                Janela prevista: {alert.dueMinutes} min
              </p>
            </article>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="section-title">Registrar analise</h3>
        <form className="form-grid two-columns" style={{ marginTop: 12 }} onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Tipo</span>
            <Select value={alertType} onChange={(event) => setAlertType(event.target.value as AlertType)}>
              <option value="inicial">Analise inicial</option>
              <option value="intermediaria">Analise intermediaria</option>
              <option value="final">Analise final</option>
            </Select>
          </label>

          <label className="field">
            <span className="field-label">Resultado</span>
            <Select
              value={resultado}
              onChange={(event) => setResultado(event.target.value as 'Conforme' | 'Atencao' | 'Critico')}
            >
              <option value="Conforme">Conforme</option>
              <option value="Atencao">Atencao</option>
              <option value="Critico">Critico</option>
            </Select>
          </label>

          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span className="field-label">Observacoes</span>
            <Input
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              placeholder="Observacoes tecnicas da amostra"
            />
          </label>

          <div className="inline-actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <Button type="submit">Salvar analise</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="section-title">Historico de registros</h3>
        {batchRecords.length === 0 ? (
          <p className="small-text" style={{ marginTop: 10 }}>
            Nenhuma analise registrada ainda.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Tipo</th>
                  <th>Resultado</th>
                  <th>Operador</th>
                  <th>Observacoes</th>
                </tr>
              </thead>
              <tbody>
                {batchRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(record.createdAt))}</td>
                    <td>{ALERT_LABEL[record.alertType]}</td>
                    <td>{record.resultado}</td>
                    <td>{record.operador}</td>
                    <td>{record.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
