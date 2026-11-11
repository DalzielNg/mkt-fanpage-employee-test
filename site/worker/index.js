const INDEX_HTML = decodeBase64('__INDEX_HTML_B64__');
const STYLES_CSS = decodeBase64('__STYLES_CSS_B64__');
const APP_JS = decodeBase64('__APP_JS_B64__');

const ASSETS = new Map([
  ['/index.html', { body: INDEX_HTML, type: 'text/html; charset=utf-8' }],
  ['/styles.css', { body: STYLES_CSS, type: 'text/css; charset=utf-8' }],
  ['/app.js', { body: APP_JS, type: 'application/javascript; charset=utf-8' }],
]);

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    },
  });
}

function getSiteIdentity(request) {
  const userId = request.headers.get('oai-authenticated-user-id')?.trim() || '';
  const email = request.headers.get('oai-authenticated-user-email')?.trim() || '';
  if (!userId || userId.length > 200) return null;
  return { userId, email: email.slice(0, 320) };
}

function unauthorized() {
  return new Response('Vui lòng đăng nhập MKT-Fanpage để tiếp tục.', {
    status: 401,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    },
  });
}

async function checkSupabase(env) {
  const supabaseUrl = env?.SUPABASE_URL;
  const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return false;

  try {
    const endpoint = new URL('/rest/v1/topics?select=id&limit=1', supabaseUrl);
    const response = await fetch(endpoint, {
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

function getTenantId(env) {
  return typeof env?.MKT_TENANT_ID === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(env.MKT_TENANT_ID)
    ? env.MKT_TENANT_ID
    : '';
}

function normalizeGroupUrl(value = '') {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return parsed.href.toLowerCase().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function mapGroupStatus(value) {
  return ({ pending: 'pending_review', inactive: 'paused' })[value] || value || 'testing';
}

async function supabaseRequest(path, env, options = {}) {
  const supabaseUrl = env?.SUPABASE_URL;
  const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !getTenantId(env)) return { ok: false, status: 503, json: null };
  try {
    const response = await fetch(new URL(path, supabaseUrl), {
      ...options,
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        'content-type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    return { ok: response.ok, status: response.status, json: body };
  } catch {
    return { ok: false, status: 503, json: null };
  }
}

async function supabaseStorageRequest(path, env, options = {}) {
  const supabaseUrl = env?.SUPABASE_URL;
  const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return { ok: false, status: 503, text: '' };
  try {
    const response = await fetch(new URL(`/storage/v1${path}`, supabaseUrl), {
      ...options,
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        ...(options.headers || {}),
      },
    });
    return { ok: response.ok, status: response.status, text: await response.text() };
  } catch {
    return { ok: false, status: 503, text: '' };
  }
}

const BACKUP_BUCKET = 'mkt-fanpage-backups';

async function ensureBackupBucket(env) {
  const existing = await supabaseStorageRequest(`/bucket/${BACKUP_BUCKET}`, env);
  if (existing.ok) return true;
  const created = await supabaseStorageRequest('/bucket', env, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: BACKUP_BUCKET, name: BACKUP_BUCKET, public: false }),
  });
  if (!created.ok && created.status !== 409) {
    console.error('backup_bucket_provision_failed', JSON.stringify({ existingStatus: existing.status, createdStatus: created.status }));
  }
  return created.ok || created.status === 409;
}

function backupObjectPath(tenantId, name) {
  return `/object/${BACKUP_BUCKET}/${tenantId}/${name}`;
}

async function handleOnlineBackup(request, env, url) {
  const tenantId = getTenantId(env);
  if (!tenantId) return json({ message: 'Backend chưa được cấu hình đầy đủ.' }, 503);
  const isAudit = url.pathname === '/api/audit';
  const objectName = isAudit ? 'audit.json' : 'latest.json';
  if (request.method === 'GET') {
    let result = await supabaseStorageRequest(backupObjectPath(tenantId, objectName), env);
    if (!result.ok && result.status !== 401 && result.status !== 403) {
      // Provision the private bucket on first read as well as first write.
      // Storage can report a missing bucket as 400, 404, or a transient 5xx.
      // Retry all non-auth failures so a fresh project is not downgraded to
      // browser-only storage just because the first read races provisioning.
      if (await ensureBackupBucket(env)) {
        result = await supabaseStorageRequest(backupObjectPath(tenantId, objectName), env);
      }
    }
    const missingObject = result.status === 404 || (result.status === 400 && /not[ _-]?found|does not exist|resource was not found/i.test(result.text));
    if (missingObject) return json(isAudit ? { audit: [] } : { backup: null });
    if (!result.ok) {
      console.error('online_backup_get_failed', JSON.stringify({ objectName, status: result.status, body: result.text.slice(0, 240) }));
      return json({ message: 'Không thể tải dữ liệu online.' }, 502);
    }
    try {
      return json(JSON.parse(result.text));
    } catch {
      return json({ message: 'Dữ liệu online không hợp lệ.' }, 502);
    }
  }
  if (request.method !== 'POST') return json({ message: 'Phương thức không được hỗ trợ.' }, 405);
  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu online không hợp lệ.' }, 400); }
  if (isAudit && (!Array.isArray(payload?.audit) || payload.audit.length > 500)) return json({ message: 'Nhật ký không hợp lệ.' }, 400);
  if (!isAudit && (!payload || payload.app !== 'MKT-Fanpage')) return json({ message: 'Bản sao lưu không đúng định dạng.' }, 400);
  const body = JSON.stringify(payload);
  if (body.length > 8_000_000) return json({ message: 'Bản sao lưu quá lớn.' }, 413);
  if (!await ensureBackupBucket(env)) return json({ message: 'Không thể khởi tạo kho sao lưu online.' }, 502);
  const result = await supabaseStorageRequest(backupObjectPath(tenantId, objectName), env, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-upsert': 'true',
    },
    body,
  });
  if (!result.ok) return json({ message: 'Không thể lưu dữ liệu online.' }, 502);
  return json({ saved: true, updatedAt: new Date().toISOString() });
}

