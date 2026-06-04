export type SiloStatus = 'ativo' | 'atencao' | 'manutencao' | 'inativo'

export interface Silo {
  id: string
  codigo: string
  nome: string
  capacidadeKg: number
  status: SiloStatus
  umidadeRelativaPct: number
  umidadeAmendoimPct: number
  temperaturaC: number
  tempoEstimadoMin: number
  observacoes?: string
}
