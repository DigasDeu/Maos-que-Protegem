
// Configuração institucional, usuários, unidades e regras administráveis.
export const entryGatewayOptions = [
  'UBSI/CASAI/DSEI', 'UBS', 'Hospital', 'CRAS', 'Policia Civil',
  'Escolas municipais', 'Escolas estaduais', 'IFAM', 'Secretaria de Esporte e Lazer'
];

export const institutionTypeOptions = [
  'Saude', 'Assistencia Social', 'Educacao', 'Seguranca Publica',
  'Conselho Tutelar', 'Sistema de Justica', 'Gestao', 'Outro'
];

export const serviceTypeOptions = [
  'UBSI/CASAI/DSEI', 'UBS', 'Hospital', 'CRAS', 'CREAS', 'Policia Civil',
  'Escola Municipal', 'Escola Estadual', 'IFAM', 'SAMIC', 'Conselho Tutelar',
  'DIP', 'SAVVIS', 'Ministerio Publico', 'Outro'
];

export const flowParticipationOptions = [
  ['canBeEntryPoint', 'Pode ser porta de entrada'],
  ['canReceiveForward', 'Pode receber encaminhamento'],
  ['canTriggerCouncil', 'Pode acionar Conselho Tutelar'],
  ['canRegisterSinan', 'Pode registrar SINAN'],
  ['canRegisterSipiaReference', 'Pode registrar referencia SIPIA'],
  ['canReceiveSamicCases', 'Pode receber casos do SAMIC']
];

export const defaultSystemConfig = Object.freeze({
  samic: {
    start: '08:00',
    end: '17:00',
    weekdays: [1, 2, 3, 4, 5],
    responsible: '',
    contact: '',
    exceptions: '',
    offHoursRoute: 'Rede de protecao e hospital/SAVVIS'
  },
  deadlines: { cienciaConselhoHoras: 2, aceiteEncaminhamentoHoras: 24, devolutivaDias: 7 },
  minGroupSize: 3,
  retentionPolicy: 'Uso operacional com dados minimizados, acesso por perfil e auditoria.'
});

