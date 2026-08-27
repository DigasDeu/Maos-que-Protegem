
// Regras e opções específicas de encaminhamentos.
export const defaultForwardDestinations = [
  ['hospital-savvis', 'Hospital/SAVVIS'],
  ['dip', 'DIP'],
  ['creas', 'CREAS'],
  ['ministerio-publico', 'Ministerio Publico'],
  ['ubs', 'UBS'],
  ['autoridade-policial', 'Autoridade policial'],
  ['rede-protecao', 'Rede de protecao']
];

export const workflowStageRoutes = Object.freeze({
  'encaminhar-conselho': {
    title: 'Encaminhar ao Conselho Tutelar',
    subtitle: 'Porta de entrada aciona o Conselho com protocolo, prioridade, prazo e registro minimo.',
    kind: 'protocol',
    stages: ['abertura', 'conselho'],
    fields: ['Protocolo', 'prioridade', 'prazo', 'unidade de origem', 'motivo codificado'],
    restricted: ['nome completo', 'endereco', 'relato detalhado', 'documentos'],
    actionLabel: 'Abrir protocolo'
  },
  'conselho-confirmar-ciencia': {
    title: 'Conselho - confirmar ciencia',
    subtitle: 'Registro de recebimento formal pelo Conselho Tutelar.',
    kind: 'protocol',
    stages: ['conselho'],
    fields: ['Protocolo', 'prioridade', 'prazo', 'origem', 'providencia imediata'],
    restricted: ['conteudo que nao seja necessario a esta decisao'],
    actionLabel: 'Confirmar ciencia'
  },
  'conselho-registro-sipia': {
    title: 'Conselho - registro SIPIA',
    subtitle: 'Controle administrativo do registro SIPIA conforme competencia do Conselho.',
    kind: 'protocol',
    stages: ['sipia', 'conselho'],
    fields: ['Protocolo', 'situacao SIPIA', 'numero SIPIA', 'data SIPIA'],
    restricted: ['narrativa integral fora do campo oficial necessario'],
    actionLabel: 'Registrar SIPIA'
  },
  'conselho-acionar-samic': {
    title: 'Conselho - acionar SAMIC',
    subtitle: 'Decisao do Conselho para acionar o SAMIC ou rota alternativa.',
    kind: 'protocol',
    stages: ['conselho', 'sipia'],
    fields: ['Protocolo', 'prioridade', 'status SAMIC', 'rota fora do horario'],
    restricted: ['dados nao exigidos para acionamento'],
    actionLabel: 'Acionar SAMIC'
  },
  'samic-confirmar-recebimento': {
    title: 'SAMIC - confirmar recebimento',
    subtitle: 'SAMIC visualiza somente casos formalmente direcionados para sua etapa.',
    kind: 'protocol',
    stages: ['samic'],
    fields: ['Protocolo', 'prioridade', 'prazo', 'acionamento'],
    restricted: ['dados alheios a decisao SAMIC'],
    actionLabel: 'Registrar recebimento'
  },
  'samic-tomada-de-decisao': {
    title: 'SAMIC - tomada de decisao',
    subtitle: 'Registro de disponibilidade, decisao operacional e devolutiva minima.',
    kind: 'protocol',
    stages: ['samic', 'decisao'],
    fields: ['Status SAMIC', 'decisao', 'rota fora do horario', 'devolutiva minima'],
    restricted: ['conteudo que nao sustente a decisao'],
    actionLabel: 'Salvar decisao'
  },
  'encaminhamento-ubs': destinationStage('UBS', 'ubs'),
  'encaminhamento-creas': destinationStage('CREAS', 'creas'),
  'encaminhamento-dip': destinationStage('DIP', 'dip'),
  'encaminhamento-ministerio-publico': destinationStage('Ministerio Publico', 'ministerio-publico'),
  'encaminhamento-hospital-savvis': destinationStage('Hospital/SAVVIS', 'hospital-savvis'),
  'encaminhamento-autoridade-policial': destinationStage('Autoridade policial', 'autoridade-policial'),
  'encaminhamento-devolutiva': {
    title: 'Encaminhamentos - devolutiva',
    subtitle: 'Registro de retorno do servico destinatario sem anexar conteudo desnecessario.',
    kind: 'forward',
    destination: '',
    fields: ['Protocolo', 'destino', 'status', 'devolutiva minima'],
    restricted: ['relato integral', 'documentos', 'endereco completo'],
    actionLabel: 'Registrar devolutiva'
  },
  'encaminhamento-concluir': {
    title: 'Encaminhamentos - concluir',
    subtitle: 'Conclusao administrativa da etapa quando nao houver pendencia aberta.',
    kind: 'forward',
    destination: '',
    fields: ['Protocolo', 'destino', 'status', 'justificativa de conclusao'],
    restricted: ['dados sensiveis nao usados na conclusao'],
    actionLabel: 'Concluir etapa'
  }
});

