// Rede Protege Maués — protocolos e camada de dados compatível com o sistema atual
import { RPM, sparkCollections } from './fluxo.js';
import {
  appRowToSupabase,
  getSupabaseContext,
  supabaseColumnForField,
  supabaseRowToApp,
  supabaseTableName
} from './supabase-config.js';
import { defaultSystemConfig } from './administracao.js';

export const rpmSparkSeed = {
  users: [
    {
      id: 'diego-admin',
      email: 'diegofernandosilva.10@gmail.com',
      name: 'Diego Fernando Pereira da Silva',
      role: 'admin',
      unitId: 'rede',
      active: true,
      liberation: 'liberado',
      requestedUnit: 'Administracao',
      provider: 'bootstrap',
      emailVerified: true,
      createdAt: '2026-08-12T03:33:00',
      updatedAt: '2026-08-12T03:33:00',
      lastSeenAt: '2026-08-12T03:33:00'
    }
  ],
  units: [],
  protocols: [],
  forwards: [],
  notifications: [],
  audit: [],
  system: {
    config: {
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
      retentionPolicy: 'Modulo funcional em branco. Dados reais entram somente pelo fluxo autorizado.'
    }
  }
};

const REMOTE_TIMEOUT_MS = 6500;
const refreshingCollections = new Map();
const sampleProtocolNumbersToRemove = new Set([
  'RP-2026-E7113C',
  'RP-2026-AB0F55',
  'RP-2026-8E2D88',
  'RP-2026-490499'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

const stateKeyByCollection = Object.freeze({
  usuarios: 'users',
  unidades: 'units',
  protocolos: 'protocols',
  estatisticasProtocolos: 'protocolStats',
  encaminhamentos: 'forwards',
  notificacoes: 'notifications',
  auditoria: 'audit',
  configuracoes: 'system'
});

function stateKey(collectionName) {
  return stateKeyByCollection[collectionName] || collectionName;
}

function sampleProtocolRefs(protocols = [], extraIds = []) {
  const rows = Array.isArray(protocols) ? protocols : [];
  const ids = new Set(Array.isArray(extraIds) ? extraIds.filter(Boolean) : []);
  const numbers = new Set(sampleProtocolNumbersToRemove);
  rows.forEach((protocol) => {
    if (!sampleProtocolNumbersToRemove.has(protocol?.number)) return;
    if (protocol.id) ids.add(protocol.id);
    if (protocol.number) numbers.add(protocol.number);
  });
  return { ids, numbers };
}

function referencesRemovedProtocol(row = {}, ids = new Set(), numbers = sampleProtocolNumbersToRemove) {
  if (row.protocolId && ids.has(row.protocolId)) return true;
  const text = [row.number, row.title, row.message, row.target, row.action, row.description, row.details]
    .filter(Boolean)
    .join(' ');
  return [...numbers].some((number) => text.includes(number));
}

function filterRemovedSampleRows(key, rows = [], knownProtocols = [], removedIds = []) {
  const refs = sampleProtocolRefs(knownProtocols, removedIds);
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (key === 'protocols') return !sampleProtocolNumbersToRemove.has(row.number);
    if (['forwards', 'notifications', 'audit'].includes(key)) return !referencesRemovedProtocol(row, refs.ids, refs.numbers);
    return true;
  });
}

function sanitizeRemovedSampleProtocols(raw = {}) {
  if (!raw || typeof raw !== 'object') return raw;
  const refs = sampleProtocolRefs(raw.protocols, raw.removedSampleProtocolIds);
  return {
    ...raw,
    removedSampleProtocolIds: Array.from(new Set([...(Array.isArray(raw.removedSampleProtocolIds) ? raw.removedSampleProtocolIds : []), ...refs.ids])),
    protocols: filterRemovedSampleRows('protocols', raw.protocols || [], raw.protocols || [], raw.removedSampleProtocolIds),
    forwards: (Array.isArray(raw.forwards) ? raw.forwards : []).filter((row) => !referencesRemovedProtocol(row, refs.ids, refs.numbers)),
    notifications: (Array.isArray(raw.notifications) ? raw.notifications : []).filter((row) => !referencesRemovedProtocol(row, refs.ids, refs.numbers)),
    audit: (Array.isArray(raw.audit) ? raw.audit : []).filter((row) => !referencesRemovedProtocol(row, refs.ids, refs.numbers))
  };
}

function ensureState() {
  const raw = localStorage.getItem(RPM.localStoreKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const state = sanitizeRemovedSampleProtocols(parsed);
      if (state && typeof state === 'object') {
        if (state.version !== RPM.version) {
          state.version = RPM.version;
        }
        if (JSON.stringify(state) !== JSON.stringify(parsed)) localStorage.setItem(RPM.localStoreKey, JSON.stringify(state));
        return state;
      }
    } catch {}
  }
  const state = { version: RPM.version, mode: 'local-supabase-spark-adapter', savedAt: new Date().toISOString(), ...clone(rpmSparkSeed) };
  localStorage.setItem(RPM.localStoreKey, JSON.stringify(state));
  return state;
}

function persist(state, reason = 'local-write') {
  const next = sanitizeRemovedSampleProtocols({ ...state, savedAt: new Date().toISOString() });
  localStorage.setItem(RPM.localStoreKey, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('rpm-spark-store-change', { detail: { reason } }));
  return next;
}

function cacheRows(collectionName, rows) {
  const state = ensureState();
  const key = stateKey(collectionName);
  const nextRows = filterRemovedSampleRows(key, rows, state.protocols || [], state.removedSampleProtocolIds || []);
  if (JSON.stringify(state[key] || []) === JSON.stringify(nextRows)) return;
  state[key] = nextRows;
  persist(state, 'remote-refresh');
}

function cacheOne(collectionName, row) {
  const state = ensureState();
  const key = stateKey(collectionName);
  if (filterRemovedSampleRows(key, [row], state.protocols || [], state.removedSampleProtocolIds || []).length === 0) return;
  const rows = state[key] || [];
  const index = rows.findIndex((item) => item.id === row.id);
  if (index >= 0 && JSON.stringify(rows[index]) === JSON.stringify(row)) return;
  if (index >= 0) rows[index] = row;
  else rows.push(row);
  state[key] = rows;
  persist(state, 'remote-cache');
}

async function remoteContext() {
  return getSupabaseContext({ requireAuth: true }).catch((error) => {
    console.warn('[store] Supabase remoto indisponivel, usando fallback local.', error);
    return null;
  });
}

function remoteCollection(context, collectionName) {
  return context.client.from(supabaseTableName(collectionName));
}

