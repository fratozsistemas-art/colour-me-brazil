import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Image, MessageCircle, BookOpen, ArrowLeft } from 'lucide-react';
import FamilyArtGallery from '../components/family/FamilyArtGallery';
import { createPageUrl } from '../utils';

export default function FamilyHub() {
  const [parentAccount, setParentAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentAccount();
  }, []);

  const loadParentAccount = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('FamilyHub'));
        return;
      }

      const user = await base44.auth.me();
      
      // Find parent account
      const allAccounts = await base44.entities.ParentAccount.list();
      const account = allAccounts.find(acc => 
        acc.owner_email === user.email || 
        acc.co_guardians?.some(g => g.email === user.email && g.status === 'active')
      );
      
      if (account) {
        setParentAccount(account);
      }
    } catch (error) {
      console.error('Error loading account:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!parentAccount) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Conta Familiar Não Encontrada
          </h2>
          <p className="text-gray-600 mb-4">
            Configure uma conta familiar primeiro no Portal dos Pais
          </p>
          <Button onClick={() => window.location.href = createPageUrl('ParentPortal')}>
            Ir para Portal dos Pais
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => window.location.href = createPageUrl('Dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl">
            👨‍👩‍👧‍👦
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Centro Familiar</h1>
            <p className="text-gray-600">
              Colabore, celebre e conecte-se com sua família
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-1">
          <TabsTrigger value="gallery" className="gap-2">
            <Image className="w-4 h-4" />
            Galeria de Arte da Família
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          <FamilyArtGallery parentAccount={parentAccount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}