function toGroupRow(group, tenantId) {
  const name = typeof group?.name === 'string' ? group.name.trim().slice(0, 300) : '';
  const url = typeof group?.url === 'string' ? group.url.trim().slice(0, 2000) : '';
  const normalizedUrl = normalizeGroupUrl(url);
  if (!name || !normalizedUrl) return null;
  const approvalRate = Number(group?.approvalRate);
  const testedAt = group?.updatedAt && !Number.isNaN(new Date(group.updatedAt).getTime())
    ? new Date(group.updatedAt).toISOString()
    : null;
  const row = {
    owner_id: tenantId,
    name,
    url,
    normalized_url: normalizedUrl,
    audience: typeof group?.audience === 'string' ? group.audience.trim().slice(0, 500) : null,
    topic_label: typeof group?.topic === 'string' ? group.topic.trim().slice(0, 200) : null,
    notes: typeof group?.notes === 'string' ? group.notes.trim().slice(0, 2000) : null,
    status: mapGroupStatus(group?.status),
    approval_rate: Number.isFinite(approvalRate) && approvalRate >= 0 && approvalRate <= 100 ? approvalRate : null,
    last_tested_at: testedAt,
    is_deleted: false,
  };
  if (typeof group?.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(group.id)) row.id = group.id;
  return row;
}

function toGroupMetadata(group) {
  return {
    topic_label: typeof group?.topic === 'string' ? group.topic.trim().slice(0, 200) : null,
    notes: typeof group?.notes === 'string' ? group.notes.trim().slice(0, 2000) : null,
  };
}

function uniqueGroupRows(groups, tenantId) {
  const validRows = groups.map((group) => toGroupRow(group, tenantId)).filter(Boolean);
  const uniqueRows = [...new Map(validRows.map((row) => [row.normalized_url, row])).values()];
  return {
    validRows,
    uniqueRows,
    invalidCount: groups.length - validRows.length,
    duplicateCount: validRows.length - uniqueRows.length,
  };
}

const CONTENT_METADATA_PREFIX = 'MKT-FANPAGE-META-V1\n';

