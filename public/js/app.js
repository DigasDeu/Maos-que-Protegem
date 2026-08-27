import {
  RPM, roles, navItems, flowSteps, buildProtocol, estimateSpark, protocolRisk,
  entrySequence, mobileRoutesForPackShell, rpmPublicContract,
  protocolStates, protocolStateStages
} from './fluxo.js';
import {
  navForRole, canManage, canNotify, canViewCase, canViewStats,
  currentUser, getUsers, selectUser,
  listenRemoteProfiles, observeRemoteSession, requestRemoteAccess,
  saveRemoteUserProfile, sendRemotePasswordReset, signInWithGoogleAccount,
  signInWithInstitutionalEmail, signOutRemote
} from './auth.js';
import { list, sparkStore } from './protocolos.js';
import { municipalFlowSteps, projectIndicatorDefinitions } from './dashboard.js';
import { isWorkflowStageRoute, workflowStageCopy } from './encaminhamentos.js';
import { entryGatewayOptions, institutionTypeOptions, serviceTypeOptions, flowParticipationOptions, defaultSystemConfig } from './administracao.js';
import './notificacoes.js';

import * as AuthModule from './auth.js';
import * as DashboardModule from './dashboard.js';
import * as ProtocolosModule from './protocolos.js';
import * as FluxoModule from './fluxo.js';
import * as EncaminhamentosModule from './encaminhamentos.js';
import * as NotificacoesModule from './notificacoes.js';
import * as AdministracaoModule from './administracao.js';

const routeGroups = [
  ['Inicio', ['dashboard', 'protocols', 'notifications', 'training', 'knowledge']],
  ['Fluxo da rede', ['forwards', 'council', 'samic', 'network']],
  ['Gestao', ['management', 'reports', 'audit', 'contingency', 'users', 'settings', 'help']]
];

const routeCopy = {
  dashboard: ['Dashboard', 'Tela inicial com acompanhamento em tempo real, fila viva e indicadores municipais.'],
  protocols: ['Protocolos', 'Registros operacionais com identificacao restrita por perfil.'],
  notifications: ['Notificacoes', 'Alertas internos sem narrativa sensivel fora do caso.'],
  training: ['Treinamento', 'Rotinas guiadas para entrada, Conselho, SAMIC, rede e gestao.'],
  knowledge: ['Conhecimento', 'Base rapida de consulta, fluxos, perfis e governanca.'],
  forwards: ['Encaminhamentos', 'Aceite, devolutiva, redirecionamento e conclusao por servico de destino.'],
  council: ['Conselho Tutelar', 'Confirmacao de ciencia, SIPIA, SAMIC e medidas de protecao.'],
  samic: ['SAMIC', 'Status de funcionamento e acompanhamento especializado.'],
  network: ['Rede de Atendimento', 'Unidades autorizadas, tipo de atuacao, contatos institucionais e mapeamento.'],
  management: ['Gestao', 'Alinhamento, faturamento operacional, contingencia e atividades reais.'],
  reports: ['Relatorios', 'Dashboard de notificacoes diarias e dados agregados para gestao.'],
  audit: ['Auditoria', 'Relatorio de auditoria e trilha de acoes do sistema.'],
  contingency: ['Contingencia', 'Plano operacional para queda de conexao, fila local e retomada segura.'],
  users: ['Usuarios', 'Liberacao em tempo real de perfis e unidades para contas criadas.'],
  settings: ['Configuracoes', 'Parametros do fluxo, governanca e regras do sistema.'],
  help: ['Ajuda', 'Operacao atual, privacidade, perfis de acesso e auditoria.']
};

let scheduledRenderTimer = null;
let renderSequence = 0;

const authSessionKey = AuthModule.AUTH_SESSION_KEY;

let state = {
  active: document.body.dataset.route || location.hash.replace('#', '') || 'dashboard',
  user: currentUser(),
  data: ProtocolosModule.normalizeAppState(sparkStore.readState()),
  authenticated: Boolean(sessionStorage.getItem(authSessionKey)),
  entryReady: Boolean(sessionStorage.getItem(authSessionKey)),
  authMode: 'local',
  authNotice: '',
  entryMode: 'login',
  pendingAccess: null,
  sidebarOpen: false,
  modal: null
};