export const encaminhamentoStatus = Object.freeze({
  CRIADO: 'Criado',
  AGUARDANDO_ACEITE: 'Aguardando aceite',
  ACEITO: 'Aceito',
  DEVOLVIDO: 'Devolvido',
  REDIRECIONADO: 'Redirecionado',
  EM_ATENDIMENTO: 'Em atendimento',
  DEVOLUTIVA_PENDENTE: 'Devolutiva pendente',
  DEVOLUTIVA_REGISTRADA: 'Devolutiva registrada',
  CONCLUIDO: 'Concluido'
});

// --- Camada de interface migrada do sistema existente ---
let RPM, activateProfile, activateSamicFlow, activityPanel, appendTimeline, applySearch, audit, auditAction, auditProtocolRead, auditTrailList, authCard, average, bindActions, bindEntry, bindModalActions, bindShell, boot, breakdownPanel, buildProtocol, canCouncilContinue, canManage, canNotify, canViewCase, canViewStats, caseCard, caseGrid, checklist, clearEntryTimers, closeModal, closeProtocol, closurePanel, commandBoard, compactCase, confirmCouncilAwareness, contingency, copyFor, council, councilFollowupPanel, countBy, createLocalPendingAccess, csvCell, currentUser, dashboard, dashboardData, dashedEmpty, emptyRoute, entrySequence, entryShell, esc, escAttr, estimateSpark, exportCsv, findProtocol, findUserByEmail, finishEntrySequence, flowSettingsForm, flowSteps, formatDate, formatHours, friendlyAuthError, getUsers, governanceList, groupedNav, guardAction, handleActionError, handleGoogleLogin, handleLogin, handleRecoverPassword, handleRegister, handoffCard, healthEntryAlert, help, hoursBetween, initials, isClosed, isHealthEntry, isOccurrenceRoute, isSamicOpen, knowledge, labelFor, lastDaysCount, list, liveClock, liveUsersPanel, loginCard, management, managementCard, markNotificationRead, mergeRemoteProfiles, metric, metrics, mobileBottomNav, mobileRoutesForPackShell, modalShell, moduleCard, municipalFlowCounts, municipalFlowPanel, navButton, navForRole, navItems, navSignal, navigate, network, normalize, normalizeAppState, normalizeEmail, notificationItem, notificationModal, notifications, occurrenceDetails, officialOptions, officialRecordsPanel, officialSummary, openModal, opsTable, pendingAccessCard, persistProtocol, priorityBadge, projectIndicatorGrid, projectIndicatorValues, protocolForm, protocolModal, protocolOperationsTable, protocolRisk, protocolStateCode, protocolStateLabel, protocolStateStage, protocolStateStages, protocolStates, protocolTable, protocolTimeline, protocols, quickAction, quickActionsPanel, registerCard, render, renderEntry, renderFailure, reopenProtocol, reports, restoreRemoteSession, roles, routeCopy, routeGroups, routeLoading, rpmPublicContract, samic, samicDecisionPanel, samicStatusCard, saveCouncilFollowup, saveNotification, saveOfficialRecords, saveSamicDecision, saveSettings, saveUnit, saveUser, scheduleRender, securityPanel, selectUser, settings, shell, sparkPanel, sparkStore, stageBoard, startEntrySequence, startRemoteProfileSync, state, statusBadge, syncUserProfile, table, textOnly, thisMonthCount, timeoutPromise, titleFor, toast, todayCount, training, unitModal, unitName, unitOperationsGrid, unitOptions, userModal, userOperationsTable, users, view, weekdayName, withProtocolState, workflowPanel;
export function initEncaminhamentosUI(runtime) {
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
  emptyRoute = runtime.emptyRoute;
  entrySequence = runtime.entrySequence;
  entryShell = runtime.entryShell;
  esc = runtime.esc;
  escAttr = runtime.escAttr;
  estimateSpark = runtime.estimateSpark;
  exportCsv = runtime.exportCsv;
  findProtocol = runtime.findProtocol;
  findUserByEmail = runtime.findUserByEmail;
  finishEntrySequence = runtime.finishEntrySequence;
  flowSettingsForm = runtime.flowSettingsForm;
  flowSteps = runtime.flowSteps;
  formatDate = runtime.formatDate;
  formatHours = runtime.formatHours;
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
  network = runtime.network;
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
  userModal = runtime.userModal;
  userOperationsTable = runtime.userOperationsTable;
  users = runtime.users;
  view = runtime.view;
  weekdayName = runtime.weekdayName;
  withProtocolState = runtime.withProtocolState;
  workflowPanel = runtime.workflowPanel;
}

