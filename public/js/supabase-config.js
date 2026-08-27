// Rede Protege Maues - configuracao central do Supabase.
// A chave publishable/anon e publica no navegador, mas depende de RLS ativo no banco.
export const supabaseConfig = {
  url: 'https://ukjcjzijhakkxnerbvid.supabase.co',
  publishableKey: ''
};

const SUPABASE_JS_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const PUBLISHABLE_KEY_STORAGE = 'rpm.supabase.publishableKey';

let supabaseContextPromise = null;

export function configuredSupabaseKey() {
  const browserKey = typeof window === 'undefined'
    ? ''
    : window.RPM_SUPABASE_PUBLISHABLE_KEY || localStorage.getItem(PUBLISHABLE_KEY_STORAGE) || '';
  return (
    browserKey ||
    supabaseConfig.publishableKey ||
    ''
  ).trim();
}

export function isSupabaseConfigured() {
  const key = configuredSupabaseKey();
  return Boolean(supabaseConfig.url && key && !key.includes('cole_') && !key.includes('SUA_'));
}

export function saveSupabasePublishableKey(key) {
  if (key) localStorage.setItem(PUBLISHABLE_KEY_STORAGE, key.trim());
  else localStorage.removeItem(PUBLISHABLE_KEY_STORAGE);
}

