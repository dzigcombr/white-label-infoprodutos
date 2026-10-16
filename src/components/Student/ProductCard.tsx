import React from 'react';
import { Package, Clock, ChevronRight } from 'lucide-react';
import { Product } from '../../types/student';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-lime-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {product.nome}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Criado em {new Date(product.criado_em).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          
          {product.descricao && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {product.descricao}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-lime-600">
              Ver conteúdo
            </span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}