// --- Camada de interface migrada do sistema existente ---
let RPM, activateProfile, activateSamicFlow, appendTimeline, applySearch, auditProtocolRead, authCard, average, bindActions, bindEntry, bindModalActions, bindShell, boot, breakdownPanel, buildProtocol, canCouncilContinue, canForwardContinue, canManage, canNotify, canViewCase, canViewStats, caseCard, caseGrid, checklist, clearEntryTimers, closeModal, closeProtocol, closurePanel, commandBoard, compactCase, confirmCouncilAwareness, copyFor, council, councilFollowupPanel, countBy, createLocalPendingAccess, csvCell, currentUser, dashboard, dashboardData, dashedEmpty, deadlineBadge, destinationName, emptyRoute, entrySequence, entryShell, esc, escAttr, estimateSpark, findForward, findProtocol, findUserByEmail, finishEntrySequence, flowSteps, formatDate, formatDuration, formatHours, forwardActionButtons, forwardDestinationOptions, forwardOperationsTable, forwards, friendlyAuthError, getUsers, groupedNav, guardAction, handleActionError, handleGoogleLogin, handleLogin, handleRecoverPassword, handleRegister, handoffCard, healthEntryAlert, hoursBetween, initials, isClosed, isHealthEntry, isOccurrenceRoute, isSamicOpen, knowledge, labelFor, lastDaysCount, list, liveClock, liveUsersPanel, loginCard, markNotificationRead, mergeRemoteProfiles, metric, metrics, mobileBottomNav, mobileRoutesForPackShell, modalShell, moduleCard, municipalFlowCounts, municipalFlowPanel, navButton, navForRole, navItems, navSignal, navigate, nextDeadline, normalize, normalizeAppState, normalizeEmail, notificationItem, notificationModal, notifications, occurrenceDetails, officialOptions, officialRecordsPanel, officialSummary, openModal, opsTable, pendingAccessCard, persistProtocol, priorityBadge, projectIndicatorGrid, projectIndicatorValues, protocolForm, protocolModal, protocolOperationsTable, protocolRisk, protocolStateCode, protocolStateLabel, protocolStateStage, protocolStateStages, protocolStates, protocolTable, protocolTimeline, protocols, quickAction, quickActionsPanel, registerCard, render, renderEntry, renderFailure, reopenProtocol, reports, restoreRemoteSession, roles, routeCopy, routeGroups, routeLoading, rpmPublicContract, samic, samicDecisionPanel, samicStatusCard, saveCouncilFollowup, saveForward, saveNotification, saveOfficialRecords, saveSamicDecision, scheduleRender, securityPanel, selectUser, shell, sparkPanel, sparkStore, stageBoard, startEntrySequence, startRemoteProfileSync, state, statusBadge, syncUserProfile, table, textOnly, thisMonthCount, timeoutPromise, titleFor, toast, todayCount, training, unitName, unitOptions, updateForwardStatus, view, weekdayName, withProtocolState, workflowPanel;
export function initAdministracaoUI(runtime) {
  RPM = runtime.RPM;
  activateProfile = runtime.activateProfile;
  activateSamicFlow = runtime.activateSamicFlow;
  appendTimeline = runtime.appendTimeline;
  applySearch = runtime.applySearch;
  auditProtocolRead = runtime.auditProtocolRead;
  authCard = runtime.authCard;
  average = runtime.average;
  bindActions = runtime.bindActions;
  bindEntry = runtime.bindEntry;
  bindModalActions = runtime.bindModalActions;
  bindShell = runtime.bindShell;
  boot = runtime.boot;
  breakdownPanel = runtime.breakdownPanel;
  buildProtocol = runtime.buildProtocol;
  canCouncilContinue = runtime.canCouncilContinue;
  canForwardContinue = runtime.canForwardContinue;
  canManage = runtime.canManage;
  canNotify = runtime.canNotify;
  canViewCase = runtime.canViewCase;
  canViewStats = runtime.canViewStats;
  caseCard = runtime.caseCard;
  caseGrid = runtime.caseGrid;
  checklist = runtime.checklist;
  clearEntryTimers = runtime.clearEntryTimers;
  closeModal = runtime.closeModal;
  closeProtocol = runtime.closeProtocol;
  closurePanel = runtime.closurePanel;
  commandBoard = runtime.commandBoard;
  compactCase = runtime.compactCase;
  confirmCouncilAwareness = runtime.confirmCouncilAwareness;
  copyFor = runtime.copyFor;
  council = runtime.council;
  councilFollowupPanel = runtime.councilFollowupPanel;
  countBy = runtime.countBy;
  createLocalPendingAccess = runtime.createLocalPendingAccess;
  csvCell = runtime.csvCell;
  currentUser = runtime.currentUser;
  dashboard = runtime.dashboard;
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
  findForward = runtime.findForward;
  findProtocol = runtime.findProtocol;
  findUserByEmail = runtime.findUserByEmail;
  finishEntrySequence = runtime.finishEntrySequence;
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
  groupedNav = runtime.groupedNav;
  guardAction = runtime.guardAction;
  handleActionError = runtime.handleActionError;
  handleGoogleLogin = runtime.handleGoogleLogin;
  handleLogin = runtime.handleLogin;
  handleRecoverPassword = runtime.handleRecoverPassword;
  handleRegister = runtime.handleRegister;
  handoffCard = runtime.handoffCard;
  healthEntryAlert = runtime.healthEntryAlert;
  hoursBetween = runtime.hoursBetween;
  initials = runtime.initials;
  isClosed = runtime.isClosed;
  isHealthEntry = runtime.isHealthEntry;
  isOccurrenceRoute = runtime.isOccurrenceRoute;
  isSamicOpen = runtime.isSamicOpen;
  knowledge = runtime.knowledge;
  labelFor = runtime.labelFor;
  lastDaysCount = runtime.lastDaysCount;
  list = runtime.list;
  liveClock = runtime.liveClock;
  liveUsersPanel = runtime.liveUsersPanel;
  loginCard = runtime.loginCard;
  markNotificationRead = runtime.markNotificationRead;
  mergeRemoteProfiles = runtime.mergeRemoteProfiles;
  metric = runtime.metric;
  metrics = runtime.metrics;
  mobileBottomNav = runtime.mobileBottomNav;
  mobileRoutesForPackShell = runtime.mobileRoutesForPackShell;
  modalShell = runtime.modalShell;
  moduleCard = runtime.moduleCard;
  municipalFlowCounts = runtime.municipalFlowCounts;
  municipalFlowPanel = runtime.municipalFlowPanel;
  navButton = runtime.navButton;
  navForRole = runtime.navForRole;
  navItems = runtime.navItems;
  navSignal = runtime.navSignal;
  navigate = runtime.navigate;
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
  projectIndicatorGrid = runtime.projectIndicatorGrid;
  projectIndicatorValues = runtime.projectIndicatorValues;
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
  reports = runtime.reports;
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
  scheduleRender = runtime.scheduleRender;
  securityPanel = runtime.securityPanel;
  selectUser = runtime.selectUser;
  shell = runtime.shell;
  sparkPanel = runtime.sparkPanel;
  sparkStore = runtime.sparkStore;
  stageBoard = runtime.stageBoard;
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
  training = runtime.training;
  unitName = runtime.unitName;
  unitOptions = runtime.unitOptions;
  updateForwardStatus = runtime.updateForwardStatus;
  view = runtime.view;
  weekdayName = runtime.weekdayName;
  withProtocolState = runtime.withProtocolState;
  workflowPanel = runtime.workflowPanel;
}

