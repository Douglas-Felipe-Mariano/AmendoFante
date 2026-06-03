import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { Input } from '../../../design-system/components/Input.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { Select } from '../../../design-system/components/Select.tsx'
import { StatCard } from '../../../design-system/components/StatCard.tsx'

type StatusFilter = 'todos' | 'cadastrado' | 'secando' | 'aguardando_analise' | 'pausado' | 'finalizado'

export function HistoryPage() {
  const navigate = useNavigate()

  const role = useAppStore((state) => state.session.role)
  const batches = useAppStore((state) => state.batches)
  const silos = useAppStore((state) => state.silos)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return batches
      .filter((batch) => (statusFilter === 'todos' ? true : batch.status === statusFilter))
      .filter((batch) => {
        if (!normalizedSearch) {
          return true
        }

        return (
          batch.numero.toLowerCase().includes(normalizedSearch)
          || batch.operador.toLowerCase().includes(normalizedSearch)
        )
      })
      .sort((a, b) => {
        const dateA = new Date(a.startedAt ?? a.data).getTime()
        const dateB = new Date(b.startedAt ?? b.data).getTime()
        return dateB - dateA
      })
  }, [batches, statusFilter, search])

  const finalizedCount = batches.filter((batch) => batch.status === 'finalizado').length
  const activeCount = batches.filter((batch) => batch.status === 'secando' || batch.status === 'aguardando_analise').length

  const openSummary = (batchId: string) => {
    if (role === 'gestor') {
      navigate(`/gerencial/lotes/${batchId}/resumo`)
      return
    }

    navigate(`/lotes/${batchId}/resumo`)
  }

  return (
    <>
      <PageHeader
        title="Historico de lotes"
        description="Consulta completa dos lotes com filtros por status e busca textual."
      />

      <section className="stat-grid">
        <StatCard label="Total de lotes" value={String(batches.length)} />
        <StatCard label="Em andamento" value={String(activeCount)} tone={activeCount > 0 ? 'warning' : 'default'} />
        <StatCard label="Finalizados" value={String(finalizedCount)} tone="success" />
      </section>

      <Card>
        <div className="form-grid two-columns">
          <label className="field">
            <span className="field-label">Status</span>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              <option value="todos">Todos</option>
              <option value="cadastrado">Cadastrado</option>
              <option value="secando">Secando</option>
              <option value="aguardando_analise">Aguardando analise</option>
              <option value="pausado">Pausado</option>
              <option value="finalizado">Finalizado</option>
            </Select>
          </label>

          <label className="field">
            <span className="field-label">Buscar lote ou operador</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="LT-2026-101 ou nome do operador"
            />
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">Resultados</h3>
        {filtered.length === 0 ? (
          <p className="small-text" style={{ marginTop: 10 }}>
            Nenhum lote encontrado com os filtros atuais.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Silo</th>
                  <th>Operador</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((batch) => {
                  const silo = silos.find((item) => item.id === batch.siloId)

                  return (
                    <tr key={batch.id}>
                      <td>{batch.numero}</td>
                      <td>{silo ? `${silo.codigo} - ${silo.nome}` : '-'}</td>
                      <td>{batch.operador}</td>
                      <td>{batch.status}</td>
                      <td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(batch.data))}</td>
                      <td>
                        <Button variant="secondary" onClick={() => openSummary(batch.id)}>
                          Abrir resumo
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
