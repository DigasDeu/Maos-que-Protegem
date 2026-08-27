// Rede Protege Maués — fluxo e regras centrais
// Consolidado a partir da arquitetura existente para reduzir duplicidade.

export const RPM = Object.freeze({
  appName: 'Rede Protege Maues',
  subtitle: 'Maos que Protegem',
  version: 'spark-functional-auth-0.3.17',
  localStoreKey: 'rpm.spark.local.v1',
  sessionKey: 'rpm.spark.session.v1'
});

export const roles = Object.freeze({
  admin: 'Administrador tecnico',
  supervisor_caso: 'Supervisor de caso autorizado',
  entrada: 'Porta de entrada',
  conselho: 'Conselho Tutelar',
  autoridade_policial: 'Autoridade policial',
  policia_civil: 'Policia Civil',
  policia_federal: 'Policia Federal',
  samic: 'SAMIC',
  rede: 'Servico da rede',
  vigilancia: 'Vigilancia em saude',
  referencia_saude_crianca: 'Referencia tecnica Saude Crianca',
  gerente_ubs: 'Gerente UBS',
  gerente_casai: 'Gerente CASAI',
  gerente_cras: 'Gerente CRAS',
  gerente_sejel: 'Gerente SEJEL',
  gestor: 'Gestor/Auditor',
  pending: 'Aguardando liberacao'
});

export const navItems = [
  [
    "dashboard",
    "Dashboard",
    "layout-dashboard"
  ],
  [
    "protocols",
    "Protocolos",
    "clipboard-list"
  ],
  [
    "notifications",
    "Notificacoes",
    "bell-ring"
  ],
  [
    "training",
    "Treinamento",
    "graduation-cap"
  ],
  [
    "knowledge",
    "Conhecimento",
    "book-open"
  ],
  [
    "forwards",
    "Encaminhamentos",
    "send"
  ],
  [
    "council",
    "Conselho Tutelar",
    "scale"
  ],
  [
    "samic",
    "SAMIC",
    "heart-pulse"
  ],
  [
    "network",
    "Rede de Atendimento",
    "network"
  ],
  [
    "management",
    "Gestao",
    "briefcase-business"
  ],
  [
    "reports",
    "Relatorios",
    "bar-chart-3"
  ],
  [
    "audit",
    "Auditoria",
    "shield-check"
  ],
  [
    "contingency",
    "Contingencia",
    "wifi-off"
  ],
  [
    "users",
    "Usuarios",
    "users"
  ],
  [
    "settings",
    "Configuracoes",
    "settings"
  ],
  [
    "help",
    "Ajuda",
    "circle-help"
  ]
];

export const sparkCollections = Object.freeze({
  users: 'usuarios',
  units: 'unidades',
  protocols: 'protocolos',
  protocolStats: 'estatisticasProtocolos',
  forwards: 'encaminhamentos',
  notifications: 'notificacoes',
  audit: 'auditoria',
  system: 'configuracoes'
});

export const flowSteps = [
  ['1', 'Atendimento', 'Acolhimento pela porta de entrada'],
  ['2', 'Porta de Entrada', 'UBS, CRAS, escola, policia ou hospital'],
  ['3', 'Notificacao', 'Suspeita ou confirmacao'],
  ['4', 'Conselho Tutelar', 'Ciencia, medidas e SIPIA'],
  ['5', 'SAMIC', 'Atendimento especializado'],
  ['6', 'Decisao', 'Encaminhamentos e devolutivas']
];

export const sparkLimits = Object.freeze({
  firestoreReadsDay: 50000,
  firestoreWritesDay: 20000,
  firestoreDeletesDay: 20000,
  firestoreStorageGib: 1,
  hostingStorageGb: 10,
  hostingTransferGbMonth: 10
});

export function friendlyNumber(docId, date = new Date()) {
  return 'RP-' + date.getFullYear() + '-' + String(docId).slice(-6).toUpperCase().padStart(6, '0');
}

export function buildProtocol(form, context) {
  const id = crypto.randomUUID();
  const number = friendlyNumber(id);
  return {
    id,
    number,
    originUnitId: form.originUnitId || context.user.unitId,
    entryPoint: form.entryPoint,
    priority: form.priority,
    classification: form.classification,
    violenceType: form.violenceType || 'Violencia sexual',
    ageRange: form.ageRange,
    sex: form.sex || 'Nao informado',
    initials: form.initials || '',
    triggerReason: form.triggerReason || '',
    immediateAction: form.immediateAction || '',
    immediateProtection: form.immediateProtection || 'Nao informado',
    minimalRecord: form.minimalRecord,
    statusCode: 'CONSELHO_ACIONADO',
    status: 'Conselho acionado',
    stage: 'conselho',
    currentOwner: 'Conselho Tutelar',
    currentUnitId: 'conselho-tutelar',
    visibleToRoles: ['conselho'],
    visibleToUnits: [form.originUnitId || context.user.unitId, 'conselho-tutelar'].filter(Boolean),
    accessGrants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [{
      id: crypto.randomUUID(),
      protocolId: id,
      actorId: context.user.id,
      usuarioId: context.user.id,
      unitId: form.originUnitId || context.user.unitId,
      unidadeId: form.originUnitId || context.user.unitId,
      tipo: 'PROTOCOLO_CRIADO',
      action: 'PROTOCOLO_CRIADO',
      description: 'Dados minimos registrados pela porta de entrada, sem substituir avaliacao tecnica ou decisao institucional.',
      previousStatus: '',
      nextStatus: 'CONSELHO_ACIONADO',
      estadoAnterior: '',
      estadoNovo: 'CONSELHO_ACIONADO',
      justificativa: 'Dados minimos registrados pela porta de entrada.',
      createdAt: new Date().toISOString(),
      dataHora: new Date().toISOString()
    }]
  };
}