const runtime = {
  state,
  routeCopy,
  routeGroups,
  RPM, roles, navItems, flowSteps,
  navForRole, canManage, canNotify, canViewCase, canViewStats,
  currentUser, getUsers, selectUser,
  list, sparkStore, buildProtocol, estimateSpark, protocolRisk,
  entrySequence, mobileRoutesForPackShell, rpmPublicContract,
  protocolStates, protocolStateStages,
  render, scheduleRender, navigate, toast, openModal, closeModal, dashboardData,
  guardAction, handleActionError,
  quickActionsPanel, securityPanel, liveUsersPanel,
  opsTable, dashedEmpty, table, statusBadge, priorityBadge, checklist,
  applySearch, labelFor, formatDate, liveClock, todayCount, lastDaysCount,
  thisMonthCount, hoursBetween, average, formatHours, isClosed, countBy,
  unitName, csvCell, initials, normalize, textOnly, esc, escAttr,
  // Cross-module adapters
  auditAction: (...args) => AdministracaoModule.auditAction(...args),
  findProtocol: (...args) => ProtocolosModule.findProtocol(...args),
  findForward: (...args) => EncaminhamentosModule.findForward(...args),
  normalizeAppState: (...args) => ProtocolosModule.normalizeAppState(...args),
  appendTimeline: (...args) => ProtocolosModule.appendTimeline(...args),
  persistProtocol: (...args) => ProtocolosModule.persistProtocol(...args),
  protocolStateCode: (...args) => ProtocolosModule.protocolStateCode(...args),
  protocolStateLabel: (...args) => ProtocolosModule.protocolStateLabel(...args),
  protocolStateStage: (...args) => ProtocolosModule.protocolStateStage(...args),
  officialSummary: (...args) => ProtocolosModule.officialSummary(...args),
  auditProtocolRead: (...args) => ProtocolosModule.auditProtocolRead(...args),
  withProtocolState: (...args) => FluxoModule.withProtocolState(...args),
  councilFollowupPanel: (...args) => FluxoModule.councilFollowupPanel(...args),
  samicDecisionPanel: (...args) => FluxoModule.samicDecisionPanel(...args),
  samicStatusCard: (...args) => FluxoModule.samicStatusCard(...args),
  isSamicOpen: (...args) => FluxoModule.isSamicOpen(...args),
  canCouncilContinue: (...args) => FluxoModule.canCouncilContinue(...args),
  alterarEtapa: (...args) => FluxoModule.alterarEtapa(...args),
  protocolOperationsTable: (...args) => ProtocolosModule.protocolOperationsTable(...args),
  forwardOperationsTable: (...args) => EncaminhamentosModule.forwardOperationsTable(...args),
  forwardDestinationOptions: (...args) => EncaminhamentosModule.forwardDestinationOptions(...args),
  nextDeadline: (...args) => EncaminhamentosModule.nextDeadline(...args),
  deadlineBadge: (...args) => EncaminhamentosModule.deadlineBadge(...args),
  formatDuration: (...args) => EncaminhamentosModule.formatDuration(...args),
  canForwardContinue: (...args) => EncaminhamentosModule.canForwardContinue(...args),
  destinationName: (...args) => EncaminhamentosModule.destinationName(...args),
  notificationItem: (...args) => NotificacoesModule.notificationItem(...args),
  officialRecordsPanel: (...args) => ProtocolosModule.officialRecordsPanel(...args),
  closurePanel: (...args) => ProtocolosModule.closurePanel(...args),
  protocolTimeline: (...args) => ProtocolosModule.protocolTimeline(...args),
  unitOptions,
};

AuthModule.initAuthUI(runtime);
DashboardModule.initDashboard(runtime);
ProtocolosModule.initProtocolosUI(runtime);
FluxoModule.initFluxoUI(runtime);
EncaminhamentosModule.initEncaminhamentosUI(runtime);
NotificacoesModule.initNotificacoesUI(runtime);
AdministracaoModule.initAdministracaoUI(runtime);

window.addEventListener('storage', () => {
  if (state.authenticated) scheduleRender();
});

window.addEventListener('rpm-spark-store-change', (event) => {
  state.data = ProtocolosModule.normalizeAppState(sparkStore.readState());
  if (event.detail?.reason === 'remote-cache') return;
  if (state.authenticated) scheduleRender();
});

window.addEventListener('hashchange', () => {
  state.active = location.hash.replace('#', '') || 'dashboard';
  if (isOccurrenceRoute(state.active)) {
    state.modal = null;
    ProtocolosModule.auditProtocolRead(state.active.split(':')[1]);
  }
  render();
});

document.addEventListener('DOMContentLoaded', boot);
setInterval(() => {
  document.querySelectorAll('[data-live-clock]').forEach((node) => {
    node.textContent = liveClock();
  });
}, 1000);

