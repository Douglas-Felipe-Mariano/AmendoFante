import { Badge } from '../../../design-system/components/Badge.tsx'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import type { Silo } from '../model.ts'

interface SiloCardProps {
  silo: Silo
  selected: boolean
  onSelect: () => void
  onEdit: () => void
}

function getStatusVariant(status: Silo['status']) {
  if (status === 'ativo') {
    return 'success'
  }

  if (status === 'atencao') {
    return 'warning'
  }

  if (status === 'manutencao') {
    return 'danger'
  }

  return 'default'
}

function getStatusLabel(status: Silo['status']) {
  if (status === 'atencao') {
    return 'Atencao'
  }

  if (status === 'manutencao') {
    return 'Manutencao'
  }

  if (status === 'inativo') {
    return 'Inativo'
  }

  return 'Ativo'
}

export function SiloCard({ silo, selected, onSelect, onEdit }: SiloCardProps) {
  return (
    <Card className="card-section silo-card">
      <div className="silo-card-top">
        <div>
          <p className="small-text">{silo.codigo}</p>
          <h3>{silo.nome}</h3>
        </div>
        <Badge variant={getStatusVariant(silo.status)}>{getStatusLabel(silo.status)}</Badge>
      </div>

      <div className="silo-card-metrics">
        <div className="metric-stack">
          <span className="label">Umidade relativa do ar</span>
          <span className="value">{silo.umidadeRelativaPct.toFixed(1)}%</span>
        </div>
        <div className="metric-stack">
          <span className="label">Umidade do amendoim</span>
          <span className="value">{silo.umidadeAmendoimPct.toFixed(1)}%</span>
        </div>
        <div className="metric-stack">
          <span className="label">Temperatura</span>
          <span className="value">{silo.temperaturaC.toFixed(1)} C</span>
        </div>
        <div className="metric-stack">
          <span className="label">Tempo estimado</span>
          <span className="value">{Math.round(silo.tempoEstimadoMin)} min</span>
        </div>
        <div className="metric-stack">
          <span className="label">Capacidade</span>
          <span className="value">{silo.capacidadeKg.toLocaleString('pt-BR')} KG</span>
        </div>
      </div>

      <div className="inline-actions">
        <Button variant={selected ? 'secondary' : 'primary'} onClick={onSelect}>
          {selected ? 'Silo Selecionado' : 'Selecionar Silo'}
        </Button>
        <Button variant="ghost" onClick={onEdit}>
          Editar
        </Button>
      </div>
    </Card>
  )
}

