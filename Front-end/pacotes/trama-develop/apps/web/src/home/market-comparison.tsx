import { useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Info, SlidersHorizontal } from 'lucide-react';
import { money, quantity, total, type Sale } from '@/data/demo';

const illustrativeReferences: Record<string, { name: string; averagePrice: number; monthlyPieces: number; categories: string }> = {
  'Santa Cruz do Capibaribe': { name: 'Referência ilustrativa — Santa Cruz', averagePrice: 53, monthlyPieces: 720, categories: 'Jeans e moda feminina' },
  Toritama: { name: 'Referência ilustrativa — Toritama', averagePrice: 61, monthlyPieces: 680, categories: 'Jeans e peças em denim' },
  Caruaru: { name: 'Referência ilustrativa — Caruaru', averagePrice: 48, monthlyPieces: 790, categories: 'Moda feminina e básica' },
};

export function MarketComparison({ sales, city }: { sales: Sale[]; city: string }) {
  const availablePeriods = [...new Set(sales.map((sale) => sale.date.slice(0, 7)))].sort().reverse();
  const [selectedPeriod, setSelectedPeriod] = useState(availablePeriods[0] || 'Todos');
  const [selectedCity, setSelectedCity] = useState(city in illustrativeReferences ? city : 'Santa Cruz do Capibaribe');
  const [impact, setImpact] = useState(12);
  const reference = illustrativeReferences[selectedCity];
  const periodSales = sales.filter((sale) => selectedPeriod === 'Todos' || sale.date.startsWith(selectedPeriod));
  const ownRevenue = total(periodSales);
  const ownPieces = quantity(periodSales);
  const averagePrice = ownPieces ? ownRevenue / ownPieces : 0;
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    periodSales.forEach((sale) => map.set(sale.category, (map.get(sale.category) || 0) + sale.quantity * sale.price));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [periodSales]);
  const hypotheticalRevenue = ownRevenue * (1 - impact / 100);
  const priceDifference = averagePrice - reference.averagePrice;
  return <div className="market-comparison-layout">
    <section className="panel market-warning"><AlertCircle size={19} /><div><b>Comparação demonstrativa, não de concorrentes reais.</b><p>A TRAMA não acessa vendas privadas de outras empresas. Os números de referência abaixo são fictícios, criados apenas para demonstrar como uma comparação regional poderia funcionar. Não use esses valores como pesquisa de mercado.</p></div></section>
    <section className="panel market-filter"><div><span className="eyebrow">REFERÊNCIA REGIONAL</span><h3>Escolha o período e a cidade</h3><p>Compare um mês das suas vendas com um parâmetro ilustrativo para a demonstração.</p></div><div className="market-filter-fields"><label>Mês analisado<select value={selectedPeriod} onChange={(event) => setSelectedPeriod(event.target.value)}><option value="Todos">Todo o histórico</option>{availablePeriods.map((month) => <option key={month} value={month}>{month.split('-').reverse().join('/')}</option>)}</select></label><label>Cidade de referência<select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>{Object.keys(illustrativeReferences).map((item) => <option key={item}>{item}</option>)}</select></label></div></section>
    <div className="market-metrics">
      <article><span>Sua média por peça</span><strong>{money(averagePrice)}</strong><small>{ownPieces} peças registradas</small></article>
      <article><span>Referência ilustrativa por peça</span><strong>{money(reference.averagePrice)}</strong><small>{reference.categories}</small></article>
      <article><span>Diferença da sua média</span><strong className={priceDifference >= 0 ? 'market-positive' : 'market-negative'}>{priceDifference >= 0 ? '+' : '−'}{money(Math.abs(priceDifference))}</strong><small>{averagePrice ? priceDifference >= 0 ? 'Acima da referência fictícia' : 'Abaixo da referência fictícia' : 'Cadastre vendas para comparar'}</small></article>
    </div>
    <section className="panel market-compare-panel"><div className="panel-title"><div><span className="eyebrow">COMPARAÇÃO DE VOLUME</span><h3>Seu volume e o exemplo de referência</h3></div><BarChart3 size={18} /></div>
      <div className="market-bars"><div><div><b>Sua confecção</b><strong>{ownPieces.toLocaleString('pt-BR')} peças</strong></div><i><span style={{ width: `${ownPieces / Math.max(ownPieces, reference.monthlyPieces, 1) * 100}%` }} /></i></div><div><div><b>{reference.name}</b><strong>{reference.monthlyPieces.toLocaleString('pt-BR')} peças (fictício)</strong></div><i className="reference"><span style={{ width: `${reference.monthlyPieces / Math.max(ownPieces, reference.monthlyPieces, 1) * 100}%` }} /></i></div></div>
      <p className="market-explanation">A comparação é mensal quando um mês específico é selecionado. Se “Todo o histórico” estiver ativo, o volume acumulado será comparado com uma referência mensal e não deve ser interpretado como equivalência. Nesta demonstração, os dados de referência são inventados e não representam a média real da cidade.</p>
    </section>
    <section className="panel market-simulator"><div className="panel-title"><div><span className="eyebrow">SIMULAÇÃO DE IMPACTO</span><h3>Como uma queda hipotética afetaria seu faturamento?</h3></div><SlidersHorizontal size={18} /></div>
      <label className="market-slider-label">Percentual de impacto hipotético <b>{impact}%</b><input type="range" min="0" max="50" step="1" value={impact} onChange={(event) => setImpact(Number(event.target.value))} /></label>
      <div className="market-simulation-results"><article><span>Faturamento cadastrado</span><strong>{money(ownRevenue)}</strong></article><article><span>Faturamento hipotético</span><strong>{money(hypotheticalRevenue)}</strong></article><article><span>Diferença estimada</span><strong>{money(ownRevenue - hypotheticalRevenue)}</strong></article></div>
      <p className="market-method"><Info size={14} /> Cálculo simples: faturamento cadastrado × (1 − percentual de impacto ÷ 100). É uma hipótese matemática, não uma previsão de vendas nem evidência de ação de concorrentes.</p>
    </section>
    <section className="panel"><div className="panel-title"><div><span className="eyebrow">COMPOSIÇÃO DAS SUAS VENDAS</span><h3>Categorias com maior faturamento</h3></div></div>{categories.length ? categories.slice(0, 5).map(([name, amount]) => <div className="report-bar" key={name}><div><b>{name}</b><span>{money(amount)}</span></div><i><span style={{ width: `${amount / Math.max(...categories.map((item) => item[1]), 1) * 100}%` }} /></i></div>) : <p>Cadastre vendas para comparar a composição do seu negócio.</p>}</section>
  </div>;
}