export function statPayload(protocol) {
  return {
    id: protocol.id,
    number: protocol.number,
    originUnitId: protocol.originUnitId,
    entryPoint: protocol.entryPoint,
    priority: protocol.priority,
    classification: protocol.classification,
    violenceType: protocol.violenceType,
    ageRange: protocol.ageRange,
    statusCode: protocol.statusCode,
    status: protocol.status,
    stage: protocol.stage,
    currentOwner: protocol.currentOwner,
    createdAt: protocol.createdAt,
    updatedAt: protocol.updatedAt
  };
}

export function estimateSpark(protocols, forwards, notifications) {
  const dashboardReads = Math.min(50, protocols.length + forwards.length + notifications.length + 6);
  const projectedReads = dashboardReads * 30;
  return {
    dashboardReads,
    projectedReads,
    readPressure: projectedReads / sparkLimits.firestoreReadsDay,
    writeCostNewProtocol: 4,
    notes: ['usar limit()', 'evitar listeners em listas grandes', 'statPayload separado reduz leitura sensivel']
  };
}

export function protocolRisk(protocol) {
  const base = protocol.priority === 'Critica' ? 80 : protocol.priority === 'Alta' ? 62 : protocol.priority === 'Media' ? 42 : 20;
  const overdue = new Date(protocol.deadlineAt || Date.now() + 86400000) < new Date() ? 18 : 0;
  const score = Math.min(100, base + overdue);
  return { score, band: score >= 80 ? 'critica' : score >= 62 ? 'alta' : score >= 42 ? 'media' : 'baixa' };
}

export const rpmPublicContract = Object.freeze({
  source: 'https://rede-protege-maues.web.app',
  capturedVersion: 'real-20260811-ops8',
  capturedAt: '2026-08-12',
  layoutTarget: 'PEC 5.5 / Pack-like operational shell',
  modules: [
    ['auth', 'Autenticacao'],
    ['dashboard', 'Dashboard'],
    ['casos', 'Casos'],
    ['protocolos', 'Protocolos'],
    ['atendimento-inicial', 'Atendimento inicial'],
    ['portas-entrada', 'Portas de entrada'],
    ['classificacao', 'Classificacao'],
    ['sinan', 'SINAN'],
    ['sipia', 'SIPIA'],
    ['notificacoes', 'Notificacoes'],
    ['encaminhamentos', 'Encaminhamentos'],
    ['conselho-tutelar', 'Conselho Tutelar'],
    ['samic', 'SAMIC'],
    ['atendimentos', 'Atendimentos'],
    ['registros-oficiais', 'Registros oficiais'],
    ['rede-protecao', 'Rede de protecao'],
    ['relatorios', 'Relatorios'],
    ['auditoria', 'Auditoria'],
    ['contingencia', 'Contingencia'],
    ['administracao', 'Administracao']
  ],
  publishedRoutes: [
    ['dashboard', 'Dashboard', 'layout-dashboard'],
    ['protocols', 'Protocolos', 'clipboard-list'],
    ['notifications', 'Notificacoes', 'bell-ring'],
    ['training', 'Treinamento', 'graduation-cap'],
    ['knowledge', 'Conhecimento', 'book-open'],
    ['forwards', 'Encaminhamentos', 'send'],
    ['council', 'Conselho Tutelar', 'scale'],
    ['samic', 'SAMIC', 'heart-pulse'],
    ['network', 'Rede de Atendimento', 'network'],
    ['management', 'Gestao', 'briefcase-business'],
    ['reports', 'Relatorios', 'bar-chart-3'],
    ['audit', 'Auditoria', 'shield-check'],
    ['contingency', 'Contingencia', 'wifi-off'],
    ['users', 'Usuarios', 'users'],
    ['settings', 'Configuracoes', 'settings'],
    ['help', 'Ajuda', 'circle-help']
  ],
  publishedMobileRoutes: [
    ['dashboard', 'layout-dashboard', 'Inicio'],
    ['protocols', 'clipboard-list', 'Casos'],
    ['notifications', 'bell-ring', 'Alertas'],
    ['reports', 'bar-chart-3', 'Dados']
  ],
  roles: {
    admin: 'Administrador tecnico',
    supervisor_caso: 'Supervisor de caso autorizado',
    entrada: 'Porta de entrada',
    conselho: 'Conselho Tutelar',
    autoridade_policial: 'Autoridade policial',
    policia_civil: 'Policia Civil',
    policia_federal: 'Policia Federal',
    samic: 'SAMIC',
    rede: 'Servico da rede',
    vigilancia: 'Vigilancia em saude',
    referencia_saude_crianca: 'Referencia tecnica Saude Crianca',
    gerente_ubs: 'Gerente UBS',
    gerente_casai: 'Gerente CASAI',
    gerente_cras: 'Gerente CRAS',
    gerente_sejel: 'Gerente SEJEL',
    gestor: 'Gestor/Auditor',
    pending: 'Aguardando liberacao'
  },
  sparkCollectionMap: {
    users: 'usuarios',
    units: 'unidades',
    protocols: 'protocolos',
    protocolStats: 'estatisticasProtocolos',
    forwards: 'encaminhamentos',
    notifications: 'notificacoes',
    audit: 'auditoria',
    system: 'configuracoes'
  },
  preservedPublicPaths: [
    '.reference/rpm-public/app.js',
    '.reference/rpm-public/js/core/constants.js',
    '.reference/rpm-public/js/core/permissions.js',
    '.reference/rpm-public/js/services/case.service.js',
    '.reference/rpm-public/js/modules/protocolos/protocolos.module.js',
    '.reference/rpm-public/js/modules/encaminhamentos/encaminhamentos.module.js',
    '.reference/rpm-public/js/modules/conselho-tutelar/conselho.module.js',
    '.reference/rpm-public/js/modules/samic/samic.module.js'
  ]
});

