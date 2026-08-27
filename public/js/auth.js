// Rede Protege Maués — autenticação, sessão e permissões
import { RPM } from './fluxo.js';
import { sparkStore } from './protocolos.js';
import { appRowToSupabase, getSupabaseContext, supabaseRowToApp } from './supabase-config.js';

const notificationOnlyRoles = ['gerente_ubs', 'gerente_casai', 'gerente_cras', 'gerente_sejel'];
const statsOnlyRoles = ['referencia_saude_crianca'];
const sensitiveAccessRoles = ['supervisor_caso', 'conselho', 'samic', 'autoridade_policial', 'policia_civil', 'policia_federal'];
const operationalRoles = ['entrada', 'conselho', 'samic', 'rede', 'vigilancia', 'supervisor_caso', 'autoridade_policial', 'policia_civil', 'policia_federal'];

export function navForRole(role, navItems) {
  if (statsOnlyRoles.includes(role)) return navItems.filter(([id]) => ['dashboard', 'reports', 'knowledge', 'help'].includes(id));
  if (notificationOnlyRoles.includes(role)) return navItems.filter(([id]) => ['dashboard', 'notifications', 'training', 'knowledge', 'help'].includes(id));
  if (role !== 'admin') return navItems.filter(([id]) => !['users', 'settings'].includes(id));
  return navItems;
}

export function canManage(role) { return role === 'admin'; }
export function canViewCase(role) { return ['supervisor_caso', 'entrada', 'conselho', 'samic', 'rede', 'vigilancia', 'autoridade_policial', 'policia_civil', 'policia_federal'].includes(role); }
export function canViewStats(role) { return ['admin', 'gestor', 'referencia_saude_crianca', 'conselho', 'samic', 'autoridade_policial', 'policia_civil', 'policia_federal'].includes(role); }
export function canViewSensitive(role) { return sensitiveAccessRoles.includes(role); }
export function canUseOperationalActions(role) { return operationalRoles.includes(role); }
export function canNotify(role) { return ['entrada', 'conselho', 'samic', 'rede', 'autoridade_policial', 'policia_civil', 'policia_federal', ...notificationOnlyRoles].includes(role); }

export function getUsers() {
  return sparkStore.readState().users;
}

export function currentUser() {
  const selected = localStorage.getItem(RPM.sessionKey);
  const users = getUsers().filter((user) => user.active);
  return users.find((user) => user.id === selected) || users.find((user) => user.email === 'diegofernandosilva.10@gmail.com') || users[0];
}

export function selectUser(id) {
  localStorage.setItem(RPM.sessionKey, id);
  return currentUser();
}

export function authModeLabel() {
  return 'Supabase Auth ativo no publicado; modo local apenas no VS Code';
}

const BOOTSTRAP_ADMIN_EMAIL = 'diegofernandosilva.10@gmail.com';

let profilesUnsubscribe = null;

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function displayNameFromEmail(email) {
  return normalizeEmail(email).split('@')[0]?.replace(/[._-]+/g, ' ') || 'Usuario';
}

function bootstrapAdminProfile(supabaseUser, base = {}, request = {}) {
  const email = normalizeEmail(supabaseUser.email || base.email || request.email);
  return cleanProfile({
    ...base,
    id: supabaseUser.id,
    email,
    name: supabaseUser.user_metadata?.name || base.name || request.name || displayNameFromEmail(email),
    role: 'admin',
    unitId: 'rede',
    active: true,
    requestedUnit: base.requestedUnit || request.requestedUnit || 'Administracao',
    provider: supabaseUser.app_metadata?.provider || base.provider || request.provider || 'password',
    emailVerified: Boolean(supabaseUser.email_confirmed_at || base.emailVerified)
  });
}