async function boot() {
  await AuthModule.restoreRemoteSession();
  await ProtocolosModule.removeSampleProtocolRequests();
  render();
}


async function render() {
  const sequence = ++renderSequence;
  try {
    if (!state.authenticated) {
      AuthModule.renderEntry();
      return;
    }

    AuthModule.clearEntryTimers();
    state.user = currentUser();
    state.data = ProtocolosModule.normalizeAppState(sparkStore.readState());
    const visible = navForRole(state.user.role, navItems);
    if (!isOccurrenceRoute(state.active) && !isWorkflowStageRoute(state.active) && !visible.some(([id]) => id === state.active)) state.active = visible[0]?.[0] || 'dashboard';

    document.querySelector('#app').innerHTML = shell(visible);
    document.body.classList.toggle('modal-open', Boolean(state.modal));
    bindShell();
    const mainView = document.querySelector('#main-view');
    mainView.innerHTML = routeLoading();
    const content = await timeoutPromise(view(state.active), 9000, 'Tempo excedido ao carregar a rota.');
    if (sequence !== renderSequence) return;
    mainView.innerHTML = content || emptyRoute();
    bindActions();
    if (sessionStorage.getItem('rpm.openNewProtocol') === '1') {
      sessionStorage.removeItem('rpm.openNewProtocol');
      openModal('notification');
    }
    window.lucide?.createIcons?.();
  } catch (error) {
    if (sequence !== renderSequence) return;
    renderFailure(error);
  }
}

function routeLoading() {
  return `<section class="route-loading" aria-live="polite">
    <span></span>
    <strong>Carregando modulo...</strong>
    <p>Buscando informacoes da rede. Se o banco demorar, o sistema usa o cache para nao travar.</p>
  </section>`;
}

function emptyRoute() {
  return `<section class="empty-state"><i data-lucide="layout-panel-top"></i><strong>Nada para exibir aqui</strong><p>O modulo carregou, mas nao retornou conteudo operacional.</p></section>`;
}

function timeoutPromise(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
}

function renderFailure(error) {
  console.error('[rpm] falha ao renderizar', error);
  const app = document.querySelector('#app');
  document.body.classList.remove('modal-open');
  app.innerHTML = `<main class="render-failure">
    <section>
      <img src="/assets/logos/maos-que-protegem-logo.png" alt="">
      <h1>O sistema encontrou uma falha de tela.</h1>
      <p>Nada foi apagado. Atualize a pagina ou volte para o Dashboard para continuar.</p>
      <div>
        <button class="button primary" data-action="recover-dashboard"><i data-lucide="layout-dashboard"></i><span>Voltar ao Dashboard</span></button>
        <button class="button" data-action="recover-reload"><i data-lucide="refresh-cw"></i><span>Atualizar</span></button>
      </div>
      <small>${esc(error?.message || 'Falha inesperada')}</small>
    </section>
  </main>`;
  document.querySelector('[data-action="recover-dashboard"]')?.addEventListener('click', () => {
    state.active = 'dashboard';
    location.hash = 'dashboard';
    render();
  });
  document.querySelector('[data-action="recover-reload"]')?.addEventListener('click', () => location.reload());
  window.lucide?.createIcons?.();
}