export const entrySequence = Object.freeze([
  'Carregando o sistema...',
  'Inicializando o sistema...',
  'Carregando informacoes...',
  'Sincronizando dados...',
  'Validando informacoes...',
  'Conectando aos servicos...',
  'Tudo pronto. Faca sua notificacao.'
]);

export function mobileRoutesForPackShell() {
  return rpmPublicContract.publishedMobileRoutes;
}

export function publicModuleLabel(moduleId) {
  return rpmPublicContract.modules.find(([id]) => id === moduleId)?.[1] || moduleId;
}


export const protocolStates = Object.freeze({
  ABERTO: 'Aberto',
  CONSELHO_ACIONADO: 'Conselho acionado',
  CONSELHO_CIENTE: 'Conselho ciente',
  SIPIA_PENDENTE: 'SIPIA pendente',
  SIPIA_REGISTRADO: 'SIPIA registrado',
  SAMIC_ACIONADO: 'SAMIC acionado',
  SAMIC_DISPONIVEL: 'SAMIC disponivel',
  SAMIC_INDISPONIVEL: 'SAMIC indisponivel',
  DECISAO_REGISTRADA: 'Decisao registrada',
  ENCAMINHAMENTO_CRIADO: 'Encaminhamento criado',
  AGUARDANDO_ACEITE: 'Aguardando aceite',
  ACEITO: 'Aceito',
  EM_ATENDIMENTO: 'Em atendimento',
  DEVOLUTIVA_PENDENTE: 'Devolutiva pendente',
  CONCLUIDO: 'Concluido',
  ENCERRADO: 'Encerrado',
  REABERTO: 'Reaberto'
});

export const protocolStateStages = Object.freeze({
  ABERTO: 'abertura',
  CONSELHO_ACIONADO: 'conselho',
  CONSELHO_CIENTE: 'conselho',
  SIPIA_PENDENTE: 'sipia',
  SIPIA_REGISTRADO: 'sipia',
  SAMIC_ACIONADO: 'samic',
  SAMIC_DISPONIVEL: 'samic',
  SAMIC_INDISPONIVEL: 'samic',
  DECISAO_REGISTRADA: 'decisao',
  ENCAMINHAMENTO_CRIADO: 'encaminhamento',
  AGUARDANDO_ACEITE: 'encaminhamento',
  ACEITO: 'encaminhamento',
  EM_ATENDIMENTO: 'encaminhamento',
  DEVOLUTIVA_PENDENTE: 'encaminhamento',
  CONCLUIDO: 'conclusao',
  ENCERRADO: 'encerrado',
  REABERTO: 'reaberto'
});

export const timelineEventTypes = Object.freeze({
  PROTOCOLO_CRIADO: 'PROTOCOLO_CRIADO',
  CONSELHO_ACIONADO: 'CONSELHO_ACIONADO',
  CONSELHO_CIENTE: 'CONSELHO_CIENTE',
  SIPIA_REGISTRADO: 'SIPIA_REGISTRADO',
  SAMIC_ACIONADO: 'SAMIC_ACIONADO',
  DECISAO_SAMIC: 'DECISAO_SAMIC',
  ENCAMINHAMENTO_CRIADO: 'ENCAMINHAMENTO_CRIADO',
  ENCAMINHAMENTO_ACEITO: 'ENCAMINHAMENTO_ACEITO',
  ENCAMINHAMENTO_DEVOLVIDO: 'ENCAMINHAMENTO_DEVOLVIDO',
  ATENDIMENTO_REGISTRADO: 'ATENDIMENTO_REGISTRADO',
  DEVOLUTIVA_REGISTRADA: 'DEVOLUTIVA_REGISTRADA',
  PROTOCOLO_ENCERRADO: 'PROTOCOLO_ENCERRADO',
  PROTOCOLO_REABERTO: 'PROTOCOLO_REABERTO'
});