function cleanProfile(profile) {
  return {
    id: profile.id,
    email: normalizeEmail(profile.email),
    name: profile.name || displayNameFromEmail(profile.email),
    role: profile.role || 'pending',
    unitId: profile.unitId || '',
    active: Boolean(profile.active),
    liberation: profile.active ? 'liberado' : 'pendente',
    requestedUnit: profile.requestedUnit || '',
    provider: profile.provider || 'password',
    emailVerified: Boolean(profile.emailVerified),
    createdAt: profile.createdAt || nowIso(),
    updatedAt: nowIso()
  };
}

async function supabaseContext(options = {}) {
  return getSupabaseContext(options);
}

async function ensureProfile(supabaseUser, request = {}) {
  const context = await supabaseContext({ requireAuth: true });
  if (!context || !supabaseUser) return null;

  const { client } = context;
  const email = normalizeEmail(supabaseUser.email || request.email);
  const isBootstrapAdmin = email === BOOTSTRAP_ADMIN_EMAIL;
  const byId = await client.from('usuarios').select('*').eq('id', supabaseUser.id).maybeSingle();
  if (byId.error) throw byId.error;

  let existing = byId.data;
  if (!existing && email) {
    const byEmail = await client.from('usuarios').select('*').eq('email', email).maybeSingle();
    if (byEmail.error) throw byEmail.error;
    existing = byEmail.data;
  }

  if (existing) {
    const profile = supabaseRowToApp('usuarios', existing);
    if (isBootstrapAdmin && (profile.role !== 'admin' || profile.unitId !== 'rede' || !profile.active)) {
      const repaired = bootstrapAdminProfile(supabaseUser, profile, request);
      try {
        const conflictTarget = profile.id === supabaseUser.id ? 'id' : 'email';
        const { error } = await client.from('usuarios').upsert(appRowToSupabase('usuarios', repaired), { onConflict: conflictTarget });
        if (error) throw error;
      } catch (error) {
        console.warn('[auth] Reparo remoto do administrador bootstrap indisponivel.', error);
      }
      return repaired;
    }
    return profile;
  }

  const profile = cleanProfile({
    id: supabaseUser.id,
    email,
    name: supabaseUser.user_metadata?.name || request.name || displayNameFromEmail(email),
    role: isBootstrapAdmin ? 'admin' : 'pending',
    unitId: isBootstrapAdmin ? 'rede' : '',
    active: isBootstrapAdmin,
    requestedUnit: request.requestedUnit || '',
    provider: supabaseUser.app_metadata?.provider || request.provider || 'password',
    emailVerified: Boolean(supabaseUser.email_confirmed_at)
  });

  const { error } = await client.from('usuarios').upsert(appRowToSupabase('usuarios', profile), { onConflict: 'id' });
  if (error) throw error;
  return profile;
}

export async function firebaseAuthAvailable() {
  return Boolean(await supabaseContext());
}

export async function supabaseAuthAvailable() {
  return Boolean(await supabaseContext());
}

export async function observeRemoteSession() {
  const context = await supabaseContext();
  if (!context) return { mode: 'local', supabaseUser: null, profile: null };

  const { data, error } = await context.client.auth.getSession();
  if (error) throw error;
  const supabaseUser = data.session?.user;
  if (!supabaseUser) return { mode: 'supabase', supabaseUser: null, profile: null };
  try {
    const profile = await ensureProfile(supabaseUser);
    return { mode: 'supabase', supabaseUser, profile };
  } catch (profileError) {
    console.warn('[auth] Perfil remoto indisponivel.', profileError);
    return { mode: 'supabase', supabaseUser, profile: null, error: profileError };
  }
}

export async function signInWithInstitutionalEmail(email, password) {
  const context = await supabaseContext();
  if (!context) return { mode: 'local', profile: null };
  const { data, error } = await context.client.auth.signInWithPassword({ email: normalizeEmail(email), password });
  if (error) throw error;
  const profile = await ensureProfile(data.user);
  return { mode: 'supabase', supabaseUser: data.user, profile };
}

export async function signInWithGoogleAccount() {
  const context = await supabaseContext();
  if (!context) return { mode: 'local', profile: null };
  const { error } = await context.client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href,
      queryParams: { prompt: 'select_account' }
    }
  });
  if (error) throw error;
  return { mode: 'supabase', profile: null };
}

