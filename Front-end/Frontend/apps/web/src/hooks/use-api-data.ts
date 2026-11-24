import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Sale } from '@/data/demo';
import type { Categoria, Confeccao, Venda } from '@/types/api';
import { getApiErrorMessage } from '@/services/api';
import { listCategorias, listConfeccoes } from '@/services/cadastrosService';
import { listVendas, toSale } from '@/services/vendasService';

export type ApiData = {
  vendas: Venda[];
  categorias: Categoria[];
  confeccoes: Confeccao[];
  sales: Sale[];
  ready: boolean;
  error: string;
  updatedAt: string;
  reload: () => Promise<void>;
};

export function useApiData(enabled: boolean): ApiData {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [confeccoes, setConfeccoes] = useState<Confeccao[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const pending = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    try {
      const [novasVendas, novasCategorias, novasConfeccoes] = await Promise.all([
        listVendas(controller.signal),
        listCategorias(controller.signal),
        listConfeccoes(controller.signal),
      ]);
      if (controller.signal.aborted) return;
      setVendas(novasVendas);
      setCategorias(novasCategorias);
      setConfeccoes(novasConfeccoes);
      setError('');
      setUpdatedAt(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()));
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(getApiErrorMessage(caught));
    }
    setReady(true);
  }, [enabled]);

  useEffect(() => {
    void reload();
    return () => pending.current?.abort();
  }, [reload]);

  const sales = useMemo(() => vendas.map((venda) => toSale(venda, confeccoes)), [vendas, confeccoes]);

  return { vendas, categorias, confeccoes, sales, ready, error, updatedAt, reload };
}
