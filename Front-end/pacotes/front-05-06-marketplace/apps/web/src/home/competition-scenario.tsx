import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Save, TrendingDown } from 'lucide-react';
import { money } from '@/data/demo';

type SavedScenario = { id: string; name: string; impact: number; historical: number; hypothetical: number; createdAt: string };

export function CompetitionScenario({ historicalRevenue }: { historicalRevenue: number }) {
  const [impact, setImpact] = useState(15);
  const [modalOpen, setModalOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState<SavedScenario[]>([]);
  const hypothetical = useMemo(() => historicalRevenue * (1 - impact / 100), [historicalRevenue, impact]);
  const difference = historicalRevenue - hypothetical;
  const hasHistoricalData = historicalRevenue > 0;

  function saveScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = scenarioName.trim();
    if (!name) { setMessage('Informe um nome para o cenário.'); return; }
    if (!hasHistoricalData) { setMessage('Não há faturamento histórico disponível para simular.'); return; }
    const item: SavedScenario = { id: `${Date.now()}`, name, impact, historical: historicalRevenue, hypothetical, createdAt: new Date().toLocaleString('pt-BR') };
    const next = [item, ...saved];
    setSaved(next);
    try { sessionStorage.setItem('trama-demo-scenarios', JSON.stringify(next)); } catch {  }
    setScenarioName('');
    setModalOpen(false);
    setMessage('Cenário guardado nesta sessão de demonstração. Ele não foi enviado ao servidor.');
  }

  return <section className="issue-section">
    <div className="issue-intro"><span className="eyebrow"><TrendingDown size={14}/> FRONT-04 · ANÁLISE COMERCIAL</span><h2>Simulador de concorrência</h2><p>Explore como diferentes níveis de pressão da concorrência podem afetar o faturamento histórico selecionado.</p></div>
    <div className="demo-notice"><b>Ambiente demonstrativo:</b> o faturamento exibido vem dos dados fictícios já existentes no protótipo. O salvamento abaixo é temporário nesta sessão; a API de persistência ainda não existe neste pacote.</div>
    <div className="panel competition-control">
      <div className="panel-title"><h3>Impacto estimado da concorrência</h3><strong className="impact-value">{impact}%</strong></div>
      <input aria-label="Percentual de impacto da concorrência" type="range" min="0" max="100" step="1" value={impact} onChange={e=>setImpact(Number(e.target.value))}/>
      <div className="range-labels"><span>0% · Sem impacto</span><span>100% · Impacto total</span></div>
      <p>Defina um percentual para estimar a redução do faturamento. O resultado é recalculado automaticamente.</p>
    </div>
    <div className="formula-card"><b>Fórmula utilizada</b><code>Faturamento Hipotético = Faturamento Histórico × (1 − Percentual/100)</code><p>O percentual é convertido em uma proporção e subtraído de 1. Essa proporção é multiplicada pelo faturamento histórico.</p></div>
    {!hasHistoricalData && <p className="issue-warning"><AlertCircle size={16}/> Não há vendas no período/filtros selecionados para calcular um faturamento histórico.</p>}
    <div className="metrics comparison-metrics">
      <article><span>Faturamento histórico</span><strong>{money(historicalRevenue)}</strong><small>Base do cálculo selecionado</small></article>
      <article><span>Faturamento hipotético</span><strong>{money(hypothetical)}</strong><small>Após impacto de {impact}%</small></article>
      <article><span>Diferença estimada</span><strong>{money(difference)}</strong><small>Redução em relação à base</small></article>
      <article><span>Variação percentual</span><strong>{hasHistoricalData ? `−${impact}%` : '—'}</strong><small>Impacto configurado</small></article>
    </div>
    <div className="panel"><div className="panel-title"><h3>Comparação visual</h3><span>Valores em R$</span></div>
      <div className="comparison-bar"><div><span>Histórico</span><b>{money(historicalRevenue)}</b></div><div className="bar-track"><i style={{width:'100%'}}/></div></div>
      <div className="comparison-bar"><div><span>Hipotético</span><b>{money(hypothetical)}</b></div><div className="bar-track"><i style={{width:`${Math.max(0,Math.min(100,historicalRevenue ? hypothetical/historicalRevenue*100 : 0))}%`}}/></div></div>
      <div className="actions"><button type="button" disabled={!hasHistoricalData} onClick={()=>{setMessage('');setModalOpen(true);}}><Save size={16}/> Salvar cenário</button></div>
    </div>
    {message && <p className="notice" role="status">{message}</p>}
    {saved.length>0 && <div className="panel"><h3>Cenários desta sessão</h3><div className="table-wrap"><table><thead><tr><th>Nome</th><th>Impacto</th><th>Faturamento hipotético</th><th>Data</th></tr></thead><tbody>{saved.map(item=><tr key={item.id}><td>{item.name}</td><td>{item.impact}%</td><td>{money(item.hypothetical)}</td><td>{item.createdAt}</td></tr>)}</tbody></table></div></div>}
    {modalOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="scenario-modal-title"><span className="eyebrow">TRAMA / CENÁRIO</span><h2 id="scenario-modal-title">Salvar cenário</h2><p>Escolha um nome para identificar esta simulação. No pacote atual, o registro ficará disponível apenas nesta sessão de demonstração.</p><form onSubmit={saveScenario}><label>Nome do cenário<input autoFocus maxLength={80} required value={scenarioName} onChange={e=>setScenarioName(e.target.value)} placeholder="Ex.: Concorrência moderada"/></label>{message&&<p className="issue-warning">{message}</p>}<div className="actions"><button type="button" className="outline-button" onClick={()=>setModalOpen(false)}>Cancelar</button><button type="submit">Guardar cenário</button></div></form></section></div>}
  </section>;
}