export async function requestRemoteAccess(request) {
  const context = await supabaseContext();
  if (!context) return { mode: 'local', profile: null };
  const { data, error } = await context.client.auth.signUp({
    email: normalizeEmail(request.email),
    password: request.password,
    options: {
      data: {
        name: request.name || '',
        requestedUnit: request.requestedUnit || ''
      }
    }
  });
  if (error) throw error;
  const profile = data.session ? await ensureProfile(data.user, {
    name: request.name,
    email: request.email,
    requestedUnit: request.requestedUnit,
    provider: 'password'
  }) : cleanProfile({
    id: data.user?.id || `pending-${crypto.randomUUID()}`,
    name: request.name,
    email: request.email,
    requestedUnit: request.requestedUnit,
    provider: 'password',
    role: 'pending',
    active: false
  });
  return { mode: 'supabase', supabaseUser: data.user, profile };
}

export async function sendRemotePasswordReset(email) {
  const context = await supabaseContext();
  if (!context) return false;
  const { error } = await context.client.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: `${window.location.origin}/login.html`
  });
  if (error) throw error;
  return true;
}

export async function signOutRemote() {
  const context = await supabaseContext();
  if (context) await context.client.auth.signOut();
}

export async function saveRemoteUserProfile(profile) {
  const context = await supabaseContext({ requireAuth: true });
  if (!context || !profile?.id) return false;
  const { error } = await context.client.from('usuarios').upsert(appRowToSupabase('usuarios', cleanProfile(profile)), { onConflict: 'id' });
  if (error) throw error;
  return true;
}