function applyRemoteQuery(query, collectionName, filters, sort, cap) {
  let nextQuery = query.select('*');
  for (const filter of filters) {
    const column = supabaseColumnForField(collectionName, filter.field);
    if (filter.operator === '==') nextQuery = nextQuery.eq(column, filter.value);
    else if (filter.operator === 'in') nextQuery = nextQuery.in(column, filter.value);
    else if (filter.operator === 'array-contains') nextQuery = nextQuery.contains(column, [filter.value]);
  }
  if (sort) nextQuery = nextQuery.order(supabaseColumnForField(collectionName, sort.field), { ascending: sort.direction !== 'desc' });
  if (cap) nextQuery = nextQuery.limit(cap);
  return nextQuery;
}

function timeoutPromise(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label)), ms))
  ]);
}

function localRows(collectionName, filters = [], sort = null, cap = null) {
  const state = ensureState();
  let rows = [...(state[stateKey(collectionName)] || [])];
  for (const filter of filters) rows = rows.filter((row) => compare(row[filter.field], filter.operator, filter.value));
  if (sort) rows.sort((a, b) => (sort.direction === 'desc' ? -1 : 1) * String(a[sort.field] || '').localeCompare(String(b[sort.field] || '')));
  if (cap) rows = rows.slice(0, cap);
  return rows;
}

function snapshotFromRows(rows) {
  return { docs: rows.map((row) => ({ id: row.id, data: () => clone(row), exists: true })) };
}

export class SparkCollection {
  constructor(name, filters = [], sort = null, cap = null) {
    this.name = name;
    this.filters = filters;
    this.sort = sort;
    this.cap = cap;
  }
  doc(id) {
    return new SparkDocument(this.name, id);
  }
  where(field, operator, value) {
    return new SparkCollection(this.name, [...this.filters, { field, operator, value }], this.sort, this.cap);
  }
  orderBy(field, direction = 'asc') {
    return new SparkCollection(this.name, this.filters, { field, direction }, this.cap);
  }
  limit(cap) {
    return new SparkCollection(this.name, this.filters, this.sort, cap);
  }
  async get() {
    const cached = snapshotFromRows(localRows(this.name, this.filters, this.sort, this.cap));
    const refreshKey = JSON.stringify([this.name, this.filters, this.sort, this.cap]);
    if (!refreshingCollections.has(refreshKey)) {
      const refresh = (async () => {
        const context = await remoteContext();
        if (!context) return;
        try {
          const { data, error } = await timeoutPromise(
            applyRemoteQuery(remoteCollection(context, this.name), this.name, this.filters, this.sort, this.cap),
            REMOTE_TIMEOUT_MS,
            `Tempo excedido ao ler ${this.name}`
          );
          if (error) throw error;
          cacheRows(this.name, (data || []).map((row) => supabaseRowToApp(this.name, row)));
        } catch (error) {
          console.warn(`[store] Leitura remota de ${this.name} falhou; usando cache local.`, error);
        }
      })().finally(() => refreshingCollections.delete(refreshKey));
      refreshingCollections.set(refreshKey, refresh);
    }
    return cached;
  }
  onSnapshot(next) {
    const emit = async () => next(await this.get());
    const handler = () => emit();
    window.addEventListener('rpm-spark-store-change', handler);
    emit();
    return () => window.removeEventListener('rpm-spark-store-change', handler);
  }
}

export class SparkDocument {
  constructor(collectionName, id) {
    this.collectionName = collectionName;
    this.id = id || crypto.randomUUID();
  }
  async get() {
    const context = await remoteContext();
    if (context) {
      try {
        const { data, error } = await timeoutPromise(
          remoteCollection(context, this.collectionName).select('*').eq('id', this.id).maybeSingle(),
          REMOTE_TIMEOUT_MS,
          `Tempo excedido ao ler ${this.collectionName}/${this.id}`
        );
        if (error) throw error;
        const row = data ? supabaseRowToApp(this.collectionName, data) : null;
        if (row) cacheOne(this.collectionName, row);
        return { id: this.id, exists: Boolean(row), data: () => clone(row) };
      } catch (error) {
        console.warn(`[store] Documento remoto ${this.collectionName}/${this.id} indisponivel; usando cache local.`, error);
      }
    }
    const row = (ensureState()[stateKey(this.collectionName)] || []).find((item) => item.id === this.id);
    return { id: this.id, exists: Boolean(row), data: () => clone(row) };
  }
  async set(payload, options = {}) {
    const state = ensureState();
    const key = stateKey(this.collectionName);
    const localRows = state[key] || [];
    const index = localRows.findIndex((row) => row.id === this.id);
    const current = index >= 0 ? localRows[index] : { id: this.id };
    const nextPayload = options.merge ? { ...current, ...clone(payload), id: this.id } : { ...clone(payload), id: this.id };
    const context = await remoteContext();
    if (context) {
      try {
        const { error } = await timeoutPromise(
          remoteCollection(context, this.collectionName).upsert(appRowToSupabase(this.collectionName, nextPayload), { onConflict: 'id' }),
          REMOTE_TIMEOUT_MS,
          `Tempo excedido ao salvar ${this.collectionName}`
        );
        if (error) throw error;
        cacheOne(this.collectionName, nextPayload);
        return;
      } catch (error) {
        console.warn(`[store] Escrita remota em ${this.collectionName} falhou; mantendo copia local.`, error);
      }
    }
    if (index >= 0) localRows[index] = nextPayload;
    else localRows.push(nextPayload);
    state[key] = localRows;
    persist(state);
  }
  async update(payload) {
    return this.set(payload, { merge: true });
  }
  async delete() {
    const context = await remoteContext();
    if (context) {
      try {
        const { error } = await timeoutPromise(
          remoteCollection(context, this.collectionName).delete().eq('id', this.id),
          REMOTE_TIMEOUT_MS,
          `Tempo excedido ao remover ${this.collectionName}`
        );
        if (error) throw error;
      } catch (error) {
        console.warn(`[store] Remocao remota em ${this.collectionName} falhou; removendo copia local.`, error);
      }
    }
    const state = ensureState();
    const key = stateKey(this.collectionName);
    state[key] = (state[key] || []).filter((row) => row.id !== this.id);
    persist(state);
  }
}

export function createSparkStore() {
  return {
    mode: 'supabase-spark-local',
    fallbackActive: true,
    collection(name) {
      return new SparkCollection(name);
    },
    reset() {
      localStorage.removeItem(RPM.localStoreKey);
      return ensureState();
    },
    readState: ensureState,
    writeState: persist
  };
}

function compare(left, operator, right) {
  if (operator === '==') return left === right;
  if (operator === 'in') return Array.isArray(right) && right.includes(left);
  if (operator === 'array-contains') return Array.isArray(left) && left.includes(right);
  return true;
}

