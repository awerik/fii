/**
 * Arquivo de dados da carteira de FIIs.
 * Edite este arquivo manualmente para atualizar sua carteira.
 */

export interface FiiItem {
  ticker: string;
  quantidade: number;
  precoMedio: number;
}

export const minhaCarteira: FiiItem[] = [
  { ticker: "HGLG11", quantidade: 10, precoMedio: 160.50 },
  { ticker: "KNRI11", quantidade: 15, precoMedio: 155.20 },
  { ticker: "XPLG11", quantidade: 20, precoMedio: 105.00 },
  { ticker: "MXRF11", quantidade: 100, precoMedio: 10.20 },
  { ticker: "VISC11", quantidade: 12, precoMedio: 115.80 },
];
