
// Indicadores e configuração visual do Dashboard.
export const municipalFlowSteps = [
  ['Atendimento inicial', 'Acolhimento, protecao imediata e acionamento do fluxo.'],
  ['Porta de entrada', 'UBSI/CASAI/DSEI, UBS, hospital, CRAS, Policia Civil, escolas, IFAM ou SEJEL.'],
  ['Suspeita ou confirmacao', 'Registro minimo, sem exigir investigacao ou conclusao fora da competencia.'],
  ['Conselho Tutelar', 'Confirmacao de ciencia e medidas de protecao.'],
  ['SIPIA', 'Referencia do registro oficial quando permitido.'],
  ['SAMIC', 'Acionamento conforme horario configurado.'],
  ['Tomada de decisao', 'Orientacao de rota sem impedir decisao humana excepcional.'],
  ['Encaminhamento', 'DIP, CREAS, Ministerio Publico, UBS, hospital/SAVVIS ou rede autorizada.'],
  ['Encerramento administrativo', 'Historico preservado, devolutivas registradas e revisao de qualidade.']
];

export const projectIndicatorDefinitions = [
  ['tempoCiencia', 'Tempo ate ciencia', 'Intervalo entre abertura e confirmacao do Conselho Tutelar.'],
  ['tempoAceite', 'Tempo ate aceite', 'Intervalo entre encaminhamento e confirmacao do servico de destino.'],
  ['pendenciasVencidas', 'Pendencias vencidas', 'Encaminhamentos com prazo excedido.'],
  ['devolucoes', 'Devolucoes', 'Recusas, devolucoes ou redirecionamentos codificados.'],
  ['continuidade', 'Continuidade', 'Protocolos com linha do tempo e devolutiva registrada.'],
  ['coberturaFluxo', 'Cobertura do fluxo', 'Distribuicao de entradas e destinos por unidade.'],
  ['registroOficial', 'Situacao SINAN/SIPIA', 'Percentual com referencia oficial informada quando aplicavel.'],
  ['usoSistema', 'Uso do sistema', 'Usuarios ativos, acessos e tarefas concluidas.'],
  ['qualidadeDados', 'Qualidade dos dados', 'Campos incompletos, duplicidades e inconsistencias.'],
  ['seguranca', 'Seguranca', 'Tentativas negadas, incidentes e acessos revisados.']
];

