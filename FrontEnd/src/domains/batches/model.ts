export type BatchStatus = 'cadastrado' | 'secando' | 'pausado' | 'finalizado'

export interface Batch {
  id: string
  numero: string
  operador: string
  siloId: string
  data: string
  umidadeChegadaPct: number
  umidadeFinalPct?: number
  observacoes?: string
  status: BatchStatus
  tempoTotalMin?: number
}

export interface MonitoringSnapshot {
  batchId: string
  timestamp: string
  umidadeArPct: number
  temperaturaC: number
  tempoEstimadoMin: number
  gasKgPorHora: number
  gasAcumuladoKg: number
  statusSecagem: 'Estavel' | 'Atencao' | 'Critico'
}
