// Data seed + shared formatting helpers for Despesas × Xani

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const daysAgoIso = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const CATEGORIAS = [
  { id: 1, nome: 'Alimentação',   tipo: 'despesa', cor: '#ff6b01', slug: 'alim' },
  { id: 2, nome: 'Transporte',    tipo: 'despesa', cor: '#6bb5ff', slug: 'trans' },
  { id: 3, nome: 'Casa',          tipo: 'despesa', cor: '#fbbf24', slug: 'casa' },
  { id: 4, nome: 'Lazer',         tipo: 'despesa', cor: '#c084fc', slug: 'lazer' },
  { id: 5, nome: 'Saúde',         tipo: 'despesa', cor: '#6ee7b7', slug: 'saude' },
  { id: 6, nome: 'Salário',       tipo: 'receita', cor: '#6ee7b7', slug: 'salario' },
  { id: 7, nome: 'Freelance',     tipo: 'receita', cor: '#fbbf24', slug: 'freela' },
  { id: 8, nome: 'Outros',        tipo: 'despesa', cor: '#94a3b8', slug: 'outros' },
];

const CONTAS = [
  { id: 1, nome: 'Carteira',      tipo: 'carteira',        saldo: 142.50,   cor: '#ff6b01' },
  { id: 2, nome: 'Millennium BCP',tipo: 'banco',           saldo: 3284.12,  cor: '#6bb5ff' },
  { id: 3, nome: 'Revolut',       tipo: 'banco',           saldo: 812.40,   cor: '#c084fc' },
  { id: 4, nome: 'Cartão Visa',   tipo: 'cartao_credito',  saldo: -318.90,  cor: '#fda4af' },
];

// Transactions seeded with recent dates relative to today
const TRANSACOES = [
  { id: 101, tipo: 'despesa', valor: 8.90,   data: todayIso(),     descricao: 'Café + tosta mista',       notas: 'Pastelaria do bairro', conta_id: 1, categoria_id: 1 },
  { id: 102, tipo: 'despesa', valor: 46.22,  data: todayIso(),     descricao: 'Mercadona',                 notas: 'Compra semana',        conta_id: 2, categoria_id: 1 },
  { id: 103, tipo: 'receita', valor: 1850,   data: daysAgoIso(1),  descricao: 'Salário — Novembro',        notas: '',                      conta_id: 2, categoria_id: 6 },
  { id: 104, tipo: 'despesa', valor: 12.00,  data: daysAgoIso(1),  descricao: 'Metro 10 viagens',          notas: '',                      conta_id: 3, categoria_id: 2 },
  { id: 105, tipo: 'despesa', valor: 520,    data: daysAgoIso(2),  descricao: 'Renda',                     notas: 'Out/2025',              conta_id: 2, categoria_id: 3 },
  { id: 106, tipo: 'despesa', valor: 19.99,  data: daysAgoIso(3),  descricao: 'Netflix',                   notas: 'Plano Standard',        conta_id: 4, categoria_id: 4 },
  { id: 107, tipo: 'transferencia', valor: 200, data: daysAgoIso(3), descricao: 'Poupança',              notas: 'Mensal',               conta_id: 2, categoria_id: null, conta_destino_id: 3 },
  { id: 108, tipo: 'despesa', valor: 64.30,  data: daysAgoIso(4),  descricao: 'Farmácia',                  notas: '',                      conta_id: 2, categoria_id: 5 },
  { id: 109, tipo: 'despesa', valor: 32.50,  data: daysAgoIso(5),  descricao: 'Jantar com amigos',         notas: 'Sushi',                 conta_id: 3, categoria_id: 4 },
  { id: 110, tipo: 'receita', valor: 280,    data: daysAgoIso(6),  descricao: 'Freelance design',          notas: 'Invoice #42',           conta_id: 2, categoria_id: 7 },
  { id: 111, tipo: 'despesa', valor: 27.80,  data: daysAgoIso(7),  descricao: 'Gasolina',                  notas: '',                      conta_id: 4, categoria_id: 2 },
  { id: 112, tipo: 'despesa', valor: 15.00,  data: daysAgoIso(8),  descricao: 'Cinema',                    notas: 'NOS Colombo',           conta_id: 1, categoria_id: 4 },
  { id: 113, tipo: 'despesa', valor: 88.40,  data: daysAgoIso(10), descricao: 'Mercadona',                 notas: '',                      conta_id: 2, categoria_id: 1 },
  { id: 114, tipo: 'despesa', valor: 42.00,  data: daysAgoIso(12), descricao: 'Luz — EDP',                 notas: '',                      conta_id: 2, categoria_id: 3 },
  { id: 115, tipo: 'despesa', valor: 21.99,  data: daysAgoIso(14), descricao: 'Spotify Family',            notas: '',                      conta_id: 4, categoria_id: 4 },
  { id: 116, tipo: 'despesa', valor: 75.00,  data: daysAgoIso(16), descricao: 'Consulta médica',           notas: '',                      conta_id: 2, categoria_id: 5 },
  { id: 117, tipo: 'receita', valor: 120,    data: daysAgoIso(18), descricao: 'Venda OLX',                 notas: 'Bicicleta antiga',      conta_id: 1, categoria_id: 7 },
  { id: 118, tipo: 'despesa', valor: 9.50,   data: daysAgoIso(20), descricao: 'Uber',                      notas: '',                      conta_id: 3, categoria_id: 2 },
];