// --- Camada de interface migrada do sistema existente ---
let RPM, activateProfile, activateSamicFlow, activityPanel, appendTimeline, applySearch, audit, auditAction, auditProtocolRead, auditTrailList, authCard, average, bindActions, bindEntry, bindModalActions, bindShell, boot, buildProtocol, canCouncilContinue, canForwardContinue, canManage, canNotify, canViewCase, canViewStats, checklist, clearEntryTimers, closeModal, closeProtocol, closurePanel, confirmCouncilAwareness, contingency, copyFor, council, councilFollowupPanel, countBy, createLocalPendingAccess, csvCell, currentUser, dashboardData, dashedEmpty, deadlineBadge, destinationName, emptyRoute, entrySequence, entryShell, esc, escAttr, estimateSpark, exportCsv, findForward, findProtocol, findUserByEmail, finishEntrySequence, flowSettingsForm, flowSteps, formatDate, formatDuration, formatHours, forwardActionButtons, forwardDestinationOptions, forwardOperationsTable, forwards, friendlyAuthError, getUsers, governanceList, groupedNav, guardAction, handleActionError, handleGoogleLogin, handleLogin, handleRecoverPassword, handleRegister, healthEntryAlert, help, hoursBetween, initials, isClosed, isHealthEntry, isOccurrenceRoute, isSamicOpen, labelFor, lastDaysCount, list, liveClock, liveUsersPanel, loginCard, management, managementCard, markNotificationRead, mergeRemoteProfiles, mobileBottomNav, mobileRoutesForPackShell, modalShell, navButton, navForRole, navItems, navSignal, navigate, network, nextDeadline, normalize, normalizeAppState, normalizeEmail, notificationItem, notificationModal, notifications, occurrenceDetails, officialOptions, officialRecordsPanel, officialSummary, openModal, opsTable, pendingAccessCard, persistProtocol, priorityBadge, protocolForm, protocolModal, protocolOperationsTable, protocolRisk, protocolStateCode, protocolStateLabel, protocolStateStage, protocolStateStages, protocolStates, protocolTable, protocolTimeline, protocols, quickAction, quickActionsPanel, registerCard, render, renderEntry, renderFailure, reopenProtocol, restoreRemoteSession, roles, routeCopy, routeGroups, routeLoading, rpmPublicContract, samic, samicDecisionPanel, samicStatusCard, saveCouncilFollowup, saveForward, saveNotification, saveOfficialRecords, saveSamicDecision, saveSettings, saveUnit, saveUser, scheduleRender, securityPanel, selectUser, settings, shell, sparkStore, startEntrySequence, startRemoteProfileSync, state, statusBadge, syncUserProfile, table, textOnly, thisMonthCount, timeoutPromise, titleFor, toast, todayCount, unitModal, unitName, unitOperationsGrid, unitOptions, updateForwardStatus, userModal, userOperationsTable, users, view, weekdayName, withProtocolState;
export function initDashboard(runtime) {
  RPM = runtime.RPM;
  activateProfile = runtime.activateProfile;
  activateSamicFlow = runtime.activateSamicFlow;
  activityPanel = runtime.activityPanel;
  appendTimeline = runtime.appendTimeline;
  applySearch = runtime.applySearch;
  audit = runtime.audit;
  auditAction = runtime.auditAction;
  auditProtocolRead = runtime.auditProtocolRead;
  auditTrailList = runtime.auditTrailList;
  authCard = runtime.authCard;
  average = runtime.average;
  bindActions = runtime.bindActions;
  bindEntry = runtime.bindEntry;
  bindModalActions = runtime.bindModalActions;
  bindShell = runtime.bindShell;
  boot = runtime.boot;
  buildProtocol = runtime.buildProtocol;
  canCouncilContinue = runtime.canCouncilContinue;
  canForwardContinue = runtime.canForwardContinue;
  canManage = runtime.canManage;
  canNotify = runtime.canNotify;
  canViewCase = runtime.canViewCase;
  canViewStats = runtime.canViewStats;
  checklist = runtime.checklist;
  clearEntryTimers = runtime.clearEntryTimers;
  closeModal = runtime.closeModal;
  closeProtocol = runtime.closeProtocol;
  closurePanel = runtime.closurePanel;
  confirmCouncilAwareness = runtime.confirmCouncilAwareness;
  contingency = runtime.contingency;
  copyFor = runtime.copyFor;
  council = runtime.council;
  councilFollowupPanel = runtime.councilFollowupPanel;
  countBy = runtime.countBy;
  createLocalPendingAccess = runtime.createLocalPendingAccess;
  csvCell = runtime.csvCell;
  currentUser = runtime.currentUser;
  dashboardData = runtime.dashboardData;
  dashedEmpty = runtime.dashedEmpty;
  deadlineBadge = runtime.deadlineBadge;
  destinationName = runtime.destinationName;
  emptyRoute = runtime.emptyRoute;
  entrySequence = runtime.entrySequence;
  entryShell = runtime.entryShell;
  esc = runtime.esc;
  escAttr = runtime.escAttr;
  estimateSpark = runtime.estimateSpark;
  exportCsv = runtime.exportCsv;
  findForward = runtime.findForward;
  findProtocol = runtime.findProtocol;
  findUserByEmail = runtime.findUserByEmail;
  finishEntrySequence = runtime.finishEntrySequence;
  flowSettingsForm = runtime.flowSettingsForm;
  flowSteps = runtime.flowSteps;
  formatDate = runtime.formatDate;
  formatDuration = runtime.formatDuration;
  formatHours = runtime.formatHours;
  forwardActionButtons = runtime.forwardActionButtons;
  forwardDestinationOptions = runtime.forwardDestinationOptions;
  forwardOperationsTable = runtime.forwardOperationsTable;
  forwards = runtime.forwards;
  friendlyAuthError = runtime.friendlyAuthError;
  getUsers = runtime.getUsers;
  governanceList = runtime.governanceList;
  groupedNav = runtime.groupedNav;
  guardAction = runtime.guardAction;
  handleActionError = runtime.handleActionError;
  handleGoogleLogin = runtime.handleGoogleLogin;
  handleLogin = runtime.handleLogin;
  handleRecoverPassword = runtime.handleRecoverPassword;
  handleRegister = runtime.handleRegister;
  healthEntryAlert = runtime.healthEntryAlert;
  help = runtime.help;
  hoursBetween = runtime.hoursBetween;
  initials = runtime.initials;
  isClosed = runtime.isClosed;
  isHealthEntry = runtime.isHealthEntry;
  isOccurrenceRoute = runtime.isOccurrenceRoute;
  isSamicOpen = runtime.isSamicOpen;
  labelFor = runtime.labelFor;
  lastDaysCount = runtime.lastDaysCount;
  list = runtime.list;
  liveClock = runtime.liveClock;
  liveUsersPanel = runtime.liveUsersPanel;
  loginCard = runtime.loginCard;
  management = runtime.management;
  managementCard = runtime.managementCard;
  markNotificationRead = runtime.markNotificationRead;
  mergeRemoteProfiles = runtime.mergeRemoteProfiles;
  mobileBottomNav = runtime.mobileBottomNav;
  mobileRoutesForPackShell = runtime.mobileRoutesForPackShell;
  modalShell = runtime.modalShell;
  navButton = runtime.navButton;
  navForRole = runtime.navForRole;
  navItems = runtime.navItems;
  navSignal = runtime.navSignal;
  navigate = runtime.navigate;
  network = runtime.network;
  nextDeadline = runtime.nextDeadline;
  normalize = runtime.normalize;
  normalizeAppState = runtime.normalizeAppState;
  normalizeEmail = runtime.normalizeEmail;
  notificationItem = runtime.notificationItem;
  notificationModal = runtime.notificationModal;
  notifications = runtime.notifications;
  occurrenceDetails = runtime.occurrenceDetails;
  officialOptions = runtime.officialOptions;
  officialRecordsPanel = runtime.officialRecordsPanel;
  officialSummary = runtime.officialSummary;
  openModal = runtime.openModal;
  opsTable = runtime.opsTable;
  pendingAccessCard = runtime.pendingAccessCard;
  persistProtocol = runtime.persistProtocol;
  priorityBadge = runtime.priorityBadge;
  protocolForm = runtime.protocolForm;
  protocolModal = runtime.protocolModal;
  protocolOperationsTable = runtime.protocolOperationsTable;
  protocolRisk = runtime.protocolRisk;
  protocolStateCode = runtime.protocolStateCode;
  protocolStateLabel = runtime.protocolStateLabel;
  protocolStateStage = runtime.protocolStateStage;
  protocolStateStages = runtime.protocolStateStages;
  protocolStates = runtime.protocolStates;
  protocolTable = runtime.protocolTable;
  protocolTimeline = runtime.protocolTimeline;
  protocols = runtime.protocols;
  quickAction = runtime.quickAction;
  quickActionsPanel = runtime.quickActionsPanel;
  registerCard = runtime.registerCard;
  render = runtime.render;
  renderEntry = runtime.renderEntry;
  renderFailure = runtime.renderFailure;
  reopenProtocol = runtime.reopenProtocol;
  restoreRemoteSession = runtime.restoreRemoteSession;
  roles = runtime.roles;
  routeCopy = runtime.routeCopy;
  routeGroups = runtime.routeGroups;
  routeLoading = runtime.routeLoading;
  rpmPublicContract = runtime.rpmPublicContract;
  samic = runtime.samic;
  samicDecisionPanel = runtime.samicDecisionPanel;
  samicStatusCard = runtime.samicStatusCard;
  saveCouncilFollowup = runtime.saveCouncilFollowup;
  saveForward = runtime.saveForward;
  saveNotification = runtime.saveNotification;
  saveOfficialRecords = runtime.saveOfficialRecords;
  saveSamicDecision = runtime.saveSamicDecision;
  saveSettings = runtime.saveSettings;
  saveUnit = runtime.saveUnit;
  saveUser = runtime.saveUser;
  scheduleRender = runtime.scheduleRender;
  securityPanel = runtime.securityPanel;
  selectUser = runtime.selectUser;
  settings = runtime.settings;
  shell = runtime.shell;
  sparkStore = runtime.sparkStore;
  startEntrySequence = runtime.startEntrySequence;
  startRemoteProfileSync = runtime.startRemoteProfileSync;
  state = runtime.state;
  statusBadge = runtime.statusBadge;
  syncUserProfile = runtime.syncUserProfile;
  table = runtime.table;
  textOnly = runtime.textOnly;
  thisMonthCount = runtime.thisMonthCount;
  timeoutPromise = runtime.timeoutPromise;
  titleFor = runtime.titleFor;
  toast = runtime.toast;
  todayCount = runtime.todayCount;
  unitModal = runtime.unitModal;
  unitName = runtime.unitName;
  unitOperationsGrid = runtime.unitOperationsGrid;
  unitOptions = runtime.unitOptions;
  updateForwardStatus = runtime.updateForwardStatus;
  userModal = runtime.userModal;
  userOperationsTable = runtime.userOperationsTable;
  users = runtime.users;
  view = runtime.view;
  weekdayName = runtime.weekdayName;
  withProtocolState = runtime.withProtocolState;
}