export const sparkStore = createSparkStore();

export function rows(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function list(collection, options = {}) {
  let query = sparkStore.collection(mapRpmCollection(collection));
  if (options.where) {
    for (const filter of options.where) query = query.where(filter[0], filter[1], filter[2]);
  }
  if (options.orderBy) query = query.orderBy(options.orderBy[0], options.orderBy[1]);
  if (options.limit) query = query.limit(options.limit);
  return rows(await query.get());
}

export async function removeSampleProtocolRequests() {
  const state = ensureState();
  const localProtocols = (state.protocols || []).filter((protocol) => sampleProtocolNumbersToRemove.has(protocol.number));
  const remoteProtocols = await remoteSampleProtocolRows();
  const protocolsToRemove = dedupeByIdOrNumber([...localProtocols, ...remoteProtocols]);
  if (!protocolsToRemove.length) return false;

  const ids = new Set(protocolsToRemove.map((protocol) => protocol.id).filter(Boolean));
  const numbers = new Set(protocolsToRemove.map((protocol) => protocol.number).filter(Boolean));
  const localForwards = (state.forwards || []).filter((row) => referencesRemovedProtocol(row, ids, numbers));
  const localNotifications = (state.notifications || []).filter((row) => referencesRemovedProtocol(row, ids, numbers));
  const localAudit = (state.audit || []).filter((row) => referencesRemovedProtocol(row, ids, numbers));

  state.removedSampleProtocolIds = Array.from(new Set([...(state.removedSampleProtocolIds || []), ...ids]));
  state.protocols = (state.protocols || []).filter((row) => !ids.has(row.id) && !numbers.has(row.number));
  state.forwards = (state.forwards || []).filter((row) => !referencesRemovedProtocol(row, ids, numbers));
  state.notifications = (state.notifications || []).filter((row) => !referencesRemovedProtocol(row, ids, numbers));
  state.audit = (state.audit || []).filter((row) => !referencesRemovedProtocol(row, ids, numbers));
  persist(state, 'sample-cleanup');

  await deleteRemoteSampleRows(ids, [
    ...localForwards.map((row) => ['forwards', row.id]),
    ...localNotifications.map((row) => ['notifications', row.id]),
    ...localAudit.map((row) => ['audit', row.id])
  ]);
  return true;
}

export function mapRpmCollection(name) {
  return sparkCollections[name] || name;
}

function dedupeByIdOrNumber(rows = []) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = row.id || row.number;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function chunk(values = [], size = 10) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
}

async function remoteSampleProtocolRows() {
  const context = await remoteContext();
  if (!context) return [];
  try {
    const { data, error } = await timeoutPromise(
      remoteCollection(context, mapRpmCollection('protocols')).select('*').in('number', [...sampleProtocolNumbersToRemove]),
      REMOTE_TIMEOUT_MS,
      'Tempo excedido ao buscar exemplos'
    );
    if (error) throw error;
    return (data || []).map((row) => supabaseRowToApp(mapRpmCollection('protocols'), row));
  } catch (error) {
    console.warn('[store] Busca remota dos protocolos de exemplo falhou; limpando cache local.', error);
    return [];
  }
}

async function remoteRowsByProtocolId(context, collectionName, ids) {
  const protocolIds = [...ids].filter(Boolean);
  if (!protocolIds.length) return [];
  const snapshots = await Promise.all(chunk(protocolIds).map((part) => {
    return timeoutPromise(
      remoteCollection(context, mapRpmCollection(collectionName)).select('*').in('protocol_id', part),
      REMOTE_TIMEOUT_MS,
      `Tempo excedido ao buscar ${collectionName}`
    );
  }));
  return snapshots.flatMap(({ data, error }) => {
    if (error) throw error;
    return (data || []).map((row) => supabaseRowToApp(mapRpmCollection(collectionName), row));
  });
}

async function deleteRemoteSampleRows(protocolIds, localRelatedRows = []) {
  const context = await remoteContext();
  if (!context) return;
  try {
    const relatedResults = await Promise.allSettled([
      remoteRowsByProtocolId(context, 'forwards', protocolIds),
      remoteRowsByProtocolId(context, 'notifications', protocolIds),
      remoteRowsByProtocolId(context, 'audit', protocolIds)
    ]);
    const relatedRows = relatedResults.map((result) => result.status === 'fulfilled' ? result.value : []);
    const docs = [
      ...[...protocolIds].map((id) => ['protocols', id]),
      ...localRelatedRows,
      ...relatedRows.flatMap((rows, index) => {
        const collection = ['forwards', 'notifications', 'audit'][index];
        return rows.map((row) => [collection, row.id]);
      })
    ].filter(([, id]) => Boolean(id));
    const uniqueDocs = Array.from(new Map(docs.map(([collection, id]) => [`${collection}:${id}`, [collection, id]])).values());
    await Promise.all(uniqueDocs.map(([collection, id]) => {
      return timeoutPromise(
        remoteCollection(context, mapRpmCollection(collection)).delete().eq('id', id),
        REMOTE_TIMEOUT_MS,
        `Tempo excedido ao remover ${collection}/${id}`
      );
    }));
  } catch (error) {
    console.warn('[store] Remocao remota dos exemplos falhou; cache local ja foi limpo.', error);
  }
}

export async function readProtocolDashboard() {
  const protocols = await list('protocols', { orderBy: ['updatedAt', 'desc'], limit: 20 });
  const forwards = await list('forwards', { limit: 20 });
  const notifications = await list('notifications', { limit: 20 });
  return { protocols, forwards, notifications };
}