export async function listenRemoteProfiles(callback) {
  const context = await supabaseContext({ requireAuth: true });
  if (!context) return () => {};
  if (profilesUnsubscribe) profilesUnsubscribe();
  const fetchProfiles = async () => {
    const { data, error } = await context.client.from('usuarios').select('*').order('updated_at', { ascending: false });
    if (error) {
      console.warn('[auth] Lista remota de usuarios indisponivel.', error);
      return;
    }
    callback((data || []).map((row) => supabaseRowToApp('usuarios', row)));
  };
  await fetchProfiles();
  const channel = context.client.channel('rpm-usuarios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, fetchProfiles)
    .subscribe();
  profilesUnsubscribe = () => context.client.removeChannel(channel);
  return profilesUnsubscribe;
}

// --- Camada de interface migrada do sistema existente ---
export const AUTH_SESSION_KEY = 'rpm.pec55.auth.session';
const entryStepMs = 1000;
let splashTimer = null;
let entryInterval = null;
let remoteProfileUnsubscribe = null;
let remoteProfileSyncStarting = false;
let activateSamicFlow, activityPanel, appendTimeline, applySearch, audit, auditAction, auditProtocolRead, auditTrailList, average, bindActions, bindModalActions, bindShell, boot, breakdownPanel, buildProtocol, canCouncilContinue, canForwardContinue, caseCard, caseGrid, checklist, closeModal, closeProtocol, closurePanel, commandBoard, compactCase, confirmCouncilAwareness, contingency, copyFor, council, councilFollowupPanel, countBy, csvCell, dashboard, dashboardData, dashedEmpty, deadlineBadge, destinationName, emptyRoute, entrySequence, esc, escAttr, estimateSpark, exportCsv, findForward, findProtocol, flowSettingsForm, flowSteps, formatDate, formatDuration, formatHours, forwardActionButtons, forwardDestinationOptions, forwardOperationsTable, forwards, governanceList, groupedNav, guardAction, handleActionError, handoffCard, healthEntryAlert, help, hoursBetween, initials, isClosed, isHealthEntry, isOccurrenceRoute, isSamicOpen, knowledge, labelFor, lastDaysCount, list, liveClock, liveUsersPanel, management, managementCard, markNotificationRead, metric, metrics, mobileBottomNav, mobileRoutesForPackShell, modalShell, moduleCard, municipalFlowCounts, municipalFlowPanel, navButton, navItems, navSignal, navigate, network, nextDeadline, normalize, normalizeAppState, notificationItem, notificationModal, notifications, occurrenceDetails, officialOptions, officialRecordsPanel, officialSummary, openModal, opsTable, persistProtocol, priorityBadge, projectIndicatorGrid, projectIndicatorValues, protocolForm, protocolModal, protocolOperationsTable, protocolRisk, protocolStateCode, protocolStateLabel, protocolStateStage, protocolStateStages, protocolStates, protocolTable, protocolTimeline, protocols, quickAction, quickActionsPanel, render, renderFailure, reopenProtocol, reports, roles, routeCopy, routeGroups, routeLoading, rpmPublicContract, samic, samicDecisionPanel, samicStatusCard, saveCouncilFollowup, saveForward, saveNotification, saveOfficialRecords, saveSamicDecision, saveSettings, saveUnit, saveUser, scheduleRender, securityPanel, settings, shell, sparkPanel, stageBoard, state, statusBadge, table, textOnly, thisMonthCount, timeoutPromise, titleFor, toast, todayCount, training, unitModal, unitName, unitOperationsGrid, unitOptions, updateForwardStatus, userModal, userOperationsTable, users, view, weekdayName, withProtocolState, workflowPanel;
export function initAuthUI(runtime) {
  activateSamicFlow = runtime.activateSamicFlow;
  activityPanel = runtime.activityPanel;
  appendTimeline = runtime.appendTimeline;
  applySearch = runtime.applySearch;
  audit = runtime.audit;
  auditAction = runtime.auditAction;
  auditProtocolRead = runtime.auditProtocolRead;
  auditTrailList = runtime.auditTrailList;
  average = runtime.average;
  bindActions = runtime.bindActions;
  bindModalActions = runtime.bindModalActions;
  bindShell = runtime.bindShell;
  boot = runtime.boot;
  breakdownPanel = runtime.breakdownPanel;
  buildProtocol = runtime.buildProtocol;
  canCouncilContinue = runtime.canCouncilContinue;
  canForwardContinue = runtime.canForwardContinue;
  caseCard = runtime.caseCard;
  caseGrid = runtime.caseGrid;
  checklist = runtime.checklist;
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
  csvCell = runtime.csvCell;
  dashboard = runtime.dashboard;
  dashboardData = runtime.dashboardData;
  dashedEmpty = runtime.dashedEmpty;
  deadlineBadge = runtime.deadlineBadge;
  destinationName = runtime.destinationName;
  emptyRoute = runtime.emptyRoute;
  entrySequence = runtime.entrySequence;
  esc = runtime.esc;
  escAttr = runtime.escAttr;
  estimateSpark = runtime.estimateSpark;
  exportCsv = runtime.exportCsv;
  findForward = runtime.findForward;
  findProtocol = runtime.findProtocol;
  flowSettingsForm = runtime.flowSettingsForm;
  flowSteps = runtime.flowSteps;
  formatDate = runtime.formatDate;
  formatDuration = runtime.formatDuration;
  formatHours = runtime.formatHours;
  forwardActionButtons = runtime.forwardActionButtons;
  forwardDestinationOptions = runtime.forwardDestinationOptions;
  forwardOperationsTable = runtime.forwardOperationsTable;
  forwards = runtime.forwards;
  governanceList = runtime.governanceList;
  groupedNav = runtime.groupedNav;
  guardAction = runtime.guardAction;
  handleActionError = runtime.handleActionError;
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
  management = runtime.management;
  managementCard = runtime.managementCard;
  markNotificationRead = runtime.markNotificationRead;
  metric = runtime.metric;
  metrics = runtime.metrics;
  mobileBottomNav = runtime.mobileBottomNav;
  mobileRoutesForPackShell = runtime.mobileRoutesForPackShell;
  modalShell = runtime.modalShell;
  moduleCard = runtime.moduleCard;
  municipalFlowCounts = runtime.municipalFlowCounts;
  municipalFlowPanel = runtime.municipalFlowPanel;
  navButton = runtime.navButton;
  navItems = runtime.navItems;
  navSignal = runtime.navSignal;
  navigate = runtime.navigate;
  network = runtime.network;
  nextDeadline = runtime.nextDeadline;
  normalize = runtime.normalize;
  normalizeAppState = runtime.normalizeAppState;
  notificationItem = runtime.notificationItem;
  notificationModal = runtime.notificationModal;
  notifications = runtime.notifications;
  occurrenceDetails = runtime.occurrenceDetails;
  officialOptions = runtime.officialOptions;
  officialRecordsPanel = runtime.officialRecordsPanel;
  officialSummary = runtime.officialSummary;
  openModal = runtime.openModal;
  opsTable = runtime.opsTable;
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
  render = runtime.render;
  renderFailure = runtime.renderFailure;
  reopenProtocol = runtime.reopenProtocol;
  reports = runtime.reports;
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
  settings = runtime.settings;
  shell = runtime.shell;
  sparkPanel = runtime.sparkPanel;
  stageBoard = runtime.stageBoard;
  state = runtime.state;
  statusBadge = runtime.statusBadge;
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

export async function restoreRemoteSession() {
  const session = await observeRemoteSession();
  state.authMode = session.mode || 'local';
  if (session.profile) {
    activateProfile(session.profile, state.authMode);
    return;
  }

  if (state.authenticated) {
    const user = currentUser();
    if (user?.active) {
      state.user = user;
      state.entryReady = true;
      await startRemoteProfileSync();
      return;
    }
  }

  sessionStorage.removeItem(AUTH_SESSION_KEY);
  state.authenticated = false;
}

export function renderEntry() {
  const app = document.querySelector('#app');
  document.body.classList.remove('modal-open');
  app.innerHTML = entryShell();
  bindEntry();
  window.lucide?.createIcons?.();
  startEntrySequence();
}

export function entryShell() {
  return `
    <main class="entry-shell ${state.entryReady ? 'login-ready' : 'loading'}">
      <section class="entry-stage" aria-label="Abertura do sistema">
        <div class="entry-art">
          <img src="/assets/images/maos-que-protegem-pessoas.png" alt="Maos que Protegem">
        </div>
        <div class="entry-phrases" aria-live="polite">
          <span class="entry-phrase" data-entry-phrase>${esc(entrySequence[0])}</span>
        </div>
        <div class="entry-progress"><span></span></div>
      </section>
      <section class="login-panel" aria-label="Entrar no sistema">
        <div class="login-panel-brand" aria-hidden="true">
          <img src="/assets/images/maos-que-protegem-pessoas.png" alt="">
        </div>
        ${authCard()}
      </section>
    </main>`;
}

export function authCard() {
  if (state.pendingAccess) return pendingAccessCard(state.pendingAccess);
  if (state.entryMode === 'register') return registerCard();
  return loginCard();
}

export function loginCard() {
  return `<form class="login-card" id="login-form">
    <div class="login-card-head">
      <img class="login-logo" src="/assets/logos/maos-que-protegem-logo.png" alt="Maos que Protegem">
      <div>
        <strong>Entrar</strong>
        <small>Acesso restrito a usuarios cadastrados e autorizados.</small>
      </div>
    </div>
    ${state.authNotice ? `<p class="form-note">${esc(state.authNotice)}</p>` : ''}
    <label class="field"><span>E-mail institucional</span><input name="email" type="email" value="diegofernandosilva.10@gmail.com" autocomplete="email" required></label>
    <label class="field"><span>Senha</span><input name="password" type="password" autocomplete="current-password"></label>
    <button class="button primary login-submit"><i data-lucide="log-in"></i><span>Entrar</span></button>
    <div class="login-divider"><span></span><strong>OU</strong><span></span></div>
    <button class="google-button" type="button" data-action="google-login"><b>G</b><span>Entrar com o Google</span></button>
    <div class="login-secondary">
      <button type="button" data-action="request-access">Criar acesso</button>
      <button type="button" data-action="recover-password">Esqueci a senha</button>
    </div>
  </form>`;
}

export function registerCard() {
  return `<form class="login-card register-card" id="register-form">
    <div class="login-card-head">
      <img class="login-logo" src="/assets/logos/maos-que-protegem-logo.png" alt="Maos que Protegem">
      <div>
        <strong>Criar acesso</strong>
        <small>O cadastro entra pendente para liberacao do administrador tecnico.</small>
      </div>
    </div>
    ${state.authNotice ? `<p class="form-note">${esc(state.authNotice)}</p>` : ''}
    <label class="field"><span>Nome completo</span><input name="name" autocomplete="name" required></label>
    <label class="field"><span>E-mail institucional</span><input name="email" type="email" autocomplete="email" required></label>
    <label class="field"><span>Orgao ou unidade</span><input name="requestedUnit" placeholder="Ex.: Conselho Tutelar, Policia Civil, UBS..." required></label>
    <label class="field"><span>Senha</span><input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
    <button class="button primary login-submit"><i data-lucide="user-plus"></i><span>Solicitar cadastro</span></button>
    <button class="button login-back" type="button" data-action="back-login"><i data-lucide="arrow-left"></i><span>Voltar para login</span></button>
  </form>`;
}

export function pendingAccessCard(profile) {
  return `<section class="login-card pending-card">
    <div class="login-card-head">
      <img class="login-logo" src="/assets/logos/maos-que-protegem-logo.png" alt="Maos que Protegem">
      <div>
        <strong>Aguardando</strong>
        <small>Cadastro recebido. O administrador tecnico precisa liberar perfil e unidade.</small>
      </div>
    </div>
    <div class="pending-access-box">
      <span class="status-badge warning">Pendente</span>
      <strong>${esc(profile.name || profile.email)}</strong>
      <p>${esc(profile.email || '')}</p>
      ${profile.requestedUnit ? `<small>Solicitacao: ${esc(profile.requestedUnit)}</small>` : ''}
    </div>
    <button class="button primary" type="button" data-action="refresh-access"><i data-lucide="refresh-cw"></i><span>Verificar liberacao</span></button>
    <button class="button login-back" type="button" data-action="back-login"><i data-lucide="arrow-left"></i><span>Voltar para login</span></button>
  </section>`;
}

export function startEntrySequence() {
  clearEntryTimers();
  if (state.entryReady) return;

  const phraseNode = document.querySelector('[data-entry-phrase]');
  let index = 0;

  const showPhrase = () => {
    if (!phraseNode || index >= entrySequence.length) {
      finishEntrySequence();
      return;
    }
    phraseNode.textContent = entrySequence[index];
    phraseNode.classList.remove('phrase-visible');
    phraseNode.getBoundingClientRect();
    phraseNode.classList.add('phrase-visible');
    index += 1;
  };

  showPhrase();
  entryInterval = setInterval(() => {
    if (index >= entrySequence.length) {
      finishEntrySequence();
      return;
    }
    showPhrase();
  }, entryStepMs);
}

export function finishEntrySequence() {
  clearEntryTimers();
  splashTimer = setTimeout(() => {
    state.entryReady = true;
    splashTimer = null;
    render();
  }, 180);
}

export function clearEntryTimers() {
  if (entryInterval) {
    clearInterval(entryInterval);
    entryInterval = null;
  }
  if (splashTimer) {
    clearTimeout(splashTimer);
    splashTimer = null;
  }
}

export function bindEntry() {
  document.querySelector('#login-form')?.addEventListener('submit', handleLogin);
  document.querySelector('#register-form')?.addEventListener('submit', handleRegister);
  document.querySelector('[data-action="google-login"]')?.addEventListener('click', handleGoogleLogin);
  document.querySelector('[data-action="request-access"]')?.addEventListener('click', () => {
    state.entryMode = 'register';
    state.authNotice = '';
    state.entryReady = true;
    render();
  });
  document.querySelector('[data-action="back-login"]')?.addEventListener('click', async () => {
    state.entryMode = 'login';
    state.pendingAccess = null;
    state.authNotice = '';
    await signOutRemote();
    render();
  });
  document.querySelector('[data-action="recover-password"]')?.addEventListener('click', handleRecoverPassword);
  document.querySelector('[data-action="refresh-access"]')?.addEventListener('click', async () => {
    await restoreRemoteSession();
    if (!state.authenticated && state.pendingAccess) state.authNotice = 'A liberacao ainda nao apareceu para esta conta.';
    render();
  });
}

export async function handleLogin(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const email = normalizeEmail(form.email);
  const password = String(form.password || '');
  state.authNotice = '';

  if (password) {
    try {
      const result = await signInWithInstitutionalEmail(email, password);
      if (result.profile) {
        activateProfile(result.profile, result.mode);
        render();
        return;
      }
    } catch (error) {
      state.authNotice = friendlyAuthError(error);
      render();
      return;
    }
  }

  const localUser = findUserByEmail(email);
  if (!localUser) {
    state.authNotice = 'Conta nao encontrada. Solicite cadastro ou entre com o Google.';
    render();
    return;
  }

  activateProfile(localUser, 'local');
  render();
}

export async function handleGoogleLogin() {
  state.authNotice = '';
  try {
    const result = await signInWithGoogleAccount();
    if (!result.profile) {
      state.authNotice = 'Google indisponivel neste ambiente. Use e-mail/senha ou solicite cadastro.';
      render();
      return;
    }
    activateProfile(result.profile, result.mode);
    render();
  } catch (error) {
    state.authNotice = friendlyAuthError(error);
    render();
  }
}

export async function handleRegister(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  state.authNotice = '';
  try {
    const result = await requestRemoteAccess(form);
    if (result.profile) {
      activateProfile(result.profile, result.mode);
      render();
      return;
    }
  } catch (error) {
    state.authNotice = friendlyAuthError(error);
    render();
    return;
  }

  const profile = await createLocalPendingAccess(form);
  activateProfile(profile, 'local');
  render();
}

export async function handleRecoverPassword() {
  const email = normalizeEmail(document.querySelector('#login-form input[name="email"]')?.value || '');
  if (!email) {
    state.authNotice = 'Informe o e-mail institucional para recuperar a senha.';
    render();
    return;
  }
  try {
    const sent = await sendRemotePasswordReset(email);
    state.authNotice = sent ? 'E-mail de recuperacao enviado.' : 'Recuperacao remota indisponivel neste ambiente.';
  } catch (error) {
    state.authNotice = friendlyAuthError(error);
  }
  render();
}

export function activateProfile(profile, mode = 'local') {
  syncUserProfile(profile);
  state.authMode = mode;
  state.entryReady = true;
  state.sidebarOpen = false;

  if (!profile.active || profile.role === 'pending') {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    state.authenticated = false;
    state.pendingAccess = profile;
    state.authNotice = '';
    return false;
  }

  selectUser(profile.id);
  state.user = currentUser();
  state.data = normalizeAppState(sparkStore.readState());
  state.pendingAccess = null;
  state.authenticated = true;
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ mode, uid: profile.id, at: new Date().toISOString() }));
  if (!location.hash) location.hash = 'dashboard';
  startRemoteProfileSync();
  return true;
}