export async function dashboard() {
  const { protocols, forwards, notifications } = await dashboardData();
  const users = await list('users');
  const critical = protocols.filter((item) => protocolRisk(item).band === 'critica').length;
  const pendingForwards = forwards.filter((item) => item.status !== 'Concluido').length;

  return `
    ${metrics([
      ['Hoje', todayCount(protocols), 'notificacoes registradas no dia', 'calendar-days'],
      ['Pendencias', pendingForwards, 'encaminhamentos em andamento', 'clock'],
      ['Criticas', critical, 'decisao prioritaria', 'siren'],
      ['Tempo real', users.filter((user) => user.active).length, 'usuarios autorizados', 'radio']
    ])}
    ${municipalFlowPanel(protocols, forwards)}
    <div class="ops-dashboard-grid">
      <section class="legacy-panel legacy-panel-wide">
        <div class="legacy-panel-header">
          <div>
            <h2>Protocolos em acompanhamento</h2>
            <p>Fila inicial com dados restritos, status e registro oficial.</p>
          </div>
          <button class="button primary" data-action="open-notification-modal"><i data-lucide="plus"></i><span>Abrir protocolo</span></button>
        </div>
        ${protocolOperationsTable(protocols)}
      </section>
      <aside class="ops-side-stack">
        ${quickActionsPanel()}
        ${liveUsersPanel(users)}
      </aside>
    </div>
    ${workflowPanel(protocols)}
  `;
}