export async function forwards() {
  const rows = await list('forwards', { limit: 30 });
  return `
    <section class="legacy-panel">
      <div class="legacy-panel-header"><div><h2>Encaminhamentos</h2><p>Aceite, devolutiva, redirecionamento e conclusao por servico de destino.</p></div></div>
      ${forwardOperationsTable(rows)}
    </section>`;
}

export function isWorkflowStageRoute(routeId = '') {
  return Boolean(workflowStageRoutes[routeId]);
}

export function workflowStageCopy(routeId = '') {
  const stage = workflowStageRoutes[routeId];
  return stage ? [stage.title, stage.subtitle] : ['Etapa do fluxo', 'Tela operacional por competencia.'];
}

export async function workflowStagePage(routeId = '') {
  const stage = workflowStageRoutes[routeId];
  if (!stage) return '';
  const rows = stage.kind === 'forward'
    ? filterForwardsForStage(await list('forwards', { limit: 80 }), stage)
    : filterProtocolsForStage(await list('protocols', { limit: 80 }), stage);
  return `<div class="ops-two-cols main-and-aside">
    <section class="legacy-panel workflow-stage-panel">
      <div class="legacy-panel-header">
        <div>
          <h2>${esc(stage.title)}</h2>
          <p>${esc(stage.subtitle)}</p>
        </div>
        <span class="status-badge restricted"><i data-lucide="shield-check"></i> Por competencia</span>
      </div>
      ${stage.kind === 'forward' ? forwardOperationsTable(rows) : protocolOperationsTable(rows)}
    </section>
    <aside class="ops-side-stack">
      <section class="legacy-panel competence-card">
        <h2>Campos desta etapa</h2>
        ${checklist(stage.fields || [])}
      </section>
      <section class="legacy-panel competence-card restricted-card">
        <h2>Conteudo nao liberado</h2>
        ${checklist(stage.restricted || [])}
      </section>
      <section class="legacy-panel competence-card">
        <h2>Regra</h2>
        <p>Notificacao nao significa autorizacao de leitura. Esta tela lista apenas registros vinculados ao perfil, unidade, etapa ou encaminhamento atual.</p>
      </section>
    </aside>
  </div>`;
}

function filterProtocolsForStage(rows, stage) {
  return rows.filter((protocol) => {
    const currentStage = protocolStateStage(protocol);
    const stageMatch = !stage.stages?.length || stage.stages.includes(currentStage);
    const roleMatch = !stage.role || state.user.role === stage.role;
    const visibleRole = (protocol.visibleToRoles || []).includes(state.user.role);
    const visibleUnit = state.user.unitId && (protocol.visibleToUnits || []).includes(state.user.unitId);
    const directUnit = state.user.unitId && [protocol.originUnitId, protocol.currentUnitId].includes(state.user.unitId);
    const councilStage = state.user.role === 'conselho' && ['conselho', 'sipia'].includes(currentStage);
    const samicStage = state.user.role === 'samic' && ['samic', 'decisao'].includes(currentStage);
    const supervisor = state.user.role === 'supervisor_caso';
    return stageMatch && roleMatch && (visibleRole || visibleUnit || directUnit || councilStage || samicStage || supervisor);
  });
}