export function syncUserProfile(profile) {
  const storeState = normalizeAppState(sparkStore.readState());
  const email = normalizeEmail(profile.email);
  const nextUsers = (storeState.users || []).filter((user) => user.id === profile.id || normalizeEmail(user.email) !== email);
  const index = nextUsers.findIndex((user) => user.id === profile.id);
  const current = index >= 0 ? nextUsers[index] : {};
  const next = { ...current, ...profile, email };
  if (index >= 0) nextUsers[index] = next;
  else nextUsers.push(next);
  storeState.users = nextUsers;
  sparkStore.writeState(storeState);
}

export function mergeRemoteProfiles(profiles) {
  const storeState = normalizeAppState(sparkStore.readState());
  let users = [...(storeState.users || [])];
  for (const profile of profiles) {
    const email = normalizeEmail(profile.email);
    users = users.filter((user) => user.id === profile.id || normalizeEmail(user.email) !== email);
    const index = users.findIndex((user) => user.id === profile.id);
    if (index >= 0) users[index] = { ...users[index], ...profile, email };
    else users.push({ ...profile, email });
  }
  storeState.users = users;
  sparkStore.writeState(storeState);
}

export async function startRemoteProfileSync() {
  if (state.authMode !== 'supabase' || state.user?.role !== 'admin' || remoteProfileUnsubscribe || remoteProfileSyncStarting) return;
  remoteProfileSyncStarting = true;
  try {
    remoteProfileUnsubscribe = await listenRemoteProfiles((profiles) => {
      mergeRemoteProfiles(profiles);
      state.data = normalizeAppState(sparkStore.readState());
      if (state.authenticated) scheduleRender();
    });
  } finally {
    remoteProfileSyncStarting = false;
  }
}