// --- Camada de interface migrada do sistema existente ---
let activateProfile, activateSamicFlow, activityPanel, applySearch, audit, auditAction, auditTrailList, authCard, average, bindActions, bindEntry, bindModalActions, bindShell, boot, breakdownPanel, buildProtocol, canCouncilContinue, canForwardContinue, canManage, canNotify, canViewCase, canViewStats, caseCard, caseGrid, checklist, clearEntryTimers, closeModal, commandBoard, compactCase, confirmCouncilAwareness, contingency, copyFor, council, councilFollowupPanel, countBy, createLocalPendingAccess, csvCell, currentUser, dashboard, dashboardData, dashedEmpty, deadlineBadge, destinationName, emptyRoute, entrySequence, entryShell, esc, escAttr, estimateSpark, exportCsv, findForward, findUserByEmail, finishEntrySequence, flowSettingsForm, flowSteps, formatDate, formatDuration, formatHours, forwardActionButtons, forwardDestinationOptions, forwardOperationsTable, forwards, friendlyAuthError, getUsers, governanceList, groupedNav, guardAction, handleActionError, handleGoogleLogin, handleLogin, handleRecoverPassword, handleRegister, handoffCard, help, hoursBetween, initials, isClosed, isOccurrenceRoute, isSamicOpen, knowledge, labelFor, lastDaysCount, liveClock, liveUsersPanel, loginCard, management, managementCard, markNotificationRead, mergeRemoteProfiles, metric, metrics, mobileBottomNav, mobileRoutesForPackShell, modalShell, moduleCard, municipalFlowCounts, municipalFlowPanel, navButton, navForRole, navItems, navSignal, navigate, network, nextDeadline, normalize, normalizeEmail, notificationItem, notificationModal, notifications, openModal, opsTable, pendingAccessCard, priorityBadge, projectIndicatorGrid, projectIndicatorValues, protocolRisk, protocolStateStages, protocolStates, protocolTable, quickAction, quickActionsPanel, registerCard, render, renderEntry, renderFailure, reports, restoreRemoteSession, roles, routeCopy, routeGroups, routeLoading, rpmPublicContract, samic, samicDecisionPanel, samicStatusCard, saveCouncilFollowup, saveForward, saveSamicDecision, saveSettings, saveUnit, saveUser, scheduleRender, securityPanel, selectUser, settings, shell, sparkPanel, stageBoard, startEntrySequence, startRemoteProfileSync, state, statusBadge, syncUserProfile, table, textOnly, thisMonthCount, titleFor, toast, todayCount, training, unitModal, unitName, unitOperationsGrid, unitOptions, updateForwardStatus, userModal, userOperationsTable, users, view, weekdayName, withProtocolState, workflowPanel;
export function initProtocolosUI(runtime) {
  activateProfile = runtime.activateProfile;
  activateSamicFlow = runtime.activateSamicFlow;
  activityPanel = runtime.activityPanel;
  applySearch = runtime.applySearch;
  audit = runtime.audit;
  auditAction = runtime.auditAction;
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
  help = runtime.help;
  hoursBetween = runtime.hoursBetween;
  initials = runtime.initials;
  isClosed = runtime.isClosed;
  isOccurrenceRoute = runtime.isOccurrenceRoute;
  isSamicOpen = runtime.isSamicOpen;
  knowledge = runtime.knowledge;
  labelFor = runtime.labelFor;
  lastDaysCount = runtime.lastDaysCount;
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
  nextDeadline = runtime.nextDeadline;
  normalize = runtime.normalize;
  normalizeEmail = runtime.normalizeEmail;
  notificationItem = runtime.notificationItem;
  notificationModal = runtime.notificationModal;
  notifications = runtime.notifications;
  openModal = runtime.openModal;
  opsTable = runtime.opsTable;
  pendingAccessCard = runtime.pendingAccessCard;
  priorityBadge = runtime.priorityBadge;
  projectIndicatorGrid = runtime.projectIndicatorGrid;
  projectIndicatorValues = runtime.projectIndicatorValues;
  protocolRisk = runtime.protocolRisk;
  protocolStateStages = runtime.protocolStateStages;
  protocolStates = runtime.protocolStates;
  protocolTable = runtime.protocolTable;
  quickAction = runtime.quickAction;
  quickActionsPanel = runtime.quickActionsPanel;
  registerCard = runtime.registerCard;
  render = runtime.render;
  renderEntry = runtime.renderEntry;
  renderFailure = runtime.renderFailure;
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
  stageBoard = runtime.stageBoard;
  startEntrySequence = runtime.startEntrySequence;
  startRemoteProfileSync = runtime.startRemoteProfileSync;
  state = runtime.state;
  statusBadge = runtime.statusBadge;
  syncUserProfile = runtime.syncUserProfile;
  table = runtime.table;
  textOnly = runtime.textOnly;
  thisMonthCount = runtime.thisMonthCount;
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

export function canListOperationalProtocol(protocol = {}) {
  if (!state?.user) return false;
  if (canManage(state.user.role) || canViewStats(state.user.role)) return true;
  return canAccessProtocolByCompetence(protocol);
}

export function canAccessProtocolByCompetence(protocol = {}) {
  const user = state?.user || {};
  const role = user.role || '';
  const unitId = user.unitId || '';
  if (!canViewCase(role)) return false;
  if (role === 'supervisor_caso') {
    return hasProtocolGrant(protocol, user.id, 'supervisao') || hasProtocolGrant(protocol, user.id, 'conteudo_minimo');
  }
  const visibleRoles = Array.isArray(protocol.visibleToRoles) ? protocol.visibleToRoles : [];
  const visibleUnits = Array.isArray(protocol.visibleToUnits) ? protocol.visibleToUnits : [];
  if (visibleRoles.includes(role)) return true;
  if (unitId && visibleUnits.includes(unitId)) return true;
  if (unitId && [protocol.originUnitId, protocol.currentUnitId].includes(unitId)) return true;
  if (role === 'entrada') return unitId && protocol.originUnitId === unitId;
  if (role === 'conselho') return protocol.currentUnitId === 'conselho-tutelar' || protocol.stage === 'conselho' || visibleRoles.includes('conselho');
  if (role === 'samic') return protocol.currentUnitId === 'samic' || protocol.stage === 'samic' || visibleRoles.includes('samic');
  if (['autoridade_policial', 'policia_civil', 'policia_federal'].includes(role)) {
    return visibleRoles.some((item) => ['autoridade_policial', 'policia_civil', 'policia_federal'].includes(item));
  }
  if (role === 'rede') {
    return (state.data.forwards || []).some((forward) => forward.protocolId === protocol.id && forward.destinationUnitId === unitId);
  }
  if (role === 'vigilancia') return visibleRoles.includes('vigilancia');
  return false;
}

function hasProtocolGrant(protocol = {}, actorId = '', permission = '') {
  const grants = Array.isArray(protocol.accessGrants) ? protocol.accessGrants : [];
  return grants.some((grant) => grant.actorId === actorId && (!permission || grant.permission === permission || grant.permission === 'total'));
}

function restrictedCaseNotice(protocol, context = 'protocolo') {
  const label = protocol?.number || 'Protocolo';
  return `<section class="empty-state restricted-state">
    <i data-lucide="lock-keyhole"></i>
    <strong>Informacao restrita</strong>
    <p>${esc(label)} gerou uma notificacao ou registro operacional, mas isso nao autoriza leitura do ${esc(context)}. O acesso depende de perfil, unidade, etapa, encaminhamento e necessidade real.</p>
  </section>`;
}

export async function protocols() {
  const protocols = (await list('protocols', { orderBy: ['updatedAt', 'desc'], limit: 25 })).filter(canListOperationalProtocol);
  return `
    <section class="legacy-panel">
      <div class="legacy-panel-header">
        <div>
          <h2>Protocolos</h2>
          <p>Registros operacionais com identificacao restrita por perfil.</p>
        </div>
        <button class="button primary" data-action="open-notification-modal"><i data-lucide="plus"></i><span>Abrir protocolo</span></button>
      </div>
      <div class="filter-row">
        <label class="command-search compact"><i data-lucide="search"></i><input type="search" placeholder="Buscar por protocolo, unidade, status ou tipo" data-filter-table></label>
        <input class="filter-input" type="date" data-filter-table aria-label="Data inicial">
        <input class="filter-input" type="date" data-filter-table aria-label="Data final">
        <select class="filter-select" data-filter-table>
          <option value="">Todas as unidades</option>
          ${(state.data.units || []).map((unit) => `<option>${esc(unit.name)}</option>`).join('')}
        </select>
        <select class="filter-select" data-filter-table>
          <option value="">Todas as etapas</option>
          ${Object.values(protocolStateStages).filter((value, index, array) => array.indexOf(value) === index).map((stage) => `<option>${esc(stage)}</option>`).join('')}
        </select>
        <select class="filter-select" data-filter-table>
          <option value="">Todas as prioridades</option>
          <option>Normal</option>
          <option>Prioritaria</option>
          <option>Critica</option>
        </select>
        <select class="filter-select" data-filter-table>
          <option value="">Todos os status</option>
          <option>Conselho</option>
          <option>SAMIC</option>
          <option>Em acompanhamento</option>
          <option>Encerrado</option>
        </select>
        <button class="button" data-action="clear-filter"><i data-lucide="x"></i><span>Limpar filtros</span></button>
      </div>
      ${protocolOperationsTable(protocols)}
    </section>
  `;
}

export async function occurrenceDetails(protocolId) {
  const protocols = await list('protocols', { limit: 80 });
  const protocol = protocols.find((item) => item.id === protocolId || item.number === protocolId);
  if (!protocol) {
    return `<section class="empty-state"><i data-lucide="folder-search"></i><strong>Protocolo nao encontrado</strong><p>O protocolo informado nao foi localizado na base autorizada.</p></section>`;
  }
  const forwards = (await list('forwards', { limit: 80 })).filter((row) => row.protocolId === protocol.id);
  if (!canAccessProtocolByCompetence(protocol)) {
    await auditAction('access.denied.case.read', protocol.number || protocol.id);
    return restrictedCaseNotice(protocol);
  }
  const badgeState = protocolStateLabel(protocol);
  return `<section class="occurrence-page">
    <div class="occurrence-header">
      <div>
        <button class="button ghost" data-nav="protocols"><i data-lucide="arrow-left"></i><span>Voltar</span></button>
        <h2>${esc(protocol.number)}</h2>
        <p>${esc(unitName(protocol.originUnitId))} / ${esc(protocol.entryPoint || 'Porta de entrada')}</p>
      </div>
      <div class="occurrence-badges">
        ${priorityBadge(protocol.priority || 'Normal')}
        ${statusBadge(badgeState)}
        ${deadlineBadge(nextDeadline(forwards))}
      </div>
    </div>
    <section class="protocol-summary-grid">
      ${[
        ['Origem', unitName(protocol.originUnitId)],
        ['Data/hora', formatDate(protocol.createdAt)],
        ['Faixa etaria', protocol.ageRange || 'Nao informado'],
        ['Classificacao', protocol.classification || 'Nao informada'],
        ['Prioridade', protocol.priority || 'Normal'],
        ['Unidade responsavel', unitName(protocol.currentUnitId) || protocol.currentOwner || 'A definir'],
        ['Etapa atual', protocolStateStage(protocol)],
        ['Registro oficial', officialSummary(protocol)]
      ].map(([label, value]) => `<article><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`).join('')}
    </section>
    <div class="occurrence-tabs">
      ${['Resumo', 'Linha do tempo', 'Conselho Tutelar', 'Registros oficiais', 'SAMIC', 'Encaminhamentos', 'Encerramento'].map((label) => `<a href="#${escAttr('protocol:' + protocol.id)}">${esc(label)}</a>`).join('')}
    </div>
    <div class="protocol-detail-grid">
      <section class="legacy-panel">
        <div class="legacy-panel-header compact"><h2>Resumo restrito</h2><span class="status-badge">Minimizado</span></div>
        <dl class="case-facts">
          <div><dt>Codigo/pseudonimo</dt><dd>${esc(protocol.initials || 'Dados restritos')}</dd></div>
          <div><dt>Motivo</dt><dd>${esc(protocol.triggerReason || protocol.classification || 'Nao informado')}</dd></div>
          <div><dt>Providencia imediata</dt><dd>${esc(protocol.immediateAction || 'Conselho Tutelar acionado')}</dd></div>
          <div><dt>Protecao imediata</dt><dd>${esc(protocol.immediateProtection || 'Nao informado')}</dd></div>
        </dl>
        <p class="minimal-record">${esc(protocol.minimalRecord || 'Sem observacao minima.')}</p>
      </section>
      <section class="legacy-panel">
        <div class="legacy-panel-header compact"><h2>Linha do tempo</h2></div>
        ${protocolTimeline(protocol)}
      </section>
    </div>
    ${officialRecordsPanel(protocol)}
    ${samicDecisionPanel(protocol)}
    ${councilFollowupPanel(protocol)}
    <section class="legacy-panel">
      <div class="legacy-panel-header"><div><h2>Encaminhamentos do protocolo</h2><p>Aceite, devolutiva, redirecionamento e conclusao.</p></div></div>
      ${forwardOperationsTable(forwards)}
    </section>
    ${closurePanel(protocol, forwards)}
  </section>`;
}

export function protocolOperationsTable(rows) {
  const canOpen = (row) => canAccessProtocolByCompetence(row);
  const mapped = rows.map((row) => ({
    number: row.number,
    origin: unitName(row.originUnitId) || row.entryPoint,
    identification: row.initials || row.ageRange || 'Dados restritos',
    priority: priorityBadge(row.priority),
    stage: protocolStateStage(row),
    status: statusBadge(row.status),
    official: row.sipia?.protocol || row.sinan?.protocol || 'Nao informado',
    actions: canOpen(row) ? `<button class="button ghost" data-nav="${escAttr('protocol:' + row.id)}"><i data-lucide="folder-open"></i><span>Acompanhar</span></button>` : `<span class="status-badge restricted"><i data-lucide="lock-keyhole"></i> Restrito</span>`
  }));
  const keys = ['number', 'origin', 'identification', 'priority', 'stage', 'status', 'official', 'actions'];
  return opsTable(keys, mapped, { raw: ['priority', 'status', 'actions'], empty: 'Nenhum protocolo encontrado.' });
}

export function protocolModal(protocolId) {
  const protocol = (state.data.protocols || []).find((item) => item.id === protocolId);
  if (!protocol) {
    return `<div class="modal-head"><h2>Protocolo</h2><button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar"><i data-lucide="x"></i></button></div>${dashedEmpty('Protocolo nao encontrado.')}`;
  }
  if (!canAccessProtocolByCompetence(protocol)) {
    auditAction('access.denied.case.modal', protocol.number || protocol.id).catch(() => {});
    return `<div class="modal-head"><h2>${esc(protocol.number)}</h2><button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar"><i data-lucide="x"></i></button></div>${restrictedCaseNotice(protocol)}`;
  }
  return `<div class="protocol-detail">
    <div class="modal-head">
      <div>
        <h2>${esc(protocol.number)}</h2>
        <p>${esc(unitName(protocol.originUnitId))} / ${esc(protocol.entryPoint || 'Porta de entrada')}</p>
      </div>
      <button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar"><i data-lucide="x"></i></button>
    </div>
    <section class="protocol-summary-grid">
      ${[
        ['Prioridade', priorityBadge(protocol.priority || 'Normal'), true],
        ['Status', statusBadge(protocol.status || 'Em acompanhamento'), true],
        ['Responsavel atual', protocol.currentOwner || 'Conselho Tutelar'],
        ['Registro oficial', protocol.sipia?.protocol || protocol.sinan?.protocol || 'Nao informado'],
        ['Tipo codificado', protocol.violenceType || 'Nao informado'],
        ['Faixa etaria', protocol.ageRange || 'Nao informado']
      ].map(([label, value, raw]) => `<article><span>${esc(label)}</span><strong>${raw ? value : esc(value)}</strong></article>`).join('')}
    </section>
    <div class="protocol-detail-grid">
      <section class="legacy-panel">
        <div class="legacy-panel-header compact"><h2>Registro minimo</h2><span class="status-badge">Restrito</span></div>
        <dl class="case-facts">
          <div><dt>Identificacao operacional</dt><dd>${esc(protocol.initials || 'Dados restritos')}</dd></div>
          <div><dt>Sexo</dt><dd>${esc(protocol.sex || 'Nao informado')}</dd></div>
          <div><dt>Classificacao</dt><dd>${esc(protocol.classification || 'Nao informada')}</dd></div>
        </dl>
        <p class="minimal-record">${esc(protocol.minimalRecord || 'Sem registro minimo informado.')}</p>
      </section>
      <section class="legacy-panel">
        <div class="legacy-panel-header compact"><h2>Linha do tempo</h2></div>
        ${protocolTimeline(protocol)}
      </section>
    </div>
    ${councilFollowupPanel(protocol)}
  </div>`;
}

export function officialRecordsPanel(protocol) {
  return `<section class="legacy-panel">
    <div class="legacy-panel-header">
      <div><h2>Registros oficiais</h2><p>Referencias ao SINAN/SIPIA, sem substituir os sistemas oficiais.</p></div>
    </div>
    ${healthEntryAlert(protocol)}
    <form id="official-records-form" data-protocol-id="${escAttr(protocol.id)}" class="form-grid">
      <div class="form-row three">
        <label class="field"><span>SINAN - situacao</span><select name="sinanStatus">${officialOptions(['Nao aplicavel', 'Pendente', 'Iniciado', 'Concluido', 'Enviado'], protocol.sinan?.status)}</select></label>
        <label class="field"><span>Numero/protocolo SINAN</span><input name="sinanProtocol" value="${escAttr(protocol.sinan?.protocol || '')}"></label>
        <label class="field"><span>Data SINAN</span><input name="sinanDate" type="date" value="${escAttr(protocol.sinan?.date || '')}"></label>
      </div>
      <div class="form-row three">
        <label class="field"><span>SIPIA - situacao</span><select name="sipiaStatus">${officialOptions(['Nao iniciado', 'Pendente', 'Registrado'], protocol.sipia?.status)}</select></label>
        <label class="field"><span>Numero/protocolo SIPIA</span><input name="sipiaProtocol" value="${escAttr(protocol.sipia?.protocol || '')}"></label>
        <label class="field"><span>Data SIPIA</span><input name="sipiaDate" type="date" value="${escAttr(protocol.sipia?.date || '')}"></label>
      </div>
      <div class="modal-actions"><button class="button primary"><i data-lucide="save"></i><span>Salvar registros oficiais</span></button></div>
    </form>
  </section>`;
}

export function closurePanel(protocol, forwards) {
  const pending = forwards.filter((row) => !isClosed(row));
  const closed = protocolStateCode(protocol) === 'ENCERRADO';
  return `<section class="legacy-panel">
    <div class="legacy-panel-header">
      <div><h2>Encerramento</h2><p>Encerramento administrativo, reabertura justificada e revisao de qualidade.</p></div>
      ${statusBadge(closed ? 'Encerrado' : 'Em acompanhamento')}
    </div>
    ${pending.length ? dashedEmpty(`Existem ${pending.length} encaminhamento(s) sem conclusao.`) : dashedEmpty('Nenhum encaminhamento pendente.')}
    <form id="${closed ? 'reopen-form' : 'closure-form'}" data-protocol-id="${escAttr(protocol.id)}" class="form-grid">
      <label class="field"><span>${closed ? 'Motivo da reabertura' : 'Justificativa de encerramento'}</span><textarea name="justification" required placeholder="${closed ? 'Explique por que o protocolo precisa ser reaberto.' : 'Informe a justificativa administrativa, especialmente se houver pendencia.'}"></textarea></label>
      <div class="modal-actions"><button class="button ${closed ? '' : 'primary'}"><i data-lucide="${closed ? 'rotate-ccw' : 'check-circle-2'}"></i><span>${closed ? 'Reabrir protocolo' : 'Encerrar protocolo'}</span></button></div>
    </form>
  </section>`;
}

export function officialOptions(options, selected = '') {
  return options.map((option) => `<option${selected === option ? ' selected' : ''}>${esc(option)}</option>`).join('');
}

export function healthEntryAlert(protocol) {
  if (!isHealthEntry(protocol.entryPoint)) return '';
  return `<section class="form-section-note alert-note">
    <strong>Atencao - Registro oficial de saude</strong>
    <p>Verifique a necessidade de notificacao no SINAN conforme a competencia da unidade. O Rede Protege Maues nao substitui o sistema oficial.</p>
  </section>`;
}

export function isHealthEntry(entryPoint = '') {
  return /ubs|hospital|ubsi|casai|dsei|saude/i.test(normalize(entryPoint));
}

export function protocolTimeline(protocol) {
  const rows = Array.isArray(protocol.timeline) ? protocol.timeline : [];
  if (!rows.length) return dashedEmpty('Nenhum evento registrado.');
  return `<div class="timeline-list">${rows.slice().reverse().map((event) => `<article class="timeline-event">
    <span></span>
    <div><strong>${esc(event.action || 'Evento')}</strong><p>${esc(event.description || '')}</p><small>${esc(formatDate(event.createdAt))}</small></div>
  </article>`).join('')}</div>`;
}

export function protocolForm() {
  return `<section class="panel protocol-form-panel">
    <div class="panel-header">
      <div><h2>Abrir protocolo municipal</h2><p>Registro mínimo orientado pelo fluxo municipal.</p></div>
    </div>
    <form class="form-grid" id="protocol-form">
      <div class="form-row">
        <label class="field"><span>Unidade de origem</span><select name="originUnitId">${unitOptions('', { registeredOnly: true })}</select></label>
        <label class="field"><span>Prioridade</span><select name="priority"><option>Normal</option><option>Prioritaria</option><option>Critica</option></select></label>
      </div>
      <div class="form-row">
        <label class="field"><span>Classificacao</span><input name="classification" value="Suspeita"></label>
        <label class="field"><span>Faixa etaria</span><input name="ageRange" value="12 a 14"></label>
      </div>
      <label class="field"><span>Tipo de violencia</span><input name="violenceType" value="Violencia sexual" readonly></label>
      <label class="field"><span>Registro minimo</span><textarea name="minimalRecord"></textarea></label>
      <button class="button primary"><i data-lucide="save"></i><span>Abrir protocolo</span></button>
    </form>
  </section>`;
}

export async function saveNotification(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const originUnit = (state.data.units || []).find((unit) => unit.id === form.originUnitId);
  if (!originUnit) {
    toast('Cadastre a unidade de origem na Rede de Atendimento antes de notificar.');
    navigate('network');
    return;
  }
  const protocol = buildProtocol({
    originUnitId: form.originUnitId,
    entryPoint: originUnit.serviceType || originUnit.entryType || originUnit.type || 'Rede de Atendimento',
    priority: form.priority,
    classification: form.classification,
    violenceType: 'Violencia sexual',
    ageRange: form.ageRange,
    minimalRecord: form.minimalRecord || 'Registro minimizado pendente de complemento autorizado.'
  }, { user: state.user });

  Object.assign(protocol, {
    originUnitId: form.originUnitId,
    sex: form.sex,
    initials: form.initials,
    triggerReason: form.triggerReason,
    immediateAction: form.immediateAction,
    immediateProtection: form.immediateProtection,
    statusCode: 'CONSELHO_ACIONADO',
    status: 'Conselho acionado',
    stage: 'conselho',
    currentOwner: 'Conselho Tutelar',
    currentUnitId: 'conselho-tutelar',
    visibleToRoles: Array.from(new Set([...(protocol.visibleToRoles || []), 'conselho'])),
    visibleToUnits: Array.from(new Set([...(protocol.visibleToUnits || []), form.originUnitId, 'conselho-tutelar'].filter(Boolean))),
    accessGrants: protocol.accessGrants || []
  });

  await sparkStore.collection('protocolos').doc(protocol.id).set(protocol);
  const notificationId = crypto.randomUUID();
  await sparkStore.collection('notificacoes').doc(notificationId).set({
    id: notificationId,
    userId: 'conselho-tutelar',
    targetRole: 'conselho',
    type: 'CONSELHO_PENDENTE',
    protocolId: protocol.id,
    title: 'Abrir protocolo municipal',
    message: `${protocol.number} aguarda ciencia do Conselho Tutelar.`,
    read: false,
    createdAt: new Date().toISOString(),
    status: 'pendente',
    attempts: 1,
    escalation: ''
  });
  await auditAction('protocol.created', protocol.number);
  state.modal = null;
  toast('Protocolo municipal gerado.');
  navigate('protocol:' + protocol.id);
}

export async function saveOfficialRecords(event) {
  event.preventDefault();
  const protocolId = event.currentTarget.dataset.protocolId;
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const now = new Date().toISOString();
  const sipiaRegistered = form.sipiaStatus === 'Registrado';
  const next = withProtocolState({
    ...protocol,
    sinan: {
      ...(protocol.sinan || {}),
      status: form.sinanStatus,
      protocol: form.sinanProtocol || '',
      date: form.sinanDate || '',
      responsibleId: state.user.id,
      updatedAt: now
    },
    sipia: {
      ...(protocol.sipia || {}),
      status: form.sipiaStatus,
      protocol: form.sipiaProtocol || '',
      date: form.sipiaDate || '',
      responsibleId: state.user.id,
      updatedAt: now
    },
    updatedAt: now,
    timeline: appendTimeline(protocol, sipiaRegistered ? 'SIPIA_REGISTRADO' : 'REGISTRO_OFICIAL_ATUALIZADO', officialSummary({ sinan: { status: form.sinanStatus, protocol: form.sinanProtocol }, sipia: { status: form.sipiaStatus, protocol: form.sipiaProtocol } }), now, sipiaRegistered ? 'SIPIA_REGISTRADO' : 'SIPIA_PENDENTE')
  }, sipiaRegistered ? 'SIPIA_REGISTRADO' : 'SIPIA_PENDENTE');
  await persistProtocol(next);
  await auditAction('official.update', protocol.number);
  toast('Registros oficiais atualizados.');
  navigate('protocol:' + protocol.id);
}

export async function closeProtocol(event) {
  event.preventDefault();
  const protocolId = event.currentTarget.dataset.protocolId;
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const now = new Date().toISOString();
  const next = withProtocolState({
    ...protocol,
    currentOwner: 'Fluxo encerrado',
    closure: {
      status: 'Encerrado',
      justification: form.justification,
      by: state.user.id,
      at: now
    },
    closedAt: now,
    updatedAt: now,
    timeline: appendTimeline(protocol, 'PROTOCOLO_ENCERRADO', form.justification, now, 'ENCERRADO')
  }, 'ENCERRADO');
  await persistProtocol(next);
  await auditAction('case.close', protocol.number);
  toast('Protocolo encerrado.');
  navigate('protocol:' + protocol.id);
}

export async function reopenProtocol(event) {
  event.preventDefault();
  const protocolId = event.currentTarget.dataset.protocolId;
  const protocol = findProtocol(protocolId);
  if (!protocol) {
    toast('Protocolo nao encontrado.');
    return;
  }
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const now = new Date().toISOString();
  const next = withProtocolState({
    ...protocol,
    currentOwner: 'Conselho Tutelar',
    currentUnitId: 'conselho-tutelar',
    reopenedAt: now,
    reopen: {
      reason: form.justification,
      by: state.user.id,
      at: now
    },
    updatedAt: now,
    timeline: appendTimeline(protocol, 'PROTOCOLO_REABERTO', form.justification, now, 'REABERTO')
  }, 'REABERTO');
  await persistProtocol(next);
  await auditAction('case.reopen', protocol.number);
  toast('Protocolo reaberto.');
  navigate('protocol:' + protocol.id);
}

export function findProtocol(protocolId) {
  return (state.data.protocols || []).find((item) => item.id === protocolId);
}

export function normalizeAppState(raw = {}) {
  const system = Array.isArray(raw.system)
    ? raw.system.find((item) => item.id === 'config' || item.config) || {}
    : raw.system || {};
  return {
    ...raw,
    users: Array.isArray(raw.users) ? raw.users : [],
    units: Array.isArray(raw.units) ? raw.units : [],
    protocols: Array.isArray(raw.protocols) ? raw.protocols : [],
    forwards: Array.isArray(raw.forwards) ? raw.forwards : [],
    notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
    audit: Array.isArray(raw.audit) ? raw.audit : [],
    system: {
      ...system,
      config: {
        ...defaultSystemConfig,
        ...(system.config || {}),
        samic: { ...defaultSystemConfig.samic, ...(system.config?.samic || {}) },
        deadlines: { ...defaultSystemConfig.deadlines, ...(system.config?.deadlines || {}) }
      }
    }
  };
}

export function appendTimeline(protocol, action, description, createdAt = new Date().toISOString(), nextStatus = protocolStateCode(protocol)) {
  const previousStatus = protocolStateCode(protocol);
  return [...(Array.isArray(protocol.timeline) ? protocol.timeline : []), {
    id: crypto.randomUUID(),
    protocolId: protocol.id,
    tipo: timelineEventType(action),
    action,
    description,
    createdAt,
    dataHora: createdAt,
    actorId: state.user.id,
    usuarioId: state.user.id,
    unitId: state.user.unitId,
    unidadeId: state.user.unitId,
    previousStatus,
    nextStatus,
    estadoAnterior: previousStatus,
    estadoNovo: nextStatus,
    justificativa: description || ''
  }];
}

function timelineEventType(action = '') {
  const raw = String(action).trim();
  if (/^[A-Z0-9_]+$/.test(raw)) return raw;
  const normalizedAction = normalize(raw);
  if (normalizedAction.includes('conselho') && normalizedAction.includes('ciencia')) return 'CONSELHO_CIENTE';
  if (normalizedAction.includes('sipia')) return 'SIPIA_REGISTRADO';
  if (normalizedAction.includes('samic') && normalizedAction.includes('decis')) return 'DECISAO_SAMIC';
  if (normalizedAction.includes('samic')) return 'SAMIC_ACIONADO';
  if (normalizedAction.includes('encaminhamento') && normalizedAction.includes('criado')) return 'ENCAMINHAMENTO_CRIADO';
  if (normalizedAction.includes('encaminhamento') && normalizedAction.includes('aceit')) return 'ENCAMINHAMENTO_ACEITO';
  if (normalizedAction.includes('encaminhamento') && normalizedAction.includes('devol')) return 'ENCAMINHAMENTO_DEVOLVIDO';
  if (normalizedAction.includes('atendimento')) return 'ATENDIMENTO_REGISTRADO';
  if (normalizedAction.includes('devolutiva')) return 'DEVOLUTIVA_REGISTRADA';
  if (normalizedAction.includes('encerr')) return 'PROTOCOLO_ENCERRADO';
  if (normalizedAction.includes('reabert')) return 'PROTOCOLO_REABERTO';
  if (normalizedAction.includes('criado') || normalizedAction.includes('aberto')) return 'PROTOCOLO_CRIADO';
  return 'EVENTO_REGISTRADO';
}

export async function persistProtocol(protocol) {
  await sparkStore.collection('protocolos').doc(protocol.id).set(protocol, { merge: true });
}

export function protocolStateCode(protocol = {}) {
  return protocol.statusCode || Object.entries(protocolStates).find(([, label]) => label === protocol.status)?.[0] || 'ABERTO';
}

export function protocolStateLabel(protocol = {}) {
  return protocolStates[protocolStateCode(protocol)] || protocol.status || 'Aberto';
}

export function protocolStateStage(protocol = {}) {
  const code = protocolStateCode(protocol);
  return protocolStateStages[code] || protocol.stage || 'abertura';
}

export function officialSummary(protocol = {}) {
  const sinan = protocol.sinan?.protocol || protocol.sinan?.status;
  const sipia = protocol.sipia?.protocol || protocol.sipia?.status;
  return [sinan ? `SINAN: ${sinan}` : '', sipia ? `SIPIA: ${sipia}` : ''].filter(Boolean).join(' / ') || 'Nao informado';
}

export function auditProtocolRead(protocolId) {
  const key = `rpm.audit.read.${protocolId}.${state.user?.id}`;
  if (!state.authenticated || !protocolId || sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, new Date().toISOString());
  auditAction('case.read', protocolId).catch((error) => console.warn('[audit] leitura nao registrada.', error));
}


export function newProtocolPage() {
  return `<section class="page-section protocol-create-page">
    <div class="section-heading"><div><span class="eyebrow">Protocolo municipal</span><h2>Abrir novo protocolo</h2><p>Registre somente os dados mínimos necessários à etapa atual.</p></div></div>
    ${protocolForm()}
  </section>`;
}

export async function saveQuickProtocol(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  const originUnit = (state.data.units || []).find((unit) => unit.id === form.originUnitId);
  if (!originUnit) {
    toast('Cadastre a unidade de origem antes de abrir o protocolo.');
    navigate('network');
    return;
  }
  const protocol = buildProtocol({
    ...form,
    entryPoint: originUnit.serviceType || originUnit.entryType || originUnit.type || 'Rede de Atendimento',
    violenceType: 'Violencia sexual'
  }, { user: state.user });
  const next = withProtocolState({
    ...protocol,
    originUnitId: form.originUnitId,
    currentOwner: 'Conselho Tutelar',
    currentUnitId: 'conselho-tutelar',
    timeline: appendTimeline(protocol, 'PROTOCOLO_CRIADO', 'Protocolo municipal aberto com registro mínimo.', new Date().toISOString(), 'CONSELHO_ACIONADO')
  }, 'CONSELHO_ACIONADO');
  await persistProtocol(next);
  await auditAction('protocol.created', next.number);
  toast('Protocolo municipal gerado.');
  navigate('protocol:' + next.id);
}