function filterForwardsForStage(rows, stage) {
  return rows.filter((forward) => {
    const destinationMatch = !stage.destination || normalize(forward.destinationUnitId || forward.destination).includes(normalize(stage.destination));
    const activeMatch = stage.title.includes('concluir') ? true : !isClosed(forward);
    const feedbackMatch = stage.title.includes('devolutiva') ? normalize(forward.status).includes('atendimento') || normalize(forward.status).includes('aceit') || normalize(forward.status).includes('devolutiva') : true;
    const unitMatch = !state.user.unitId || [forward.destinationUnitId, forward.originUnitId].includes(state.user.unitId) || (forward.visibleToUnits || []).includes(state.user.unitId);
    const roleMatch = (forward.visibleToRoles || []).includes(state.user.role) || ['supervisor_caso', 'conselho'].includes(state.user.role);
    return destinationMatch && activeMatch && feedbackMatch && (unitMatch || roleMatch);
  });
}

export function forwardOperationsTable(rows) {
  const canAct = canForwardContinue(state.user.role);
  const mapped = rows.map((row) => ({
    id: row.id,
    number: row.number,
    origin: unitName(row.originUnitId),
    destination: row.destination,
    reason: row.objective,
    deadline: formatDate(row.deadlineAt || row.createdAt),
    status: statusBadge(row.status),
    actions: canAct ? forwardActionButtons(row) : ''
  }));
  const keys = canAct ? ['number', 'origin', 'destination', 'reason', 'deadline', 'status', 'actions'] : ['number', 'origin', 'destination', 'reason', 'deadline', 'status'];
  return opsTable(keys, mapped, { raw: ['status', 'actions'], empty: 'Nenhum encaminhamento registrado.' });
}

function destinationStage(title, destination) {
  return {
    title: `Encaminhamento - ${title}`,
    subtitle: `${title} recebe somente o protocolo, prioridade, prazo, motivo codificado e campos necessarios a sua resposta.`,
    kind: 'forward',
    destination,
    fields: ['Protocolo', 'prioridade', 'prazo', 'motivo codificado', 'status da resposta'],
    restricted: ['nome completo por padrao', 'endereco completo', 'relato detalhado', 'documentos protegidos'],
    actionLabel: 'Atuar no encaminhamento'
  };
}

export function forwardActionButtons(row) {
  const closed = isClosed(row);
  const accepted = normalize(row.status).includes('aceit');
  const inCare = normalize(row.status).includes('atendimento');
  return `<div class="row-actions">
    ${accepted || closed ? '' : `<button class="button ghost" data-action="accept-forward" data-forward-id="${escAttr(row.id)}"><i data-lucide="check"></i><span>Aceitar</span></button>`}
    ${closed ? '' : `<button class="button ghost" data-action="return-forward" data-forward-id="${escAttr(row.id)}"><i data-lucide="undo-2"></i><span>Devolver</span></button>`}
    ${closed ? '' : `<button class="button ghost" data-action="redirect-forward" data-forward-id="${escAttr(row.id)}"><i data-lucide="send-horizontal"></i><span>Redirecionar</span></button>`}
    ${accepted && !inCare && !closed ? `<button class="button ghost" data-action="register-forward-attendance" data-forward-id="${escAttr(row.id)}"><i data-lucide="stethoscope"></i><span>Atendimento</span></button>` : ''}
    ${accepted || inCare ? `<button class="button ghost" data-action="register-forward-feedback" data-forward-id="${escAttr(row.id)}"><i data-lucide="message-square-text"></i><span>Devolutiva</span></button>` : ''}
    ${closed ? '' : `<button class="button ghost" data-action="complete-forward" data-forward-id="${escAttr(row.id)}"><i data-lucide="check-circle-2"></i><span>Concluir</span></button>`}
  </div>`;
}