export async function network() {
  const units = await list('units');
  return `
    <section class="legacy-panel">
      <div class="legacy-panel-header">
        <div><h2>Rede de Atendimento</h2><p>Cadastro das portas de entrada, unidades de origem, contatos institucionais e mapeamento.</p></div>
        <button class="button primary" data-action="open-unit-modal"><i data-lucide="map-pin"></i><span>Nova unidade</span></button>
      </div>
      ${unitOperationsGrid(units)}
    </section>`;
}

export async function management() {
  const { protocols, forwards, notifications } = await dashboardData();
  const estimate = estimateSpark(protocols, forwards, notifications);
  return `<div class="management-layout">
    <section class="legacy-panel legacy-panel-wide">
      <div class="legacy-panel-header"><div><h2>Gestao operacional</h2><p>Alinhamento, faturamento operacional, contingencia e atividades reais.</p></div></div>
      <div class="management-grid">
        ${[
          ['briefcase-business', 'Alinhamento intersetorial', protocols.length + ' protocolos acompanhados pela rede municipal.'],
          ['calculator', 'Faturamento operacional', estimate.projectedReads + ' leituras/dia estimadas e controle de producao sem recurso pago.'],
          ['activity', 'Atividades reais', (state.data.audit || []).length + ' registros na trilha de auditoria local.'],
          ['wifi-off', 'Contingencia', 'Fila local preparada para queda de conexao e retomada segura.']
        ].map(managementCard).join('')}
      </div>
    </section>
    <aside class="ops-side-stack">
      ${liveUsersPanel(await list('users'))}
      ${activityPanel()}
    </aside>
  </div>`;
}

export async function audit() {
  const rows = await list('audit', { limit: 50 });
  return `<section class="legacy-panel">
    <div class="legacy-panel-header"><div><h2>Relatorio de Auditoria</h2><p>Consultas e acoes relevantes registradas para o administrador.</p></div></div>
    ${auditTrailList(rows)}
  </section>`;
}

