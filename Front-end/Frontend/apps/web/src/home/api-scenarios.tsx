import { useEffect, useState, type FormEvent } from 'react';
import { money } from '@/data/demo';
import type { ApiData } from '@/hooks/use-api-data';
import { getApiErrorMessage } from '@/services/api';
import { createCenario, listCenarios, simularCenario } from '@/services/cenariosService';
import type { Cenario, Simulacao } from '@/types/api';

export function ApiScenarios({ data }: { data: ApiData }) {
  const [impact, setImpact] = useState(15);
  const [categoria, setCategoria] = useState('');
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null);
  const [cenarios, setCenarios] = useState<Cenario[]>([]);
  const [nome, setNome] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [busy, setBusy] = useState(false);
  const categoriaId = categoria ? Number(categoria) : undefined;

  useEffect(() => {
    listCenarios().then(setCenarios).catch((caught: unknown) => setError(getApiErrorMessage(caught)));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      simularCenario(impact, categoriaId, controller.signal)
        .then((result) => { setSimulacao(result); setError(''); })
        .catch((caught: unknown) => { if (!controller.signal.aborted) setError(getApiErrorMessage(caught)); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [impact, categoriaId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError('');
    setBusy(true);
    try {
      await createCenario({ nome: nome.trim(), categoriaId, percentualImpacto: impact });
      setCenarios(await listCenarios());
      setShowSave(false);
      setNotice('Cenário gravado no banco de dados.');
    } catch (caught) {
      setSaveError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const real = simulacao?.faturamentoReal ?? 0;
  const hypothetical = simulacao?.faturamentoHipotetico ?? 0;
  const categoryName = (id?: number) => id === undefined ? 'Todas' : data.categorias.find((c) => c.idCategoria === id)?.nome ?? '—';

  return <>
    <section className="panel">
      <span className="eyebrow">SIMULAÇÃO MATEMÁTICA · CENÁRIO HIPOTÉTICO</span>
      <h3>Como uma perda de mercado afetaria seu faturamento?</h3>
      <p>O faturamento real é a soma dos lançamentos ativos no banco de dados. Altere o percentual para visualizar uma hipótese, não uma previsão.</p>
      <label>Categoria
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          {data.categorias.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nome}</option>)}
        </select>
      </label>
      <label>Percentual de impacto: <strong>{impact}%</strong><input type="range" min="0" max="100" value={impact} onChange={(e) => setImpact(Number(e.target.value))} /></label>
      <label>Ou informe o percentual<input type="number" min="0" max="100" value={impact} onChange={(e) => setImpact(Math.max(0, Math.min(100, Number(e.target.value))))} /></label>
      <div className="demo-notice"><b>Fórmula utilizada</b><br />Faturamento Hipotético = Faturamento Histórico × (1 − Percentual/100)<br />{money(real)} × (1 − {impact}/100)</div>
      <div className="metrics">
        <article><span>Faturamento Real</span><strong>{money(real)}</strong><small>Lançamentos ativos</small></article>
        <article><span>Faturamento Hipotético</span><strong>{money(hypothetical)}</strong><small>Após impacto de {impact}%</small></article>
        <article><span>Diferença estimada</span><strong>{money(simulacao?.diferencaReais ?? 0)}</strong><small>Redução de {impact}%</small></article>
      </div>
      <div className="panel">
        <div className="panel-title"><h3>Comparação visual</h3><span>Faturamento em R$</span></div>
        <div className="bar-row"><div><b>Real</b><span>{money(real)}</span></div><div className="bar-track"><i style={{ width: real ? '100%' : '0%' }} /></div></div>
        <div className="bar-row"><div><b>Hipotético</b><span>{money(hypothetical)}</span></div><div className="bar-track"><i style={{ width: `${real ? hypothetical / real * 100 : 0}%` }} /></div></div>
      </div>
      <button disabled={!simulacao} onClick={() => { setNome(''); setSaveError(''); setNotice(''); setShowSave(true); }}>Salvar Cenário</button>
      {notice && <p role="status" className="notice">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
    </section>
    {showSave && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label="Salvar cenário">
      <h2>Salvar cenário</h2>
      <p>Nomeie esta simulação para consultá-la depois.</p>
      <form onSubmit={submit}>
        <label>Nome do cenário<input autoFocus required maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Queda de 15% nas vendas" /></label>
        {saveError && <p className="auth-error" role="alert">{saveError}</p>}
        <div className="actions">
          <button type="button" className="outline-button" onClick={() => setShowSave(false)}>Cancelar</button>
          <button disabled={busy || !nome.trim()}>Salvar</button>
        </div>
      </form>
    </section></div>}
    <section className="panel">
      <h3>Cenários salvos</h3>
      {cenarios.length ? <div className="table-wrap"><table>
        <thead><tr><th>Nome</th><th>Categoria</th><th>Impacto</th></tr></thead>
        <tbody>{cenarios.map((c) => <tr key={c.idCenario}><td>{c.nome}</td><td>{categoryName(c.categoriaId)}</td><td>{c.percentualImpacto}%</td></tr>)}</tbody>
      </table></div> : <p>Nenhum cenário salvo ainda.</p>}
    </section>
  </>;
}