export function training() {
  return `<section class="module-grid">
    ${[
      ['clipboard-list', 'Entrada e notificacao', 'Preencher dados minimos, classificar prioridade e gerar protocolo municipal.', 'Operacional'],
      ['scale', 'Conselho Tutelar', 'Confirmar ciencia, orientar SIPIA e registrar medidas de protecao.', 'Especialista'],
      ['heart-pulse', 'SAMIC', 'Usar janela de atendimento, fila critica e devolutiva tecnica.', 'Especialista'],
      ['network', 'Rede de atendimento', 'Cadastrar unidade, localizar contato e acompanhar encaminhamento.', 'Rede'],
      ['shield-check', 'Auditoria e privacidade', 'Verificar acesso, reduzir dados sensiveis e manter rastro de acoes.', 'Gestao'],
      ['wifi-off', 'Contingencia', 'Atuar quando a conexao cair e sincronizar depois sem perder o atendimento.', 'Plantao']
    ].map(moduleCard).join('')}
  </section>`;
}

export function knowledge() {
  return `<section class="knowledge-layout">
    <div class="legacy-panel">
      <div class="legacy-panel-header"><div><h2>Base de conhecimento</h2><p>Consulta rapida para caminhar no sistema sem travar a operacao.</p></div></div>
      ${[
        ['Fluxo municipal', 'Atendimento inicial, porta de entrada, Conselho Tutelar, SIPIA, SAMIC, decisao, encaminhamento e encerramento administrativo.'],
        ['Perfis de acesso', 'Cada usuario enxerga somente a etapa institucional autorizada. Administrador libera perfil, unidade e status.'],
        ['Dados restritos', 'Identificacao sensivel fica limitada ao perfil autorizado. Indicadores usam dados agregados e grupo minimo.'],
        ['Notificacao municipal', 'A notificacao abre protocolo, registra auditoria e cria alerta interno sem conteudo sensivel fora do sistema.'],
        ['Rede de atendimento', 'Unidades cadastradas apoiam origem, destino, contato institucional, responsabilidades e mapeamento.'],
        ['Piloto seguro', 'Dados reais so devem entrar apos autorizacao, governanca formal, avaliacao de impacto, seguranca e capacitacao.']
      ].map(([title, text]) => `<article class="knowledge-row" data-search-row="${escAttr(title + ' ' + text)}"><strong>${esc(title)}</strong><p>${esc(text)}</p></article>`).join('')}
    </div>
    <aside class="legacy-panel">
      <h2>Atalhos</h2>
      ${checklist(['Abrir protocolo', 'Consultar protocolo', 'Encaminhamentos', 'Relatorio de auditoria', 'Contingencia'])}
    </aside>
  </section>`;
}

