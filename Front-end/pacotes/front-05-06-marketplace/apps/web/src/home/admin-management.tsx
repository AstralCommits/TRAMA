import { useState, type FormEvent } from 'react';
import { AlertCircle, LockKeyhole } from 'lucide-react';

type FormKind = 'category' | 'factory' | 'sale';
const cities = ['Toritama', 'Caruaru', 'Santa Cruz do Capibaribe'];

export function AdminManagement({ profile }: { profile: string }) {
  const [kind, setKind] = useState<FormKind>('category');
  const [category, setCategory] = useState('');
  const [factory, setFactory] = useState('');
  const [city, setCity] = useState(cities[0]);
  const [sale, setSale] = useState({ category: '', factory: '', month: '1', year: String(new Date().getFullYear()), quantity: '', amount: '' });
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const isAdmin = profile.toLocaleLowerCase('pt-BR').includes('administrador');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: string[] = [];
    if (kind === 'category' && !category.trim()) next.push('Informe o nome da categoria.');
    if (kind === 'factory' && !factory.trim()) next.push('Informe o nome da confecção.');
    if (kind === 'sale') {
      if (!sale.category || !sale.factory) next.push('Selecione a categoria e a confecção.');
      if (!sale.month || !sale.year || !sale.quantity || !sale.amount) next.push('Preencha todos os campos obrigatórios.');
      if (sale.quantity && (!Number.isInteger(Number(sale.quantity)) || Number(sale.quantity) <= 0)) next.push('A quantidade deve ser um número inteiro maior que zero.');
      const amount = Number(sale.amount.replace(',', '.'));
      if (sale.amount && (!Number.isFinite(amount) || amount <= 0)) next.push('Informe um valor de venda válido e maior que zero.');
    }
    setErrors(next);
    setFeedback(next.length ? '' : 'Validação concluída. O cadastro não foi enviado: este pacote não contém Back-end, endpoints de cadastro nem autenticação JWT.');
  }

  if (!isAdmin) return <div className="panel issue-warning"><LockKeyhole size={18}/> Esta área é destinada ao perfil Administrador. A demonstração atual não possui autenticação real; a restrição definitiva precisa ser aplicada também no Back-end.</div>;

  return <section className="issue-section">
    <div className="issue-intro"><span className="eyebrow"><LockKeyhole size={14}/> FRONT-05 · ADMINISTRAÇÃO</span><h2>Cadastros e lançamentos</h2><p>Formulários de apoio à gestão de categorias, confecções e vendas.</p></div>
    <div className="demo-notice"><b>Integração pendente:</b> o TRAMA_GitHub.zip identifica o projeto como protótipo sem autenticação real, persistência em banco ou integração externa. Os formulários validam os dados no navegador, mas não enviam nem simulam cadastros.</div>
    <div className="admin-tabs" role="tablist" aria-label="Tipo de cadastro">{([['category','Categorias'],['factory','Confecções'],['sale','Lançar venda']] as const).map(([value,label])=><button key={value} type="button" role="tab" aria-selected={kind===value} className={kind===value?'selected':''} onClick={()=>{setKind(value);setFeedback('');setErrors([]);}}>{label}</button>)}</div>
    <div className="panel"><form onSubmit={submit} noValidate>
      {kind==='category' && <label>Nome da categoria<input value={category} maxLength={50} onChange={e=>setCategory(e.target.value)} placeholder="Ex.: Moda fitness"/><small>{category.length}/50 caracteres</small></label>}
      {kind==='factory' && <><label>Nome da confecção<input value={factory} maxLength={100} onChange={e=>setFactory(e.target.value)} placeholder="Nome da confecção"/></label><label>Cidade<select value={city} onChange={e=>setCity(e.target.value)}>{cities.map(item=><option key={item}>{item}</option>)}</select></label></>}
      {kind==='sale' && <><label>Categoria cadastrada<select value={sale.category} onChange={e=>setSale({...sale,category:e.target.value})}><option value="">Selecione uma categoria</option></select></label><label>Confecção cadastrada<select value={sale.factory} onChange={e=>setSale({...sale,factory:e.target.value})}><option value="">Selecione uma confecção</option></select></label><div className="form-columns"><label>Mês<select value={sale.month} onChange={e=>setSale({...sale,month:e.target.value})}>{Array.from({length:12},(_,i)=><option key={i+1} value={String(i+1)}>{new Intl.DateTimeFormat('pt-BR',{month:'long'}).format(new Date(2026,i,1))}</option>)}</select></label><label>Ano<input type="number" min="2000" max="2100" value={sale.year} onChange={e=>setSale({...sale,year:e.target.value})}/></label><label>Quantidade de peças<input type="number" min="1" step="1" value={sale.quantity} onChange={e=>setSale({...sale,quantity:e.target.value})} placeholder="Ex.: 120"/></label><label>Valor da venda (R$)<input inputMode="decimal" value={sale.amount} onChange={e=>setSale({...sale,amount:e.target.value})} placeholder="Ex.: 3500,00"/></label></div><p className="issue-warning"><AlertCircle size={16}/> As listas de categoria e confecção permanecem vazias até existir uma API real para consultar os cadastros.</p></>}
      {errors.length>0&&<div className="issue-error" role="alert">{errors.map(error=><p key={error}>{error}</p>)}</div>}
      {feedback&&<p className="issue-warning" role="status">{feedback}</p>}
      <div className="actions"><button type="submit">Validar formulário</button></div>
    </form></div>
  </section>;
}