export const protocolTransitions = Object.freeze({
  ABERTO: ['CONSELHO_ACIONADO', 'ENCERRADO'],
  CONSELHO_ACIONADO: ['CONSELHO_CIENTE', 'SIPIA_PENDENTE', 'SIPIA_REGISTRADO', 'SAMIC_ACIONADO', 'SAMIC_DISPONIVEL', 'SAMIC_INDISPONIVEL', 'DECISAO_REGISTRADA', 'EM_ATENDIMENTO', 'DEVOLUTIVA_PENDENTE', 'ENCERRADO'],
  CONSELHO_CIENTE: ['SIPIA_PENDENTE', 'SIPIA_REGISTRADO', 'SAMIC_ACIONADO', 'DECISAO_REGISTRADA', 'ENCAMINHAMENTO_CRIADO', 'ENCERRADO'],
  SIPIA_PENDENTE: ['SIPIA_REGISTRADO', 'SAMIC_ACIONADO', 'DECISAO_REGISTRADA', 'ENCERRADO'],
  SIPIA_REGISTRADO: ['SAMIC_ACIONADO', 'DECISAO_REGISTRADA', 'ENCAMINHAMENTO_CRIADO', 'ENCERRADO'],
  SAMIC_ACIONADO: ['SAMIC_DISPONIVEL', 'SAMIC_INDISPONIVEL', 'DECISAO_REGISTRADA', 'EM_ATENDIMENTO', 'ENCAMINHAMENTO_CRIADO', 'ENCERRADO'],
  SAMIC_DISPONIVEL: ['DECISAO_REGISTRADA', 'EM_ATENDIMENTO', 'ENCAMINHAMENTO_CRIADO', 'DEVOLUTIVA_PENDENTE', 'ENCERRADO'],
  SAMIC_INDISPONIVEL: ['DECISAO_REGISTRADA', 'ENCAMINHAMENTO_CRIADO', 'AGUARDANDO_ACEITE', 'ENCERRADO'],
  DECISAO_REGISTRADA: ['SAMIC_ACIONADO', 'SAMIC_DISPONIVEL', 'SAMIC_INDISPONIVEL', 'EM_ATENDIMENTO', 'DEVOLUTIVA_PENDENTE', 'ENCAMINHAMENTO_CRIADO', 'AGUARDANDO_ACEITE', 'ENCERRADO'],
  ENCAMINHAMENTO_CRIADO: ['AGUARDANDO_ACEITE', 'ACEITO', 'DEVOLUTIVA_PENDENTE', 'ENCERRADO'],
  AGUARDANDO_ACEITE: ['ACEITO', 'DEVOLUTIVA_PENDENTE', 'ENCERRADO'],
  ACEITO: ['EM_ATENDIMENTO', 'DEVOLUTIVA_PENDENTE', 'CONCLUIDO', 'ENCERRADO'],
  EM_ATENDIMENTO: ['DEVOLUTIVA_PENDENTE', 'CONCLUIDO', 'ENCERRADO'],
  DEVOLUTIVA_PENDENTE: ['EM_ATENDIMENTO', 'CONCLUIDO', 'ENCERRADO'],
  CONCLUIDO: ['ENCERRADO', 'REABERTO'],
  ENCERRADO: ['REABERTO'],
  REABERTO: ['CONSELHO_ACIONADO', 'CONSELHO_CIENTE', 'SAMIC_ACIONADO', 'ENCAMINHAMENTO_CRIADO', 'ENCERRADO']
});

// --- Camada de interface migrada do sistema existente ---
let activateProfile, activityPanel, appendTimeline, applySearch, audit, auditAction, auditProtocolRead, auditTrailList, authCard, average, bindActions, bindEntry, bindModalActions, bindShell, boot, breakdownPanel, canForwardContinue, canManage, canNotify, canViewCase, canViewStats, caseCard, caseGrid, checklist, clearEntryTimers, closeModal, closeProtocol, closurePanel, commandBoard, compactCase, contingency, copyFor, countBy, createLocalPendingAccess, csvCell, currentUser, dashboard, dashboardData, dashedEmpty, deadlineBadge, destinationName, emptyRoute, entryShell, esc, escAttr, exportCsv, findForward, findProtocol, findUserByEmail, finishEntrySequence, flowSettingsForm, formatDate, formatDuration, formatHours, forwardActionButtons, forwardDestinationOptions, forwardOperationsTable, forwards, friendlyAuthError, getUsers, governanceList, groupedNav, guardAction, handleActionError, handleGoogleLogin, handleLogin, handleRecoverPassword, handleRegister, handoffCard, healthEntryAlert, help, hoursBetween, initials, isClosed, isHealthEntry, isOccurrenceRoute, knowledge, labelFor, lastDaysCount, list, liveClock, liveUsersPanel, loginCard, management, managementCard, markNotificationRead, mergeRemoteProfiles, metric, metrics, mobileBottomNav, modalShell, moduleCard, municipalFlowCounts, municipalFlowPanel, navButton, navForRole, navSignal, navigate, network, nextDeadline, normalize, normalizeAppState, normalizeEmail, notificationItem, notificationModal, notifications, occurrenceDetails, officialOptions, officialRecordsPanel, officialSummary, openModal, opsTable, pendingAccessCard, persistProtocol, priorityBadge, projectIndicatorGrid, projectIndicatorValues, protocolForm, protocolModal, protocolOperationsTable, protocolStateCode, protocolStateLabel, protocolStateStage, protocolTable, protocolTimeline, protocols, quickAction, quickActionsPanel, registerCard, render, renderEntry, renderFailure, reopenProtocol, reports, restoreRemoteSession, routeCopy, routeGroups, routeLoading, saveForward, saveNotification, saveOfficialRecords, saveSettings, saveUnit, saveUser, scheduleRender, securityPanel, selectUser, settings, shell, sparkPanel, sparkStore, stageBoard, startEntrySequence, startRemoteProfileSync, state, statusBadge, syncUserProfile, table, textOnly, thisMonthCount, timeoutPromise, titleFor, toast, todayCount, training, unitModal, unitName, unitOperationsGrid, unitOptions, updateForwardStatus, userModal, userOperationsTable, users, view, workflowPanel;
export function initFluxoUI(runtime) {
  activateProfile = runtime.activateProfile;
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
  contingency = runtime.contingency;
  copyFor = runtime.copyFor;
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
  entryShell = runtime.entryShell;
  esc = runtime.esc;
  escAttr = runtime.escAttr;
  exportCsv = runtime.exportCsv;
  findForward = runtime.findForward;
  findProtocol = runtime.findProtocol;
  findUserByEmail = runtime.findUserByEmail;
  finishEntrySequence = runtime.finishEntrySequence;
  flowSettingsForm = runtime.flowSettingsForm;
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
  modalShell = runtime.modalShell;
  moduleCard = runtime.moduleCard;
  municipalFlowCounts = runtime.municipalFlowCounts;
  municipalFlowPanel = runtime.municipalFlowPanel;
  navButton = runtime.navButton;
  navForRole = runtime.navForRole;
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
  projectIndicatorGrid = runtime.projectIndicatorGrid;
  projectIndicatorValues = runtime.projectIndicatorValues;
  protocolForm = runtime.protocolForm;
  protocolModal = runtime.protocolModal;
  protocolOperationsTable = runtime.protocolOperationsTable;
  protocolStateCode = runtime.protocolStateCode;
  protocolStateLabel = runtime.protocolStateLabel;
  protocolStateStage = runtime.protocolStateStage;
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
  routeCopy = runtime.routeCopy;
  routeGroups = runtime.routeGroups;
  routeLoading = runtime.routeLoading;
  saveForward = runtime.saveForward;
  saveNotification = runtime.saveNotification;
  saveOfficialRecords = runtime.saveOfficialRecords;
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
  workflowPanel = runtime.workflowPanel;
}

