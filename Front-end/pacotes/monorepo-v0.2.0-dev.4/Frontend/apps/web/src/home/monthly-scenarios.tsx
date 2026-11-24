import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, getApiErrorMessage } from '@/services/api';
import { Pencil, Trash2 } from 'lucide-react';
import {
  createScenario,
  deleteScenario,
  updateScenario,
  listScenarios,
  simulateScenario,
  type Scenario,
  type ScenarioCategory,
  type ScenarioSimulation,
} from '@/services/cenariosService';
import { money } from '@/data/demo';

type Props = { nomeConfeccao: string };

export function MonthlyScenarios({ nomeConfeccao }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [categories, setCategories] = useState<ScenarioCategory[]>([]);
  const [name, setName] = useState('Queda hipotética de faturamento');
  const [description, setDescription] = useState('Simulação para avaliar um possível impacto no faturamento da confecção.');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [impact, setImpact] = useState('10');
  const [categoryId, setCategoryId] = useState('');
  const [result, setResult] = useState<ScenarioSimulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [scenarioRows, categoryRows] = await Promise.all([
        listScenarios(), api.get<ScenarioCategory[]>('/api/categorias').then((response) => response.data),
      ]);
      setScenarios(scenarioRows);
      setCategories(categoryRows);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const percentage = Number(impact);
  const validImpact = Number.isFinite(percentage) && percentage >= 0 && percentage <= 100;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !validImpact) {
      setError('Informe um nome e um percentual entre 0 e 100.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = { nome: name.trim(), descricao: description.trim(), categoriaId: categoryId ? Number(categoryId) : null, percentualImpacto: percentage };
      if (editingId !== null) {
        const updated = await updateScenario(editingId, payload);
        setScenarios((current) => current.map((item) => item.idCenario === editingId ? updated : item));
        setMessage('Cenário atualizado no servidor.');
      } else {
        const created = await createScenario(payload);
        setScenarios((current) => [created, ...current]);
        setMessage('Cenário salvo no servidor.');
      }
      setEditingId(null);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const runSimulation = async () => {
    if (!validImpact) { setError('Informe um percentual entre 0 e 100.'); return; }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const simulation = await simulateScenario(percentage, categoryId ? Number(categoryId) : null);
      setResult(simulation);
      setMessage('Simulação calculada com dados de lançamentos ativos da sua confecção.');
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  return <>
    <section className="panel">
      <span className="eyebrow">CENÁRIO HIPOTÉTICO · CÁLCULO NO SERVIDOR</span>
      <h3>Explore um cenário. Não uma previsão.</h3>
      <p>Confecção: <b>{nomeConfeccao}</b>. A simulação aplica o percentual escolhido ao faturamento acumulado dos lançamentos mensais ativos. Não usa dados privados de concorrentes nem prevê resultados futuros.</p>
      <div className="filters filter-panel">
        <label>Hipótese de impacto (%)<input type="number" min="0" max="100" step="0.1" value={impact} onChange={(event) => setImpact(event.target.value)} /></label>
        <label>Categoria<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Todas as categorias</option>{categories.map((category) => <option key={category.idCategoria} value={category.idCategoria}>{category.nome}</option>)}</select></label>
      </div>
      <div className="actions"><button type="button" onClick={() => void runSimulation()} disabled={busy || !validImpact}>{busy ? 'Calculando…' : 'Calcular hipótese'}</button><button type="button" className="outline-button" onClick={() => { setResult(null); setMessage(''); setError(''); }} disabled={busy}>Limpar resultado</button></div>
      {result && <div className="metrics trama-kpis" aria-live="polite">
        <article><span>Faturamento acumulado usado como base</span><strong>{money(result.faturamentoReal)}</strong><small>lançamentos ativos da categoria selecionada</small></article>
        <article><span>Resultado hipotético</span><strong>{money(result.faturamentoHipotetico)}</strong><small>base × (1 − impacto ÷ 100)</small></article>
        <article><span>Diferença calculada</span><strong>{money(result.diferencaReais)}</strong><small>redução hipotética de {result.diferencaPercentual.toLocaleString('pt-BR')}%</small></article>
      </div>}
      {message && <p role="status" className="notice">{message}</p>}
      {error && <p role="alert" className="auth-error">{error}</p>}
    </section>

    <section className="panel">
      <div className="panel-title"><div><span className="eyebrow">HISTÓRICO</span><h3>Cenários salvos</h3></div><button className="outline-button" type="button" onClick={() => void refresh()} disabled={loading || busy}>Atualizar</button></div>
      {loading ? <p>Carregando cenários do servidor…</p> : scenarios.length ? <div className="table-wrap"><table><thead><tr><th>Nome</th><th>Categoria</th><th>Impacto</th><th>Descrição</th><th>Ações</th></tr></thead><tbody>{scenarios.map((scenario) => <tr key={scenario.idCenario}><td>{scenario.nome}</td><td>{categories.find((category) => category.idCategoria === scenario.categoriaId)?.nome || 'Todas'}</td><td>{Number(scenario.percentualImpacto).toLocaleString('pt-BR')}%</td><td>{scenario.descricao || '—'}</td><td><div className="actions"><button type="button" className="text-button" onClick={() => { setEditingId(scenario.idCenario); setName(scenario.nome); setDescription(scenario.descricao || ''); setImpact(String(scenario.percentualImpacto)); setCategoryId(scenario.categoriaId ? String(scenario.categoriaId) : ''); setError(''); }} disabled={busy}><Pencil size={14}/> Editar</button><button type="button" className="text-button" onClick={async () => { if (!window.confirm(`Excluir o cenário “${scenario.nome}”?`)) return; setBusy(true); setError(''); try { await deleteScenario(scenario.idCenario); setScenarios((current) => current.filter((item) => item.idCenario !== scenario.idCenario)); setMessage('Cenário excluído.'); if (editingId === scenario.idCenario) setEditingId(null); } catch (caught) { setError(getApiErrorMessage(caught)); } finally { setBusy(false); } }} disabled={busy}><Trash2 size={14}/> Excluir</button></div></td></tr>)}</tbody></table></div> : <p>Nenhum cenário salvo.</p>}
    </section>

    <section className="panel">
      <span className="eyebrow">{editingId === null ? "SALVAR HIPÓTESE" : "EDITAR HIPÓTESE"}</span><h3>{editingId === null ? "Registrar cenário para consultar depois" : "Atualizar cenário salvo"}</h3>
      <form onSubmit={submit}>
        <label>Nome do cenário<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Descrição<textarea maxLength={300} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <div className="actions"><button type="submit" disabled={busy || !validImpact}>{busy ? 'Salvando…' : editingId === null ? 'Salvar cenário no servidor' : 'Atualizar cenário'}</button>{editingId !== null && <button type="button" className="outline-button" onClick={() => { setEditingId(null); setName('Queda hipotética de faturamento'); setDescription('Simulação para avaliar um possível impacto no faturamento da confecção.'); setImpact('10'); setCategoryId(''); }} disabled={busy}>Cancelar edição</button>}</div>
      </form>
    </section>
  </>;
}