function shell(visible) {
  const activeCopy = copyFor(state.active);
  const unread = (state.data.notifications || []).filter((item) => !item.read).length;
  return `
    <div class="pec55-app ${state.sidebarOpen ? 'sidebar-open' : ''}">
      <button class="sidebar-scrim" data-action="close-sidebar" aria-label="Fechar menu"></button>
      <aside class="sidebar pec55-sidebar" aria-label="Navegacao principal">
        <div class="brand product-card product-card-clean">
          <img src="/assets/logos/maos-que-protegem-logo.png" alt="Maos que Protegem">
          <div>
            <strong>Rede Protege Maues</strong>
          </div>
        </div>
        <div class="operator-card">
          <span class="avatar">${initials(state.user.name)}</span>
          <div>
            <strong>${esc(state.user.name)}</strong>
            <small>${esc(roles[state.user.role] || state.user.role)}</small>
          </div>
        </div>
        ${groupedNav(visible)}
        <div class="sidebar-footer">
          <span class="status-dot"></span>
          <div>
            <strong>Tempo real ativo</strong>
            <small data-live-clock>${esc(liveClock())}</small>
          </div>
        </div>
      </aside>
      <div class="app-workspace pec55-workspace">
        <header class="navbar pec55-topbar">
          <div class="topbar-left">
            <button class="icon-button mobile-menu-button" data-action="toggle-sidebar" aria-label="Abrir menu"><i data-lucide="menu"></i></button>
            <div class="topbar-title">
              <strong>${esc(activeCopy[0])}</strong>
              <small>Rede municipal de protecao intersetorial</small>
            </div>
          </div>
          <div class="topbar-actions">
            <button class="icon-button notification-button" data-nav="notifications" aria-label="Notificacoes"><i data-lucide="bell"></i>${unread ? `<span>${unread}</span>` : ''}</button>
            <button class="icon-button" data-nav="help" aria-label="Ajuda"><i data-lucide="circle-help"></i></button>
            <span class="live-pill"><i data-lucide="radio"></i>Tempo real ativo</span>
            <span class="auth-source-pill"><i data-lucide="${state.authMode === 'supabase' ? 'shield-check' : 'monitor-check'}"></i>${state.authMode === 'supabase' ? 'Sessao segura' : 'Modo local'}</span>
            <div class="user-pill">
              <span>${initials(state.user.name)}</span>
              <div>
                <strong>${esc(state.user.name)}</strong>
                <small>${esc(roles[state.user.role] || state.user.role)}</small>
              </div>
            </div>
            ${canNotify(state.user.role) ? '<button class="button primary" data-action="open-notification-modal"><i data-lucide="plus"></i><span>Abrir protocolo</span></button>' : ''}
            <button class="button exit-button" data-action="logout"><span>Sair</span></button>
          </div>
        </header>
        <main id="app-main" class="main-content pec55-main">
          <section class="route-hero operational-hero">
            <div>
              <span class="eyebrow">RPM / ${esc(activeCopy[0])}</span>
              <h1>${esc(activeCopy[0])}</h1>
              <p>${esc(activeCopy[1])}</p>
            </div>
            <div class="hero-actions">
              ${canNotify(state.user.role) ? '<button class="quick-action primary-action" data-action="open-notification-modal"><i data-lucide="plus"></i><span>Abrir protocolo</span></button>' : ''}
              ${quickAction('forwards', 'send', 'Encaminhar')}
              ${quickAction('network', 'map-pin', 'Rede')}
            </div>
          </section>
          <section id="main-view" class="page-surface"></section>
        </main>
        ${mobileBottomNav(visible)}
      </div>
      ${state.modal ? modalShell(state.modal) : ''}
    </div>`;
}










async function view(active) {
  if (isOccurrenceRoute(active)) return ProtocolosModule.occurrenceDetails(active.split(':')[1]);
  if (active === 'dashboard') return DashboardModule.dashboard();
  if (active === 'new-protocol') return ProtocolosModule.newProtocolPage();
  if (active === 'protocols') return ProtocolosModule.protocols();
  if (active === 'notifications') return NotificacoesModule.notifications();
  if (active === 'training') return DashboardModule.training();
  if (active === 'knowledge') return DashboardModule.knowledge();
  if (active === 'forwards') return EncaminhamentosModule.forwards();
  if (isWorkflowStageRoute(active)) return EncaminhamentosModule.workflowStagePage(active);
  if (active === 'council') return FluxoModule.council();
  if (active === 'samic') return FluxoModule.samic();
  if (active === 'network') return AdministracaoModule.network();
  if (active === 'management') return AdministracaoModule.management();
  if (active === 'reports') return DashboardModule.reports();
  if (active === 'audit') return AdministracaoModule.audit();
  if (active === 'contingency') return AdministracaoModule.contingency();
  if (active === 'users') return AdministracaoModule.users();
  if (active === 'settings') return AdministracaoModule.settings();
  return AdministracaoModule.help();
}























function quickActionsPanel() {
  return `<section class="legacy-panel quick-panel">
    <h2>Acoes Rapidas</h2>
    <button class="button action-line" data-action="open-notification-modal"><i data-lucide="bell-plus"></i><span>Abrir protocolo</span></button>
    <button class="button action-line" data-nav="protocols"><i data-lucide="search"></i><span>Consultar protocolo</span></button>
    <button class="button action-line" data-nav="forwards"><i data-lucide="send"></i><span>Encaminhamentos</span></button>
  </section>`;
}