export async function council() {
  const rows = (await list('protocols')).filter((item) => ['conselho', 'triagem'].includes(item.stage) || item.status.includes('Conselho'));
  return `
    <section class="legacy-panel">
      <div class="legacy-panel-header"><div><h2>Conselho Tutelar</h2><p>Confirmacao de ciencia, SIPIA, SAMIC e medidas de protecao.</p></div></div>
      ${protocolOperationsTable(rows)}
    </section>`;
}

export async function samic() {
  const rows = (await list('protocols')).filter((item) => item.stage === 'samic');
  const config = state.data.system?.config?.samic || {};
  return `
    <div class="ops-two-cols">
      <section class="legacy-panel">
        <div class="legacy-panel-header"><div><h2>Status de Funcionamento</h2><p>Horario configuravel pela Administracao, com excecoes e rota fora do horario.</p></div></div>
        ${samicStatusCard()}
        <div class="samic-config-line">
          <span>${esc((config.weekdays || [1, 2, 3, 4, 5]).map(weekdayName).join(', '))}</span>
          <span>${esc(config.start || '08:00')} - ${esc(config.end || '17:00')}</span>
          <span>${esc(config.contact || 'Contato a definir')}</span>
        </div>
      </section>
      <section class="legacy-panel">
        <div class="legacy-panel-header"><div><h2>Casos no SAMIC</h2><p>Acompanhamento especializado em tempo real.</p></div></div>
        ${rows.length ? protocolOperationsTable(rows) : dashedEmpty('Nenhum caso no SAMIC.')}
      </section>
    </div>`;
}

export function councilFollowupPanel(protocol) {
  if (!canCouncilContinue(state.user.role)) {
    return `<section class="legacy-panel"><div class="legacy-panel-header compact"><h2>Acompanhamento</h2></div>${dashedEmpty('Seu perfil visualiza o protocolo, mas nao executa a etapa do Conselho Tutelar.')}</section>`;
  }
  return `<section class="legacy-panel council-followup">
    <div class="legacy-panel-header">
      <div>
        <h2>Continuidade do Conselho Tutelar</h2>
        <p>Confirme ciencia, registre SIPIA, acione SAMIC e encaminhe sem apagar o historico.</p>
      </div>
    </div>
    <div class="council-action-row">
      <button class="button primary" type="button" data-action="confirm-council" data-protocol-id="${escAttr(protocol.id)}"><i data-lucide="check-circle-2"></i><span>Confirmar ciencia</span></button>
      <button class="button" type="button" data-action="activate-samic" data-protocol-id="${escAttr(protocol.id)}"><i data-lucide="heart-pulse"></i><span>Acionar SAMIC</span></button>
    </div>
    <form id="council-followup-form" data-protocol-id="${escAttr(protocol.id)}" class="form-grid">
      <div class="form-row three">
        <label class="field"><span>SIPIA - situacao</span><select name="sipiaStatus"><option value="">Nao informado</option><option${protocol.sipia?.status === 'Pendente' ? ' selected' : ''}>Pendente</option><option${protocol.sipia?.status === 'Registrado' ? ' selected' : ''}>Registrado</option><option${protocol.sipia?.status === 'Nao aplicavel neste momento' ? ' selected' : ''}>Nao aplicavel neste momento</option></select></label>
        <label class="field"><span>Protocolo SIPIA</span><input name="sipiaProtocol" value="${escAttr(protocol.sipia?.protocol || '')}" placeholder="Quando permitido"></label>
        <label class="field"><span>Decisao inicial</span><select name="decision"><option>Em analise pelo Conselho</option><option>Acionar SAMIC</option><option>Encaminhar rede de protecao</option><option>Encaminhar hospital/SAVVIS</option><option>Solicitar apoio da Policia Civil</option></select></label>
      </div>
      <label class="field"><span>Medida ou justificativa operacional</span><textarea name="measure" placeholder="Registre providencia administrativa, medida de protecao ou justificativa da excecao."></textarea></label>
      <div class="modal-actions"><button class="button primary"><i data-lucide="save"></i><span>Salvar acompanhamento</span></button></div>
    </form>
    <form id="forward-form" data-protocol-id="${escAttr(protocol.id)}" class="form-grid forward-inline-form">
      <div class="form-row three">
        <label class="field"><span>Destino</span><select name="destinationUnitId" required>${forwardDestinationOptions()}</select></label>
        <label class="field"><span>Prazo</span><select name="deadlineHours"><option value="24">24 horas</option><option value="48">48 horas</option><option value="168">7 dias</option></select></label>
        <label class="field"><span>Status inicial</span><select name="status"><option>Aguardando aceite</option><option>Aceito</option><option>Redirecionado</option></select></label>
      </div>
      <label class="field"><span>Motivo codificado</span><textarea name="objective" placeholder="Ex.: atendimento especializado, protecao, avaliacao, retorno, hospital/SAVVIS."></textarea></label>
      <div class="modal-actions"><button class="button"><i data-lucide="send"></i><span>Criar encaminhamento</span></button></div>
    </form>
  </section>`;
}