export async function reports() {
  const { protocols, forwards, notifications } = await dashboardData();
  if (!canViewStats(state.user.role)) {
    return `<section class="empty-state"><i data-lucide="lock"></i><strong>Acesso limitado</strong><p>Perfil atual nao acessa indicadores.</p></section>`;
  }
  return `
    <section class="legacy-panel">
      <div class="legacy-panel-header">
        <div><h2>Dashboard de Notificacoes Diarias</h2><p>Dados agregados para gestao, sem nome da vitima, notificante, descricao, endereco ou geolocalizacao.</p></div>
        <button class="button primary" data-action="export-csv"><i data-lucide="download"></i><span>Exportar CSV</span></button>
      </div>
      ${metrics([
        ['Hoje', todayCount(protocols), 'notificacoes registradas no dia', 'calendar-days'],
        ['Ultimos 7 dias', lastDaysCount(protocols, 7), 'notificacoes na semana operacional', 'calendar-range'],
        ['Este mes', thisMonthCount(protocols), 'notificacoes acumuladas no mes', 'calendar'],
        ['Total', protocols.length, 'registros agregados disponiveis', 'database'],
        ['Pendencias', protocols.filter((item) => !isClosed(item)).length, 'protocolos nao encerrados', 'clock'],
        ['Encerrados', protocols.filter(isClosed).length, 'protocolos finalizados', 'check-circle-2']
      ])}
      ${projectIndicatorGrid(protocols, forwards, notifications)}
    </section>
    <div class="report-breakdown-grid">
      ${breakdownPanel('Tipo de violencia', countBy(protocols, 'violenceType'))}
      ${breakdownPanel('Faixa etaria', countBy(protocols, 'ageRange'))}
      ${breakdownPanel('Sexo', countBy(protocols, 'sex'))}
      ${breakdownPanel('Unidade notificadora', countBy(protocols.map((item) => ({ ...item, unitLabel: unitName(item.originUnitId) })), 'unitLabel'))}
      ${breakdownPanel('Status do protocolo', countBy(protocols, 'status'))}
    </div>`;
}

