
// Tipos de notificações internas. Não usar este módulo como substituto de SINAN/SIPIA.
export const notificationTypes = Object.freeze({
  NOVO_PROTOCOLO: 'NOVO_PROTOCOLO',
  CONSELHO_PENDENTE: 'CONSELHO_PENDENTE',
  SAMIC_ACIONADO: 'SAMIC_ACIONADO',
  PRAZO_PROXIMO: 'PRAZO_PROXIMO',
  PRAZO_VENCIDO: 'PRAZO_VENCIDO',
  ENCAMINHAMENTO_RECEBIDO: 'ENCAMINHAMENTO_RECEBIDO',
  ENCAMINHAMENTO_ACEITO: 'ENCAMINHAMENTO_ACEITO',
  ENCAMINHAMENTO_DEVOLVIDO: 'ENCAMINHAMENTO_DEVOLVIDO',
  DEVOLUTIVA_RECEBIDA: 'DEVOLUTIVA_RECEBIDA',
  PROTOCOLO_CONCLUIDO: 'PROTOCOLO_CONCLUIDO'
});

export function unreadCount(items = []) {
  return items.filter((item) => !item.read).length;
}

// --- Camada de interface migrada do sistema existente ---
let RPM, activateProfile, activateSamicFlow, activityPanel, appendTimeline, applySearch, audit, auditAction, auditProtocolRead, auditTrailList, authCard, average, bindActions, bindEntry, bindModalActions, bindShell, boot, breakdownPanel, buildProtocol, canCouncilContinue, canForwardContinue, canManage, canNotify, canViewCase, canViewStats, caseCard, caseGrid, checklist, clearEntryTimers, closeModal, closeProtocol, closurePanel, commandBoard, compactCase, confirmCouncilAwareness, contingency, copyFor, council, councilFollowupPanel, countBy, createLocalPendingAccess, csvCell, currentUser, dashboard, dashboardData, dashedEmpty, deadlineBadge, destinationName, emptyRoute, entrySequence, entryShell, esc, escAttr, estimateSpark, exportCsv, findForward, findProtocol, findUserByEmail, finishEntrySequence, flowSettingsForm, flowSteps, formatDate, formatDuration, formatHours, forwardActionButtons, forwardDestinationOptions, forwardOperationsTable, forwards, friendlyAuthError, getUsers, governanceList, groupedNav, guardAction, handleActionError, handleGoogleLogin, handleLogin, handleRecoverPassword, handleRegister, handoffCard, healthEntryAlert, help, hoursBetween, initials, isClosed, isHealthEntry, isOccurrenceRoute, isSamicOpen, knowledge, labelFor, lastDaysCount, list, liveClock, liveUsersPanel, loginCard, management, managementCard, mergeRemoteProfiles, metric, metrics, mobileBottomNav, mobileRoutesForPackShell, modalShell, moduleCard, municipalFlowCounts, municipalFlowPanel, navButton, navForRole, navItems, navSignal, navigate, network, nextDeadline, normalize, normalizeAppState, normalizeEmail, occurrenceDetails, officialOptions, officialRecordsPanel, officialSummary, openModal, opsTable, pendingAccessCard, persistProtocol, priorityBadge, projectIndicatorGrid, projectIndicatorValues, protocolForm, protocolModal, protocolOperationsTable, protocolRisk, protocolStateCode, protocolStateLabel, protocolStateStage, protocolStateStages, protocolStates, protocolTable, protocolTimeline, protocols, quickAction, quickActionsPanel, registerCard, render, renderEntry, renderFailure, reopenProtocol, reports, restoreRemoteSession, roles, routeCopy, routeGroups, routeLoading, rpmPublicContract, samic, samicDecisionPanel, samicStatusCard, saveCouncilFollowup, saveForward, saveNotification, saveOfficialRecords, saveSamicDecision, saveSettings, saveUnit, saveUser, scheduleRender, securityPanel, selectUser, settings, shell, sparkPanel, sparkStore, stageBoard, startEntrySequence, startRemoteProfileSync, state, statusBadge, syncUserProfile, table, textOnly, thisMonthCount, timeoutPromise, titleFor, toast, todayCount, training, unitModal, unitName, unitOperationsGrid, unitOptions, updateForwardStatus, userModal, userOperationsTable, users, view, weekdayName, withProtocolState, workflowPanel;
export function initNotificacoesUI(runtime) {
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
  contingency = runtime.contingency;
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
  handoffCard = runtime.handoffCard;
  healthEntryAlert = runtime.healthEntryAlert;
  help = runtime.help;
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
  management = runtime.management;
  managementCard = runtime.managementCard;
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
  network = runtime.network;
  nextDeadline = runtime.nextDeadline;
  normalize = runtime.normalize;
  normalizeAppState = runtime.normalizeAppState;
  normalizeEmail = runtime.normalizeEmail;
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
  saveSettings = runtime.saveSettings;
  saveUnit = runtime.saveUnit;
  saveUser = runtime.saveUser;
  scheduleRender = runtime.scheduleRender;
  securityPanel = runtime.securityPanel;
  selectUser = runtime.selectUser;
  settings = runtime.settings;
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
  workflowPanel = runtime.workflowPanel;
}

