import { Product, Content, Post, Notification } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Curso de JavaScript Avançado',
    external_id: 'JS_ADV_001',
    platform: 'hotmart',
    description: 'Aprenda JavaScript do zero ao avançado com projetos práticos',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'React para Iniciantes',
    external_id: 'REACT_BEG_002',
    platform: 'kiwify',
    description: 'Domine React.js criando aplicações reais',
    created_at: '2024-01-20T14:30:00Z'
  }
];

export const mockContents: Content[] = [
  {
    id: '1',
    title: 'Introdução ao JavaScript',
    type: 'video',
    url: 'https://example.com/video1',
    product_id: '1',
    created_at: '2024-01-15T10:00:00Z',
    thumbnail: 'https://images.pexels.com/photos/943096/pexels-photo-943096.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    title: 'Fundamentos do React',
    type: 'video',
    url: 'https://example.com/video2',
    product_id: '2',
    created_at: '2024-01-20T14:30:00Z',
    thumbnail: 'https://images.pexels.com/photos/374559/pexels-photo-374559.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    title: 'Guia Completo JavaScript.pdf',
    type: 'pdf',
    url: 'https://example.com/guide.pdf',
    product_id: '1',
    created_at: '2024-01-16T09:00:00Z'
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Acabei de lançar uma nova aula sobre Promises em JavaScript! Quem já assistiu?',
    author: {
      id: '1',
      name: 'João Silva',
      email: 'creator@example.com',
      role: 'creator',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    created_at: '2024-12-20T10:30:00Z',
    likes: 12,
    comments: [
      {
        id: '1',
        content: 'Excelente aula! Tirou todas as minhas dúvidas sobre async/await.',
        author: {
          id: '2',
          name: 'Maria Santos',
          email: 'student@example.com',
          role: 'student',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        post_id: '1',
        created_at: '2024-12-20T11:00:00Z'
      }
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova Aula Disponível',
    message: 'A aula "Promises Avançadas" foi adicionada ao curso JavaScript Avançado',
    created_at: '2024-12-20T09:00:00Z',
    read: false
  },
  {
    id: '2',
    title: 'Novo Comentário',
    message: 'Maria Santos comentou no seu post sobre JavaScript',
    created_at: '2024-12-20T11:00:00Z',
    read: true
  }
];