export function commandBoard(protocols, forwards, estimate) {
  const urgent = protocols.find((item) => protocolRisk(item).band === 'critica') || protocols[0];
  return `
    <section class="command-board">
      <div class="command-copy">
        <span class="eyebrow">Plantao agora</span>
        <h2>${urgent ? esc(urgent.number) + ' precisa andar' : 'Fila limpa'}</h2>
        <p>${urgent ? esc(urgent.status + ' / ' + urgent.currentOwner) : 'Nenhum protocolo aguardando decisao.'}</p>
        <div class="command-actions">
          <button class="button primary" data-action="new-protocol"><i data-lucide="plus"></i><span>Novo protocolo</span></button>
          <button class="button" data-nav="forwards"><i data-lucide="send"></i><span>Ver encaminhamentos</span></button>
        </div>
      </div>
      <div class="command-side">
        <span>${forwards.length} encaminhamentos</span>
        <strong>${estimate.projectedReads}</strong>
        <small>leituras/dia estimadas</small>
      </div>
    </section>`;
}

export function metrics(items) {
  return `<section class="metric-grid">${items.map(([label, value, hint, icon]) => metric(label, value, hint, icon)).join('')}</section>`;
}

export function metric(label, value, hint, icon = 'activity') {
  return `<article class="metric">
    <i data-lucide="${icon}"></i>
    <span>${esc(label)}</span>
    <strong>${esc(value)}</strong>
    <small>${esc(hint)}</small>
  </article>`;
}

export function stageBoard(protocols) {
  const lanes = [
    ['conselho', 'Conselho', 'scale'],
    ['samic', 'SAMIC', 'heart-pulse'],
    ['rede', 'Rede', 'network']
  ];
  return `<section class="stage-board">
    ${lanes.map(([stage, label, icon]) => {
      const rows = protocols.filter((item) => item.stage === stage || item.currentOwner?.toLowerCase().includes(stage));
      return `<div class="stage-lane">
        <div class="stage-title"><i data-lucide="${icon}"></i><strong>${label}</strong><span>${rows.length}</span></div>
        ${rows.length ? rows.map(compactCase).join('') : '<p class="muted">Sem itens nesta etapa.</p>'}
      </div>`;
    }).join('')}
  </section>`;
}

export function caseGrid(rows) {
  if (!rows.length) return `<section class="empty-state"><i data-lucide="check-circle-2"></i><strong>Sem itens nesta fila</strong><p>Nada exige acao agora.</p></section>`;
  return `<section class="case-grid">${rows.map(caseCard).join('')}</section>`;
}

export function caseCard(row) {
  const risk = protocolRisk(row);
  return `<article class="case-card" data-search-row="${escAttr([row.number, row.status, row.currentOwner, row.entryPoint, row.priority].join(' '))}">
    <div class="case-top">
      <strong>${esc(row.number)}</strong>
      ${priorityBadge(row.priority)}
    </div>
    <h3>${esc(row.classification)} / ${esc(row.violenceType)}</h3>
    <p>${esc(row.minimalRecord || 'Registro minimizado.')}</p>
    <div class="case-meta">
      <span><i data-lucide="map-pin"></i>${esc(row.entryPoint)}</span>
      <span><i data-lucide="user-check"></i>${esc(row.currentOwner)}</span>
      <span><i data-lucide="activity"></i>Risco ${risk.score}</span>
    </div>
    <div class="case-bottom">
      ${statusBadge(row.status)}
      <button class="button ghost" data-nav="forwards"><i data-lucide="send"></i><span>Encaminhar</span></button>
    </div>
  </article>`;
}

export function compactCase(row) {
  return `<article class="mini-case" data-search-row="${escAttr([row.number, row.status, row.currentOwner].join(' '))}">
    <strong>${esc(row.number)}</strong>
    <span>${esc(row.status)}</span>
    ${priorityBadge(row.priority)}
  </article>`;
}

