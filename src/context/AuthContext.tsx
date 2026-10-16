// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Creator, Product, Purchase } from '../types/student';

// Interface para cachedData
interface CachedData {
  creator: Creator | null;
  products: Product[];
  purchases: Purchase[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginStudent: (email: string, password: string, dominio: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  cachedData: CachedData;
  setCachedData: (data: CachedData) => void;
  checkCreatorAccess: (userId: string, creatorId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cachedData, setCachedData] = useState<CachedData>({
    creator: null,
    products: [],
    purchases: []
  });

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setUser(data.user);
      
      // Buscar o papel do usuário na tabela info_usuarios
      const { data: userProfile, error: profileError } = await supabase
        .from('info_usuarios')
        .select('papel')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return;
      }

      // Adicionar o papel ao user_metadata para fácil acesso
      if (userProfile?.papel) {
        await supabase.auth.updateUser({
          data: { papel: userProfile.papel }
        });
      }

      console.log('✅ Login bem-sucedido. Papel:', userProfile?.papel);
      
    } catch (error: any) {
      throw error;
    }
  };

  // No AuthContext.tsx - modifique a função loginStudent
const loginStudent = async (email: string, password: string, dominio: string) => {
  try {
    // Primeiro faz login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) throw authError;

    // Verifica se é membro
    const { data: userData } = await supabase
      .from('info_usuarios')
      .select('papel')
      .eq('id', authData.user.id)
      .single();

    if (userData?.papel !== 'membro') {
      await supabase.auth.signOut();
      throw new Error('Acesso permitido apenas para membros');
    }

    // Verifica compra ativa
    const { data: compra } = await supabase
      .from('info_compras')
      .select('*')
      .eq('usuario_id', authData.user.id)
      .eq('status', 'ativa')
      .single();

    if (!compra) {
      return { 
        success: false, 
        redirectUrl: `/checkout?dominio=${dominio}`,
        error: 'Nenhuma compra ativa encontrada'
      };
    }

    // ✅ CORREÇÃO: Redirecionar para a rota correta do aluno
    return { 
      success: true, 
      redirectUrl: `/aluno/${dominio}/feed` // Rota consistente
    };
  } catch (error: any) {
    throw error;
  }
};
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    // Limpar cache ao fazer logout
    setCachedData({
      creator: null,
      products: [],
      purchases: []
    });
  };

  const checkCreatorAccess = async (userId: string, creatorId: string): Promise<boolean> => {
    try {
      const { data: purchases, error } = await supabase
        .from('info_compras')
        .select('*')
        .eq('usuario_id', userId)
        .eq('status', 'ativa');

      if (error) {
        console.error('Erro ao verificar acesso:', error);
        return false;
      }

      // Verificar se alguma compra está associada a produtos deste criador
      if (purchases && purchases.length > 0) {
        const productIds = purchases.map(p => p.produto_id);
        
        const { data: products, error: productsError } = await supabase
          .from('info_produtos')
          .select('criador_id')
          .in('id', productIds);

        if (productsError) {
          console.error('Erro ao buscar produtos:', productsError);
          return false;
        }

        return products?.some(product => product.criador_id === creatorId) || false;
      }

      return false;
    } catch (error) {
      console.error('Erro em checkCreatorAccess:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    loginStudent,
    logout,
    loading,
    cachedData,
    setCachedData,
    checkCreatorAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};