export async function saveForward(event) {
  event.preventDefault();
  if (!canCouncilContinue(state.user.role)) {
    toast('Seu perfil nao cria encaminhamento.');
    return;
  }
  const protocolId = event.currentTarget.dataset.protocolId;
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const now = new Date().toISOString();
  const forwardId = crypto.randomUUID();
  const destination = destinationName(form.destinationUnitId);
  const deadlineAt = new Date(Date.now() + Number(form.deadlineHours || 24) * 3600000).toISOString();
  const forward = {
    id: forwardId,
    protocolId: protocol.id,
    number: protocol.number,
    originUnitId: protocol.currentUnitId || protocol.originUnitId,
    destination,
    destinationUnitId: form.destinationUnitId,
    destinationType: form.destinationType || form.destinationUnitId,
    visibleToRoles: rolesForForwardDestination(form.destinationUnitId),
    visibleToUnits: [form.destinationUnitId].filter(Boolean),
    status: form.status || 'Aguardando aceite',
    objective: form.objective || 'Encaminhamento conforme fluxo municipal.',
    createdAt: now,
    updatedAt: now,
    deadlineAt,
    acceptedAt: form.status === 'Aceito' ? now : '',
    closedAt: ''
  };
  await sparkStore.collection('encaminhamentos').doc(forwardId).set(forward);
  await createForwardNotification(forward, 'ENCAMINHAMENTO_RECEBIDO', 'Encaminhamento recebido', `${protocol.number} foi encaminhado para ${destination}.`);
  const next = withProtocolState({
    ...protocol,
    currentOwner: destination,
    currentUnitId: form.destinationUnitId,
    visibleToRoles: Array.from(new Set([...(protocol.visibleToRoles || []), ...rolesForForwardDestination(form.destinationUnitId), 'conselho'])),
    visibleToUnits: Array.from(new Set([...(protocol.visibleToUnits || []), form.destinationUnitId, protocol.originUnitId, protocol.currentUnitId].filter(Boolean))),
    lastForwardId: forwardId,
    updatedAt: now,
    timeline: appendTimeline(protocol, 'ENCAMINHAMENTO_CRIADO', `${destination}: ${forward.objective}`, now, 'AGUARDANDO_ACEITE')
  }, 'AGUARDANDO_ACEITE');
  await persistProtocol(next);
  await auditAction('forward.create', protocol.number + ' -> ' + destination);
  toast('Encaminhamento criado e protocolo atualizado.');
  navigate('protocol:' + protocolId);
}

export async function updateForwardStatus(forwardId, status, options = {}) {
  if (!canForwardContinue(state.user.role)) {
    toast('Seu perfil nao atualiza encaminhamento.');
    return;
  }
  const forward = findForward(forwardId);
  if (!forward) {
    toast('Encaminhamento nao encontrado.');
    return;
  }
  const now = new Date().toISOString();
  const nextForward = {
    ...forward,
    ...options.forwardPatch,
    status,
    acceptedAt: status === 'Aceito' && !forward.acceptedAt ? now : forward.acceptedAt || '',
    returnedAt: status === 'Devolvido' ? now : forward.returnedAt || '',
    redirectedAt: status === 'Redirecionado' ? now : forward.redirectedAt || '',
    attendanceAt: status === 'Em atendimento' ? now : forward.attendanceAt || '',
    feedbackAt: status === 'Devolutiva registrada' ? now : forward.feedbackAt || '',
    closedAt: status === 'Concluido' ? now : forward.closedAt || '',
    updatedAt: now
  };
  await sparkStore.collection('encaminhamentos').doc(forward.id).set(nextForward, { merge: true });
  const protocol = findProtocol(forward.protocolId);
  if (protocol) {
    const protocolStatus = options.protocolStatus || forwardProtocolStatus(status);
    const eventType = options.eventType || forwardEventType(status);
    const description = options.description || `${nextForward.destination}: ${nextForward.objective || 'Atualizacao do servico de destino.'}`;
    const nextProtocol = withProtocolState({
      ...protocol,
      currentOwner: nextForward.destination || protocol.currentOwner,
      currentUnitId: nextForward.destinationUnitId || protocol.currentUnitId,
      visibleToRoles: Array.from(new Set([...(protocol.visibleToRoles || []), ...(nextForward.visibleToRoles || []), ...rolesForForwardDestination(nextForward.destinationUnitId), 'conselho'])),
      visibleToUnits: Array.from(new Set([...(protocol.visibleToUnits || []), nextForward.destinationUnitId, protocol.originUnitId, protocol.currentUnitId].filter(Boolean))),
      updatedAt: now,
      timeline: appendTimeline(protocol, eventType, description, now, protocolStatus)
    }, protocolStatus);
    await persistProtocol(nextProtocol);
    await createForwardNotification(nextForward, notificationTypeForForward(status), notificationTitleForForward(status), `${protocol.number}: ${description}`);
  }
  await auditAction(auditActionForForward(status), forward.number + ' -> ' + (nextForward.destination || forward.destination));
  toast(toastForForward(status));
  render();
}