export function handoffCard(row) {
  return `<article class="handoff-card" data-search-row="${escAttr([row.number, row.destination, row.status, row.objective].join(' '))}">
    <div><span>${esc(row.number)}</span><strong>${esc(row.destination)}</strong></div>
    ${statusBadge(row.status)}
    <p>${esc(row.objective)}</p>
  </article>`;
}

export function sparkPanel(estimate) {
  const percent = Math.min(100, Math.round(estimate.readPressure * 100));
  return `<section class="spark-panel">
    <div class="section-heading"><span>Saude Spark</span><i data-lucide="zap"></i></div>
    <div class="spark-meter" style="--value:${percent}%"><span></span></div>
    <strong>${percent}% da cota diaria estimada</strong>
    <p>Consultas limitadas, dados estatisticos separados e nenhuma funcao paga.</p>
    ${checklist(['usar limit()', 'evitar listeners grandes', 'separar estatistica de caso'])}
  </section>`;
}

export function workflowPanel(protocols) {
  return `<section class="workflow-panel">
    <div class="section-heading"><span>Percurso do atendimento</span><small>${protocols.length} protocolos ativos</small></div>
    <div class="flow-track">
      ${flowSteps.map((step, index) => `<div class="flow-step">
        <em>${step[0]}</em>
        <strong>${esc(step[1])}</strong>
        <span>${esc(step[2])}</span>
        ${index < flowSteps.length - 1 ? '<b></b>' : ''}
      </div>`).join('')}
    </div>
  </section>`;
}

export function municipalFlowPanel(protocols, forwards) {
  const counts = municipalFlowCounts(protocols, forwards);
  return `<section class="legacy-panel municipal-flow-panel">
    <div class="legacy-panel-header">
      <div>
        <h2>Fluxo municipal do projeto</h2>
        <p>Sequencia operacional baseada no Projeto Rede Protege Maues.</p>
      </div>
    </div>
    <div class="municipal-flow-strip">
      ${municipalFlowSteps.map(([title, text], index) => `<article class="flow-step-card" data-search-row="${escAttr(title + ' ' + text)}">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <strong>${esc(title)}</strong>
        <p>${esc(text)}</p>
        <em>${esc(counts[title] || 0)} registro(s)</em>
      </article>`).join('')}
    </div>
  </section>`;
}

export function municipalFlowCounts(protocols, forwards) {
  return {
    'Atendimento inicial': protocols.length,
    'Porta de entrada': new Set(protocols.map((row) => row.originUnitId || row.entryPoint).filter(Boolean)).size,
    'Suspeita ou confirmacao': protocols.filter((row) => row.classification).length,
    'Conselho Tutelar': protocols.filter((row) => row.stage === 'conselho' || normalize(row.status).includes('conselho')).length,
    SIPIA: protocols.filter((row) => row.sipia?.protocol || row.sipia?.status).length,
    SAMIC: protocols.filter((row) => row.stage === 'samic' || row.samic?.status).length,
    'Tomada de decisao': protocols.filter((row) => normalize(row.status).includes('decis')).length,
    Encaminhamento: forwards.length,
    'Encerramento administrativo': protocols.filter(isClosed).length
  };
}

export function projectIndicatorGrid(protocols, forwards, notifications) {
  const values = projectIndicatorValues(protocols, forwards, notifications);
  return `<div class="project-indicator-grid">
    ${projectIndicatorDefinitions.map(([id, title, description]) => {
      const item = values[id] || { value: '0', detail: 'Sem dados cadastrados.' };
      return `<article class="project-indicator-card" data-search-row="${escAttr(title + ' ' + description + ' ' + item.detail)}">
        <span>${esc(title)}</span>
        <strong>${esc(item.value)}</strong>
        <p>${esc(description)}</p>
        <em>${esc(item.detail)}</em>
      </article>`;
    }).join('')}
  </div>`;
}

