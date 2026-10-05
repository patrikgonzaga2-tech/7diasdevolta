/**
 * Desafio Volta ao Eixo 7D — recebe os dados do app e grava na planilha.
 *
 * Como instalar: veja planilha/COMO-CONFIGURAR.md.
 *
 * Abas criadas pelo menu "Volta ao Eixo > Preparar planilha":
 *   Clientes     uma linha por cliente (identificada pelo WhatsApp)
 *   Registros    comentários, motivos de "não consegui", dias concluídos e resultado
 *   Compras      dados da venda (a equipe cola aqui o relatório do checkout)
 */

// Precisa ser igual a CONFIG.sheetKey no index.html.
const CHAVE = 've7d-2026';

// Precisa ter os mesmos ids de CONFIG.measures no index.html.
const MEDIDAS = [
  ['cintura', 'Cintura'],
  ['abdomen', 'Abdômen'],
  ['quadril', 'Quadril']
];

const ABA_CLIENTES = 'Clientes';
const ABA_REGISTROS = 'Registros';
const ABA_COMPRAS = 'Compras';

function cabecalhoClientes() {
  const inicio = MEDIDAS.map(m => m[1] + ' inicial (cm)');
  const fim = MEDIDAS.map(m => m[1] + ' final (cm)');
  const dif = MEDIDAS.map(m => 'Diferença ' + m[1].toLowerCase() + ' (cm)');
  return ['WhatsApp', 'Nome', 'Data da compra', 'Data do cadastro', 'Peso inicial (kg)']
    .concat(inicio)
    .concat(['Dias concluídos', 'Dias com recuperação', 'Último dia concluído', 'Concluiu os 7 dias', 'Última atividade',
      'Peso final (kg)'])
    .concat(fim)
    .concat(['Diferença peso (kg)'])
    .concat(dif)
    .concat(['Data do resultado', 'ID do aparelho']);
}
const CABECALHO_REGISTROS = ['Data e hora', 'WhatsApp', 'Nome', 'Data da compra', 'Dia', 'Tipo', 'Texto'];
const CABECALHO_COMPRAS = ['WhatsApp', 'Nome', 'E-mail', 'Data da compra', 'Produto', 'Observação'];

const TIPOS = {
  comentario: 'Comentário do dia',
  nao_consegui: 'Não consegui completar',
  dia_concluido: 'Dia concluído',
  dia_recuperacao: 'Dia concluído com recuperação',
  dia_desmarcado: 'Dia desmarcado',
  cadastro: 'Cadastro',
  correcao: 'Cadastro corrigido',
  reinicio: 'Jornada reiniciada do zero',
  resultado: 'Resultado final'
};

/* ------------------------------------------------------------------ */
/* Menu e preparação                                                   */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Volta ao Eixo')
    .addItem('Preparar planilha', 'prepararPlanilha')
    .addItem('Atualizar datas de compra', 'atualizarDatasDeCompra')
    .addItem('Corrigir WhatsApp com #ERROR!', 'corrigirTelefones')
    .addToUi();
}

// Coluna do WhatsApp em cada aba (1 = A, 2 = B).
const COLUNA_WHATSAPP = { Clientes: 1, Registros: 2, Compras: 1 };

function prepararPlanilha() {
  prepararAba(ABA_CLIENTES, cabecalhoClientes());
  prepararAba(ABA_REGISTROS, CABECALHO_REGISTROS);
  prepararAba(ABA_COMPRAS, CABECALHO_COMPRAS);
  const padrao = SpreadsheetApp.getActive().getSheetByName('Página1') || SpreadsheetApp.getActive().getSheetByName('Sheet1');
  if (padrao && padrao.getLastRow() === 0 && SpreadsheetApp.getActive().getSheets().length > 3) {
    SpreadsheetApp.getActive().deleteSheet(padrao);
  }
}

function prepararAba(nome, cabecalho) {
  const ss = SpreadsheetApp.getActive();
  const aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
  aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight('bold').setBackground('#F9DDE4');
  aba.setFrozenRows(1);
  // WhatsApp como texto, para o Planilhas não tratar o número como conta.
  aba.getRange(1, COLUNA_WHATSAPP[nome], aba.getMaxRows(), 1).setNumberFormat('@');
  return aba;
}

function aba(nome) {
  return SpreadsheetApp.getActive().getSheetByName(nome);
}

/* ------------------------------------------------------------------ */
/* Recebimento dos dados do app                                         */
/* ------------------------------------------------------------------ */

