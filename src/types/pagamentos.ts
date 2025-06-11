import { Timestamp } from 'firebase/firestore';

export interface Pagamento {
  id: string;
  moradorId: string;
  dataPagamento: Timestamp;
  valor: number;
  mes: number;
  ano: number;
  status: 'pendente' | 'confirmado' | 'atrasado';
  comprovanteUrl?: string;
  observacao?: string;
  metodoPagamento: 'pix' | 'boleto' | 'transferencia' | 'dinheiro';
  dataVencimento: Timestamp;
}

export interface MoradorComPagamento {
  id: string;
  nome: string;
  apartamento: string;
  email: string;
  telefone: string;
  status: 'em dia' | 'atrasado';
  ultimoPagamento?: Pagamento;
}

export interface ConfiguracaoPagamento {
  valorPadrao: number;
  diaVencimento: number;
  pixKey?: string;
  pixType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  webhookUrl?: string;
}