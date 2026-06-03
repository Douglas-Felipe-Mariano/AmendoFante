import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { StatCard } from '../../../design-system/components/StatCard.tsx'
import { SiloCard } from '../components/SiloCard.tsx'

export function SilosDashboardPage() {
  const navigate = useNavigate()
  const silos = useAppStore((state) => state.silos)
  const selectedSiloId = useAppStore((state) => state.selectedSiloId)
  const selectSilo = useAppStore((state) => state.selectSilo)
  const resetData = useAppStore((state) => state.resetData)

  const stats = useMemo(() => {
    const activeCount = silos.filter((silo) => silo.status === 'ativo' || silo.status === 'atencao').length
    const attentionCount = silos.filter((silo) => silo.status === 'atencao').length
    const averageHumidity = silos.length
      ? silos.reduce((sum, silo) => sum + silo.umidadeRelativaPct, 0) / silos.length
      : 0

    return {
      activeCount,
      attentionCount,
      averageHumidity,
    }
  }, [silos])

  return (
    <>
      <PageHeader
        title="Dashboard de Silos"
        description="Etapa 2: listar, selecionar, cadastrar e editar silos com indicadores mockados."
        actions={(
          <>
            <Button onClick={() => navigate('/silos/novo')}>Cadastrar Silo</Button>
            <Button variant="secondary" onClick={() => navigate('/lotes/novo')} disabled={silos.length === 0}>
              Cadastrar Lote
            </Button>
            <Button variant="ghost" onClick={resetData}>Resetar dados mock</Button>
          </>
        )}
      />

      <section className="stat-grid">
        <StatCard label="Silos ativos" value={String(stats.activeCount)} helper="Em operacao ou atencao" tone="success" />
        <StatCard label="Em atencao" value={String(stats.attentionCount)} helper="Prioridade no turno" tone={stats.attentionCount > 0 ? 'warning' : 'default'} />
        <StatCard label="Umidade media" value={`${stats.averageHumidity.toFixed(1)}%`} helper="Referencia ambiental" />
      </section>

      {silos.length === 0 ? (
        <Card>
          <h3 className="section-title">Nenhum silo cadastrado</h3>
          <p className="small-text">Cadastre ao menos um silo para iniciar o fluxo operacional.</p>
          <div style={{ marginTop: 12 }}>
            <Button onClick={() => navigate('/silos/novo')}>Cadastrar primeiro silo</Button>
          </div>
        </Card>
      ) : (
        <section className="silo-grid">
          {silos.map((silo) => (
            <SiloCard
              key={silo.id}
              silo={silo}
              selected={selectedSiloId === silo.id}
              onSelect={() => selectSilo(silo.id)}
              onEdit={() => navigate(`/silos/${silo.id}/editar`)}
            />
          ))}
        </section>
      )}
    </>
  )
}