export async function getSupabaseContext(options = {}) {
  if (typeof window === 'undefined' || !isSupabaseConfigured()) return null;
  if (!supabaseContextPromise) {
    supabaseContextPromise = (async () => {
      const { createClient } = await import(SUPABASE_JS_URL);
      const client = createClient(supabaseConfig.url, configuredSupabaseKey(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return { client };
    })().catch((error) => {
      console.warn('[supabase] Inicializacao indisponivel, usando modo local.', error);
      return null;
    });
  }
  const context = await supabaseContextPromise;
  if (!context) return null;
  if (options.requireAuth) {
    const { data } = await context.client.auth.getSession();
    if (!data.session) return null;
  }
  return context;
}

export function supabaseTableName(collectionName) {
  return {
    users: 'usuarios',
    units: 'unidades',
    protocols: 'protocolos',
    forwards: 'encaminhamentos',
    notifications: 'notificacoes',
    audit: 'auditoria',
    system: 'configuracoes'
  }[collectionName] || collectionName;
}

export function supabaseColumnForField(collectionName, field) {
  const common = {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  const byCollection = {
    usuarios: {
      unitId: 'unit_id',
      requestedUnit: 'requested_unit',
      emailVerified: 'email_verified'
    },
    unidades: {
      institutionType: 'institution_type',
      serviceType: 'service_type'
    },
    protocolos: {
      originUnitId: 'origin_unit_id',
      currentUnitId: 'current_unit_id',
      statusCode: 'status_code',
      visibleToRoles: 'visible_to_roles',
      visibleToUnits: 'visible_to_units',
      accessGrants: 'access_grants'
    },
    encaminhamentos: {
      protocolId: 'protocol_id',
      originUnitId: 'origin_unit_id',
      destinationUnitId: 'destination_unit_id',
      deadlineAt: 'deadline'
    },
    notificacoes: {
      userId: 'user_id',
      targetRole: 'target_role',
      protocolId: 'protocol_id'
    },
    auditoria: {
      actorId: 'actor_id'
    }
  };
  return byCollection[collectionName]?.[field] || common[field] || field;
}

export function supabaseRowToApp(collectionName, row = {}) {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  if (collectionName === 'configuracoes') {
    return { id: row.id, config: payload.config || payload };
  }
  const base = { ...payload, id: row.id };
  if (collectionName === 'usuarios') {
    return {
      ...base,
      email: row.email ?? base.email,
      name: row.name ?? base.name,
      role: row.role ?? base.role,
      unitId: row.unit_id ?? base.unitId,
      active: row.active ?? base.active,
      liberation: row.liberation ?? base.liberation,
      requestedUnit: row.requested_unit ?? base.requestedUnit,
      provider: row.provider ?? base.provider,
      emailVerified: row.email_verified ?? base.emailVerified,
      createdAt: base.createdAt || row.created_at,
      updatedAt: row.updated_at || base.updatedAt
    };
  }
  if (collectionName === 'unidades') {
    return {
      ...base,
      name: row.name ?? base.name,
      acronym: row.acronym ?? base.acronym,
      institutionType: row.institution_type ?? base.institutionType,
      serviceType: row.service_type ?? base.serviceType,
      active: row.active ?? base.active,
      createdAt: base.createdAt || row.created_at,
      updatedAt: row.updated_at || base.updatedAt
    };
  }
  if (collectionName === 'protocolos') {
    return {
      ...base,
      number: row.number ?? base.number,
      originUnitId: row.origin_unit_id ?? base.originUnitId,
      currentUnitId: row.current_unit_id ?? base.currentUnitId,
      status: row.status ?? base.status,
      statusCode: row.status_code ?? base.statusCode,
      stage: row.stage ?? base.stage,
      priority: row.priority ?? base.priority,
      visibleToRoles: row.visible_to_roles ?? base.visibleToRoles ?? [],
      visibleToUnits: row.visible_to_units ?? base.visibleToUnits ?? [],
      accessGrants: row.access_grants ?? base.accessGrants ?? [],
      createdAt: base.createdAt || row.created_at,
      updatedAt: row.updated_at || base.updatedAt
    };
  }
  if (collectionName === 'encaminhamentos') {
    return {
      ...base,
      protocolId: row.protocol_id ?? base.protocolId,
      originUnitId: row.origin_unit_id ?? base.originUnitId,
      destinationUnitId: row.destination_unit_id ?? base.destinationUnitId,
      status: row.status ?? base.status,
      deadlineAt: base.deadlineAt || row.deadline,
      createdAt: base.createdAt || row.created_at,
      updatedAt: row.updated_at || base.updatedAt
    };
  }
  if (collectionName === 'notificacoes') {
    return {
      ...base,
      userId: row.user_id ?? base.userId,
      targetRole: row.target_role ?? base.targetRole,
      protocolId: row.protocol_id ?? base.protocolId,
      read: row.read ?? base.read,
      createdAt: base.createdAt || row.created_at,
      updatedAt: row.updated_at || base.updatedAt
    };
  }
  if (collectionName === 'auditoria') {
    return {
      ...base,
      actorId: row.actor_id ?? base.actorId,
      action: row.action ?? base.action,
      target: row.target ?? base.target,
      at: row.at ?? base.at
    };
  }
  return base;
}

export function appRowToSupabase(collectionName, payload = {}) {
  const row = { id: payload.id, payload: { ...payload } };
  if (collectionName === 'usuarios') {
    Object.assign(row, {
      email: payload.email,
      name: payload.name || '',
      role: payload.role || 'pending',
      unit_id: payload.unitId || '',
      active: Boolean(payload.active),
      liberation: payload.active ? 'liberado' : (payload.liberation || 'pendente'),
      requested_unit: payload.requestedUnit || '',
      provider: payload.provider || 'password',
      email_verified: Boolean(payload.emailVerified)
    });
  }
  if (collectionName === 'unidades') {
    Object.assign(row, {
      name: payload.name || 'Unidade sem nome',
      acronym: payload.acronym || '',
      institution_type: payload.institutionType || payload.sector || '',
      service_type: payload.serviceType || payload.type || '',
      active: payload.active !== false
    });
  }
  if (collectionName === 'protocolos') {
    Object.assign(row, {
      number: payload.number || null,
      origin_unit_id: payload.originUnitId || '',
      current_unit_id: payload.currentUnitId || '',
      status: payload.status || '',
      status_code: payload.statusCode || '',
      stage: payload.stage || '',
      priority: payload.priority || '',
      visible_to_roles: payload.visibleToRoles || [],
      visible_to_units: payload.visibleToUnits || [],
      access_grants: payload.accessGrants || []
    });
  }
  if (collectionName === 'encaminhamentos') {
    Object.assign(row, {
      protocol_id: payload.protocolId || null,
      origin_unit_id: payload.originUnitId || '',
      destination_unit_id: payload.destinationUnitId || '',
      status: payload.status || '',
      deadline: payload.deadlineAt || payload.deadline || null
    });
  }
  if (collectionName === 'notificacoes') {
    Object.assign(row, {
      user_id: payload.userId || '',
      target_role: payload.targetRole || '',
      protocol_id: payload.protocolId || null,
      read: Boolean(payload.read)
    });
  }
  if (collectionName === 'auditoria') {
    Object.assign(row, {
      actor_id: payload.actorId || '',
      action: payload.action || 'audit.event',
      target: payload.target || '',
      at: payload.at || new Date().toISOString()
    });
  }
  if (collectionName === 'configuracoes') {
    row.payload = payload.config || payload;
  }
  return row;
}