export function projectIndicatorValues(protocols, forwards, notifications) {
  const auditRows = state.data.audit || [];
  const activeUsers = (state.data.users || []).filter((user) => user.active).length;
  const councilHours = protocols
    .map((row) => hoursBetween(row.createdAt, row.councilAcknowledgedAt || row.council?.acknowledgedAt))
    .filter(Number.isFinite);
  const acceptHours = forwards
    .map((row) => hoursBetween(row.createdAt, row.acceptedAt))
    .filter(Number.isFinite);
  const overdue = forwards.filter((row) => !isClosed(row) && row.deadlineAt && new Date(row.deadlineAt) < new Date()).length;
  const returns = forwards.filter((row) => /devol|recus|redirecion/i.test(normalize([row.status, row.objective].join(' ')))).length;
  const completeTimeline = protocols.filter((row) => Array.isArray(row.timeline) && row.timeline.length > 1).length;
  const officialCount = protocols.filter((row) => row.sinan?.protocol || row.sinan?.status || row.sipia?.protocol || row.sipia?.status).length;
  const incomplete = protocols.filter((row) => !row.originUnitId || !row.priority || !row.ageRange || !row.classification).length;
  const deniedOrIncident = auditRows.filter((row) => /denied|negad|incident/i.test(normalize([row.action, row.target].join(' ')))).length;
  return {
    tempoCiencia: {
      value: councilHours.length ? formatHours(average(councilHours)) : 'Pendente',
      detail: councilHours.length ? `${councilHours.length} protocolo(s) com ciencia registrada.` : 'Aguardando evento de ciencia do Conselho.'
    },
    tempoAceite: {
      value: acceptHours.length ? formatHours(average(acceptHours)) : 'Pendente',
      detail: acceptHours.length ? `${acceptHours.length} encaminhamento(s) com aceite.` : 'Aguardando aceite de servico de destino.'
    },
    pendenciasVencidas: {
      value: String(overdue),
      detail: `${forwards.length} encaminhamento(s) monitorado(s).`
    },
    devolucoes: {
      value: String(returns),
      detail: 'Recusas, devolucoes e redirecionamentos permanecem rastreaveis.'
    },
    continuidade: {
      value: protocols.length ? `${Math.round((completeTimeline / protocols.length) * 100)}%` : '0%',
      detail: `${completeTimeline} de ${protocols.length} protocolo(s) com mais de um evento.`
    },
    coberturaFluxo: {
      value: String(new Set(protocols.map((row) => row.originUnitId || row.entryPoint).filter(Boolean)).size),
      detail: 'Unidades ou portas com entrada registrada no periodo.'
    },
    registroOficial: {
      value: protocols.length ? `${Math.round((officialCount / protocols.length) * 100)}%` : '0%',
      detail: `${officialCount} protocolo(s) com situacao SINAN/SIPIA informada.`
    },
    usoSistema: {
      value: String(activeUsers),
      detail: `${auditRows.length} acao(oes) registradas e ${notifications.length} alerta(s) interno(s).`
    },
    qualidadeDados: {
      value: String(incomplete),
      detail: 'Protocolos com campos minimos incompletos.'
    },
    seguranca: {
      value: String(deniedOrIncident),
      detail: 'Tentativas negadas ou incidentes registrados na auditoria.'
    }
  };
}

export function breakdownPanel(title, counts) {
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return `<section class="legacy-panel breakdown-panel">
    <h2>${esc(title)}</h2>
    ${rows.length ? rows.map(([label, value]) => `<article data-search-row="${escAttr(label)}"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`).join('') : dashedEmpty('Sem dados cadastrados.')}
  </section>`;
}

export function moduleCard([icon, title, text, tag]) {
  return `<article class="module-card" data-search-row="${escAttr(title + ' ' + text + ' ' + tag)}">
    <i data-lucide="${icon}"></i>
    <span>${esc(tag)}</span>
    <strong>${esc(title)}</strong>
    <p>${esc(text)}</p>
  </article>`;
}