export function contingency() {
  return `<section class="playbook-grid">
    ${[
      ['wifi-off', 'Sem conexao', 'Formulario local minimizado ate o retorno da rede.'],
      ['shield-check', 'Dados restritos', 'Nenhum anexo ou narrativa sensivel fora do perfil autorizado.'],
      ['refresh-cw', 'Retomada', 'Equipe revisa a fila local antes de sincronizar no Supabase.'],
      ['list-checks', 'Atividades reais', 'Plantao acompanha notificacoes, encaminhamentos, Conselho e SAMIC.'],
      ['radio', 'Tempo real', 'A tela reflete alteracoes locais e esta pronta para realtime do Supabase.'],
      ['hard-drive-download', 'Backup operacional', 'Exportacao agregada para relatorio, sem expor dados sensiveis.']
    ].map(([icon, title, text]) => `
      <article class="playbook-card"><i data-lucide="${icon}"></i><strong>${title}</strong><p>${text}</p></article>`).join('')}
  </section>`;
}

export async function users() {
  if (!canManage(state.user.role)) {
    return `<section class="empty-state"><i data-lucide="lock"></i><strong>Somente administrador</strong><p>Perfil atual nao libera usuarios.</p></section>`;
  }
  const rows = await list('users');
  return `
    <section class="legacy-panel">
      <div class="legacy-panel-header">
        <div><h2>Usuarios</h2><p>Liberacao em tempo real de perfis e unidades para contas criadas no sistema.</p></div>
        <span class="status-badge success">Tempo real ativo</span>
      </div>
      ${userOperationsTable(rows)}
    </section>`;
}

export function settings() {
  const config = state.data.system?.config || defaultSystemConfig;
  return `<div class="settings-grid">
    <section class="legacy-panel">
      <div class="legacy-panel-header"><div><h2>Configuracoes do Fluxo</h2><p>Prazos, SAMIC e politica operacional.</p></div></div>
      ${flowSettingsForm(config)}
    </section>
    <section class="legacy-panel">
      <div class="legacy-panel-header"><div><h2>Governanca</h2></div></div>
      ${governanceList()}
    </section>
  </div>`;
}

export function help() {
  return `<section class="legacy-panel help-document">
    <div class="legacy-panel-header"><div><h2>Ajuda</h2><p>Operacao atual, privacidade, perfis de acesso e trilha de auditoria.</p></div></div>
    <div class="help-columns">
      <article><strong>Operacao atual</strong><p>O sistema usa autenticacao segura no ambiente publicado e mantem adaptador local apenas para teste no VS Code. A liberacao de perfil e unidade fica centralizada no administrador tecnico.</p></article>
      <article><strong>Usuarios</strong><p>Novos acessos ficam pendentes ate liberacao de perfil e unidade pelo administrador. A liberacao reflete automaticamente na tela de usuario.</p></article>
      <article><strong>Privacidade</strong><p>Dados identificadores ficam restritos por perfil. Relatorios usam indicadores agregados e nao exibem narrativa sensivel.</p></article>
      <article><strong>Auditoria</strong><p>Consultas, configuracoes e acoes relevantes aparecem na trilha de auditoria disponivel ao administrador.</p></article>
    </div>
    <h3>Perfis de acesso</h3>
    ${[
      ['Administrador institucional', 'Configura unidades, usuarios, perfis, horarios, regras e indicadores. Nao deve acessar narrativa sensivel por padrao.'],
      ['Porta de entrada', 'Abre protocolo, registra dados minimos, urgencia e primeiro encaminhamento. Visualiza apenas casos da propria unidade.'],
      ['Vigilancia em saude', 'Acompanha situacao da notificacao SINAN e indicadores epidemiologicos conforme competencia.'],
      ['Conselho Tutelar', 'Confirma recebimento, registra medidas, situacao SIPIA, acionamento SAMIC e encaminhamentos.'],
      ['SAMIC', 'Recebe casos, registra disponibilidade, decisao, atendimento, retorno e encaminhamentos.'],
      ['Servico da rede', 'Confirma recebimento, agenda ou realiza atendimento e informa conclusao ou necessidade de retorno.'],
      ['Gestor/Auditor', 'Acessa indicadores agregados e trilhas de auditoria, sem exposicao desnecessaria de dados individuais.']
    ].map(([title, text]) => `<article class="profile-help"><strong>${esc(title)}</strong><p>${esc(text)}</p></article>`).join('')}
    <h3>Trilha de auditoria</h3>
    ${auditTrailList((state.data.audit || []).slice(-5))}
  </section>`;
}