export function samicDecisionPanel(protocol) {
  const config = state.data.system?.config?.samic || {};
  return `<section class="legacy-panel">
    <div class="legacy-panel-header">
      <div><h2>SAMIC</h2><p>Funcionamento configurado, orientativo e sem bloqueio da decisao humana.</p></div>
      ${samicStatusCard()}
    </div>
    <div class="samic-config-line">
      <span>${esc((config.weekdays || [1, 2, 3, 4, 5]).map(weekdayName).join(', '))}</span>
      <span>${esc(config.start || '08:00')} - ${esc(config.end || '17:00')}</span>
      <span>${esc(config.responsible || 'Responsavel a definir')}</span>
    </div>
    <form id="samic-decision-form" data-protocol-id="${escAttr(protocol.id)}" class="form-grid">
      <div class="form-row three">
        <label class="field"><span>Situacao SAMIC</span><select name="samicStatus"><option>Acionado</option><option>Disponivel</option><option>Indisponivel</option><option>Em atendimento</option><option>Devolutiva pendente</option></select></label>
        <label class="field"><span>Decisao</span><select name="samicDecision"><option>Aguardar atendimento</option><option>Encaminhar rede</option><option>Encaminhar hospital/SAVVIS</option><option>Solicitar apoio especializado</option></select></label>
        <label class="field"><span>Rota fora do horario</span><input name="offHoursRoute" value="${escAttr(config.offHoursRoute || 'Rede de protecao e hospital/SAVVIS')}"></label>
      </div>
      <label class="field"><span>Devolutiva minima</span><textarea name="samicNote" placeholder="Registre somente a decisao operacional ou devolutiva necessaria."></textarea></label>
      <div class="modal-actions"><button class="button"><i data-lucide="heart-pulse"></i><span>Salvar decisao SAMIC</span></button></div>
    </form>
  </section>`;
}

export function samicStatusCard() {
  const open = isSamicOpen();
  const config = state.data.system?.config?.samic || {};
  return `<article class="samic-status ${open ? 'open' : 'closed'}">
    <i data-lucide="${open ? 'check-circle-2' : 'x-circle'}"></i>
    <div><strong>SAMIC ${open ? 'aberto' : 'fechado'}</strong><p>${esc(open ? (config.responsible || 'Responsavel a definir') : (config.offHoursRoute || 'Rede de protecao e hospital/SAVVIS'))}</p></div>
  </article>`;
}

export async function confirmCouncilAwareness(protocolId) {
  if (!canCouncilContinue(state.user.role)) {
    toast('Seu perfil nao executa a etapa do Conselho Tutelar.');
    return;
  }
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  await alterarEtapa(protocolId, 'CONSELHO_CIENTE', {
    eventType: 'CONSELHO_CIENTE',
    description: 'Recebimento registrado para continuidade das medidas de protecao.',
    auditAction: 'council.acknowledge',
    patch: (current, now) => {
      const acknowledgedAt = current.councilAcknowledgedAt || now;
      return {
        currentOwner: 'Conselho Tutelar',
        currentUnitId: 'conselho-tutelar',
        councilAcknowledgedAt: acknowledgedAt,
        council: {
          ...(current.council || {}),
          acknowledgedAt,
          acknowledgedBy: state.user.id
        }
      };
    }
  });
  toast('Ciencia do Conselho registrada.');
  navigate('protocol:' + protocolId);
}

export async function activateSamicFlow(protocolId) {
  if (!canCouncilContinue(state.user.role)) {
    toast('Seu perfil nao aciona o SAMIC.');
    return;
  }
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  const open = isSamicOpen();
  await alterarEtapa(protocolId, open ? 'SAMIC_ACIONADO' : 'SAMIC_INDISPONIVEL', {
    eventType: 'SAMIC_ACIONADO',
    description: open ? 'Caso direcionado ao SAMIC para decisao e devolutiva.' : 'Sistema orientou continuidade pela rede de protecao e hospital/SAVVIS, sem impedir decisao humana.',
    auditAction: 'samic.activate',
    patch: (current, now) => ({
      currentOwner: open ? 'SAMIC' : 'Rede de protecao / hospital-SAVVIS',
      currentUnitId: open ? 'samic' : 'rede-protecao',
      samic: {
        ...(current.samic || {}),
        status: open ? 'Acionado em horario de funcionamento' : 'Fechado no momento do acionamento',
        checkedAt: now,
        checkedBy: state.user.id
      }
    })
  });
  toast(open ? 'SAMIC acionado.' : 'SAMIC fechado; rota de rede registrada.');
  navigate('protocol:' + protocolId);
}

