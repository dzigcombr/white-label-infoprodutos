export interface Creator {
  id: string;
  nome: string;
  dominio_personalizado?: string;
  branding: {
    logo?: string;
    cor_primaria?: string;
    banners?: Array<{
      image: string | null;
      url: string;
    }>;
    language?: string;
    appType?: string;
    showProductNames?: boolean;
    supportIcon?: string;
  };
  email_suporte?: string;
  whatsapp_suporte?: string;
}

export interface Product {
  id: string;
  criador_id: string;
  nome: string;
  descricao: string;
  criado_em: string;
}

export interface Content {
  id: string;
  produto_id: string;
  tipo: 'video' | 'pdf' | 'texto';
  titulo: string;
  url: string;
  metadata?: {
    duracao?: string;
    thumbnail?: string;
    descricao?: string;
  };
}

export interface Note {
  id: number;
  titulo: string;
  texto: string;
  produto_id: string;
  usuario_uid: string;
  created_at: string;
  produto?: {
    nome: string;
  };
}

export interface Purchase {
  id: string;
  usuario_id: string;
  produto_id: string;
  status: string;
  transacao_externa_id?: string;
  criado_em: string;
  produto?: {
    nome: string;
    descricao?: string;
  };
}

export interface StudentProfile {
  id: string;
  email: string;
  nome: string;
  papel: string;
  criado_em: string;
}