export function userOperationsTable(rows) {
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Nome</th><th>E-mail</th><th>Solicitacao</th><th>Perfil</th><th>Unidade</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map((user) => `<tr data-search-row="${escAttr([user.name, user.email, user.requestedUnit, roles[user.role], user.unitId].join(' '))}">
      <td>${esc(user.name)}</td>
      <td>${esc(user.email)}</td>
      <td>${esc(user.requestedUnit || 'Nao informado')}</td>
      <td>${esc(roles[user.role] || user.role)}</td>
      <td>${esc(unitName(user.unitId))}</td>
      <td>${statusBadge(user.active ? 'Ativo' : 'Aguardando liberacao')}</td>
      <td><button class="button ghost" data-action="open-user-modal" data-user-id="${escAttr(user.id)}"><i data-lucide="pencil"></i><span>Editar</span></button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

export function unitOperationsGrid(units) {
  if (!units.length) return dashedEmpty('Nenhuma unidade cadastrada.');
  return `<section class="unit-grid compact-units">
    ${units.map((unit) => `<article class="unit-card" data-search-row="${escAttr([unit.acronym, unit.name, unit.entryType, unit.serviceType, unit.institutionType, unit.sector, unit.email, unit.phone].join(' '))}">
      <span>${esc(unit.acronym || initials(unit.name))}</span>
      <strong>${esc(unit.name)}</strong>
      <small>${esc(unit.serviceType || unit.entryType || unit.type || 'Servico')} / ${esc(unit.institutionType || unit.sector || 'setor a definir')}</small>
      <p>${esc(unit.address || 'Endereco a definir')}</p>
      <div class="case-bottom"><em>${esc(unit.phone || unit.email || 'Contato institucional')}</em><button class="button ghost" data-action="open-unit-modal" data-unit-id="${escAttr(unit.id)}"><i data-lucide="pencil"></i><span>Editar</span></button></div>
    </article>`).join('')}
  </section>`;
}

export function activityPanel() {
  const rows = [...(state.data.audit || [])].slice(-5).reverse();
  return `<section class="legacy-panel activity-panel">
    <h2>Atividades reais</h2>
    ${rows.length ? rows.map((row) => `<article class="activity-row" data-search-row="${escAttr([row.action, row.target, row.actorId].join(' '))}">
      <span></span><div><strong>${esc(row.action)}</strong><small>${esc(formatDate(row.at))} - ${esc(row.actorId)}</small></div>
    </article>`).join('') : dashedEmpty('Nenhuma atividade registrada.')}
  </section>`;
}

export function managementCard([icon, title, text]) {
  return `<article class="management-card" data-search-row="${escAttr(title + ' ' + text)}">
    <i data-lucide="${icon}"></i>
    <strong>${esc(title)}</strong>
    <p>${esc(text)}</p>
  </article>`;
}

export function flowSettingsForm(config) {
  return `<form class="form-grid settings-form" id="settings-form">
    <div class="form-row three">
      <label class="field"><span>Inicio SAMIC</span><input name="samicStart" type="time" value="${escAttr(config.samic?.start || '08:00')}"></label>
      <label class="field"><span>Fim SAMIC</span><input name="samicEnd" type="time" value="${escAttr(config.samic?.end || '17:00')}"></label>
      <label class="field"><span>Confirmacao Conselho (h)</span><input name="councilHours" type="number" value="${escAttr(config.deadlines?.cienciaConselhoHoras || 2)}"></label>
    </div>
    <div class="form-row three">
      <label class="field"><span>Responsavel SAMIC</span><input name="samicResponsible" value="${escAttr(config.samic?.responsible || '')}" placeholder="Nome ou equipe responsavel"></label>
      <label class="field"><span>Contato SAMIC</span><input name="samicContact" value="${escAttr(config.samic?.contact || '')}" placeholder="Telefone, e-mail ou ramal"></label>
      <label class="field"><span>Feriados/excecoes</span><input name="samicExceptions" value="${escAttr(config.samic?.exceptions || '')}" placeholder="AAAA-MM-DD, separados por virgula"></label>
    </div>
    <label class="field"><span>Orientacao fora do horario</span><textarea name="samicOffHoursRoute">${esc(config.samic?.offHoursRoute || 'Rede de protecao e hospital/SAVVIS')}</textarea></label>
    <div class="form-row three">
      <label class="field"><span>Aceite encaminhamento (h)</span><input name="acceptHours" type="number" value="${escAttr(config.deadlines?.aceiteEncaminhamentoHoras || 24)}"></label>
      <label class="field"><span>Devolutiva (dias)</span><input name="returnDays" type="number" value="${escAttr(config.deadlines?.devolutivaDias || 7)}"></label>
      <label class="field"><span>Grupo minimo indicador</span><input name="minGroupSize" type="number" value="${escAttr(config.minGroupSize || 3)}"></label>
    </div>
    <label class="field"><span>Politica de retencao</span><textarea name="retentionPolicy">${esc(config.retentionPolicy || '')}</textarea></label>
    <button class="button primary"><i data-lucide="save"></i><span>Salvar configuracoes</span></button>
  </form>`;
}

export function governanceList() {
  return `<div class="governance-list">
    ${[
      'Autenticacao segura obrigatoria',
      'Menor privilegio por perfil e unidade',
      'Usuarios sincronizados no Supabase',
      'Notificacoes sem nome, relato, endereco ou diagnostico',
      'Auditoria de acesso, alteracao, exportacao e tentativa negada',
      'Indicadores agregados com grupo minimo',
      'Plano de contingencia para queda de conexao',
      'Piloto real somente apos autorizacao institucional'
    ].map((item) => `<article><strong>${esc(item)}</strong><span class="status-badge success">Ativo</span></article>`).join('')}
  </div>`;
}

export function auditTrailList(rows) {
  if (!rows.length) return dashedEmpty('Nenhuma acao registrada.');
  return `<div class="audit-list">${rows.slice().reverse().map((row) => `<article class="audit-row" data-search-row="${escAttr([row.action, row.target, row.actorId].join(' '))}">
    <strong>${esc(row.action)}</strong>
    <p>${esc(formatDate(row.at))} - ${esc(row.actorId)} - ${esc(row.target)}</p>
  </article>`).join('')}</div>`;
}

export function unitModal(unitId) {
  const unit = (state.data.units || []).find((item) => item.id === unitId) || {};
  return `<form id="unit-form" data-unit-id="${escAttr(unit.id || '')}">
    <div class="modal-head"><h2>${unit.id ? 'Editar unidade' : 'Nova unidade'}</h2><button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar"><i data-lucide="x"></i></button></div>
    <div class="form-row three">
      <label class="field"><span>Nome da unidade</span><input name="name" value="${escAttr(unit.name || '')}" required></label>
      <label class="field"><span>Tipo de instituicao</span><select name="institutionType">${institutionTypeOptions.map((option) => `<option value="${escAttr(option)}"${(unit.institutionType || unit.sector) === option ? ' selected' : ''}>${esc(option)}</option>`).join('')}</select></label>
      <label class="field"><span>Tipo de servico</span><select name="serviceType">${serviceTypeOptions.map((option) => `<option value="${escAttr(option)}"${(unit.serviceType || unit.entryType || unit.type) === option ? ' selected' : ''}>${esc(option)}</option>`).join('')}</select></label>
    </div>
    <section class="unit-flow-checks">
      ${flowParticipationOptions.map(([key, label]) => `<label><input type="checkbox" name="${escAttr(key)}" value="true"${unit.participation?.[key] ? ' checked' : ''}> <span>${esc(label)}</span></label>`).join('')}
    </section>
    <label class="field"><span>Endereco</span><input name="address" value="${escAttr(unit.address || '')}" placeholder="Rua, bairro, comunidade ou ponto de referencia"></label>
    <div class="form-row three"><label class="field"><span>Latitude</span><input name="latitude" value="${escAttr(unit.latitude || '')}" placeholder="-3.383..."></label><label class="field"><span>Longitude</span><input name="longitude" value="${escAttr(unit.longitude || '')}" placeholder="-57.718..."></label><label class="field"><span>Link do mapa</span><input name="mapLink" value="${escAttr(unit.mapLink || '')}" placeholder="Google Maps ou outro mapa"></label></div>
    <div class="form-row three"><label class="field"><span>E-mail</span><input name="email" value="${escAttr(unit.email || '')}"></label><label class="field"><span>Telefone</span><input name="phone" value="${escAttr(unit.phone || '')}"></label><label class="field"><span>Status</span><select name="active"><option value="true"${unit.active !== false ? ' selected' : ''}>Ativo</option><option value="false"${unit.active === false ? ' selected' : ''}>Inativo</option></select></label></div>
    <div class="form-row three">
      <label class="field"><span>Funcionamento</span><input name="workingDays" value="${escAttr(unit.workingDays || 'Segunda a sexta')}"></label>
      <label class="field"><span>Horario</span><input name="workingHours" value="${escAttr(unit.workingHours || '08:00 - 17:00')}"></label>
      <label class="field"><span>Responsavel institucional</span><input name="responsible" value="${escAttr(unit.responsible || '')}"></label>
    </div>
    <div class="form-row">
      <label class="field"><span>Contato alternativo</span><input name="alternateContact" value="${escAttr(unit.alternateContact || '')}"></label>
      <label class="field"><span>Orientacao fora do horario</span><input name="offHoursGuidance" value="${escAttr(unit.offHoursGuidance || '')}"></label>
    </div>
    <label class="field"><span>Observacoes</span><textarea name="notes" placeholder="Referencia de chegada, plantao, observacao institucional...">${esc(unit.notes || '')}</textarea></label>
    <div class="modal-actions"><button class="button primary"><i data-lucide="save"></i><span>Salvar unidade</span></button><button type="button" class="button" data-action="capture-location"><i data-lucide="crosshair"></i><span>Usar minha localizacao atual</span></button><button type="button" class="button" data-action="close-modal">Cancelar</button></div>
  </form>`;
}

export function userModal(userId) {
  const user = (state.data.users || []).find((item) => item.id === userId) || state.user;
  return `<form id="user-form" data-user-id="${escAttr(user.id)}">
    <div class="modal-head"><h2>Editar usuario</h2><button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar"><i data-lucide="x"></i></button></div>
    <label class="field"><span>Nome</span><input name="name" value="${escAttr(user.name || '')}"></label>
    <label class="field"><span>E-mail</span><input value="${escAttr(user.email || '')}" disabled></label>
    <div class="approval-callout">
      <strong>Solicitacao de acesso</strong>
      <span>${esc(user.requestedUnit || 'Sem unidade informada')}</span>
    </div>
    <div class="form-row three">
      <label class="field"><span>Perfil</span><select name="role">${Object.entries(roles).map(([id, label]) => `<option value="${escAttr(id)}"${user.role === id ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select></label>
      <label class="field"><span>Unidade</span><select name="unitId">${unitOptions(user.unitId)}</select></label>
      <label class="field"><span>Status</span><select name="active"><option value="true"${user.active !== false ? ' selected' : ''}>Ativo</option><option value="false"${user.active === false ? ' selected' : ''}>Aguardando liberacao</option></select></label>
    </div>
    <div class="modal-actions"><button class="button primary"><i data-lucide="save"></i><span>Salvar usuario</span></button><button type="button" class="button" data-action="close-modal">Cancelar</button></div>
  </form>`;
}

export async function saveUnit(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const id = event.currentTarget.dataset.unitId || crypto.randomUUID();
  const participation = Object.fromEntries(flowParticipationOptions.map(([key]) => [key, form[key] === 'true']));
  const payload = {
    id,
    name: form.name || 'Unidade sem nome',
    acronym: initials(form.name || 'UN'),
    sector: form.institutionType,
    institutionType: form.institutionType,
    serviceType: form.serviceType,
    entryType: form.serviceType,
    type: form.serviceType,
    participation,
    serviceLevel: form.institutionType || 'operacional',
    address: form.address,
    latitude: form.latitude,
    longitude: form.longitude,
    mapLink: form.mapLink,
    email: form.email,
    phone: form.phone,
    workingDays: form.workingDays,
    workingHours: form.workingHours,
    responsible: form.responsible,
    alternateContact: form.alternateContact,
    offHoursGuidance: form.offHoursGuidance,
    active: form.active === 'true',
    notes: form.notes,
    sparkQueryGroup: 'standard'
  };
  await sparkStore.collection('unidades').doc(id).set(payload, { merge: true });
  await auditAction('unit.update', payload.name);
  state.modal = null;
  toast('Unidade salva na rede.');
  navigate('network');
}

export async function saveUser(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const id = event.currentTarget.dataset.userId;
  const current = (state.data.users || []).find((user) => user.id === id) || {};
  const active = form.active === 'true' && form.role !== 'pending';
  const payload = {
    ...current,
    id,
    name: form.name,
    role: form.role,
    unitId: form.unitId,
    active,
    liberation: active ? 'liberado' : 'pendente',
    updatedAt: new Date().toISOString()
  };
  await sparkStore.collection('usuarios').doc(id).set(payload, { merge: true });
  try {
    await saveRemoteUserProfile(payload);
  } catch (error) {
    console.warn('[auth] Nao foi possivel sincronizar usuario remoto.', error);
  }
  await auditAction('user.update', payload.email || payload.name);
  state.modal = null;
  toast('Usuario atualizado em tempo real.');
  navigate('users');
}

export async function saveSettings(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const storeState = normalizeAppState(sparkStore.readState());
  storeState.system = {
    ...storeState.system,
    config: {
      samic: {
        start: form.samicStart,
        end: form.samicEnd,
        weekdays: [1, 2, 3, 4, 5],
        responsible: form.samicResponsible || '',
        contact: form.samicContact || '',
        exceptions: form.samicExceptions || '',
        offHoursRoute: form.samicOffHoursRoute || 'Rede de protecao e hospital/SAVVIS'
      },
      deadlines: {
        cienciaConselhoHoras: Number(form.councilHours || 2),
        aceiteEncaminhamentoHoras: Number(form.acceptHours || 24),
        devolutivaDias: Number(form.returnDays || 7)
      },
      minGroupSize: Number(form.minGroupSize || 3),
      retentionPolicy: form.retentionPolicy
    }
  };
  sparkStore.writeState(storeState);
  await sparkStore.collection('configuracoes').doc('config').set({ id: 'config', config: storeState.system.config }, { merge: true });
  await auditAction('settings.update', 'configuracoes');
  toast('Configuracoes salvas.');
}

export async function auditAction(action, target) {
  const id = crypto.randomUUID();
  try {
    await sparkStore.collection('auditoria').doc(id).set({ id, actorId: state.user.id, action, target, at: new Date().toISOString() });
  } catch (error) {
    console.warn('[audit] registro ignorado para manter a operacao ativa.', error);
  }
}

export function exportCsv() {
  const rows = state.data.protocols || [];
  const header = ['protocolo', 'origem', 'porta_entrada', 'prioridade', 'status', 'tipo', 'faixa_etaria'];
  const body = rows.map((row) => [
    row.number,
    unitName(row.originUnitId),
    row.entryPoint,
    row.priority,
    row.status,
    row.violenceType,
    row.ageRange
  ]);
  const csv = [header, ...body].map((line) => line.map(csvCell).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rede-protege-relatorio.csv';
  link.click();
  URL.revokeObjectURL(url);
  toast('CSV agregado exportado.');
}