export async function returnForward(forwardId) {
  const justification = window.prompt('Informe a justificativa da devolucao:')?.trim();
  if (!justification) {
    toast('Devolucao exige justificativa.');
    return;
  }
  await updateForwardStatus(forwardId, 'Devolvido', {
    eventType: 'ENCAMINHAMENTO_DEVOLVIDO',
    protocolStatus: 'DEVOLUTIVA_PENDENTE',
    description: `Devolucao justificada: ${justification}`,
    forwardPatch: { returnJustification: justification }
  });
}

export async function redirectForward(forwardId) {
  const destination = window.prompt('Informe o novo destino do encaminhamento:')?.trim();
  if (!destination) {
    toast('Redirecionamento exige novo destino.');
    return;
  }
  const justification = window.prompt('Informe a justificativa do redirecionamento:')?.trim() || 'Redirecionamento operacional registrado.';
  await updateForwardStatus(forwardId, 'Redirecionado', {
    eventType: 'ENCAMINHAMENTO_CRIADO',
    protocolStatus: 'AGUARDANDO_ACEITE',
    description: `Redirecionado para ${destination}. ${justification}`,
    forwardPatch: { destination, destinationUnitId: destination, visibleToRoles: rolesForForwardDestination(destination), visibleToUnits: [destination], redirectJustification: justification }
  });
}

export async function registerForwardAttendance(forwardId) {
  const note = window.prompt('Registre o atendimento realizado:')?.trim();
  if (!note) {
    toast('Informe um resumo minimo do atendimento.');
    return;
  }
  await updateForwardStatus(forwardId, 'Em atendimento', {
    eventType: 'ATENDIMENTO_REGISTRADO',
    protocolStatus: 'EM_ATENDIMENTO',
    description: `Atendimento registrado: ${note}`,
    forwardPatch: { attendanceNote: note }
  });
}

export async function registerForwardFeedback(forwardId) {
  const feedback = window.prompt('Registre a devolutiva do servico:')?.trim();
  if (!feedback) {
    toast('Informe a devolutiva antes de registrar.');
    return;
  }
  await updateForwardStatus(forwardId, 'Devolutiva registrada', {
    eventType: 'DEVOLUTIVA_REGISTRADA',
    protocolStatus: 'DEVOLUTIVA_PENDENTE',
    description: `Devolutiva registrada: ${feedback}`,
    forwardPatch: { feedback }
  });
}

export function findForward(forwardId) {
  return (state.data.forwards || []).find((item) => item.id === forwardId);
}

export function forwardDestinationOptions(selected = '') {
  const fixed = defaultForwardDestinations.map(([id, label]) => `<option value="${escAttr(id)}"${selected === id ? ' selected' : ''}>${esc(label)}</option>`);
  const units = (state.data.units || []).map((unit) => `<option value="${escAttr(unit.id)}"${selected === unit.id ? ' selected' : ''}>${esc(unit.name)}</option>`);
  return fixed.concat(units).join('');
}

export function nextDeadline(forwards = []) {
  const pending = forwards.filter((row) => !isClosed(row) && row.deadlineAt)
    .sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));
  return pending[0]?.deadlineAt || '';
}

export function deadlineBadge(deadlineAt) {
  if (!deadlineAt) return '<span class="status-badge">Sem prazo aberto</span>';
  const diff = new Date(deadlineAt).getTime() - Date.now();
  if (diff < 0) return `<span class="status-badge danger">Vencido ha ${esc(formatDuration(Math.abs(diff)))}</span>`;
  if (diff < 3600000) return `<span class="status-badge warning">${esc(formatDuration(diff))}</span>`;
  return `<span class="status-badge success">${esc(formatDuration(diff))}</span>`;
}

