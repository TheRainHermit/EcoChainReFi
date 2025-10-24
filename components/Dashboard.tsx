'use client';

import { useState, useEffect } from 'react';
import { supabase, type Wallet, type EcoTransaction } from '@/lib/supabase';
import { formatEcoAmount } from '@/lib/wallet-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, TrendingUp, Award, QrCode, Wallet as WalletIcon, Sparkles } from 'lucide-react';
import WalletQR from './WalletQR';
import MaterialDeposit from './MaterialDeposit';
import RewardsMarketplace from './RewardsMarketplace';
import TransactionHistory from './TransactionHistory';

interface DashboardProps {
  wallet: Wallet;
}

export default function Dashboard({ wallet }: DashboardProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<EcoTransaction[]>([]);
  const [totalImpact, setTotalImpact] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
    const channel = supabase
      .channel('eco_transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'eco_transactions',
          filter: `wallet_id=eq.${wallet.id}`,
        },
        () => {
          loadWalletData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wallet.id]);

  const loadWalletData = async () => {
    try {
      const { data: txData, error: txError } = await supabase
        .from('eco_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      setTransactions(txData || []);

      const totalEco = txData?.reduce((sum, tx) => sum + parseFloat(tx.eco_amount.toString()), 0) || 0;
      setBalance(totalEco);
      setTotalImpact(txData?.length || 0);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    loadWalletData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLThWMTZoOHptLTE2IDB2OEg4VjE2aDEyek0zNiAzNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-2xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                  <Leaf className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">EcoChain</h1>
                  <p className="text-emerald-100 text-sm">Tu impacto regenerativo</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                <WalletIcon className="w-4 h-4" />
                <span className="text-sm font-mono">{wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-600">Balance Total</CardDescription>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {formatEcoAmount(balance)} $EC0
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">En crecimiento</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-600">Depósitos Totales</CardDescription>
                  <CardTitle className="text-4xl font-bold text-green-600">
                    {totalImpact}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-green-600">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm font-medium">Materiales reciclados</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-600">Impacto Ambiental</CardDescription>
                  <CardTitle className="text-4xl font-bold text-teal-600">
                    {(totalImpact * 0.5).toFixed(1)} kg
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-teal-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">CO₂ evitado</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="deposit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-white shadow-lg rounded-xl p-1">
              <TabsTrigger value="deposit" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg">
                <Leaf className="w-4 h-4 mr-2" />
                Depositar
              </TabsTrigger>
              <TabsTrigger value="qr" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg">
                <QrCode className="w-4 h-4 mr-2" />
                Mi QR
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-lg">
                <Award className="w-4 h-4 mr-2" />
                Recompensas
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit">
              <MaterialDeposit wallet={wallet} onTransactionAdded={handleTransactionAdded} />
            </TabsContent>

            <TabsContent value="qr">
              <WalletQR wallet={wallet} />
            </TabsContent>

            <TabsContent value="rewards">
              <RewardsMarketplace wallet={wallet} balance={balance} onRedemption={loadWalletData} />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory transactions={transactions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