const ORCAMENTOS = [
  { id: 1, categoria_id: 1, valor_limite: 350,  mes: new Date().getMonth()+1, ano: new Date().getFullYear() },
  { id: 2, categoria_id: 2, valor_limite: 80,   mes: new Date().getMonth()+1, ano: new Date().getFullYear() },
  { id: 3, categoria_id: 3, valor_limite: 600,  mes: new Date().getMonth()+1, ano: new Date().getFullYear() },
  { id: 4, categoria_id: 4, valor_limite: 120,  mes: new Date().getMonth()+1, ano: new Date().getFullYear() },
  { id: 5, categoria_id: 5, valor_limite: 200,  mes: new Date().getMonth()+1, ano: new Date().getFullYear() },
];

const AGENDADAS = [
  { id: 1, tipo: 'despesa', valor: 520, descricao: 'Renda', frequencia: 'mensal', dia_do_mes: 1, categoria_id: 3, conta_id: 2, proxima: '2025-12-01', ativa: true },
  { id: 2, tipo: 'receita', valor: 1850, descricao: 'Salário', frequencia: 'mensal', dia_do_mes: 25, categoria_id: 6, conta_id: 2, proxima: '2025-12-25', ativa: true },
  { id: 3, tipo: 'despesa', valor: 19.99, descricao: 'Netflix', frequencia: 'mensal', dia_do_mes: 15, categoria_id: 4, conta_id: 4, proxima: '2025-12-15', ativa: true },
  { id: 4, tipo: 'despesa', valor: 21.99, descricao: 'Spotify', frequencia: 'mensal', dia_do_mes: 8, categoria_id: 4, conta_id: 4, proxima: '2025-12-08', ativa: false },
  { id: 5, tipo: 'despesa', valor: 200, descricao: 'Poupança', frequencia: 'mensal', dia_do_mes: 5, categoria_id: null, conta_id: 2, proxima: '2025-12-05', ativa: true },
];

const DIVIDAS = [
  { id: 1, tipo: 'divida',  interveniente: 'João Silva',    valor_total: 500, valor_pago: 200, data_vencimento: '2026-01-15', conta_id: 2, notas: 'Empréstimo setembro' },
  { id: 2, tipo: 'credito', interveniente: 'Maria Santos',  valor_total: 150, valor_pago: 0,   data_vencimento: '2025-12-20', conta_id: 1, notas: 'Jantar aniversário' },
  { id: 3, tipo: 'divida',  interveniente: 'Crédito auto',  valor_total: 4200, valor_pago: 2800, data_vencimento: '2026-06-30', conta_id: 2, notas: 'Banco Santander' },
  { id: 4, tipo: 'credito', interveniente: 'Pedro Costa',   valor_total: 80,  valor_pago: 80,  data_vencimento: '2025-11-01', conta_id: 3, notas: 'Pago' },
];

const fmtEUR = (v) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v);
const fmtDate = (iso) => { const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
const fmtDateShort = (iso) => { const [y,m,d] = iso.split('-'); return `${d}/${m}`; };

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

Object.assign(window, {
  CATEGORIAS, CONTAS, TRANSACOES, ORCAMENTOS, AGENDADAS, DIVIDAS,
  fmtEUR, fmtDate, fmtDateShort, MESES, DIAS_SEMANA, todayIso, daysAgoIso,
});