export function formatDuration(ms) {
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

export function canForwardContinue(role) {
  return ['supervisor_caso', 'conselho', 'samic', 'rede', 'autoridade_policial', 'policia_civil', 'policia_federal'].includes(role);
}

export function destinationName(id) {
  return defaultForwardDestinations.find(([value]) => value === id)?.[1] || unitName(id);
}

function rolesForForwardDestination(id = '') {
  const normalized = normalize(id);
  if (normalized.includes('policia') || normalized.includes('autoridade')) return ['autoridade_policial', 'policia_civil', 'policia_federal'];
  if (normalized.includes('ministerio')) return ['rede'];
  if (normalized.includes('samic')) return ['samic'];
  if (normalized.includes('conselho')) return ['conselho'];
  return ['rede'];
}

function forwardProtocolStatus(status) {
  return {
    Aceito: 'ACEITO',
    Devolvido: 'DEVOLUTIVA_PENDENTE',
    Redirecionado: 'AGUARDANDO_ACEITE',
    'Em atendimento': 'EM_ATENDIMENTO',
    'Devolutiva registrada': 'DEVOLUTIVA_PENDENTE',
    Concluido: 'CONCLUIDO'
  }[status] || 'ENCAMINHAMENTO_CRIADO';
}

function forwardEventType(status) {
  return {
    Aceito: 'ENCAMINHAMENTO_ACEITO',
    Devolvido: 'ENCAMINHAMENTO_DEVOLVIDO',
    Redirecionado: 'ENCAMINHAMENTO_CRIADO',
    'Em atendimento': 'ATENDIMENTO_REGISTRADO',
    'Devolutiva registrada': 'DEVOLUTIVA_REGISTRADA',
    Concluido: 'DEVOLUTIVA_REGISTRADA'
  }[status] || 'ENCAMINHAMENTO_CRIADO';
}

function notificationTypeForForward(status) {
  return {
    Aceito: 'ENCAMINHAMENTO_ACEITO',
    Devolvido: 'ENCAMINHAMENTO_DEVOLVIDO',
    Redirecionado: 'ENCAMINHAMENTO_RECEBIDO',
    'Devolutiva registrada': 'DEVOLUTIVA_RECEBIDA',
    Concluido: 'PROTOCOLO_CONCLUIDO'
  }[status] || '';
}

function notificationTitleForForward(status) {
  return {
    Aceito: 'Encaminhamento aceito',
    Devolvido: 'Encaminhamento devolvido',
    Redirecionado: 'Encaminhamento redirecionado',
    'Devolutiva registrada': 'Devolutiva recebida',
    Concluido: 'Encaminhamento concluido'
  }[status] || 'Encaminhamento atualizado';
}

function auditActionForForward(status) {
  return {
    Aceito: 'forward.accept',
    Devolvido: 'forward.return',
    Redirecionado: 'forward.redirect',
    'Em atendimento': 'forward.attendance',
    'Devolutiva registrada': 'forward.feedback',
    Concluido: 'forward.complete'
  }[status] || 'forward.update';
}

function toastForForward(status) {
  return {
    Aceito: 'Encaminhamento aceito.',
    Devolvido: 'Encaminhamento devolvido.',
    Redirecionado: 'Encaminhamento redirecionado.',
    'Em atendimento': 'Atendimento registrado.',
    'Devolutiva registrada': 'Devolutiva registrada.',
    Concluido: 'Encaminhamento concluido.'
  }[status] || 'Encaminhamento atualizado.';
}

async function createForwardNotification(forward, type, title, message) {
  if (!type) return;
  const targetRole = type === 'ENCAMINHAMENTO_RECEBIDO' ? rolesForForwardDestination(forward.destinationUnitId)[0] : 'conselho';
  const id = crypto.randomUUID();
  await sparkStore.collection('notificacoes').doc(id).set({
    id,
    userId: targetRole === 'rede' ? (forward.destinationUnitId || forward.destination || 'rede') : targetRole,
    targetRole,
    type,
    protocolId: forward.protocolId,
    unitId: forward.destinationUnitId || '',
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    status: 'pendente',
    attempts: 1,
    escalation: ''
  });
}
