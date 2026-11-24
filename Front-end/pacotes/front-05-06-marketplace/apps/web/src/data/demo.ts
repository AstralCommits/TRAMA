export const banner = 'https://horizons-cdn.hostinger.com/e80e5b8e-f827-41f2-a36a-cdf1418cf885/47317e3c0102a2d4c8e2f05e48d7cced.jpg';
export const modules = ['Visão Geral','Dados de Vendas','Tendências por Categoria','Comparação de Produtos','Cenário da Concorrência','Estoque','Produção','Vendas e Pedidos','Financeiro','Clientes e Fornecedores','Relatórios e Indicadores','Agenda e Notificações','Equipe e Permissões','Cadastros Administrativos','Configurações'];
export const products = [{name:'Calça jeans',category:'Jeans',price:65},{name:'Short jeans',category:'Jeans',price:42},{name:'Camiseta básica',category:'Malha',price:24},{name:'Conjunto fitness',category:'Moda fitness',price:58}];
export type Sale = {id:number;product:string;category:string;quantity:number;price:number;date:string};
export const initialSales:Sale[] = Array.from({length:48},(_,i)=>{const p=products[i%4];return {id:i+1,product:p.name,category:p.category,quantity:20+(i*13)%90,price:p.price,date:`2026-${i<24?'09':'10'}-${String(1+(i%24)).padStart(2,'0')}`};});
export const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
export const total=(s:Sale[])=>s.reduce((n,r)=>n+r.price*r.quantity,0);
export const quantity=(s:Sale[])=>s.reduce((n,r)=>n+r.quantity,0);
export const variation=(a:number,b:number)=>b?`${((a-b)/b*100).toFixed(1).replace('.',',')}%`:'Sem base';
export type Filters={period:string;category:string;product:string};
export function filtered(sales:Sale[],f:Filters,previous=false){const month=f.period==='Setembro de 2026'?(previous?'08':'09'):(previous?'09':'10');return sales.filter(s=>s.date.startsWith(`2026-${month}`)&&(f.category==='Todas'||s.category===f.category)&&(f.product==='Todos'||s.product===f.product));}