function isUuid(value = '') {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function encodeContentCaption(content) {
  const metadata = {
    title: typeof content?.title === 'string' ? content.title.trim().slice(0, 160) : '',
    summary: typeof content?.summary === 'string' ? content.summary.trim().slice(0, 1200) : '',
    topic: typeof content?.topic === 'string' ? content.topic.trim().slice(0, 200) : '',
    audience: typeof content?.audience === 'string' ? content.audience.trim().slice(0, 500) : '',
    format: typeof content?.format === 'string' ? content.format.trim().slice(0, 30) : 'post',
    cta: typeof content?.cta === 'string' ? content.cta.trim().slice(0, 180) : '',
  };
  return `${CONTENT_METADATA_PREFIX}${JSON.stringify(metadata)}`;
}

function decodeContentCaption(value) {
  if (typeof value !== 'string' || !value.startsWith(CONTENT_METADATA_PREFIX)) {
    return { summary: typeof value === 'string' ? value : '' };
  }
  try {
    const parsed = JSON.parse(value.slice(CONTENT_METADATA_PREFIX.length));
    return parsed && typeof parsed === 'object' ? parsed : { summary: '' };
  } catch {
    return { summary: '' };
  }
}

function toContentRow(content, tenantId) {
  const metadata = decodeContentCaption(encodeContentCaption(content));
  const title = metadata.title || 'Bài viết chưa đặt tiêu đề';
  const sourceUrl = typeof content?.sourceUrl === 'string' ? content.sourceUrl.trim().slice(0, 2000) : null;
  const status = ['draft', 'approved', 'rejected'].includes(content?.status) ? content.status : 'draft';
  const row = {
    owner_id: tenantId,
    title,
    caption: encodeContentCaption(content),
    source_url: sourceUrl || null,
    status,
  };
  if (isUuid(content?.id)) row.id = content.id;
  return row;
}

function fromContentRow(row) {
  const metadata = decodeContentCaption(row?.caption);
  return {
    id: row.id,
    title: metadata.title || (typeof row?.title === 'string' ? row.title : ''),
    sourceUrl: row?.source_url || '',
    topic: metadata.topic || '',
    audience: metadata.audience || '',
    format: metadata.format || 'post',
    status: row?.status || 'draft',
    summary: metadata.summary || '',
    cta: metadata.cta || '',
    posterDataUrl: '',
    posterBlobId: '',
    createdAt: row?.created_at || row?.updated_at || new Date().toISOString(),
    updatedAt: row?.updated_at || row?.created_at || new Date().toISOString(),
  };
}

function uniqueContentRows(contents, tenantId) {
  const validRows = contents
    .filter((content) => content && typeof content === 'object')
    .map((content) => toContentRow(content, tenantId))
    .filter((row) => row.title && row.caption);
  const uniqueRows = [...new Map(validRows.map((row) => [row.id || `${row.title}::${row.source_url || ''}`, row])).values()];
  return { validRows, uniqueRows, invalidCount: contents.length - validRows.length, duplicateCount: validRows.length - uniqueRows.length };
}

async function previewContents(request, env, tenantId) {
  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu kiểm tra nội dung không hợp lệ.' }, 400); }
  if (!Array.isArray(payload?.contents) || payload.contents.length > 1000) {
    return json({ message: 'Danh sách nội dung phải là mảng tối đa 1.000 dòng.' }, 400);
  }
  const { uniqueRows, invalidCount, duplicateCount } = uniqueContentRows(payload.contents, tenantId);
  const result = await supabaseRequest(`/rest/v1/contents?select=id&owner_id=eq.${tenantId}`, env);
  if (!result.ok) return json({ message: 'Không thể đối chiếu thư viện nội dung trên Supabase.' }, 502);
  const existingIds = new Set((Array.isArray(result.json) ? result.json : []).map((row) => row.id));
  const updateCount = uniqueRows.filter((row) => row.id && existingIds.has(row.id)).length;
  return json({ total: payload.contents.length, validCount: uniqueRows.length, newCount: uniqueRows.length - updateCount, updateCount, invalidCount, duplicateCount });
}

async function deleteContentRowsWithDependencies(ids, env, tenantId) {
  const contentIds = [...new Set(ids.filter(isUuid))];
  if (!contentIds.length) return 0;
  const contentFilter = contentIds.join(',');
  const batchesResult = await supabaseRequest(`/rest/v1/batches?select=id&owner_id=eq.${tenantId}&content_id=in.(${contentFilter})`, env);
  if (!batchesResult.ok) throw new Error('Không thể đọc các lô đang tham chiếu nội dung trên Supabase.');
  const batchIds = [...new Set((Array.isArray(batchesResult.json) ? batchesResult.json : []).map((row) => row.id).filter(isUuid))];

  const contentItemsResult = await supabaseRequest(`/rest/v1/queue_items?select=id,batch_id&owner_id=eq.${tenantId}&content_id=in.(${contentFilter})`, env);
  if (!contentItemsResult.ok) throw new Error('Không thể đọc hàng đợi đang tham chiếu nội dung trên Supabase.');
  const contentItems = Array.isArray(contentItemsResult.json) ? contentItemsResult.json : [];
  const batchFilter = batchIds.join(',');
  const batchItemsResult = batchIds.length
    ? await supabaseRequest(`/rest/v1/queue_items?select=id,batch_id&owner_id=eq.${tenantId}&batch_id=in.(${batchFilter})`, env)
    : { ok: true, json: [] };
  if (!batchItemsResult.ok) throw new Error('Không thể đọc hàng đợi theo lô trên Supabase.');
  const queueItems = [...contentItems, ...(Array.isArray(batchItemsResult.json) ? batchItemsResult.json : [])];
  const queueItemIds = [...new Set(queueItems.map((row) => row.id).filter(isUuid))];

  const deleteRows = async (path, message) => {
    const result = await supabaseRequest(path, env, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    if (!result.ok) throw new Error(message);
  };

  if (queueItemIds.length) {
    await deleteRows(`/rest/v1/metric_snapshots?owner_id=eq.${tenantId}&queue_item_id=in.(${queueItemIds.join(',')})`, 'Không thể xóa số liệu gắn với nội dung trên Supabase.');
  }
  if (queueItemIds.length) {
    await deleteRows(`/rest/v1/queue_items?owner_id=eq.${tenantId}&id=in.(${queueItemIds.join(',')})`, 'Không thể xóa mục hàng đợi gắn với nội dung trên Supabase.');
  }
  if (batchIds.length) {
    await deleteRows(`/rest/v1/group_decisions?owner_id=eq.${tenantId}&batch_id=in.(${batchFilter})`, 'Không thể xóa quyết định gắn với lô trên Supabase.');
    await deleteRows(`/rest/v1/batches?owner_id=eq.${tenantId}&id=in.(${batchFilter})`, 'Không thể xóa lô gắn với nội dung trên Supabase.');
  }
  await deleteRows(`/rest/v1/contents?owner_id=eq.${tenantId}&id=in.(${contentFilter})`, 'Không thể xóa nội dung trên Supabase.');
  return contentIds.length;
}

async function handleContents(request, env, url) {
  const tenantId = getTenantId(env);
  if (!tenantId) return json({ message: 'Backend chưa được cấu hình đầy đủ.' }, 503);
  if (request.method === 'GET' && url.pathname === '/api/contents') {
    const result = await supabaseRequest(`/rest/v1/contents?select=id,title,caption,source_url,status,created_at,updated_at&owner_id=eq.${tenantId}&order=created_at.desc,id.desc`, env);
    if (!result.ok) return json({ message: 'Không thể tải thư viện nội dung từ Supabase.' }, 502);
    return json({ contents: (Array.isArray(result.json) ? result.json : []).map(fromContentRow) });
  }
  if (request.method === 'DELETE' && url.pathname.startsWith('/api/contents/')) {
    const contentId = decodeURIComponent(url.pathname.slice('/api/contents/'.length));
    if (!isUuid(contentId)) return json({ message: 'Mã nội dung không hợp lệ.' }, 400);
    try {
      await deleteContentRowsWithDependencies([contentId], env, tenantId);
      return json({ deleted: true });
    } catch (error) {
      return json({ message: error?.message || 'Không thể xóa nội dung trên Supabase.' }, 502);
    }
  }
  if (request.method === 'POST' && url.pathname === '/api/contents/retention') {
    let payload;
    try { payload = await request.json(); } catch { return json({ message: 'Danh sách dọn nội dung không hợp lệ.' }, 400); }
    const ids = [...new Set(Array.isArray(payload?.ids) ? payload.ids.filter(isUuid) : [])];
    if (!ids.length || ids.length > 1000) return json({ message: 'Danh sách nội dung cần dọn phải có từ 1 đến 1.000 mã hợp lệ.' }, 400);
    try {
      const deleted = await deleteContentRowsWithDependencies(ids, env, tenantId);
      return json({ deleted });
    } catch (error) {
      return json({ message: error?.message || 'Không thể dọn nội dung cũ trên Supabase.' }, 502);
    }
  }
  if (request.method === 'POST' && url.pathname === '/api/contents/preview') return previewContents(request, env, tenantId);
  if (request.method !== 'POST' || url.pathname !== '/api/contents/sync') return json({ message: 'Phương thức không được hỗ trợ.' }, 405);
  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu đồng bộ nội dung không hợp lệ.' }, 400); }
  if (!Array.isArray(payload?.contents) || payload.contents.length > 1000) return json({ message: 'Danh sách nội dung phải là mảng tối đa 1.000 dòng.' }, 400);
  const { uniqueRows: rows, invalidCount, duplicateCount } = uniqueContentRows(payload.contents, tenantId);
  if (!rows.length) return json({ message: 'Không có nội dung hợp lệ để đồng bộ.' }, 400);
  const result = await supabaseRequest('/rest/v1/contents?on_conflict=owner_id,id', env, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(rows),
  });
  if (!result.ok) return json({ message: 'Không thể đồng bộ thư viện nội dung với Supabase.' }, 502);
  return json({ synced: rows.length, invalidCount, duplicateCount, contents: Array.isArray(result.json) ? result.json.map(fromContentRow) : [] });
}

const QUEUE_STATUS_TO_DB = {
  draft: 'pending',
  sent: 'posted',
  pending: 'pending_approval',
  approved: 'approved',
  rejected: 'rejected',
  error: 'error',
};

const QUEUE_STATUS_FROM_DB = {
  pending: 'draft',
  posted: 'sent',
  pending_approval: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  error: 'error',
};

function encodeBatchName(entry) {
  const metadata = {
    mode: ['unknown', 'simulation', 'real'].includes(entry?.mode) ? entry.mode : 'unknown',
    createdAt: entry?.createdAt || new Date().toISOString(),
    metrics: entry?.metrics && typeof entry.metrics === 'object' ? entry.metrics : {},
    metricsHistory: entry?.metricsHistory && typeof entry.metricsHistory === 'object' ? entry.metricsHistory : {},
    nextChecks: entry?.nextChecks && typeof entry.nextChecks === 'object' ? entry.nextChecks : {},
    decisions: entry?.decisions && typeof entry.decisions === 'object' ? entry.decisions : {},
    postingHistory: entry?.postingHistory && typeof entry.postingHistory === 'object' ? entry.postingHistory : {},
    fanpages: Array.isArray(entry?.fanpages) ? entry.fanpages.filter((item) => item && typeof item === 'object').slice(0, 20) : [],
  };
  return `MKT-FANPAGE-BATCH-V1\n${JSON.stringify(metadata)}`;
}

function decodeBatchName(value) {
  if (typeof value !== 'string' || !value.startsWith('MKT-FANPAGE-BATCH-V1\n')) return {};
  try {
    const parsed = JSON.parse(value.slice('MKT-FANPAGE-BATCH-V1\n'.length));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function queueRows(queue, tenantId) {
  const batches = [];
  const items = [];
  let invalidCount = 0;
  for (const entry of Array.isArray(queue) ? queue : []) {
    if (!isUuid(entry?.id) || !isUuid(entry?.contentId) || !Array.isArray(entry?.groupIds)) {
      invalidCount += 1;
      continue;
    }
    batches.push({
      id: entry.id,
      owner_id: tenantId,
      name: encodeBatchName(entry),
      content_id: entry.contentId,
      status: ['completed', 'archived'].includes(entry.status) ? entry.status : entry.status === 'draft' ? 'draft' : 'in_progress',
    });
    for (const groupId of entry.groupIds) {
      if (!isUuid(groupId)) {
        invalidCount += 1;
        continue;
      }
      const groupStatus = entry.groupStatuses?.[groupId] || entry.status || 'draft';
      const dbStatus = QUEUE_STATUS_TO_DB[groupStatus] || 'pending';
      items.push({
        owner_id: tenantId,
        batch_id: entry.id,
        group_id: groupId,
        content_id: entry.contentId,
        status: dbStatus,
        posted_url: typeof entry.groupPostedUrls?.[groupId] === 'string' ? entry.groupPostedUrls[groupId].slice(0, 2000) : null,
        posted_at: entry.groupPostedAt?.[groupId] || null,
        approval_checked_at: entry.groupApprovalCheckedAt?.[groupId] || null,
        error_message: typeof entry.groupErrors?.[groupId] === 'string' ? entry.groupErrors[groupId].slice(0, 2000) : null,
      });
    }
  }
  return { batches, items, invalidCount };
}

function fromQueueRows(batchRows, itemRows) {
  const itemByBatch = new Map();
  for (const item of Array.isArray(itemRows) ? itemRows : []) {
    if (!itemByBatch.has(item.batch_id)) itemByBatch.set(item.batch_id, []);
    itemByBatch.get(item.batch_id).push(item);
  }
  return (Array.isArray(batchRows) ? batchRows : []).map((batch) => {
    const metadata = decodeBatchName(batch?.name) || {};
    const items = itemByBatch.get(batch.id) || [];
    const groupIds = items.map((item) => item.group_id).filter(Boolean);
    const groupStatuses = Object.fromEntries(items.map((item) => [item.group_id, QUEUE_STATUS_FROM_DB[item.status] || 'draft']));
    const groupPostedUrls = Object.fromEntries(items.filter((item) => item.posted_url).map((item) => [item.group_id, item.posted_url]));
    const groupPostedAt = Object.fromEntries(items.filter((item) => item.posted_at).map((item) => [item.group_id, item.posted_at]));
    const groupApprovalCheckedAt = Object.fromEntries(items.filter((item) => item.approval_checked_at).map((item) => [item.group_id, item.approval_checked_at]));
    const groupErrors = Object.fromEntries(items.filter((item) => item.error_message).map((item) => [item.group_id, item.error_message]));
    return {
      id: batch.id,
      contentId: batch.content_id,
      groupIds,
      groupStatuses,
      groupPostedUrls,
      groupPostedAt,
      groupApprovalCheckedAt,
      groupErrors,
      status: groupStatuses[groupIds[0]] || 'draft',
      mode: ['unknown', 'simulation', 'real'].includes(metadata?.mode) ? metadata.mode : 'unknown',
      createdAt: metadata.createdAt || batch.created_at || new Date().toISOString(),
      updatedAt: batch.updated_at || batch.created_at || new Date().toISOString(),
      metrics: metadata.metrics && typeof metadata.metrics === 'object' ? metadata.metrics : {},
      metricsHistory: metadata.metricsHistory && typeof metadata.metricsHistory === 'object' ? metadata.metricsHistory : {},
      nextChecks: metadata.nextChecks && typeof metadata.nextChecks === 'object' ? metadata.nextChecks : {},
      decisions: metadata.decisions && typeof metadata.decisions === 'object' ? metadata.decisions : {},
      postingHistory: metadata.postingHistory && typeof metadata.postingHistory === 'object' ? metadata.postingHistory : {},
      fanpages: Array.isArray(metadata.fanpages) ? metadata.fanpages : [],
    };
  }).filter((entry) => entry.groupIds.length);
}

async function previewQueue(request, env, tenantId) {
  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu kiểm tra hàng đợi không hợp lệ.' }, 400); }
  if (!Array.isArray(payload?.queue) || payload.queue.length > 500) return json({ message: 'Hàng đợi phải là mảng tối đa 500 lô.' }, 400);
  const { batches, items, invalidCount } = queueRows(payload.queue, tenantId);
  const result = await supabaseRequest(`/rest/v1/queue_items?select=id&owner_id=eq.${tenantId}&limit=1`, env);
  if (!result.ok) return json({ message: 'Không thể đối chiếu hàng đợi trên Supabase.' }, 502);
  return json({ totalBatches: payload.queue.length, validBatches: batches.length, totalItems: items.length, invalidCount });
}

async function clearQueue(env, tenantId) {
  const itemsResult = await supabaseRequest(`/rest/v1/queue_items?owner_id=eq.${tenantId}`, env, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
  if (!itemsResult.ok) return json({ message: 'Không thể xóa các mục hàng đợi online.' }, 502);
  const batchesResult = await supabaseRequest(`/rest/v1/batches?owner_id=eq.${tenantId}`, env, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
  if (!batchesResult.ok) return json({ message: 'Đã xóa mục hàng đợi nhưng chưa xóa được các lô online.' }, 502);
  return json({ cleared: true });
}

async function handleQueue(request, env, url) {
  const tenantId = getTenantId(env);
  if (!tenantId) return json({ message: 'Backend chưa được cấu hình đầy đủ.' }, 503);
  if (request.method === 'GET' && url.pathname === '/api/queue') {
    const batchesResult = await supabaseRequest(`/rest/v1/batches?select=id,name,content_id,status,created_at,updated_at&owner_id=eq.${tenantId}&order=updated_at.desc`, env);
    if (!batchesResult.ok) return json({ message: 'Không thể tải hàng đợi từ Supabase.' }, 502);
    const itemsResult = await supabaseRequest(`/rest/v1/queue_items?select=id,batch_id,group_id,content_id,status,posted_url,posted_at,approval_checked_at,error_message&owner_id=eq.${tenantId}`, env);
    if (!itemsResult.ok) return json({ message: 'Không thể tải các mục hàng đợi từ Supabase.' }, 502);
    return json({ queue: fromQueueRows(batchesResult.json, itemsResult.json) });
  }
  if (request.method === 'POST' && url.pathname === '/api/queue/preview') return previewQueue(request, env, tenantId);
  if (request.method === 'POST' && url.pathname === '/api/queue/clear') return clearQueue(env, tenantId);
  if (request.method !== 'POST' || url.pathname !== '/api/queue/sync') return json({ message: 'Phương thức không được hỗ trợ.' }, 405);
  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu đồng bộ hàng đợi không hợp lệ.' }, 400); }
  if (!Array.isArray(payload?.queue) || payload.queue.length > 500) return json({ message: 'Hàng đợi phải là mảng tối đa 500 lô.' }, 400);
  const { batches, items, invalidCount } = queueRows(payload.queue, tenantId);
  if (!batches.length || !items.length) return json({ message: 'Không có mục hàng đợi hợp lệ để đồng bộ.' }, 400);
  const batchResult = await supabaseRequest('/rest/v1/batches?on_conflict=owner_id,id', env, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(batches),
  });
  if (!batchResult.ok) return json({ message: 'Không thể lưu các lô hàng đợi lên Supabase.' }, 502);
  const itemsResult = await supabaseRequest('/rest/v1/queue_items?on_conflict=batch_id,group_id', env, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(items),
  });
  if (!itemsResult.ok) return json({ message: 'Đã lưu lô nhưng không thể lưu mục hàng đợi lên Supabase.' }, 502);
  return json({ syncedBatches: batches.length, syncedItems: items.length, invalidCount });
}

async function previewGroups(request, env, tenantId) {
  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu kiểm tra không hợp lệ.' }, 400); }
  if (!Array.isArray(payload?.groups) || payload.groups.length > 5000) {
    return json({ message: 'Danh sách group phải là mảng tối đa 5.000 dòng.' }, 400);
  }

  const { uniqueRows, invalidCount, duplicateCount } = uniqueGroupRows(payload.groups, tenantId);
  const query = `/rest/v1/groups?select=normalized_url&owner_id=eq.${tenantId}`;
  const result = await supabaseRequest(query, env);
  if (!result.ok) return json({ message: 'Không thể đối chiếu danh sách group trên Supabase.' }, 502);

  const existingUrls = new Set((Array.isArray(result.json) ? result.json : []).map((row) => row.normalized_url));
  const updateCount = uniqueRows.filter((row) => existingUrls.has(row.normalized_url)).length;
  return json({
    total: payload.groups.length,
    validCount: uniqueRows.length,
    newCount: uniqueRows.length - updateCount,
    updateCount,
    invalidCount,
    duplicateCount,
  });
}

async function syncGroupMetadata(rows, sourceGroups, env) {
  let supported = true;
  let synced = 0;
  for (const row of rows) {
    const source = sourceGroups.find((group) => group?.id === row.id || normalizeGroupUrl(group?.url) === row.normalized_url);
    if (!source) continue;
    const result = await supabaseRequest(`/rest/v1/groups?id=eq.${row.id}`, env, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(toGroupMetadata(source)),
    });
    if (result.ok) {
      synced += 1;
      continue;
    }
    if ([400, 404].includes(result.status)) {
      supported = false;
      break;
    }
    return { ok: false, supported, synced };
  }
  return { ok: true, supported, synced };
}

async function archiveMissingGroups(rows, env, tenantId) {
  const currentUrls = new Set(rows.map((row) => row.normalized_url));
  const result = await supabaseRequest(`/rest/v1/groups?select=id,normalized_url&owner_id=eq.${tenantId}&is_deleted=eq.false`, env);
  if (!result.ok) return { ok: false, archived: 0 };
  const missing = (Array.isArray(result.json) ? result.json : []).filter((row) => !currentUrls.has(row.normalized_url));
  let archived = 0;
  for (const row of missing) {
    const archivedResult = await supabaseRequest(`/rest/v1/groups?id=eq.${row.id}`, env, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ is_deleted: true, deleted_at: new Date().toISOString() }),
    });
    if (!archivedResult.ok) return { ok: false, archived };
    archived += 1;
  }
  return { ok: true, archived };
}