function doGet() {
  return ContentService.createTextOutput('Volta ao Eixo: planilha conectada.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const dados = JSON.parse(e.postData.contents);
    if (dados.chave !== CHAVE) return resposta({ ok: false, erro: 'chave inválida' });
    if (!aba(ABA_CLIENTES)) prepararPlanilha();

    const tel = formatarTelefone(dados.whatsapp);
    if (!tel) return resposta({ ok: false, erro: 'WhatsApp ausente' });
    const quando = dados.quando ? new Date(dados.quando) : new Date();
    const compra = dataDeCompra(tel);

    atualizarCliente(tel, dados, quando, compra);

    switch (dados.tipo) {
      case 'cadastro':
        registrar(tel, dados.nome, compra, quando, '', dados.correcao ? TIPOS.correcao : TIPOS.cadastro,
          resumoMedidas(dados.inicio) + (dados.whatsappAnterior ? ' · WhatsApp anterior: ' + formatarTelefone(dados.whatsappAnterior) : ''));
        break;
      case 'reinicio':
        registrar(tel, dados.nome, compra, quando, '', TIPOS.reinicio, 'Ela apagou o progresso no aparelho e recomeçou do Dia 1.');
        break;
      case 'comentario':
      case 'nao_consegui':
        // Um registro por cliente, dia e tipo: edições atualizam a mesma linha.
        registrar(tel, dados.nome, compra, quando, dados.dia, TIPOS[dados.tipo], dados.texto, true);
        break;
      case 'dia':
        registrar(tel, dados.nome, compra, quando, dados.dia,
          !dados.concluido ? TIPOS.dia_desmarcado : (dados.recuperacao ? TIPOS.dia_recuperacao : TIPOS.dia_concluido), '');
        break;
      case 'resultado':
        registrar(tel, dados.nome, compra, quando, '', TIPOS.resultado, resumoMedidas(dados.final));
        break;
    }
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function atualizarCliente(tel, dados, quando, compra) {
  const sh = aba(ABA_CLIENTES);
  const cab = cabecalhoClientes();
  const col = nome => cab.indexOf(nome);
  // Se ela corrigiu o WhatsApp, a linha antiga (pelo número anterior) é atualizada.
  let linha = acharLinha(sh, 1, tel) || (dados.whatsappAnterior ? acharLinha(sh, 1, dados.whatsappAnterior) : 0);
  const valores = linha
    ? sh.getRange(linha, 1, 1, cab.length).getValues()[0]
    : cab.map(() => '');

  valores[col('WhatsApp')] = tel;
  if (dados.nome) valores[col('Nome')] = dados.nome;
  if (compra) valores[col('Data da compra')] = compra;
  valores[col('Última atividade')] = quando;
  if (dados.aparelho) valores[col('ID do aparelho')] = dados.aparelho;

  if (dados.inicio) {
    if (!valores[col('Data do cadastro')]) valores[col('Data do cadastro')] = quando;
    valores[col('Peso inicial (kg)')] = dados.inicio.peso;
    MEDIDAS.forEach(m => { valores[col(m[1] + ' inicial (cm)')] = dados.inicio.medidas[m[0]]; });
  }
  if (dados.progresso) {
    valores[col('Dias concluídos')] = dados.progresso.concluidos;
    valores[col('Dias com recuperação')] = dados.progresso.recuperados;
    valores[col('Último dia concluído')] = dados.progresso.ultimoDia || '';
    valores[col('Concluiu os 7 dias')] = dados.progresso.concluidos >= 7 ? 'Sim' : 'Não';
  }
  if (dados.tipo === 'reinicio') {
    ['Peso final (kg)', 'Data do resultado'].concat(MEDIDAS.map(m => m[1] + ' final (cm)')).forEach(c => { valores[col(c)] = ''; });
  }
  if (dados.final) {
    valores[col('Peso final (kg)')] = dados.final.peso;
    MEDIDAS.forEach(m => { valores[col(m[1] + ' final (cm)')] = dados.final.medidas[m[0]]; });
    valores[col('Data do resultado')] = quando;
  }
  // Diferenças (final - inicial), quando os dois existem.
  const dif = (a, b) => (a === '' || b === '' || a == null || b == null) ? '' : Math.round((b - a) * 10) / 10;
  valores[col('Diferença peso (kg)')] = dif(valores[col('Peso inicial (kg)')], valores[col('Peso final (kg)')]);
  MEDIDAS.forEach(m => {
    valores[col('Diferença ' + m[1].toLowerCase() + ' (cm)')] =
      dif(valores[col(m[1] + ' inicial (cm)')], valores[col(m[1] + ' final (cm)')]);
  });

  if (!linha) linha = sh.getLastRow() + 1;
  sh.getRange(linha, 1, 1, cab.length).setValues([valores]);
}

function registrar(tel, nome, compra, quando, dia, tipo, texto, substituir) {
  const sh = aba(ABA_REGISTROS);
  const valores = [quando, tel, nome || '', compra || '', dia || '', tipo, texto || ''];
  if (substituir) {
    const dados = sh.getDataRange().getValues();
    for (let i = 1; i < dados.length; i++) {
      if (chaveTelefone(dados[i][1]) === chaveTelefone(tel) && String(dados[i][4]) === String(dia) && dados[i][5] === tipo) {
        sh.getRange(i + 1, 1, 1, valores.length).setValues([valores]);
        return;
      }
    }
  }
  sh.appendRow(valores);
}

function resumoMedidas(m) {
  if (!m) return '';
  return ['Peso: ' + m.peso + ' kg'].concat(MEDIDAS.map(x => x[1] + ': ' + m.medidas[x[0]] + ' cm')).join(' · ');
}

/* ------------------------------------------------------------------ */
/* Datas de compra (aba Compras)                                        */
/* ------------------------------------------------------------------ */

// Chave de comparação: DDD + 8 últimos dígitos (ignora +55 e o 9 extra).
function chaveTelefone(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
  if (d.length < 10) return '';
  return d.slice(0, 2) + d.slice(-8);
}

// Formato (37) 99946-7853. Sem o "+" no começo, que o Planilhas leria como conta.
function formatarTelefone(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
  if (d.length < 10) return '';
  const ddd = d.slice(0, 2), num = d.slice(2);
  return '(' + ddd + ') ' + num.slice(0, num.length - 4) + '-' + num.slice(-4);
}

// Conserta as células de WhatsApp que viraram #ERROR! (gravadas como "+55 ...").
function corrigirTelefones() {
  Object.keys(COLUNA_WHATSAPP).forEach(nome => {
    const sh = aba(nome);
    if (!sh) return;
    const col = COLUNA_WHATSAPP[nome];
    sh.getRange(1, col, sh.getMaxRows(), 1).setNumberFormat('@');
    const n = sh.getLastRow() - 1;
    if (n < 1) return;
    const faixa = sh.getRange(2, col, n, 1);
    const formulas = faixa.getFormulas();
    const valores = faixa.getValues();
    const novos = valores.map((v, i) => {
      const bruto = formulas[i][0] || v[0];
      const tel = formatarTelefone(bruto);
      return [tel || v[0]];
    });
    faixa.setValues(novos);
  });
  atualizarDatasDeCompra();
}

function dataDeCompra(tel) {
  const sh = aba(ABA_COMPRAS);
  if (!sh) return '';
  const chave = chaveTelefone(tel);
  const dados = sh.getDataRange().getValues();
  for (let i = dados.length - 1; i >= 1; i--) {
    if (chaveTelefone(dados[i][0]) === chave) return dados[i][3];
  }
  return '';
}

// Preenche "Data da compra" em Clientes e Registros a partir da aba Compras.
function atualizarDatasDeCompra() {
  const compras = {};
  const c = aba(ABA_COMPRAS).getDataRange().getValues();
  for (let i = 1; i < c.length; i++) {
    const k = chaveTelefone(c[i][0]);
    if (k) compras[k] = c[i][3];
  }
  [[ABA_CLIENTES, 0, 2], [ABA_REGISTROS, 1, 3]].forEach(([nome, colTel, colData]) => {
    const sh = aba(nome);
    const n = sh.getLastRow() - 1;
    if (n < 1) return;
    const tels = sh.getRange(2, colTel + 1, n, 1).getValues();
    const datas = sh.getRange(2, colData + 1, n, 1).getValues();
    tels.forEach((t, i) => {
      const d = compras[chaveTelefone(t[0])];
      if (d) datas[i][0] = d;
    });
    sh.getRange(2, colData + 1, n, 1).setValues(datas);
  });
}

// Quando alguém cola ou edita dados na aba Compras, as datas se atualizam sozinhas.
function onEdit(e) {
  if (e && e.range && e.range.getSheet().getName() === ABA_COMPRAS) atualizarDatasDeCompra();
}

function acharLinha(sh, coluna, valor) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  const chave = chaveTelefone(valor);
  const vals = sh.getRange(2, coluna, n, 1).getValues();
  for (let i = 0; i < vals.length; i++) if (chaveTelefone(vals[i][0]) === chave) return i + 2;
  return 0;
}