export async function saveCouncilFollowup(event) {
  event.preventDefault();
  if (!canCouncilContinue(state.user.role)) {
    toast('Seu perfil nao salva acompanhamento do Conselho.');
    return;
  }
  const protocolId = event.currentTarget.dataset.protocolId;
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  const form = Object.fromEntries(new FormData(event.currentTarget));
  await alterarEtapa(protocolId, 'DECISAO_REGISTRADA', {
    eventType: form.sipiaStatus === 'Registrado' ? 'SIPIA_REGISTRADO' : 'CONSELHO_CIENTE',
    description: form.measure || form.decision || 'Registro administrativo atualizado.',
    auditAction: 'council.followup',
    patch: (current, now) => {
      const acknowledgedAt = current.councilAcknowledgedAt || now;
      return {
        currentOwner: 'Conselho Tutelar',
        currentUnitId: 'conselho-tutelar',
        councilAcknowledgedAt: acknowledgedAt,
        council: {
          ...(current.council || {}),
          acknowledgedAt,
          acknowledgedBy: current.council?.acknowledgedBy || state.user.id,
          decision: form.decision,
          measure: form.measure,
          updatedBy: state.user.id,
          updatedAt: now
        },
        sipia: {
          ...(current.sipia || {}),
          status: form.sipiaStatus || 'Nao informado',
          protocol: form.sipiaProtocol || '',
          updatedAt: now
        }
      };
    }
  });
  toast('Acompanhamento salvo.');
  navigate('protocol:' + protocolId);
}

export async function saveSamicDecision(event) {
  event.preventDefault();
  if (!['supervisor_caso', 'conselho', 'samic'].includes(state.user.role)) {
    toast('Seu perfil nao registra decisao SAMIC.');
    return;
  }
  const protocolId = event.currentTarget.dataset.protocolId;
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const statusCode = normalize(form.samicStatus).includes('indispon') ? 'SAMIC_INDISPONIVEL'
    : normalize(form.samicStatus).includes('dispon') ? 'SAMIC_DISPONIVEL'
      : normalize(form.samicStatus).includes('devol') ? 'DEVOLUTIVA_PENDENTE'
        : normalize(form.samicStatus).includes('atendimento') ? 'EM_ATENDIMENTO'
          : 'SAMIC_ACIONADO';
  await alterarEtapa(protocolId, statusCode, {
    eventType: 'DECISAO_SAMIC',
    description: `${form.samicStatus}: ${form.samicDecision}. ${form.samicNote || ''}`.trim(),
    auditAction: 'samic.decision',
    patch: (current, now) => ({
      currentOwner: form.samicStatus === 'Indisponivel' ? 'Rede de protecao' : 'SAMIC',
      currentUnitId: form.samicStatus === 'Indisponivel' ? 'rede-protecao' : 'samic',
      samic: {
        ...(current.samic || {}),
        status: form.samicStatus,
        decision: form.samicDecision,
        note: form.samicNote,
        offHoursRoute: form.offHoursRoute,
        updatedBy: state.user.id,
        updatedAt: now
      }
    })
  });
  toast('Decisao SAMIC salva.');
  navigate('protocol:' + protocol.id);
}

export function canCouncilContinue(role) {
  return ['supervisor_caso', 'conselho'].includes(role);
}

export function isTransitionAllowed(currentStatus, nextStatus) {
  if (!nextStatus || !protocolStates[nextStatus]) return false;
  if (!currentStatus || currentStatus === nextStatus) return true;
  if (nextStatus === 'ENCERRADO') return true;
  return (protocolTransitions[currentStatus] || []).includes(nextStatus);
}

export async function alterarEtapa(protocoloId, novaEtapa, options = {}) {
  const protocol = typeof protocoloId === 'object' ? protocoloId : findProtocol(protocoloId);
  if (!protocol) throw new Error('Protocolo nao encontrado para transicao.');

  const estadoAnterior = protocolStateCode(protocol);
  if (!isTransitionAllowed(estadoAnterior, novaEtapa)) {
    await auditAction?.('access.denied.transition', `${protocol.number || protocol.id}: ${estadoAnterior} -> ${novaEtapa}`);
    throw new Error(`Transicao nao permitida: ${estadoAnterior} -> ${novaEtapa}`);
  }

  const now = options.at || new Date().toISOString();
  const patch = typeof options.patch === 'function' ? options.patch(protocol, now) : (options.patch || {});
  const visibleToRoles = Array.from(new Set([...(protocol.visibleToRoles || []), ...rolesForStage(novaEtapa), ...(patch.visibleToRoles || [])]));
  const visibleToUnits = Array.from(new Set([
    ...(protocol.visibleToUnits || []),
    protocol.originUnitId,
    protocol.currentUnitId,
    patch.currentUnitId,
    ...(patch.visibleToUnits || [])
  ].filter(Boolean)));
  const eventType = options.eventType || eventTypeForStatus(novaEtapa);
  const description = options.description || transitionDescription(estadoAnterior, novaEtapa);
  const next = withProtocolState({
    ...protocol,
    ...patch,
    visibleToRoles,
    visibleToUnits,
    updatedAt: now,
    timeline: appendTimeline(protocol, eventType, description, now, novaEtapa)
  }, novaEtapa);

  await persistProtocol(next);
  if (options.auditAction) await auditAction?.(options.auditAction, options.auditTarget || protocol.number || protocol.id);
  if (options.notify !== false) await notifyTransition(next, novaEtapa, options);
  return next;
}