async function handleGroups(request, env, url) {
  const tenantId = getTenantId(env);
  if (!tenantId) return json({ message: 'Backend chưa được cấu hình đầy đủ.' }, 503);
  if (request.method === 'GET' && url.pathname === '/api/groups/archived') {
    const query = `/rest/v1/groups?select=id,name,url,normalized_url,audience,status,approval_rate,last_tested_at,deleted_at,created_at,updated_at&owner_id=eq.${tenantId}&is_deleted=eq.true&order=deleted_at.desc`;
    const result = await supabaseRequest(query, env);
    if (!result.ok) return json({ message: 'Không thể tải nhóm đã xóa.' }, 502);
    const archived = Array.isArray(result.json) ? result.json : [];
    const metadataResult = await supabaseRequest(`/rest/v1/groups?select=id,topic_label,notes&owner_id=eq.${tenantId}&is_deleted=eq.true`, env);
    if (metadataResult.ok && Array.isArray(metadataResult.json)) {
      const metadataById = new Map(metadataResult.json.map((row) => [row.id, row]));
      archived.forEach((group) => Object.assign(group, metadataById.get(group.id) || {}));
    }
    return json({ groups: archived });
  }
  if (request.method === 'POST' && url.pathname === '/api/groups/restore') {
    let payload;
    try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu khôi phục không hợp lệ.' }, 400); }
    const ids = Array.isArray(payload?.ids) ? [...new Set(payload.ids.filter((id) => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(id)))] : [];
    if (!ids.length || ids.length > 100) return json({ message: 'Cần chọn ít nhất một group và tối đa 100 group mỗi lần.' }, 400);
    let restored = 0;
    for (const id of ids) {
      const result = await supabaseRequest(`/rest/v1/groups?id=eq.${encodeURIComponent(id)}&owner_id=eq.${tenantId}&is_deleted=eq.true`, env, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ is_deleted: false, deleted_at: null, updated_at: new Date().toISOString() }),
      });
      if (!result.ok) return json({ message: 'Không thể khôi phục đầy đủ các group đã chọn.' }, 502);
      restored += 1;
    }
    return json({ restored });
  }
  if (request.method === 'GET') {
    const query = `/rest/v1/groups?select=id,name,url,normalized_url,audience,status,approval_rate,last_tested_at,created_at,updated_at&owner_id=eq.${tenantId}&is_deleted=eq.false&order=updated_at.desc`;
    const result = await supabaseRequest(query, env);
    if (!result.ok) return json({ message: 'Không thể tải danh sách group từ Supabase.' }, 502);
    const groups = Array.isArray(result.json) ? result.json : [];
    const metadataResult = await supabaseRequest(`/rest/v1/groups?select=id,topic_label,notes&owner_id=eq.${tenantId}&is_deleted=eq.false`, env);
    if (metadataResult.ok && Array.isArray(metadataResult.json)) {
      const metadataById = new Map(metadataResult.json.map((row) => [row.id, row]));
      groups.forEach((group) => Object.assign(group, metadataById.get(group.id) || {}));
    }
    return json({ groups, metadataAvailable: metadataResult.ok });
  }
  if (request.method === 'POST' && url.pathname === '/api/groups/preview') {
    return previewGroups(request, env, tenantId);
  }
  if (request.method !== 'POST' || url.pathname !== '/api/groups/sync') return json({ message: 'Phương thức không được hỗ trợ.' }, 405);
  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Dữ liệu đồng bộ không hợp lệ.' }, 400); }
  if (!Array.isArray(payload?.groups) || payload.groups.length > 5000) return json({ message: 'Danh sách group phải là mảng tối đa 5.000 dòng.' }, 400);
  const { uniqueRows: rows } = uniqueGroupRows(payload.groups, tenantId);
  if (!rows.length) return json({ message: 'Không có group hợp lệ để đồng bộ.' }, 400);
  const result = await supabaseRequest('/rest/v1/groups?on_conflict=owner_id,normalized_url', env, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(rows),
  });
  if (!result.ok) return json({ message: 'Không thể đồng bộ group với Supabase.' }, 502);
  const metadataResult = await syncGroupMetadata(rows, payload.groups, env);
  if (!metadataResult.ok) return json({ message: 'Đã lưu group nhưng không thể cập nhật chủ đề và ghi chú.' }, 502);
  let archived = 0;
  if (payload.replace === true) {
    const archiveResult = await archiveMissingGroups(rows, env, tenantId);
    if (!archiveResult.ok) return json({ message: 'Đã lưu group nhưng không thể cập nhật các group đã xóa.' }, 502);
    archived = archiveResult.archived;
  }
  return json({ synced: rows.length, metadataSynced: metadataResult.supported ? metadataResult.synced : 0, metadataAvailable: metadataResult.supported, archived, groups: Array.isArray(result.json) ? result.json : [] });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const identity = getSiteIdentity(request);

    if (url.pathname === '/api/session') {
      if (!identity) return json({ authenticated: false }, 401);
      return json({ authenticated: true, access: 'owner-only', emailPresent: Boolean(identity.email) });
    }

    if (url.pathname === '/api/backend-health') {
      if (!identity) return json({ authenticated: false }, 401);
      const supabaseReady = await checkSupabase(env);
      return json({ authenticated: true, access: 'owner-only', supabase: supabaseReady ? 'ok' : 'unavailable' }, supabaseReady ? 200 : 503);
    }

    if (!identity) return unauthorized();

    if (url.pathname === '/api/groups' || url.pathname === '/api/groups/preview' || url.pathname === '/api/groups/sync' || url.pathname === '/api/groups/archived' || url.pathname === '/api/groups/restore') {
      return handleGroups(request, env, url);
    }

    if (url.pathname === '/api/contents' || url.pathname.startsWith('/api/contents/') || url.pathname === '/api/contents/preview' || url.pathname === '/api/contents/sync' || url.pathname === '/api/contents/retention') {
      return handleContents(request, env, url);
    }

    if (url.pathname === '/api/queue' || url.pathname === '/api/queue/preview' || url.pathname === '/api/queue/sync') {
      return handleQueue(request, env, url);
    }

    if (url.pathname === '/api/audit' || url.pathname === '/api/backup') {
      return handleOnlineBackup(request, env, url);
    }

    const assetPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const asset = ASSETS.get(assetPath);
    if (!asset) return new Response('Not found', { status: 404 });

    return new Response(asset.body, {
      headers: {
        'content-type': asset.type,
        'cache-control': assetPath === '/index.html' ? 'no-store' : 'public, max-age=300',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
        'permissions-policy': 'camera=(), microphone=(), geolocation=()',
        'content-security-policy': "default-src 'self'; connect-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
      },
    });
  },
};
