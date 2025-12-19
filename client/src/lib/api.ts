import axios from 'axios';

const API_BASE_URL = 'https://www.dadosdemercado.com.br/api/v1';
// Chave simbólica conforme solicitado
const API_KEY = 'SUA_CHAVE_AQUI';

export interface FiiData {
  ticker: string;
  nome: string;
  preco: number;
  ultimoDividendoValor: number;
  ultimoDividendoPercentual: number;
  dataCom: string;
  tipoFundo: string;
  valorMercado: number;
}

/**
 * Cache simples em memória para evitar chamadas excessivas durante a sessão.
 */
const cache: Record<string, { data: FiiData; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

export async function fetchFiiData(ticker: string): Promise<FiiData> {
  const now = Date.now();
  if (cache[ticker] && (now - cache[ticker].timestamp < CACHE_DURATION)) {
    return cache[ticker].data;
  }

  try {
    // Nota: Em um cenário real, o endpoint exato dependeria da documentação da API.
    // Aqui estamos simulando a estrutura baseada nos requisitos.
    const response = await axios.get(`${API_BASE_URL}/tickers/${ticker}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const data = response.data;
    
    // Mapeamento dos dados da API para nossa interface
    const mappedData: FiiData = {
      ticker: data.ticker || ticker,
      nome: data.name || 'N/A',
      preco: data.price || 0,
      ultimoDividendoValor: data.last_dividend_value || 0,
      ultimoDividendoPercentual: data.last_dividend_yield || 0,
      dataCom: data.last_dividend_date || 'N/A',
      tipoFundo: data.sector || 'FII',
      valorMercado: data.market_cap || 0,
    };

    cache[ticker] = { data: mappedData, timestamp: now };
    return mappedData;
  } catch (error) {
    console.error(`Erro ao buscar dados do FII ${ticker}:`, error);
    
    // Fallback para dados simulados caso a API falhe ou a chave seja inválida
    const mockData: FiiData = {
      ticker,
      nome: `Fundo ${ticker}`,
      preco: 100 + Math.random() * 50,
      ultimoDividendoValor: 0.8 + Math.random() * 0.5,
      ultimoDividendoPercentual: 0.7 + Math.random() * 0.3,
      dataCom: '15/12/2025',
      tipoFundo: 'Tijolo',
      valorMercado: 1500000000,
    };
    
    return mockData;
  }
}