export function withProtocolState(protocol, statusCode) {
  const timeline = Array.isArray(protocol.timeline) ? [...protocol.timeline] : [];
  if (timeline.length) {
    const last = timeline[timeline.length - 1];
    timeline[timeline.length - 1] = { ...last, nextStatus: statusCode, estadoNovo: statusCode };
  }
  return {
    ...protocol,
    statusCode,
    status: protocolStates[statusCode] || protocol.status,
    stage: protocolStateStages[statusCode] || protocol.stage,
    timeline
  };
}

function eventTypeForStatus(statusCode) {
  return {
    CONSELHO_ACIONADO: 'CONSELHO_ACIONADO',
    CONSELHO_CIENTE: 'CONSELHO_CIENTE',
    SIPIA_REGISTRADO: 'SIPIA_REGISTRADO',
    SAMIC_ACIONADO: 'SAMIC_ACIONADO',
    SAMIC_DISPONIVEL: 'SAMIC_ACIONADO',
    SAMIC_INDISPONIVEL: 'SAMIC_ACIONADO',
    DECISAO_REGISTRADA: 'DECISAO_SAMIC',
    ENCAMINHAMENTO_CRIADO: 'ENCAMINHAMENTO_CRIADO',
    AGUARDANDO_ACEITE: 'ENCAMINHAMENTO_CRIADO',
    ACEITO: 'ENCAMINHAMENTO_ACEITO',
    EM_ATENDIMENTO: 'ATENDIMENTO_REGISTRADO',
    DEVOLUTIVA_PENDENTE: 'DEVOLUTIVA_REGISTRADA',
    CONCLUIDO: 'DEVOLUTIVA_REGISTRADA',
    ENCERRADO: 'PROTOCOLO_ENCERRADO',
    REABERTO: 'PROTOCOLO_REABERTO'
  }[statusCode] || 'EVENTO_REGISTRADO';
}

function rolesForStage(statusCode) {
  const stage = protocolStateStages[statusCode] || '';
  if (stage === 'conselho' || stage === 'sipia') return ['conselho'];
  if (stage === 'samic' || stage === 'decisao') return ['samic', 'conselho'];
  if (stage === 'encaminhamento') return ['rede', 'conselho'];
  if (stage === 'conclusao' || stage === 'encerrado') return ['conselho'];
  return [];
}

function transitionDescription(from, to) {
  return `Etapa alterada de ${protocolStates[from] || from || 'inicio'} para ${protocolStates[to] || to}.`;
}

async function notifyTransition(protocol, statusCode, options = {}) {
  if (!sparkStore) return;
  const map = {
    CONSELHO_ACIONADO: ['conselho', 'CONSELHO_PENDENTE', 'Conselho Tutelar pendente', `${protocol.number} aguarda ciencia do Conselho Tutelar.`],
    SAMIC_ACIONADO: ['samic', 'SAMIC_ACIONADO', 'SAMIC acionado', `${protocol.number} aguarda decisao do SAMIC.`],
    AGUARDANDO_ACEITE: ['rede', 'ENCAMINHAMENTO_RECEBIDO', 'Encaminhamento recebido', `${protocol.number} aguarda aceite do servico de destino.`],
    ACEITO: ['conselho', 'ENCAMINHAMENTO_ACEITO', 'Encaminhamento aceito', `${protocol.number} teve encaminhamento aceito.`],
    DEVOLUTIVA_PENDENTE: ['conselho', 'DEVOLUTIVA_RECEBIDA', 'Devolutiva registrada', `${protocol.number} recebeu atualizacao de devolutiva.`],
    CONCLUIDO: ['conselho', 'PROTOCOLO_CONCLUIDO', 'Encaminhamento concluido', `${protocol.number} teve encaminhamento concluido.`],
    ENCERRADO: ['gestor', 'PROTOCOLO_CONCLUIDO', 'Protocolo encerrado', `${protocol.number} foi encerrado.`]
  };
  const [targetRole, type, title, message] = map[statusCode] || [];
  if (!type) return;
  const id = crypto.randomUUID();
  await sparkStore.collection('notificacoes').doc(id).set({
    id,
    userId: options.userId || targetRole,
    targetRole,
    type,
    protocolId: protocol.id,
    unitId: protocol.currentUnitId || protocol.originUnitId || '',
    title: options.notificationTitle || title,
    message: options.notificationMessage || message,
    read: false,
    createdAt: new Date().toISOString(),
    status: 'pendente',
    attempts: 1,
    escalation: ''
  });
}

export function isSamicOpen() {
  const config = state.data.system?.config?.samic || { start: '08:00', end: '17:00', weekdays: [1, 2, 3, 4, 5] };
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const exceptions = String(config.exceptions || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (exceptions.includes(todayIso)) return false;
  const weekday = now.getDay();
  if (!(config.weekdays || []).map(Number).includes(weekday)) return false;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = String(config.start || '08:00').split(':').map(Number);
  const [endHour, endMinute] = String(config.end || '17:00').split(':').map(Number);
  return minutesNow >= startHour * 60 + startMinute && minutesNow <= endHour * 60 + endMinute;
}

export function weekdayName(day) {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][Number(day)] || String(day);
}