export async function notifications() {
  const items = (await list('notifications', { limit: 30 })).filter(canReadNotification);
  const unread = items.filter((item) => !item.read).length;
  return `<div class="ops-two-cols main-and-aside">
    <section class="legacy-panel">
      <div class="legacy-panel-header">
        <div>
          <h2>Fila de Notificacoes</h2>
          <p>Alertas internos sem narrativa sensivel fora do caso.</p>
        </div>
        <span class="status-badge success">${unread ? unread + ' pendente(s)' : 'Sem pendencias'}</span>
      </div>
      ${items.length ? `<div class="notification-list">${items.map(notificationItem).join('')}</div>` : dashedEmpty('Sem notificacoes para seu perfil.')}
    </section>
    <aside class="ops-side-stack">
      ${quickActionsPanel()}
      ${securityPanel()}
    </aside>
  </div>`;
}

export function notificationItem(item) {
  return `<article class="notice-card ${item.read ? '' : 'unread'}" data-search-row="${escAttr([item.title, item.message].join(' '))}">
    <div class="notice-icon"><i data-lucide="${item.read ? 'check' : 'bell-ring'}"></i></div>
    <div>
      <strong>${esc(item.title)}</strong>
      <p>${esc(item.message)}</p>
      <small>${esc(formatDate(item.createdAt))}</small>
      <div class="notice-actions">
        ${item.protocolId ? `<button class="button ghost" data-nav="${escAttr('protocol:' + item.protocolId)}"><i data-lucide="folder-open"></i><span>Solicitar abertura</span></button>` : ''}
        ${item.read ? '' : `<button class="button ghost" data-action="mark-notification-read" data-notification-id="${escAttr(item.id)}"><i data-lucide="check"></i><span>Marcar lida</span></button>`}
      </div>
    </div>
  </article>`;
}

function canReadNotification(item = {}) {
  const user = state.user || {};
  return item.userId === user.id
    || item.userId === user.unitId
    || item.targetRole === user.role
    || item.unitId === user.unitId
    || user.role === 'admin';
}

export function notificationModal() {
  return `<form id="notification-form">
    <div class="modal-head"><h2>Abrir protocolo</h2><button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar"><i data-lucide="x"></i></button></div>
    <section class="form-section-note">
      <strong>Registro minimo da porta de entrada</strong>
      <p>Use apenas informacoes necessarias para acionar a rede. A porta de entrada nao precisa investigar, concluir ou expor dados identificadores.</p>
    </section>
    <h3 class="form-block-title">Origem</h3>
    <div class="form-row">
      <label class="field"><span>Unidade de origem</span><select name="originUnitId" required>${unitOptions('', { registeredOnly: true })}</select><small>A porta de entrada e definida no cadastro da Rede de Atendimento.</small></label>
      <label class="field"><span>Usuario responsavel</span><input value="${escAttr(state.user.name)}" disabled></label>
    </div>
    <h3 class="form-block-title">Classificacao inicial</h3>
    <div class="form-row three">
      <label class="field"><span>Classificacao</span><select name="classification"><option>Suspeita</option><option>Confirmacao</option></select></label>
      <label class="field"><span>Prioridade</span><select name="priority"><option>Normal</option><option>Prioritaria</option><option>Critica</option></select></label>
      <label class="field"><span>Necessita protecao imediata?</span><select name="immediateProtection"><option>Nao informado</option><option>Sim</option><option>Nao</option></select></label>
    </div>
    <div class="static-field"><span>Tipo</span><strong>Violencia sexual</strong></div>
    <h3 class="form-block-title">Identificacao minima</h3>
    <div class="form-row">
      <label class="field"><span>Faixa etaria</span><select name="ageRange"><option>0 a 4</option><option>5 a 9</option><option>10 a 14</option><option>15 a 17</option></select></label>
      <label class="field"><span>Iniciais ou codigo</span><input name="initials" placeholder="Ex.: A.S. ou codigo interno"></label>
    </div>
    <label class="field compact-field"><span>Sexo, se validado pela rede</span><select name="sex"><option>Nao informado</option><option>Feminino</option><option>Masculino</option></select></label>
    <h3 class="form-block-title">Acionamento</h3>
    <div class="form-row">
      <label class="field"><span>Motivo do acionamento</span><select name="triggerReason"><option>Suspeita identificada</option><option>Confirmacao informada</option><option>Encaminhamento recebido</option><option>Situacao de urgencia</option><option>Outro</option></select></label>
      <label class="field"><span>Providencia imediata realizada</span><select name="immediateAction"><option>Conselho Tutelar acionado</option><option>Atendimento de saude</option><option>Protecao imediata</option><option>Responsavel institucional comunicado</option><option>Nenhuma ainda</option></select></label>
    </div>
    <label class="field"><span>Observacao minima</span><textarea name="minimalRecord" maxlength="500" placeholder="Informe somente o necessario para que o proximo servico compreenda a providencia necessaria. Nao registre investigacao, diagnostico, julgamento ou narrativa detalhada."></textarea><small>Limite: 500 caracteres.</small></label>
    <div class="modal-actions"><button class="button primary"><i data-lucide="save"></i><span>Gerar protocolo municipal</span></button><button type="button" class="button" data-action="close-modal">Cancelar</button></div>
  </form>`;
}

export async function markNotificationRead(notificationId) {
  const notification = (state.data.notifications || []).find((item) => item.id === notificationId);
  if (!notification) {
    toast('Notificacao nao encontrada.');
    return;
  }
  await sparkStore.collection('notificacoes').doc(notificationId).set({ ...notification, read: true }, { merge: true });
  await auditAction('notification.read', notification.title || notificationId);
  toast('Notificacao marcada como lida.');
  render();
}
