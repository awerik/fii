import { useState, useEffect, useMemo } from 'react';
import { minhaCarteira, FiiItem } from '@/data/carteira';
import { fetchFiiData, FiiData } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Wallet, 
  Calendar, 
  ArrowUpRight, 
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [data, setData] = useState<Record<string, FiiData>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    const results: Record<string, FiiData> = {};
    for (const item of minhaCarteira) {
      const fiiData = await fetchFiiData(item.ticker);
      results[item.ticker] = fiiData;
    }
    setData(results);
    setLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    let totalInvestido = 0;
    let valorAtualTotal = 0;
    let dividendosMensaisEstimados = 0;

    minhaCarteira.forEach(item => {
      const fiiInfo = data[item.ticker];
      totalInvestido += item.quantidade * item.precoMedio;
      if (fiiInfo) {
        valorAtualTotal += item.quantidade * fiiInfo.preco;
        dividendosMensaisEstimados += item.quantidade * fiiInfo.ultimoDividendoValor;
      }
    });

    const lucroPrejuizo = valorAtualTotal - totalInvestido;
    const yieldMensalMedio = valorAtualTotal > 0 ? (dividendosMensaisEstimados / valorAtualTotal) * 100 : 0;

    return {
      totalInvestido,
      valorAtualTotal,
      lucroPrejuizo,
      dividendosMensaisEstimados,
      yieldMensalMedio
    };
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Carteira FII</h1>
              <p className="text-xs text-muted-foreground">Monitor de Investimentos</p>
            </div>
          </div>
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 hover:bg-secondary rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-primary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="container mt-8 space-y-8">
        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bento-card h-full flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full" />
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Patrimônio Total <Info className="w-3 h-3" />
                </p>
                <h2 className="text-3xl font-bold mt-2">
                  {loading ? <Skeleton className="h-9 w-32" /> : formatCurrency(stats.valorAtualTotal)}
                </h2>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-sm font-semibold flex items-center ${stats.lucroPrejuizo >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {stats.lucroPrejuizo >= 0 ? <ArrowUpRight className="w-4 h-4" /> : null}
                  {formatCurrency(stats.lucroPrejuizo)}
                </span>
                <span className="text-xs text-muted-foreground">desde o início</span>
              </div>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bento-card h-full border-accent/20 bg-accent/5">
              <p className="text-sm font-medium text-accent flex items-center gap-2">
                Dividendos Estimados <TrendingUp className="w-4 h-4" />
              </p>
              <h2 className="text-3xl font-bold mt-2 text-accent">
                {loading ? <Skeleton className="h-9 w-32" /> : formatCurrency(stats.dividendosMensaisEstimados)}
              </h2>
              <p className="text-xs text-muted-foreground mt-4">
                Projeção baseada no último rendimento
              </p>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bento-card h-full">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Yield Mensal Médio <Calendar className="w-4 h-4" />
              </p>
              <h2 className="text-3xl font-bold mt-2">
                {loading ? <Skeleton className="h-9 w-24" /> : `${stats.yieldMensalMedio.toFixed(2)}%`}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${Math.min(stats.yieldMensalMedio * 10, 100)}%` }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tabela de FIIs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bento-card overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg">Minha Carteira</h3>
              <span className="text-xs text-muted-foreground">
                Atualizado em: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">FII</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold text-right">Qtd</th>
                    <th className="px-6 py-4 font-semibold text-right">Preço Atual</th>
                    <th className="px-6 py-4 font-semibold text-right">Últ. Div (R$)</th>
                    <th className="px-6 py-4 font-semibold text-right">Últ. Div (%)</th>
                    <th className="px-6 py-4 font-semibold text-right">Data Com</th>
                    <th className="px-6 py-4 font-semibold text-right">Ganho Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {minhaCarteira.map((item, index) => {
                      const fiiInfo = data[item.ticker];
                      const ganhoEstimado = fiiInfo ? item.quantidade * fiiInfo.ultimoDividendoValor : 0;

                      return (
                        <motion.tr 
                          key={item.ticker}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-secondary/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-primary group-hover:scale-105 transition-transform origin-left">
                                {item.ticker}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {fiiInfo?.nome || <Skeleton className="h-3 w-20" />}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 bg-secondary rounded-md font-medium">
                              {fiiInfo?.tipoFundo || <Skeleton className="h-3 w-12" />}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">{item.quantidade}</td>
                          <td className="px-6 py-4 text-right font-semibold">
                            {fiiInfo ? formatCurrency(fiiInfo.preco) : <Skeleton className="h-4 w-16 ml-auto" />}
                          </td>
                          <td className="px-6 py-4 text-right text-accent font-medium">
                            {fiiInfo ? formatCurrency(fiiInfo.ultimoDividendoValor) : <Skeleton className="h-4 w-12 ml-auto" />}
                          </td>
                          <td className="px-6 py-4 text-right text-accent font-medium">
                            {fiiInfo ? `${fiiInfo.ultimoDividendoPercentual.toFixed(2)}%` : <Skeleton className="h-4 w-12 ml-auto" />}
                          </td>
                          <td className="px-6 py-4 text-right text-muted-foreground text-sm">
                            {fiiInfo?.dataCom || <Skeleton className="h-4 w-16 ml-auto" />}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-accent">
                              {fiiInfo ? formatCurrency(ganhoEstimado) : <Skeleton className="h-4 w-16 ml-auto" />}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Mobile View (Cards instead of table) */}
        <div className="md:hidden space-y-4">
          <h3 className="font-bold text-lg px-2">Detalhes por Ativo</h3>
          {minhaCarteira.map((item) => {
            const fiiInfo = data[item.ticker];
            const ganhoEstimado = fiiInfo ? item.quantidade * fiiInfo.ultimoDividendoValor : 0;
            
            return (
              <Card key={item.ticker} className="p-4 bento-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-lg font-bold text-primary">{item.ticker}</span>
                    <p className="text-xs text-muted-foreground">{fiiInfo?.nome}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-md font-medium">
                    {fiiInfo?.tipoFundo}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase">Quantidade</p>
                    <p className="font-semibold">{item.quantidade}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase">Preço Atual</p>
                    <p className="font-semibold">{fiiInfo ? formatCurrency(fiiInfo.preco) : '...'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase">Últ. Dividendo</p>
                    <p className="font-semibold text-accent">{fiiInfo ? formatCurrency(fiiInfo.ultimoDividendoValor) : '...'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase">Ganho Estimado</p>
                    <p className="font-bold text-accent">{fiiInfo ? formatCurrency(ganhoEstimado) : '...'}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mt-12 text-center text-muted-foreground text-xs">
        <p>© 2025 Carteira FII - Dados fornecidos por dadosdemercado.com.br</p>
        <p className="mt-1">Desenvolvido para uso pessoal no iPhone e Desktop</p>
      </footer>
    </div>
  );
}
