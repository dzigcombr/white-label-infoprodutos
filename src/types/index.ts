export interface User {
  id: string;
  name: string;
  email: string;
  role: 'criador' | 'membro';
  avatar?: string;
  criador_id?: string; // ← Só existe para membros (alunos)
  criador_dominio?: string; // ← NOVO CAMPO

}

export interface Product {
  id: string;
  name: string;
  external_id: string;
  platform: 'hotmart' | 'kiwify' | 'kirvano';
  description: string;
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  url: string;
  product_id: string;
  created_at: string;
  thumbnail?: string;
}

export interface Post {
  id: string;
  content: string;
  author: User;
  created_at: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  post_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface Settings {
  branding: {
    primary_color: string;
    logo?: string;
    app_name: string;
  };
  domain?: string;
  webhook_url: string;
}