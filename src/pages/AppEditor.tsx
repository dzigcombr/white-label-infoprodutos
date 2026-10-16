import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Check, 
  Upload, 
  X, 
  Smartphone, 
  Palette, 
  Headphones, 
  Eye, 
  Mail, 
  Phone, 
  Home, 
  Users, 
  FileText, 
  User,
  Package,
  Save,
  Loader2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ToggleSwitch from '../components/AppEditor/ToggleSwitch';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Banner {
  image: string | null;
  url: string;
}

interface SupportConfig {
  email: string;
  whatsapp: string;
  supportIcon: string | null;
}

interface AppSettings {
  appName: string;
  showProductNames: boolean;
  appType: 'email-password' | 'email-only';
  language: string;
  appLogo: string | null;
  banners: Banner[];
  support: SupportConfig;
  primaryColor: string;
  dominioPersonalizado: string;
}

// Componente para a Tela de Login Preview
const LoginScreenPreview: React.FC<{
  appName: string;
  appLogo: string | null;
  appType: string;
  primaryColor: string;
}> = ({ appName, appLogo, appType, primaryColor }) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white p-6 justify-between">
      {/* Header - Centralizado verticalmente */}
      <div className="flex flex-col items-center justify-center mt-12">
        {appLogo ? (
          <img src={appLogo} alt="App Logo" className="w-20 h-20 mb-6 rounded-xl object-cover" />
        ) : (
          <div className="w-20 h-20 mb-6 bg-gray-200 rounded-xl flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{appName || "Meu App"}</h1>
        <p className="text-gray-600 mb-8">Acesse sua conta</p>
      </div>

      {/* Login Form - Melhor espaçamento */}
      <div className="space-y-4 mb-12">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <input
            type="email"
            placeholder="seu@email.com"
            className="w-full border-none outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        
        {appType === 'email-password' && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <input
              type="password"
              placeholder="sua senha"
              className="w-full border-none outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        )}

        <button 
          className="w-full text-white py-4 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          {appType === 'email-password' ? 'Entrar' : 'Enviar link'}
        </button>
      </div>

      {/* Footer - Posicionado corretamente */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500">
          {appType === 'email-password' 
            ? 'Esqueceu sua senha?' 
            : 'Enviaremos um link para seu email'
          }
        </p>
      </div>
    </div>
  );
};

// Componente para a Tela Inicial Preview
const HomeScreenPreview: React.FC<{
  appName: string;
  showProductNames: boolean;
  banners: Banner[];
  supportConfig: SupportConfig;
  primaryColor: string;
}> = ({ appName, showProductNames, banners, supportConfig, primaryColor }) => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900" style={{ color: primaryColor }}>
            {appName || "Nome do App"}
          </h1>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome Message */}
        <div 
          className="rounded-xl p-4 mb-4 shadow-sm"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <h2 className="font-semibold text-gray-900 mb-2">Bem-vindo!</h2>
          <p className="text-gray-600 text-sm">Conteúdo personalizado do seu app</p>
        </div>

        {/* Banners */}
        <div className="space-y-3 mb-6">
          {banners.filter(b => b.image).slice(0, 2).map((banner, index) => (
            <div key={index} className="bg-gray-200 rounded-xl h-32 flex items-center justify-center overflow-hidden">
              {banner.image ? (
                <img src={banner.image} alt={`Banner ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-gray-500">Banner {index + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Products */}
        {showProductNames && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Produtos</h3>
            <div className="space-y-2">
              {['Curso Básico', 'Curso Avançado', 'Mentoria'].map((product, index) => (
                <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Package className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-gray-700">{product}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Support Button */}
      {supportConfig.supportIcon && (
        <div className="absolute bottom-20 right-4">
          <button 
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            {supportConfig.supportIcon ? (
              <img src={supportConfig.supportIcon} alt="Suporte" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <Headphones className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 py-3">
          <button className="flex flex-col items-center space-y-1">
            <Home className="h-5 w-5" style={{ color: primaryColor }} />
            <span className="text-xs" style={{ color: primaryColor }}>Início</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Comunidade</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <FileText className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Anotações</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <User className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para o simulador de celular - AJUSTADO COM BORDAS CINZA NEUTRA
const PhoneSimulator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative mx-auto border-4 border-gray-200 rounded-[32px] bg-gray-100 p-2 shadow-lg">
      {/* Botões laterais */}
      <div className="absolute -left-1 top-20 h-12 w-1 bg-gray-300 rounded-l-sm"></div>
      <div className="absolute -left-1 top-36 h-12 w-1 bg-gray-300 rounded-l-sm"></div>
      <div className="absolute -right-1 top-28 h-16 w-1 bg-gray-300 rounded-r-sm"></div>
      
      {/* Tela do celular */}
      <div className="relative w-60 h-[520px] bg-white rounded-[28px] overflow-hidden shadow-inner border-2 border-gray-300">
        {children}
      </div>
    </div>
  );
};

const steps = [
  { id: 'general', name: 'Dados Gerais', description: 'Informações básicas do app', icon: Smartphone },
  { id: 'support', name: 'Suporte', description: 'Canais de atendimento', icon: Headphones },
  { id: 'style', name: 'Estilo Visual', description: 'Personalize cores e fontes', icon: Palette },
  { id: 'preview', name: 'Visualização', description: 'Prévia do aplicativo', icon: Eye },
];

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
];

// ✅ COMPONENTE PRINCIPAL AppEditor COM CAMPOS VAZIOS
function AppEditor() {
  const { appId } = useParams<{ appId?: string }>();
  const [currentStep, setCurrentStep] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSupportIcon, setUploadingSupportIcon] = useState(false);
  const [uploadingBanners, setUploadingBanners] = useState<boolean[]>([false, false, false, false]);
  const { user } = useAuth();
  
  // ✅ CAMPOS INICIANDO VAZIOS (CORRIGIDO)
  const [settings, setSettings] = useState<AppSettings>({
    appName: '',
    showProductNames: true,
    appType: 'email-password',
    language: 'pt-BR',
    appLogo: null,
    banners: [
      { image: null, url: '' },
      { image: null, url: '' },
      { image: null, url: '' },
      { image: null, url: '' },
    ],
    support: {
      email: '',
      whatsapp: '',
      supportIcon: null,
    },
    primaryColor: '#10b981', // Cor padrão
    dominioPersonalizado: '',
  });

  const loadExistingSettings = useCallback(async () => {
    if (!user || !appId) {
      // For new app creation, don't load any data - keep fields blank
      setLoading(false);
      return;
    }

    try {
      let data, error;
      
      if (appId) {
        // Load specific app by ID
        const result = await supabase
          .from('info_apps_personalizados')
          .select('*')
          .eq('id', appId)
          .eq('dono_id', user.id)
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Load most recent app for this user (for editing) or create new
        const result = await supabase
          .from('info_apps_personalizados')
          .select('*')
          .eq('dono_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        data = result.data;
        error = result.error;
      }

      // Only load data when editing an existing app (appId exists)
      if (data) {
        const branding = data.branding || {};
        setSettings(prev => ({
          ...prev,
          appName: data.nome || '',
          showProductNames: branding.showProductNames ?? true,
          appType: branding.appType || 'email-password',
          language: branding.language || 'pt-BR',
          appLogo: branding.logo || null,
          banners: [
            { image: branding.banner1 || null, url: '' },
            { image: branding.banner2 || null, url: '' },
            { image: branding.banner3 || null, url: '' },
            { image: branding.banner4 || null, url: '' },
          ],
          primaryColor: branding.cor_primaria || '#10b981',
          dominioPersonalizado: data.dominio_personalizado || '',
          support: {
            email: data.email_suporte || '',
            whatsapp: data.whatsapp_suporte || '',
            supportIcon: branding.supportIcon || null,
          },
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user, appId]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Always call loadExistingSettings - it will handle new vs edit logic
    loadExistingSettings();
  }, [user, loadExistingSettings]);

  const uploadImageToSupabase = async (file: File, folder: string = 'logos'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${folder}/${uuidv4()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('infoproduto')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('infoproduto')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const brandingData = {
        logo: settings.appLogo,
        banner1: settings.banners[0]?.image || null,
        banner2: settings.banners[1]?.image || null,
        banner3: settings.banners[2]?.image || null,
        banner4: settings.banners[3]?.image || null,
        cor_primaria: settings.primaryColor,
        showProductNames: settings.showProductNames,
        appType: settings.appType,
        language: settings.language,
        supportIcon: settings.support.supportIcon,
      };

      const appData = {
        nome: settings.appName,
        dominio_personalizado: settings.dominioPersonalizado,
        dono_id: user.id,
        branding: brandingData,
        email_suporte: settings.support.email,
        whatsapp_suporte: settings.support.whatsapp,
      };

      if (appId) {
        // Update existing app
        const result = await supabase
          .from('info_apps_personalizados')
          .update(appData)
          .eq('id', appId)
          .eq('dono_id', user.id)
          .select();

        if (result.error) throw result.error;
      } else {
        // Create new app
        const result = await supabase
          .from('info_apps_personalizados')
          .insert([appData])
          .select();

        if (result.error) throw result.error;
      }

      setSaveMessage('Configurações salvas com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Erro ao salvar configurações. Tente novamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const publicUrl = await uploadImageToSupabase(file, 'logos');
      if (publicUrl) {
        setSettings(prev => ({ ...prev, appLogo: publicUrl }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSupportIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingSupportIcon(true);
    try {
      const publicUrl = await uploadImageToSupabase(file, 'support-icons');
      if (publicUrl) {
        setSettings(prev => ({ 
          ...prev, 
          support: { ...prev.support, supportIcon: publicUrl } 
        }));
      }
    } catch (error) {
      console.error('Error uploading support icon:', error);
    } finally {
      setUploadingSupportIcon(false);
    }
  };

  const handleBannerUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBanners(prev => prev.map((loading, i) => i === index ? true : loading));
    try {
      const publicUrl = await uploadImageToSupabase(file, 'banners');
      if (publicUrl) {
        setSettings(prev => ({
          ...prev,
          banners: prev.banners.map((banner, i) =>
            i === index ? { ...banner, image: publicUrl } : banner
          ),
        }));
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
    } finally {
      setUploadingBanners(prev => prev.map((loading, i) => i === index ? false : loading));
    }
  };

  const handleBannerUrlChange = (index: number, url: string) => {
    setSettings(prev => ({
      ...prev,
      banners: prev.banners.map((banner, i) =>
        i === index ? { ...banner, url } : banner
      ),
    }));
  };

  const removeBannerImage = (index: number) => {
    setSettings(prev => ({
      ...prev,
      banners: prev.banners.map((banner, i) =>
        i === index ? { ...banner, image: null } : banner
      ),
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Dados Gerais</h3>
        
        {/* App Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do App
          </label>
          <input
            type="text"
            value={settings.appName}
            onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
            placeholder="Ex: Minha Escola Online"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Domínio Personalizado */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domínio Personalizado
          </label>
          <input
            type="text"
            value={settings.dominioPersonalizado}
            onChange={(e) => setSettings(prev => ({ ...prev, dominioPersonalizado: e.target.value }))}
            placeholder="minhacomunidade"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
          />
          <p className="text-xs text-gray-500 mt-2">
            Apenas letras, números e hífens. Ex: minhacomunidade
          </p>
        </div>

        {/* Show Product Names */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exibição de Produtos
          </label>
          <ToggleSwitch
            checked={settings.showProductNames}
            onChange={(checked) => setSettings(prev => ({ ...prev, showProductNames: checked }))}
            label="Exibir nome dos produtos na tela inicial"
          />
        </div>

        {/* App Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Autenticação
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="appType"
                value="email-password"
                checked={settings.appType === 'email-password'}
                onChange={(e) => setSettings(prev => ({ ...prev, appType: e.target.value as 'email-password' }))}
                className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">Login com e-mail e senha</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="appType"
                value="email-only"
                checked={settings.appType === 'email-only'}
                onChange={(e) => setSettings(prev => ({ ...prev, appType: e.target.value as 'email-only' }))}
                className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">Somente e-mail (link mágico)</span>
            </label>
          </div>
        </div>

        {/* Language */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Idioma
          </label>
          <select
            value={settings.language}
            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* App Logo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo do App
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
              {uploadingLogo ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : settings.appLogo ? (
                <img
                  src={settings.appLogo}
                  alt="Logo preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingLogo ? 'Enviando...' : 'Escolher arquivo'}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Recomendado: 512x512px, formato PNG ou JPG
              </p>
            </div>
          </div>
        </div>

        {/* Banners */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banners Promocionais
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Adicione até 4 banners que serão exibidos na tela inicial do app
          </p>
          <div className="space-y-4">
            {settings.banners.map((banner, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Banner {index + 1}</h4>
                  {banner.image && (
                    <button
                      onClick={() => removeBannerImage(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Imagem
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        {uploadingBanners[index] ? (
                          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                        ) : banner.image ? (
                          <img
                            src={banner.image}
                            alt={`Banner ${index + 1}`}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                        ) : (
                          <Upload className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBannerUpload(index, e)}
                          className="hidden"
                          id={`banner-upload-${index}`}
                          disabled={uploadingBanners[index]}
                        />
                        <label
                          htmlFor={`banner-upload-${index}`}
                          className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${uploadingBanners[index] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          {uploadingBanners[index] ? 'Enviando...' : 'Escolher'}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      URL de Destino
                    </label>
                    <input
                      type="url"
                      value={banner.url}
                      onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                      placeholder="https://exemplo.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStyleAndSupportSettings = () => (
    <div className="space-y-8">
      {/* Estilo Visual */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Estilo Visual</h3>
        <p className="text-gray-600 mb-6">Personalize as cores do seu aplicativo</p>

        {/* Primary Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor Primária
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-16 h-16 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#10b981"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Digite o código hexadecimal ou clique no seletor de cor
              </p>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Prévia das Cores</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg mb-2"
                style={{ backgroundColor: settings.primaryColor }}
              ></div>
              <span className="text-xs text-gray-600">Primária</span>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg mb-2"
                style={{ backgroundColor: `${settings.primaryColor}20` }}
              ></div>
              <span className="text-xs text-gray-600">Clara (20%)</span>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg mb-2"
                style={{ backgroundColor: `${settings.primaryColor}80` }}
              ></div>
              <span className="text-xs text-gray-600">Escura (80%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configurações de Suporte */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Configurações de Suporte</h3>
        <p className="text-gray-600 mb-6">Configure os canais de suporte para seus usuários</p>

        {/* Support Icon */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ícone de Suporte
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
              {uploadingSupportIcon ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : settings.support.supportIcon ? (
                <img
                  src={settings.support.supportIcon}
                  alt="Support icon preview"
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <Headphones className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleSupportIconUpload}
                className="hidden"
                id="support-icon-upload"
                disabled={uploadingSupportIcon}
              />
              <label
                htmlFor="support-icon-upload"
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${uploadingSupportIcon ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingSupportIcon ? 'Enviando...' : 'Escolher ícone'}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Ícone que aparecerá no botão flutuante de suporte
              </p>
            </div>
          </div>
        </div>

        {/* Support Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail de Suporte
          </label>
          <input
            type="email"
            value={settings.support.email}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              support: { ...prev.support, email: e.target.value } 
            }))}
            placeholder="suporte@empresa.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Support WhatsApp */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp de Suporte
          </label>
          <input
            type="tel"
            value={settings.support.whatsapp}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              support: { ...prev.support, whatsapp: e.target.value } 
            }))}
            placeholder="+55 (11) 99999-9999"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
          />
          <p className="text-xs text-gray-500 mt-2">
            Inclua o código do país (ex: +55 para Brasil)
          </p>
        </div>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
          <span className="text-gray-600">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header with Steps */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Personalize seu App</h1>
              <p className="text-gray-600 mt-2">Configure seu aplicativo em 4 etapas simples</p>
            </div>
            <div className="flex items-center space-x-4">
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </>
                )}
              </button>
            </div>
         
          </div>
        </div>
        {/* Steps Navigation */}
        <div className="grid grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`p-4 rounded-xl transition-all duration-200 text-left ${
                currentStep === step.id
                  ? 'bg-lime-50 border border-lime-200 text-lime-700'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step.id
                    ? 'bg-lime-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{step.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
                {currentStep === step.id && (
                  <div className="w-6 h-6 bg-lime-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-2">
          {currentStep === 'general' && renderGeneralSettings()}
          {currentStep === 'style-support' && renderStyleAndSupportSettings()}
          {currentStep === 'preview' && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visualização</h3>
              <p className="text-gray-600">Veja uma prévia completa do seu aplicativo</p>
            </div>
          )}
        </div>

        {/* Previews Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tela de Login</h3>
            <PhoneSimulator>
              <LoginScreenPreview
                appName={settings.appName}
                appLogo={settings.appLogo}
                appType={settings.appType}
                primaryColor={settings.primaryColor}
              />
            </PhoneSimulator>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tela Inicial</h3>
            <PhoneSimulator>
              <HomeScreenPreview
                appName={settings.appName}
                showProductNames={settings.showProductNames}
                banners={settings.banners}
                supportConfig={settings.support}
                primaryColor={settings.primaryColor}
              />
            </PhoneSimulator>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ EXPORTAÇÃO PADRÃO CORRETA
export default AppEditor;