function securityPanel() {
  return `<section class="legacy-panel security-panel">
    <h2>Seguranca</h2>
    ${[
      ['Menor privilegio', 'Cada perfil acessa somente o necessario para sua funcao.'],
      ['Sem dados fora', 'Alertas nao levam nome, relato, endereco ou diagnostico.'],
      ['Auditoria', 'Acessos, alteracoes, exportacoes e negativas ficam rastreaveis.']
    ].map(([title, text]) => `<article><strong>${esc(title)}</strong><p>${esc(text)}</p></article>`).join('')}
  </section>`;
}

function liveUsersPanel(users) {
  const activeUsers = users.filter((user) => user.active).slice(0, 6);
  return `<section class="legacy-panel live-users-panel">
    <div class="legacy-panel-header compact"><h2>Usuarios em tempo real</h2><span class="status-badge success">Ativo</span></div>
    ${activeUsers.map((user, index) => `<article class="live-user" data-search-row="${escAttr([user.name, user.email, user.role].join(' '))}">
      <span class="avatar mini">${initials(user.name)}</span>
      <div><strong>${esc(user.name)}</strong><small>${esc(roles[user.role] || user.role)} / ${index === 0 ? 'online agora' : 'sincronizado'}</small></div>
    </article>`).join('')}
  </section>`;
}