export async function createLocalPendingAccess(form) {
  const id = `pending-${crypto.randomUUID()}`;
  const profile = {
    id,
    email: normalizeEmail(form.email),
    name: form.name || normalizeEmail(form.email),
    role: 'pending',
    unitId: '',
    active: false,
    liberation: 'pendente',
    requestedUnit: form.requestedUnit || '',
    provider: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await sparkStore.collection('usuarios').doc(id).set(profile);
  const auditId = crypto.randomUUID();
  try {
    await sparkStore.collection('auditoria').doc(auditId).set({ id: auditId, actorId: id, action: 'access.request', target: profile.email, at: new Date().toISOString() });
  } catch (error) {
    console.warn('[audit] solicitacao sem trilha remota.', error);
  }
  return profile;
}

export function findUserByEmail(email) {
  return (normalizeAppState(sparkStore.readState()).users || []).find((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

export function friendlyAuthError(error) {
  const code = String(error?.code || error?.message || '').toLowerCase();
  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) return 'E-mail ou senha nao conferem.';
  if (code.includes('invalid login credentials') || code.includes('invalid_credentials')) return 'E-mail ou senha nao conferem.';
  if (code.includes('auth/user-not-found')) return 'Conta nao encontrada. Solicite cadastro.';
  if (code.includes('email not confirmed')) return 'Confirme o e-mail antes de entrar.';
  if (code.includes('auth/email-already-in-use')) return 'Este e-mail ja tem cadastro. Use entrar ou recupere a senha.';
  if (code.includes('user already registered') || code.includes('already registered')) return 'Este e-mail ja tem cadastro. Use entrar ou recupere a senha.';
  if (code.includes('auth/popup-closed-by-user')) return 'Entrada com Google cancelada.';
  if (code.includes('auth/weak-password')) return 'Use uma senha com pelo menos 6 caracteres.';
  if (code.includes('weak_password') || code.includes('password should be')) return 'Use uma senha com pelo menos 6 caracteres.';
  if (code.includes('permission-denied')) return 'Cadastro criado, mas a liberacao depende das regras do administrador.';
  if (code.includes('permission denied') || code.includes('row-level security')) return 'Permissao negada. Verifique perfil, unidade e liberacao do usuario.';
  return 'Nao foi possivel concluir o acesso agora.';
}


export async function logoutCurrentSession() {
  await signOutRemote();
  if (remoteProfileUnsubscribe) remoteProfileUnsubscribe();
  remoteProfileUnsubscribe = null;
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  state.authenticated = false;
  state.entryReady = false;
  state.sidebarOpen = false;
  state.pendingAccess = null;
  state.entryMode = 'login';
  clearEntryTimers();
}
