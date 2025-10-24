'use client';

import { useState, useEffect } from 'react';
import { supabase, type Wallet } from '@/lib/supabase';
import { generateWalletAddress, generateQRCode } from '@/lib/wallet-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet as WalletIcon, QrCode, Leaf, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectProps {
  onWalletCreated: (wallet: Wallet) => void;
}

export default function WalletConnect({ onWalletCreated }: WalletConnectProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [ensName, setEnsName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      console.log('JWT:', session.data.session?.access_token);
      console.log('User:', session.data.session?.user);
    })();
  }, []);

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        if (!authData.user) throw new Error('No se pudo crear usuario');
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Usuario no autenticado');

      const address = await generateWalletAddress();
      const qrData = ensName ? ensName : address;
      const qrCode = await generateQRCode(qrData);

      const { data: wallet, error } = await supabase
        .from('wallets')
        .insert({
          user_id: currentUser.id,
          wallet_address: address,
          ens_name: ensName || null,
          qr_code: qrCode,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '¡Wallet creada exitosamente!',
        description: 'Tu wallet EcoChain está lista para recibir $EC0',
      });

      onWalletCreated(wallet);
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la wallet. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una dirección de wallet',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select()
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (error) throw error;

      if (!wallet) {
        toast({
          title: 'Wallet no encontrada',
          description: 'No existe una wallet con esta dirección',
          variant: 'destructive',
        });
        return;
      }

      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;

      toast({
        title: '¡Conectado exitosamente!',
        description: 'Tu wallet ha sido conectada',
      });

      onWalletCreated(wallet);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Error',
        description: 'No se pudo conectar la wallet. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLThWMTZoOHptLTE2IDB2OEg4VjE2aDEyek0zNiAzNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg">
              <Leaf className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            EcoChain
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transforma residuos en valor. Cada acción cuenta para regenerar nuestro planeta.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Powered by Base Network</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 border-emerald-200 shadow-xl bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300">
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-2">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Crear Nueva Wallet</CardTitle>
              <CardDescription className="text-base">
                Comienza tu viaje hacia un futuro sostenible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ensName" className="text-gray-700">
                  Nombre ENS (opcional)
                </Label>
                <Input
                  id="ensName"
                  placeholder="miguel.eth"
                  value={ensName}
                  onChange={(e) => setEnsName(e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-sm text-gray-500">
                  Tu nombre único en la red Ethereum
                </p>
              </div>
              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isCreating ? 'Creando...' : 'Crear Wallet'}
              </Button>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  <strong>Tu impacto empieza aquí:</strong> Al crear tu wallet, te unes a una comunidad global comprometida con la regeneración ambiental.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-200 shadow-xl bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300">
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-2">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Conectar Wallet Existente</CardTitle>
              <CardDescription className="text-base">
                Continúa tu impacto ambiental
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="walletAddress" className="text-gray-700">
                  Dirección de Wallet
                </Label>
                <Input
                  id="walletAddress"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500 font-mono"
                />
                <p className="text-sm text-gray-500">
                  Ingresa tu dirección de wallet de Base
                </p>
              </div>
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
              </Button>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800">
                  <strong>Bienvenido de vuelta:</strong> Tus EcoCoins y logros te esperan para seguir generando impacto positivo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-emerald-100">
            <div className="text-3xl font-bold text-emerald-600 mb-2">$EC0</div>
            <div className="text-sm text-gray-600">Token regenerativo en Base</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-emerald-100">
            <div className="text-3xl font-bold text-green-600 mb-2">ReFi</div>
            <div className="text-sm text-gray-600">Finanzas regenerativas</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-emerald-100">
            <div className="text-3xl font-bold text-teal-600 mb-2">Web3</div>
            <div className="text-sm text-gray-600">Tecnología descentralizada</div>
          </div>
        </div>
      </div>
    </div>
  );
}