function opsTable(keys, rows, options = {}) {
  const raw = new Set(options.raw || []);
  if (!rows.length) return `<div class="table-wrap"><table class="data-table"><thead><tr>${keys.map((key) => `<th>${esc(labelFor(key))}</th>`).join('')}</tr></thead><tbody><tr><td colspan="${keys.length}">${esc(options.empty || 'Nenhum registro encontrado.')}</td></tr></tbody></table></div>`;
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${keys.map((key) => `<th>${esc(labelFor(key))}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((row) => `<tr data-search-row="${escAttr(keys.map((key) => textOnly(row[key] ?? '')).join(' '))}">${keys.map((key) => `<td>${raw.has(key) ? row[key] : esc(row[key] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

function dashedEmpty(text) {
  return `<div class="dashed-empty">${esc(text)}</div>`;
}

function modalShell(modal) {
  const type = modal.type || modal;
  const content = type === 'unit' ? AdministracaoModule.unitModal(modal.id)
    : type === 'user' ? AdministracaoModule.userModal(modal.id)
      : type === 'protocol' ? ProtocolosModule.protocolModal(modal.id)
        : NotificacoesModule.notificationModal();
  return `<div class="modal-backdrop" data-modal-layer>
    <button class="modal-scrim" data-action="close-modal" aria-label="Fechar"></button>
    <section class="modal-sheet" role="dialog" aria-modal="true">${content}</section>
  </div>`;
}











function unitOptions(selected = 'rede', options = {}) {
  const units = state.data.units || [];
  if (options.registeredOnly) {
    if (!units.length) return '<option value="">Cadastre uma unidade na Rede de Atendimento</option>';
    return units.map((unit) => `<option value="${escAttr(unit.id)}"${selected === unit.id ? ' selected' : ''}>${esc(unit.name)}${unit.serviceType || unit.entryType || unit.type ? ' - ' + esc(unit.serviceType || unit.entryType || unit.type) : ''}</option>`).join('');
  }
  const fixed = [
    `<option value=""${!selected ? ' selected' : ''}>A definir</option>`,
    `<option value="rede"${selected === 'rede' ? ' selected' : ''}>Rede municipal</option>`,
    `<option value="conselho-tutelar"${selected === 'conselho-tutelar' ? ' selected' : ''}>Conselho Tutelar</option>`,
    `<option value="policia-civil"${selected === 'policia-civil' ? ' selected' : ''}>Policia Civil</option>`
  ];
  return fixed.concat(units.map((unit) => `<option value="${escAttr(unit.id)}"${selected === unit.id ? ' selected' : ''}>${esc(unit.name)}</option>`)).join('');
}















function bindShell() {
  document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.nav)));
  document.querySelector('[data-action="toggle-sidebar"]')?.addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen;
    render();
  });
  document.querySelector('[data-action="close-sidebar"]')?.addEventListener('click', () => {
    state.sidebarOpen = false;
    render();
  });
  document.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    sparkStore.reset();
    toast('Dados locais restaurados.');
    render();
  });
  document.querySelector('[data-action="logout"]')?.addEventListener('click', async () => {
    await AuthModule.logoutCurrentSession();
    toast('Sessao encerrada.');
    render();
  });
  const search = document.querySelector('#global-search');
  search?.addEventListener('input', () => applySearch(search.value));
  search?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') navigate('protocols');
  });
}

function bindActions() {
  document.querySelectorAll('[data-action="new-protocol"], [data-action="open-notification-modal"]').forEach((button) => button.addEventListener('click', () => openModal('notification')));
  document.querySelectorAll('[data-action="open-unit-modal"]').forEach((button) => button.addEventListener('click', () => openModal({ type: 'unit', id: button.dataset.unitId || '' })));
  document.querySelectorAll('[data-action="open-user-modal"]').forEach((button) => button.addEventListener('click', () => openModal({ type: 'user', id: button.dataset.userId })));
  document.querySelectorAll('[data-action="open-protocol-modal"]').forEach((button) => button.addEventListener('click', () => openModal({ type: 'protocol', id: button.dataset.protocolId })));
  document.querySelectorAll('[data-action="confirm-council"]').forEach((button) => button.addEventListener('click', guardAction(() => FluxoModule.confirmCouncilAwareness(button.dataset.protocolId))));
  document.querySelectorAll('[data-action="activate-samic"]').forEach((button) => button.addEventListener('click', guardAction(() => FluxoModule.activateSamicFlow(button.dataset.protocolId))));
  document.querySelectorAll('[data-action="accept-forward"]').forEach((button) => button.addEventListener('click', guardAction(() => EncaminhamentosModule.updateForwardStatus(button.dataset.forwardId, 'Aceito'))));
  document.querySelectorAll('[data-action="return-forward"]').forEach((button) => button.addEventListener('click', guardAction(() => EncaminhamentosModule.returnForward(button.dataset.forwardId))));
  document.querySelectorAll('[data-action="redirect-forward"]').forEach((button) => button.addEventListener('click', guardAction(() => EncaminhamentosModule.redirectForward(button.dataset.forwardId))));
  document.querySelectorAll('[data-action="register-forward-attendance"]').forEach((button) => button.addEventListener('click', guardAction(() => EncaminhamentosModule.registerForwardAttendance(button.dataset.forwardId))));
  document.querySelectorAll('[data-action="register-forward-feedback"]').forEach((button) => button.addEventListener('click', guardAction(() => EncaminhamentosModule.registerForwardFeedback(button.dataset.forwardId))));
  document.querySelectorAll('[data-action="complete-forward"]').forEach((button) => button.addEventListener('click', guardAction(() => EncaminhamentosModule.updateForwardStatus(button.dataset.forwardId, 'Concluido'))));
  document.querySelectorAll('[data-action="mark-notification-read"]').forEach((button) => button.addEventListener('click', guardAction(() => NotificacoesModule.markNotificationRead(button.dataset.notificationId))));
  document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.nav)));
  document.querySelectorAll('[data-filter-table]').forEach((control) => {
    const eventName = control.tagName === 'SELECT' ? 'change' : 'input';
    control.addEventListener(eventName, () => applySearch(control.value));
  });
  document.querySelector('[data-action="clear-filter"]')?.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-table]').forEach((control) => {
      control.value = '';
    });
    applySearch('');
  });
  document.querySelector('#council-followup-form')?.addEventListener('submit', guardAction(FluxoModule.saveCouncilFollowup));
  document.querySelector('#forward-form')?.addEventListener('submit', guardAction(EncaminhamentosModule.saveForward));
  document.querySelector('#official-records-form')?.addEventListener('submit', guardAction(ProtocolosModule.saveOfficialRecords));
  document.querySelector('#samic-decision-form')?.addEventListener('submit', guardAction(FluxoModule.saveSamicDecision));
  document.querySelector('#closure-form')?.addEventListener('submit', guardAction(ProtocolosModule.closeProtocol));
  document.querySelector('#reopen-form')?.addEventListener('submit', guardAction(ProtocolosModule.reopenProtocol));
  document.querySelector('#settings-form')?.addEventListener('submit', guardAction(AdministracaoModule.saveSettings));
  document.querySelector('[data-action="export-csv"]')?.addEventListener('click', AdministracaoModule.exportCsv);
  document.querySelector('#protocol-form')?.addEventListener('submit', guardAction(ProtocolosModule.saveQuickProtocol));
  bindModalActions();
}

function bindModalActions() {
  const layer = document.querySelector('[data-modal-layer]');
  if (!layer) return;
  layer.querySelectorAll('[data-action="close-modal"]').forEach((button) => button.addEventListener('click', closeModal));
  layer.querySelector('#notification-form')?.addEventListener('submit', guardAction(ProtocolosModule.saveNotification));
  layer.querySelector('#unit-form')?.addEventListener('submit', guardAction(AdministracaoModule.saveUnit));
  layer.querySelector('#user-form')?.addEventListener('submit', guardAction(AdministracaoModule.saveUser));
  layer.querySelectorAll('[data-action="capture-location"]').forEach((button) => button.addEventListener('click', () => toast('Captura de localizacao preparada para permissao do navegador.')));
  layer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
  layer.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])')?.focus();
}

function guardAction(fn) {
  return async (event) => {
    try {
      await fn(event);
    } catch (error) {
      handleActionError(error);
    }
  };
}

function handleActionError(error) {
  console.error('[rpm] falha na acao', error);
  const message = String(error?.code || error?.message || '').toLowerCase();
  if (message.includes('permission-denied')) {
    toast('Permissao negada. Verifique perfil, unidade e liberacao do usuario.');
    return;
  }
  toast('Nao foi possivel salvar agora. A tela continua ativa para tentar novamente.');
}

function openModal(modal) {
  state.modal = typeof modal === 'string' ? { type: modal } : modal;
  const app = document.querySelector('.pec55-app');
  if (!app) {
    render();
    return;
  }
  document.querySelector('[data-modal-layer]')?.remove();
  app.insertAdjacentHTML('beforeend', modalShell(state.modal));
  document.body.classList.add('modal-open');
  bindModalActions();
  window.lucide?.createIcons?.();
}

function closeModal() {
  state.modal = null;
  document.querySelector('[data-modal-layer]')?.remove();
  document.body.classList.remove('modal-open');
}




















function isOccurrenceRoute(active = '') {
  return /^(protocol|occurrence):/.test(String(active));
}

























function scheduleRender() {
  if (!state.authenticated || state.modal) return;
  const activeElement = document.activeElement;
  if (activeElement?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
  clearTimeout(scheduledRenderTimer);
  scheduledRenderTimer = setTimeout(() => render(), 120);
}



function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}


async function dashboardData() {
  return {
    protocols: await list('protocols', { orderBy: ['updatedAt', 'desc'], limit: 20 }),
    forwards: await list('forwards', { limit: 20 }),
    notifications: await list('notifications', { limit: 20 })
  };
}

function groupedNav(visible) {
  const visibleIds = new Set(visible.map(([id]) => id));
  return `<nav class="nav-group">${routeGroups.map(([label, ids]) => {
    const buttons = ids.filter((id) => visibleIds.has(id)).map((id) => navButton(id)).join('');
    return buttons ? `<section class="nav-section"><span>${label}</span>${buttons}</section>` : '';
  }).join('')}</nav>`;
}

function mobileBottomNav(visible) {
  const visibleIds = new Set(visible.map(([id]) => id));
  const routes = mobileRoutesForPackShell().filter(([id]) => visibleIds.has(id));
  return `<nav class="mobile-bottom-nav" aria-label="Atalhos principais">
    ${routes.map(([id, icon, label]) => `<button class="${state.active === id ? 'active' : ''}" data-nav="${id}"><i data-lucide="${icon}"></i><span>${esc(label)}</span></button>`).join('')}
  </nav>`;
}

function navButton(id) {
  const item = navItems.find(([route]) => route === id);
  if (!item) return '';
  const [, label, icon] = item;
  return `<button class="nav-link ${id === state.active ? 'active' : ''}" data-nav="${id}">
    <span><i data-lucide="${icon}"></i>${esc(label)}</span>
    ${navSignal(id)}
  </button>`;
}

function navSignal(id) {
  const protocols = state.data.protocols || [];
  const forwards = state.data.forwards || [];
  const notifications = state.data.notifications || [];
  const count = {
    dashboard: protocols.filter((item) => protocolRisk(item).band === 'critica').length,
    protocols: protocols.length,
    forwards: forwards.filter((item) => item.status !== 'Concluido').length,
    notifications: notifications.filter((item) => !item.read).length,
    council: protocols.filter((item) => item.stage === 'conselho').length,
    samic: protocols.filter((item) => item.stage === 'samic').length
  }[id];
  return Number.isFinite(count) && count > 0 ? `<small>${count}</small>` : '<small></small>';
}

function quickAction(id, icon, label) {
  return `<button class="quick-action ${id === state.active ? 'active' : ''}" data-nav="${id}"><i data-lucide="${icon}"></i><span>${label}</span></button>`;
}

function navigate(view) {
  state.sidebarOpen = false;
  location.hash = view;
  state.active = view;
  render();
}

function copyFor(id) {
  if (isOccurrenceRoute(id)) return ['Acompanhar protocolo', 'Resumo, linha do tempo, Conselho Tutelar, SINAN/SIPIA, SAMIC, encaminhamentos e encerramento.'];
  if (isWorkflowStageRoute(id)) return workflowStageCopy(id);
  return routeCopy[id] || [titleFor(id), 'Rede Protege Maues'];
}

function titleFor(id) {
  return navItems.find((item) => item[0] === id)?.[1] || 'Rede Protege';
}

function protocolTable(rows) {
  return table(['number', 'entryPoint', 'priority', 'status', 'currentOwner', 'updatedAt'], rows.map((row) => ({ ...row, priority: priorityBadge(row.priority), status: statusBadge(row.status), updatedAt: formatDate(row.updatedAt) })), true);
}

function table(keys, rows, raw = false) {
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${keys.map((key) => `<th>${esc(labelFor(key))}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((row) => {
      const haystack = keys.map((key) => textOnly(row[key] ?? '')).join(' ');
      return `<tr data-search-row="${escAttr(haystack)}">${keys.map((key) => `<td>${raw && ['priority', 'status'].includes(key) ? row[key] : esc(row[key] ?? '')}</td>`).join('')}</tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

function statusBadge(value) {
  const normalized = normalize(value);
  const cls = normalized.includes('ativo') || normalized.includes('conclu') || normalized.includes('liberado') ? 'success'
    : normalized.includes('pend') || normalized.includes('aguard') ? 'warning'
      : '';
  return `<span class="status-badge ${cls}">${esc(value)}</span>`;
}

function priorityBadge(value) {
  const cls = value === 'Critica' ? 'critica' : value === 'Alta' ? 'alta' : value === 'Media' ? 'media' : 'baixa';
  return `<span class="priority-badge priority-${cls}">${esc(value)}</span>`;
}

function checklist(items) {
  return `<ul class="check-list">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function applySearch(value) {
  const needle = normalize(value);
  document.querySelectorAll('[data-search-row]').forEach((node) => {
    node.hidden = Boolean(needle) && !normalize(node.dataset.searchRow || node.textContent).includes(needle);
  });
}

function toast(message) {
  const root = document.querySelector('#toast-root');
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  root.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}

function labelFor(key) {
  return {
    number: 'Protocolo',
    entryPoint: 'Entrada',
    origin: 'Origem',
    identification: 'Identificacao',
    priority: 'Prioridade',
    stage: 'Etapa',
    status: 'Status',
    official: 'Registro oficial',
    currentOwner: 'Responsavel',
    updatedAt: 'Atualizado',
    destination: 'Destino',
    reason: 'Motivo',
    deadline: 'Prazo',
    objective: 'Objetivo',
    name: 'Nome',
    email: 'E-mail',
    role: 'Perfil',
    unitId: 'Unidade',
    liberation: 'Liberacao',
    actions: 'Acoes'
  }[key] || key;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function liveClock() {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
}

function todayCount(rows) {
  const today = new Date().toDateString();
  return rows.filter((row) => new Date(row.createdAt || row.updatedAt || 0).toDateString() === today).length;
}

function lastDaysCount(rows, days) {
  const floor = Date.now() - days * 24 * 60 * 60 * 1000;
  return rows.filter((row) => new Date(row.createdAt || row.updatedAt || 0).getTime() >= floor).length;
}

function thisMonthCount(rows) {
  const now = new Date();
  return rows.filter((row) => {
    const date = new Date(row.createdAt || row.updatedAt || 0);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
}

function hoursBetween(start, end) {
  if (!start || !end) return NaN;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return NaN;
  return Math.max(0, (endDate.getTime() - startDate.getTime()) / 3600000);
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function formatHours(value) {
  if (!Number.isFinite(value)) return 'Pendente';
  if (value < 1) return `${Math.round(value * 60)} min`;
  return `${value.toFixed(value >= 10 ? 0 : 1)} h`;
}

function isClosed(row) {
  return normalize(row.status || '').includes('encerr') || normalize(row.status || '').includes('conclu');
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const label = row[key] || 'Nao informado';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function unitName(id) {
  const fixed = {
    rede: 'Rede municipal',
    'conselho-tutelar': 'Conselho Tutelar',
    'policia-civil': 'Policia Civil'
  };
  return (state.data.units || []).find((unit) => unit.id === id)?.name || fixed[id] || id || 'A definir';
}


function csvCell(value = '') {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'RP';
}

function normalize(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function textOnly(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ');
}

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function escAttr(value = '') {
  return esc(value).replace(/\n/g, ' ');
}

export { state, runtime };
