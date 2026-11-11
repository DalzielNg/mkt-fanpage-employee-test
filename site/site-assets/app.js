const STORAGE_KEY = 'mkt-fanpage.groups.v1';
const CONTENT_STORAGE_KEY = 'mkt-fanpage.content.v1';
const CONTENT_ARCHIVE_STORAGE_KEY = 'mkt-fanpage.content-archive.v1';
const QUEUE_STORAGE_KEY = 'mkt-fanpage.queue.v1';
const QUEUE_DB_NAME = 'mkt-fanpage-operational-storage.v1';
const QUEUE_STORE_NAME = 'queue';
const QUEUE_IDB_KEY = 'current';
const DAILY_POSTING_LIMITS_STORAGE_KEY = 'mkt-fanpage.daily-posting-limits.v1';
const POSTING_RUN_STORAGE_KEY = 'mkt-fanpage.posting-run.v1';
const POSTING_RUN_SUMMARY_STORAGE_KEY = 'mkt-fanpage.posting-run-summary.v1';
const POSTING_RUN_HISTORY_STORAGE_KEY = 'mkt-fanpage.posting-run-history.v1';
const POSTING_RUN_VIEW_STORAGE_KEY = 'mkt-fanpage.posting-run-view.v1';
const POSTING_RUN_SEQUENCE_STORAGE_KEY = 'mkt-fanpage.posting-run-sequence.v1';
const POSTING_BATCH_SCOPE_STORAGE_KEY = 'mkt-fanpage.posting-batch-scope.v1';
const POSTING_RUN_CHUNK_SIZE = 10;
const BATCH_SELECTION_STORAGE_KEY = 'mkt-fanpage.batch-selection.v1';
const BATCH_REGISTRY_STORAGE_KEY = 'mkt-fanpage.batch-registry.v1';
const BATCH_SCHEDULES_STORAGE_KEY = 'mkt-fanpage.batch-schedules.v1';
const AUDIT_STORAGE_KEY = 'mkt-fanpage.audit.v1';
const DECISION_STORAGE_KEY = 'mkt-fanpage.batch-decisions.v1';
const PRE_RESTORE_BACKUP_KEY = 'mkt-fanpage.pre-restore-backup.v1';
const RESET_PENDING_SESSION_KEY = 'mkt-fanpage.reset-pending.v1';
const LOCAL_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CONTENT_RETENTION_DAYS = 2;
const CONTENT_VISIBLE_PAGE_SIZE = 40;
const CONTENT_POSTER_HYDRATE_LIMIT = 12;
const POSTING_RUN_HISTORY_RETENTION_DAYS = 3;
const POSTING_RUN_HISTORY_MAX_ENTRIES = 180;
const BATCH_MODE_LABELS = { unknown: 'Chưa xác định', simulation: 'Giả lập', real: 'Thực tế' };
const POSTING_TOPIC_CODES = Object.freeze({
  'Tin tức': 'TUC',
  'Pháp luật': 'PL',
  'Chính trị': 'CT',
  'Đời sống': 'DS',
  'Địa phương': 'DP',
  'Kinh doanh': 'KD',
  'Công nghệ': 'CN',
  'Giải trí': 'GT',
  'Thể thao': 'TT'
});
const POSTING_TOPIC_CODE_ALIASES = Object.freeze({
  'tin tức mới': 'TUC',
  'tin tức mới nhất': 'TUC'
});
const POSTER_DB_NAME = 'mkt-fanpage-local-assets.v1';
const POSTER_STORE_NAME = 'posters';
const POSTER_OPERATION_TIMEOUT_MS = 3000;
const resetPendingOnStartup = sessionStorage.getItem(RESET_PENDING_SESSION_KEY) === '1';

function createId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `group-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seedGroups = [
  { id: createId(), name: 'Nhóm mẫu · Tin nóng Việt Nam', url: 'https://example.com/groups/tin-nong-viet-nam', topic: 'Tin tức', audience: '25–44, quan tâm thời sự', status: 'ready', approvalRate: 86, notes: 'Ưu tiên bài ngắn, nguồn rõ ràng.', updatedAt: '2026-10-15T08:30:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Chuyện đời sống', url: 'https://example.com/groups/chuyen-doi-song', topic: 'Đời sống', audience: 'Nữ 25–45, gia đình', status: 'ready', approvalRate: 78, notes: 'Nội dung gần gũi, tránh tiêu đề quá giật.', updatedAt: '2026-10-14T09:20:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Pháp luật mỗi ngày', url: 'https://example.com/groups/phap-luat-moi-ngay', topic: 'Pháp luật', audience: 'Nam 25–54, tin xã hội', status: 'pending', approvalRate: 61, notes: 'Luôn gắn nguồn và dùng ngôn ngữ trung tính.', updatedAt: '2026-10-15T05:10:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Bóng đá cuối tuần', url: 'https://example.com/groups/bong-da-cuoi-tuan', topic: 'Thể thao', audience: 'Nam 18–44, bóng đá', status: 'testing', approvalRate: 50, notes: 'Đang test khung giờ 19:00–22:00.', updatedAt: '2026-10-13T12:45:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Hà Nội hôm nay', url: 'https://example.com/groups/ha-noi-hom-nay', topic: 'Địa phương', audience: 'Người sống tại Hà Nội', status: 'ready', approvalRate: 91, notes: 'Ưu tiên tin giao thông, dân sinh.', updatedAt: '2026-10-15T02:15:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Sài Gòn có gì', url: 'https://example.com/groups/sai-gon-co-gi', topic: 'Địa phương', audience: 'Người sống tại TP.HCM', status: 'ready', approvalRate: 84, notes: 'Hình ảnh rõ địa điểm.', updatedAt: '2026-10-12T10:00:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Kinh doanh thực chiến', url: 'https://example.com/groups/kinh-doanh-thuc-chien', topic: 'Kinh doanh', audience: 'Chủ shop, người kinh doanh', status: 'rejected', approvalRate: 24, notes: 'Bị từ chối 3 bài tin tức không đúng chủ đề.', updatedAt: '2026-10-11T07:10:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Công nghệ quanh ta', url: 'https://example.com/groups/cong-nghe-quanh-ta', topic: 'Công nghệ', audience: '18–35, yêu công nghệ', status: 'testing', approvalRate: 45, notes: 'Test bài AI và ứng dụng mới.', updatedAt: '2026-10-10T15:35:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Giải trí Việt', url: 'https://example.com/groups/giai-tri-viet', topic: 'Giải trí', audience: '18–34, giải trí đại chúng', status: 'pending', approvalRate: 68, notes: 'Chờ duyệt từ quản trị viên.', updatedAt: '2026-10-14T11:25:00.000Z' },
  { id: createId(), name: 'Nhóm mẫu · Cộng đồng miền Trung', url: 'https://example.com/groups/cong-dong-mien-trung', topic: 'Địa phương', audience: 'Người miền Trung', status: 'inactive', approvalRate: 0, notes: 'Tạm dừng vì chưa xác minh quy định group.', updatedAt: '2026-10-09T08:00:00.000Z' }
];

const statusLabels = {
  ready: 'Sẵn sàng',
  testing: 'Đang test',
  pending: 'Chờ duyệt',
  rejected: 'Bị từ chối',
  inactive: 'Tạm dừng'
};

const queueStatusLabels = {
  draft: 'Chưa đăng',
  sent: 'Đã đăng',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Bị từ chối',
  skipped: 'Đã bỏ qua',
  error: 'Lỗi'
};

const fanpageStatusLabels = {
  draft: 'Chưa đăng fanpage',
  sent: 'Đã đăng fanpage',
  approved: 'Đã đăng & duyệt fanpage',
  skipped: 'Đã bỏ qua fanpage'
};

let groups = loadGroups();
let contents = loadContents();
let batchSelection = loadBatchSelection();
let selectedContentId = contents.some((content) => content.id === batchSelection.contentId)
  ? batchSelection.contentId
  : sortContentsByCreatedAt(contents)[0]?.id || null;
let batchRegistry = loadBatchRegistry();
let batchSchedules = loadBatchSchedules();
let registryDraftGroupIds = new Set();
let editingBatchRegistryId = '';
let editingBatchRegistryGroupIds = new Set();
let duplicateGroupClusters = [];
let visibleQueueItemKeys = [];
let editingId = null;
let editingContentId = null;
let pendingPosterDataUrl = '';
let pendingPosterBlob = null;
let pendingPosterBlobId = '';
let pendingPosterChanged = false;
let pendingDeleteContentId = null;
let contentVisibleLimit = CONTENT_VISIBLE_PAGE_SIZE;
let contentBatchRefreshTimer = null;
let posterDbPromise = null;
let toastTimer = null;
let groupSyncTimer = null;
let groupSyncEnabled = false;
let groupSyncInFlight = false;
let groupSyncQueued = false;
let contentSyncTimer = null;
let contentSyncEnabled = false;
let contentSyncInFlight = false;
let contentSyncQueued = false;
let contentSyncPendingIds = new Set();
let onlineContentIds = new Set();
let queueSyncTimer = null;
let queueSyncEnabled = false;
let queueSyncInFlight = false;
let queueSyncQueued = false;
let auditSyncTimer = null;
let auditSyncEnabled = false;
let auditSyncInFlight = false;
let queueCache = null;
let queueStorageMode = 'local';
let queueStorageDbPromise = null;
let postingHistoryCache = null;
let queueVisibleLimit = 40;
const QUEUE_VISIBLE_PAGE_SIZE = 40;

function invalidateQueueCache() {
  queueCache = null;
  postingHistoryCache = null;
}

function openQueueStorageDb() {
  if (queueStorageDbPromise) return queueStorageDbPromise;
  if (!window.indexedDB) return Promise.reject(new Error('IndexedDB không khả dụng trong trình duyệt này.'));
  queueStorageDbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(QUEUE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(QUEUE_STORE_NAME)) request.result.createObjectStore(QUEUE_STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Không thể mở bộ nhớ hàng đợi.'));
  });
  return queueStorageDbPromise;
}

function persistQueueToIndexedDb(queue) {
  return openQueueStorageDb().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE_NAME, 'readwrite');
    transaction.objectStore(QUEUE_STORE_NAME).put({ id: QUEUE_IDB_KEY, queue, savedAt: Date.now() });
    transaction.oncomplete = () => {
      try { localStorage.removeItem(QUEUE_STORAGE_KEY); } catch { /* IndexedDB remains the durable copy. */ }
      resolve();
    };
    transaction.onerror = () => reject(transaction.error || new Error('Không thể lưu hàng đợi vào bộ nhớ bền vững.'));
  }));
}

function hydrateQueueStorage() {
  return openQueueStorageDb().then((db) => new Promise((resolve, reject) => {
    const request = db.transaction(QUEUE_STORE_NAME, 'readonly').objectStore(QUEUE_STORE_NAME).get(QUEUE_IDB_KEY);
    request.onsuccess = () => {
      const record = request.result;
      if (Array.isArray(record?.queue)) {
        queueStorageMode = 'indexeddb';
        queueCache = normalizeQueuePostingHistory(record.queue);
        postingHistoryCache = null;
        try { localStorage.removeItem(QUEUE_STORAGE_KEY); } catch { /* No-op. */ }
      }
      resolve();
    };
    request.onerror = () => reject(request.error || new Error('Không thể đọc hàng đợi đã lưu.'));
  })).catch(() => {
    queueStorageMode = 'local';
  });
}

function updateSyncOverview() {
  const overview = document.querySelector('#syncOverview');
  if (!overview) return;
  const checks = [groupSyncEnabled, contentSyncEnabled, queueSyncEnabled, auditSyncEnabled];
  const onlineCount = checks.filter(Boolean).length;
  overview.textContent = onlineCount === checks.length
    ? 'Đồng bộ: 4/4 online'
    : `Đồng bộ: ${onlineCount}/4 online · còn dùng trình duyệt`;
  overview.classList.toggle('is-ready', onlineCount === checks.length);
  overview.classList.toggle('is-error', onlineCount < checks.length);
}

const el = {
  total: document.querySelector('#totalGroups'),
  ready: document.querySelector('#readyGroups'),
  readyRate: document.querySelector('#readyRate'),
  pending: document.querySelector('#pendingGroups'),
  attention: document.querySelector('#attentionGroups'),
  visibleCount: document.querySelector('#visibleCount'),
  rows: document.querySelector('#groupRows'),
  empty: document.querySelector('#emptyState'),
  search: document.querySelector('#searchInput'),
  topic: document.querySelector('#topicFilter'),
  status: document.querySelector('#statusFilter'),
  batchMembership: document.querySelector('#batchMembershipFilter'),
  syncGroupsButton: document.querySelector('#syncGroupsButton'),
  restoreDeletedGroupsButton: document.querySelector('#restoreDeletedGroupsButton'),
  createLocalSnapshotButton: document.querySelector('#createLocalSnapshotButton'),
  restoreLocalSnapshotButton: document.querySelector('#restoreLocalSnapshotButton'),
  deleteLocalSnapshotButton: document.querySelector('#deleteLocalSnapshotButton'),
  clearOperationalDataButton: document.querySelector('#clearOperationalDataButton'),
  backupStatus: document.querySelector('#backupStatus'),
  refreshOnlineButton: document.querySelector('#refreshOnlineButton'),
  syncGroupsStatus: document.querySelector('#syncGroupsStatus'),
  routableGroups: document.querySelector('#routableGroups'),
  testGroups: document.querySelector('#testGroups'),
  unclassifiedGroups: document.querySelector('#unclassifiedGroups'),
  topicCards: document.querySelector('#topicCards'),
  routeAllButton: document.querySelector('#routeAllButton'),
  totalContent: document.querySelector('#totalContent'),
  draftContent: document.querySelector('#draftContent'),
  approvedContent: document.querySelector('#approvedContent'),
  syncContentsButton: document.querySelector('#syncContentsButton'),
  openContentRetentionButton: document.querySelector('#openContentRetentionButton'),
  contentRetentionStatus: document.querySelector('#contentRetentionStatus'),
  contentRetentionDialog: document.querySelector('#contentRetentionDialog'),
  contentRetentionSummary: document.querySelector('#contentRetentionSummary'),
  closeContentRetentionDialog: document.querySelector('#closeContentRetentionDialog'),
  cancelContentRetention: document.querySelector('#cancelContentRetention'),
  confirmContentRetention: document.querySelector('#confirmContentRetention'),
  contentSyncStatus: document.querySelector('#contentSyncStatus'),
  contentCards: document.querySelector('#contentCards'),
  contentListFooter: document.querySelector('#contentListFooter'),
  matchingPanel: document.querySelector('#matchingPanel'),
  openBriefButton: document.querySelector('#openBriefButton'),
  briefDialog: document.querySelector('#briefDialog'),
  briefForm: document.querySelector('#briefForm'),
  briefOutput: document.querySelector('#briefOutput'),
  copyBriefButton: document.querySelector('#copyBriefButton'),
  closeBriefDialog: document.querySelector('#closeBriefDialog'),
  closeBriefDialogAction: document.querySelector('#closeBriefDialogAction'),
  batchQueueContentLabel: document.querySelector('#batchQueueContentLabel'),
  batchQueueContentNote: document.querySelector('#batchQueueContentNote'),
  batchQueueFanpageSummary: document.querySelector('#batchQueueFanpageSummary'),
  batchQueueNewCount: document.querySelector('#batchQueueNewCount'),
  batchQueueExistingCount: document.querySelector('#batchQueueExistingCount'),
  batchQueueMessage: document.querySelector('#batchQueueMessage'),
  createBatchQueueButton: document.querySelector('#createBatchQueueButton'),
  batchReviewQueueCount: document.querySelector('#batchReviewQueueCount'),
  batchReviewQueueNote: document.querySelector('#batchReviewQueueNote'),
  batchReviewReadyCount: document.querySelector('#batchReviewReadyCount'),
  batchReviewAttentionCount: document.querySelector('#batchReviewAttentionCount'),
  batchReviewAttentionNote: document.querySelector('#batchReviewAttentionNote'),
  batchReviewQueueMessage: document.querySelector('#batchReviewQueueMessage'),
  openPostingQueueButton: document.querySelector('#openPostingQueueButton'),
  batchStatusSentCount: document.querySelector('#batchStatusSentCount'),
  batchStatusPendingCount: document.querySelector('#batchStatusPendingCount'),
  batchStatusApprovedCount: document.querySelector('#batchStatusApprovedCount'),
  batchStatusAttentionCount: document.querySelector('#batchStatusAttentionCount'),
  batchStatusAttentionNote: document.querySelector('#batchStatusAttentionNote'),
  batchStatusMessage: document.querySelector('#batchStatusMessage'),
  downloadBatchMetricsTemplateButton: document.querySelector('#downloadBatchMetricsTemplateButton'),
  openBatchStatusQueueButton: document.querySelector('#openBatchStatusQueueButton'),
  batchContentSelect: document.querySelector('#batchContentSelect'),
  batchContentPreview: document.querySelector('#batchContentPreview'),
  batchContentPostingSummary: document.querySelector('#batchContentPostingSummary'),
  batchModeOptions: document.querySelector('#batchModeOptions'),
  batchModeNote: document.querySelector('#batchModeNote'),
  batchRegistrySelect: document.querySelector('#batchRegistrySelect'),
  batchRegistrySelectNote: document.querySelector('#batchRegistrySelectNote'),
  batchFanpageSummary: document.querySelector('#batchFanpageSummary'),
  batchFanpageList: document.querySelector('#batchFanpageList'),
  batchFanpageNote: document.querySelector('#batchFanpageNote'),
  batchGroupSelectionMode: document.querySelector('#batchGroupSelectionMode'),
  batchGroupSelectionLabel: document.querySelector('#batchGroupSelectionLabel'),
  batchTopicPicker: document.querySelector('#batchTopicPicker'),
  batchTopicNote: document.querySelector('#batchTopicNote'),
  batchContentStatus: document.querySelector('#batchContentStatus'),
  batchScopeLabel: document.querySelector('#batchScopeLabel'),
  batchScopeNote: document.querySelector('#batchScopeNote'),
  batchMatchCount: document.querySelector('#batchMatchCount'),
  batchExcludedCount: document.querySelector('#batchExcludedCount'),
  batchPrepMessage: document.querySelector('#batchPrepMessage'),
  batchPrepNextButton: document.querySelector('#batchPrepNextButton'),
  batchRegistryForm: document.querySelector('#batchRegistryForm'),
  batchRegistryFormTitle: document.querySelector('#batchRegistryFormTitle'),
  batchRegistryFormNote: document.querySelector('#batchRegistryFormNote'),
  batchRegistryName: document.querySelector('#batchRegistryName'),
  batchRegistryDescription: document.querySelector('#batchRegistryDescription'),
  batchRegistryFanpageName: document.querySelector('#batchRegistryFanpageName'),
  batchRegistryFanpageUrl: document.querySelector('#batchRegistryFanpageUrl'),
  batchRegistryMembershipFilter: document.querySelector('#batchRegistryMembershipFilter'),
  batchRegistryGroupSearch: document.querySelector('#batchRegistryGroupSearch'),
  batchRegistrySelectAll: document.querySelector('#batchRegistrySelectAll'),
  batchRegistrySelectedCount: document.querySelector('#batchRegistrySelectedCount'),
  batchRegistryGroupList: document.querySelector('#batchRegistryGroupList'),
  batchRegistryMessage: document.querySelector('#batchRegistryMessage'),
  batchRegistrySaveButton: document.querySelector('#batchRegistrySaveButton'),
  batchRegistryCancelEditButton: document.querySelector('#batchRegistryCancelEditButton'),
  batchRegistryList: document.querySelector('#batchRegistryList'),
  batchScheduleStartTime: document.querySelector('#batchScheduleStartTime'),
  batchScheduleEndTime: document.querySelector('#batchScheduleEndTime'),
  batchScheduleProposalButton: document.querySelector('#batchScheduleProposalButton'),
  batchScheduleSaveButton: document.querySelector('#batchScheduleSaveButton'),
  batchScheduleSummary: document.querySelector('#batchScheduleSummary'),
  batchScheduleList: document.querySelector('#batchScheduleList'),
  batchScheduleScrollUpButton: document.querySelector('#batchScheduleScrollUpButton'),
  batchScheduleScrollDownButton: document.querySelector('#batchScheduleScrollDownButton'),
  batchScheduleScrollPosition: document.querySelector('#batchScheduleScrollPosition'),
  batchScheduleNote: document.querySelector('#batchScheduleNote'),
  contentDialog: document.querySelector('#contentDialog'),
  contentForm: document.querySelector('#contentForm'),
  contentDialogTitle: document.querySelector('#contentDialogTitle'),
  contentFormError: document.querySelector('#contentFormError'),
  contentWordCount: document.querySelector('#contentWordCount'),
  deleteContentDialog: document.querySelector('#deleteContentDialog'),
  deleteContentForm: document.querySelector('#deleteContentForm'),
  deleteContentMessage: document.querySelector('#deleteContentMessage'),
  deleteContentQueueWarning: document.querySelector('#deleteContentQueueWarning'),
  closeDeleteContentDialog: document.querySelector('#closeDeleteContentDialog'),
  cancelDeleteContent: document.querySelector('#cancelDeleteContent'),
  confirmDeleteContent: document.querySelector('#confirmDeleteContent'),
  posterFile: document.querySelector('input[name="posterFile"]'),
  pastePosterButton: document.querySelector('#pastePosterButton'),
  posterUploadPreview: document.querySelector('#posterUploadPreview'),
  clearPosterButton: document.querySelector('#clearPosterButton'),
  syncQueueButton: document.querySelector('#syncQueueButton'),
  resetQueueOnlyButton: document.querySelector('#resetQueueOnlyButton'),
  queueSyncStatus: document.querySelector('#queueSyncStatus'),
  dailyPostingControl: document.querySelector('#dailyPostingControl'),
  openDailyPostingLimitButton: document.querySelector('#openDailyPostingLimitButton'),
  dailyPostingLimitDialog: document.querySelector('#dailyPostingLimitDialog'),
  dailyPostingLimitForm: document.querySelector('#dailyPostingLimitForm'),
  dailyPostingLimitScope: document.querySelector('#dailyPostingLimitScope'),
  dailyPostingLimitValue: document.querySelector('#dailyPostingLimitValue'),
  dailyPostingLimitScopeNote: document.querySelector('#dailyPostingLimitScopeNote'),
  closeDailyPostingLimitDialog: document.querySelector('#closeDailyPostingLimitDialog'),
  cancelDailyPostingLimit: document.querySelector('#cancelDailyPostingLimit'),
  postingRunLabel: document.querySelector('#postingRunLabel'),
  postingTopicNote: document.querySelector('#postingTopicNote'),
  postingBatchScope: document.querySelector('#postingBatchScope'),
  postingRunStrategy: document.querySelector('#postingRunStrategy'),
  startPostingRunButton: document.querySelector('#startPostingRunButton'),
  markAllQueueApprovedButton: document.querySelector('#markAllQueueApprovedButton'),
  postingRunPanel: document.querySelector('#postingRunPanel'),
  queueModeGuard: document.querySelector('#queueModeGuard'),
  queuePreflight: document.querySelector('#queuePreflight'),
  queueCount: document.querySelector('#queueCount'),
  queueSummary: document.querySelector('#queueSummary'),
  queueGuidance: document.querySelector('#queueGuidance'),
  postingRunHistory: document.querySelector('#postingRunHistory'),
  queueList: document.querySelector('#queueList'),
  queueFilter: document.querySelector('#queueFilter'),
  analyticsSummary: document.querySelector('#analyticsSummary'),
  analyticsModeFilter: document.querySelector('#analyticsModeFilter'),
  groupAnalyticsTable: document.querySelector('#groupAnalyticsTable'),
  topicAnalyticsTable: document.querySelector('#topicAnalyticsTable'),
  analyticsGrowthTable: document.querySelector('#analyticsGrowthTable'),
  analyticsInsights: document.querySelector('#analyticsInsights'),
  analyticsNextBatch: document.querySelector('#analyticsNextBatch'),
  batchDecisionList: document.querySelector('#batchDecisionList'),
  saveBatchDecisionsButton: document.querySelector('#saveBatchDecisionsButton'),
  applyBatchDecisionsButton: document.querySelector('#applyBatchDecisionsButton'),
  prepareBatchFromDecisionsButton: document.querySelector('#prepareBatchFromDecisionsButton'),
  inheritSimulationButton: document.querySelector('#inheritSimulationButton'),
  auditList: document.querySelector('#auditList'),
  exportAuditButton: document.querySelector('#exportAuditButton'),
  dialog: document.querySelector('#groupDialog'),
  deletedGroupsDialog: document.querySelector('#deletedGroupsDialog'),
  deletedGroupsList: document.querySelector('#deletedGroupsList'),
  scanDuplicateGroupsButton: document.querySelector('#scanDuplicateGroupsButton'),
  duplicateGroupsDialog: document.querySelector('#duplicateGroupsDialog'),
  duplicateGroupsSummary: document.querySelector('#duplicateGroupsSummary'),
  duplicateGroupsList: document.querySelector('#duplicateGroupsList'),
  deleteSelectedDuplicateGroups: document.querySelector('#deleteSelectedDuplicateGroups'),
  form: document.querySelector('#groupForm'),
  title: document.querySelector('#dialogTitle'),
  error: document.querySelector('#formError'),
  file: document.querySelector('#fileInput'),
  toast: document.querySelector('#toast')
};

function loadGroups() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveGroups() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  postingHistoryCache = null;
  scheduleGroupAutoSync();
}

function scheduleGroupAutoSync() {
  if (!groupSyncEnabled) return;
  clearTimeout(groupSyncTimer);
  groupSyncTimer = setTimeout(() => { syncGroupsInBackground(); }, 900);
}

async function syncGroupsInBackground() {
  if (groupSyncInFlight) {
    groupSyncQueued = true;
    return;
  }
  const status = el.syncGroupsStatus;
  if (!status) return;
  groupSyncInFlight = true;
  status.textContent = 'Đang lưu thay đổi lên Supabase...';
  status.classList.remove('is-error');
  try {
    const response = await fetch('/api/groups/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ groups, replace: true })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể lưu thay đổi group lên Supabase.');
    status.textContent = `Đang dùng ${payload.synced || groups.length} group từ Supabase`;
    status.classList.add('is-ready');
  } catch (error) {
    status.textContent = 'Đã lưu trình duyệt · Chờ đồng bộ Supabase';
    status.classList.add('is-error');
    showToast(error.message || 'Chưa đồng bộ được thay đổi lên Supabase.');
  } finally {
    groupSyncInFlight = false;
    if (groupSyncQueued) {
      groupSyncQueued = false;
      scheduleGroupAutoSync();
    }
  }
}

function mergeRemoteGroup(remoteGroup, localGroup) {
  const status = ({ pending_review: 'pending', paused: 'inactive' })[remoteGroup.status] || remoteGroup.status;
  return {
    ...(localGroup || {}),
    id: remoteGroup.id || localGroup?.id || createId(),
    name: remoteGroup.name || localGroup?.name || '',
    url: remoteGroup.url || localGroup?.url || '',
    topic: remoteGroup.topic_label ?? localGroup?.topic ?? '',
    audience: remoteGroup.audience ?? localGroup?.audience ?? '',
    status: status || localGroup?.status || 'testing',
    approvalRate: remoteGroup.approval_rate ?? localGroup?.approvalRate ?? null,
    notes: remoteGroup.notes ?? localGroup?.notes ?? '',
    updatedAt: remoteGroup.last_tested_at || remoteGroup.updated_at || localGroup?.updatedAt || new Date().toISOString()
  };
}

async function loadGroupsFromSupabase() {
  const response = await fetch('/api/groups', { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Không thể tải group từ Supabase.');
  const remoteGroups = Array.isArray(payload.groups) ? payload.groups : [];
  if (resetPendingOnStartup) return 0;
  if (!remoteGroups.length) return 0;

  const localByUrl = new Map(groups.map((group) => [normalizeUrl(group.url), group]));
  groups = remoteGroups.map((remoteGroup) => mergeRemoteGroup(remoteGroup, localByUrl.get(normalizeUrl(remoteGroup.url))));
  saveGroups();
  render();
  return groups.length;
}

function loadContents() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONTENT_STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    const normalized = normalizeContents(saved);
    if (JSON.stringify(normalized) !== JSON.stringify(saved)) {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return [];
  }
}

function normalizeContents(items = []) {
  return items.map((item) => {
    const updatedAt = item?.updatedAt || new Date().toISOString();
    return { ...item, createdAt: item?.createdAt || updatedAt, updatedAt };
  });
}

function loadContentArchive() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONTENT_ARCHIVE_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveContentArchive(items = []) {
  const compact = items
    .filter((item) => item?.id)
    .map((item) => ({
      id: item.id,
      title: getContentDisplayTitle(item),
      sourceUrl: item.sourceUrl || '',
      topic: item.topic || '',
      createdAt: item.createdAt || item.updatedAt || '',
      updatedAt: item.updatedAt || item.createdAt || ''
    }))
    .sort((a, b) => contentCreatedTimestamp(b) - contentCreatedTimestamp(a))
    // This is only a lightweight deletion receipt, never operational content.
    // Keep it deliberately small so it cannot block deleting active content.
    .slice(0, 200);
  const payload = JSON.stringify(compact);
  try {
    localStorage.setItem(CONTENT_ARCHIVE_STORAGE_KEY, payload);
  } catch (error) {
    const quotaError = error?.name === 'QuotaExceededError' || /quota|exceeded/i.test(error?.message || '');
    if (!quotaError) throw error;
    // Old versions could fill localStorage with a large archive. Remove only
    // this non-operational receipt store, then retry with a tiny fallback.
    try {
      localStorage.removeItem(CONTENT_ARCHIVE_STORAGE_KEY);
      localStorage.setItem(CONTENT_ARCHIVE_STORAGE_KEY, JSON.stringify(compact.slice(0, 25)));
    } catch {
      // Deletion must not fail because an optional history receipt is full.
      try { localStorage.removeItem(CONTENT_ARCHIVE_STORAGE_KEY); } catch {}
    }
  }
}

function getContentRetentionCutoff() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (CONTENT_RETENTION_DAYS - 1));
  return cutoff;
}

function getContentRetentionDateLabel() {
  return getLocalRunDateKey(getContentRetentionCutoff());
}

function getProtectedRetentionContentIds() {
  const protectedIds = new Set();
  if (batchSelection?.contentId) protectedIds.add(batchSelection.contentId);
  const queue = loadQueue();
  queue.forEach((entry) => {
    if (!['completed', 'archived'].includes(entry?.status)) {
      if (entry?.contentId) protectedIds.add(entry.contentId);
    }
  });
  return protectedIds;
}

function getContentRetentionPreview() {
  const cutoff = getContentRetentionCutoff();
  const protectedIds = getProtectedRetentionContentIds();
  const candidates = contents.filter((content) => {
    const createdAt = contentCreatedTimestamp(content);
    return createdAt > 0 && createdAt < cutoff.getTime() && !protectedIds.has(content.id);
  });
  const protectedOld = contents.filter((content) => {
    const createdAt = contentCreatedTimestamp(content);
    return createdAt > 0 && createdAt < cutoff.getTime() && protectedIds.has(content.id);
  });
  return { cutoff, candidates, protectedOld };
}

function updateContentRetentionStatus() {
  if (!el.contentRetentionStatus) return;
  const { candidates, protectedOld } = getContentRetentionPreview();
  el.contentRetentionStatus.textContent = candidates.length
    ? `Giữ ${CONTENT_RETENTION_DAYS} ngày gần nhất · có thể dọn ${candidates.length} bài${protectedOld.length ? ` · giữ lại ${protectedOld.length} bài đang dùng` : ''}`
    : `Giữ ${CONTENT_RETENTION_DAYS} ngày gần nhất · chưa có bài cũ cần dọn`;
}

function contentCreatedTimestamp(content) {
  const timestamp = Date.parse(content?.createdAt || content?.updatedAt || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortContentsByCreatedAt(items = []) {
  return [...items].sort((a, b) => contentCreatedTimestamp(b) - contentCreatedTimestamp(a) || String(b.id || '').localeCompare(String(a.id || '')));
}

function mergeRemoteContent(remoteContent, localContent) {
  return {
    ...(localContent || {}),
    id: remoteContent.id || localContent?.id || createId(),
    title: remoteContent.title ?? localContent?.title ?? '',
    sourceUrl: remoteContent.sourceUrl ?? localContent?.sourceUrl ?? '',
    topic: remoteContent.topic ?? localContent?.topic ?? '',
    audience: remoteContent.audience ?? localContent?.audience ?? '',
    format: remoteContent.format ?? localContent?.format ?? 'post',
    status: remoteContent.status ?? localContent?.status ?? 'draft',
    summary: remoteContent.summary ?? localContent?.summary ?? '',
    cta: remoteContent.cta ?? localContent?.cta ?? '',
    pinnedComment: remoteContent.pinnedComment ?? localContent?.pinnedComment ?? '',
    createdAt: remoteContent.createdAt || localContent?.createdAt || localContent?.updatedAt || remoteContent.updatedAt || new Date().toISOString(),
    updatedAt: remoteContent.updatedAt || localContent?.updatedAt || new Date().toISOString()
  };
}

async function loadContentsFromSupabase() {
  const response = await fetch('/api/contents', { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Không thể tải thư viện nội dung từ Supabase.');
  const remoteContents = Array.isArray(payload.contents) ? payload.contents : [];
  onlineContentIds = new Set(remoteContents.map((content) => content.id).filter(Boolean));
  if (resetPendingOnStartup) return 0;
  if (!remoteContents.length) return 0;
  const localById = new Map(contents.map((content) => [content.id, content]));
  const remoteIds = new Set(remoteContents.map((content) => content.id));
  const localOnly = contents.filter((content) => !remoteIds.has(content.id));
  contents = sortContentsByCreatedAt([...remoteContents.map((remote) => mergeRemoteContent(remote, localById.get(remote.id))), ...localOnly]);
  saveContents();
  render();
  return remoteContents.length;
}

function isApprovedContent(content) {
  return String(content?.status || '').trim().toLowerCase() === 'approved';
}

function getContentDisplayTitle(content) {
  const title = typeof content?.title === 'string' ? content.title.trim() : '';
  if (title) return title;
  const summary = typeof content?.summary === 'string' ? content.summary.trim().replace(/\s+/g, ' ') : '';
  if (!summary) return 'Bài viết chưa đặt tiêu đề';
  return `Bài chưa đặt tiêu đề · ${summary.slice(0, 72)}${summary.length > 72 ? '…' : ''}`;
}

function getContentDescription(content) {
  const summary = typeof content?.summary === 'string' ? content.summary.trim().replace(/\s+/g, ' ') : '';
  if (summary) return summary;
  const sourceUrl = typeof content?.sourceUrl === 'string' ? content.sourceUrl.trim() : '';
  if (sourceUrl) return `Nguồn: ${sourceUrl}`;
  return `Chủ đề: ${content?.topic?.trim() || 'Chưa phân loại'} · Chưa có mô tả`;
}

const MAX_CONTENT_WORDS = 1500;

function countWords(text) {
  const normalized = String(text || '').trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

function updateContentWordCount() {
  if (!el.contentWordCount || !el.contentForm) return;
  const summary = el.contentForm.elements.namedItem('summary')?.value || '';
  const count = countWords(summary);
  el.contentWordCount.textContent = `${count.toLocaleString('vi-VN')} / ${MAX_CONTENT_WORDS.toLocaleString('vi-VN')} từ`;
  el.contentWordCount.classList.toggle('is-error', count > MAX_CONTENT_WORDS);
}

function contentStorageRecord(content) {
  const { posterDataUrl, posterObjectUrl, ...record } = content || {};
  return record;
}

function contentsForStorage(sourceContents = contents) {
  return sourceContents.map(contentStorageRecord);
}

function saveContents(options = {}) {
  try {
    // Poster binaries belong in IndexedDB, never in the small localStorage quota.
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(contentsForStorage()));
    postingHistoryCache = null;
  } catch (error) {
    const quotaError = error?.name === 'QuotaExceededError' || /quota|exceeded/i.test(error?.message || '');
    if (quotaError) {
      // A stale archive must never prevent saving the current content list.
      try {
        localStorage.removeItem(CONTENT_ARCHIVE_STORAGE_KEY);
        localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(contentsForStorage()));
      } catch {
        throw new Error('Bộ nhớ trình duyệt đã đầy. Hãy đóng các tab MKT-Fanpage cũ rồi tải lại trang để tiếp tục xóa.');
      }
    }
    throw error;
  }
  scheduleContentAutoSync();
  if (contentSyncEnabled) {
    const syncItems = Array.isArray(options.syncItems) ? options.syncItems : contents;
    syncItems.forEach((content) => {
      if (content?.id) contentSyncPendingIds.add(content.id);
    });
  }
}

function scheduleContentAutoSync() {
  if (!contentSyncEnabled) return;
  clearTimeout(contentSyncTimer);
  contentSyncTimer = setTimeout(() => { syncContentsInBackground(); }, 900);
}

async function syncContentsInBackground({ forceFull = false } = {}) {
  if (contentSyncInFlight) {
    contentSyncQueued = true;
    return;
  }
  const pendingIds = forceFull ? [] : [...contentSyncPendingIds];
  const syncItems = pendingIds.length
    ? contents.filter((content) => pendingIds.includes(content.id))
    : contents;
  if (!syncItems.length) {
    pendingIds.forEach((id) => contentSyncPendingIds.delete(id));
    return;
  }
  const status = el.contentSyncStatus;
  if (!status || !contents.length) return;
  contentSyncInFlight = true;
  status.textContent = 'Đang lưu nội dung lên Supabase...';
  status.classList.remove('is-error', 'is-ready');
  try {
    const response = await fetch('/api/contents/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ contents: syncItems })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể lưu nội dung lên Supabase.');
    if (forceFull || !pendingIds.length) onlineContentIds = new Set(contents.map((content) => content.id).filter(Boolean));
    else (payload.contents || syncItems).forEach((content) => content?.id && onlineContentIds.add(content.id));
    pendingIds.forEach((id) => contentSyncPendingIds.delete(id));
    status.textContent = `Đang dùng ${onlineContentIds.size || payload.synced || syncItems.length} nội dung online`;
    status.classList.add('is-ready');
  } catch (error) {
    status.textContent = 'Đã lưu trình duyệt · Chờ đồng bộ nội dung';
    status.classList.add('is-error');
    showToast(error.message || 'Chưa đồng bộ được nội dung lên Supabase.');
  } finally {
    contentSyncInFlight = false;
    if (contentSyncQueued) {
      contentSyncQueued = false;
      scheduleContentAutoSync();
    }
  }
}

async function syncContentsToSupabase() {
  if (!contents.length) {
    showToast('Chưa có nội dung để đồng bộ.');
    return;
  }
  const button = el.syncContentsButton;
  const status = el.contentSyncStatus;
  if (!button || !status) return;
  button.disabled = true;
  status.textContent = 'Đang kiểm tra thư viện nội dung...';
  status.classList.remove('is-error', 'is-ready');
  try {
    const previewResponse = await fetch('/api/contents/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ contents })
    });
    const preview = await previewResponse.json().catch(() => ({}));
    if (!previewResponse.ok) throw new Error(preview.message || 'Không thể kiểm tra thư viện nội dung.');
    const summary = [
      `Tổng nội dung hiện tại: ${preview.total || 0}`,
      `Sẽ thêm mới: ${preview.newCount || 0}`,
      `Sẽ cập nhật: ${preview.updateCount || 0}`,
      `Bỏ qua do trùng trong danh sách: ${preview.duplicateCount || 0}`,
      `Bỏ qua do dữ liệu không hợp lệ: ${preview.invalidCount || 0}`,
      '',
      'Anh có muốn đồng bộ lên Supabase không?'
    ].join('\n');
    if (!window.confirm(summary)) {
      status.textContent = 'Đã kiểm tra — chưa đồng bộ';
      return;
    }
    await syncContentsInBackground({ forceFull: true });
    recordAudit('Đồng bộ nội dung lên Supabase', `${contents.length} nội dung`);
  } catch (error) {
    status.textContent = 'Đồng bộ lỗi';
    status.classList.add('is-error');
    showToast(error.message || 'Không thể đồng bộ nội dung.');
  } finally {
    button.disabled = false;
  }
}

function closeContentRetentionDialog() {
  if (el.contentRetentionDialog?.open) el.contentRetentionDialog.close();
}

function openContentRetentionDialog() {
  const { candidates, protectedOld } = getContentRetentionPreview();
  if (!el.contentRetentionDialog || !el.contentRetentionSummary) return;
  const cutoffLabel = formatDate(getContentRetentionCutoff());
  el.contentRetentionSummary.innerHTML = candidates.length
    ? `<strong>Sẽ dọn ${candidates.length} bài cũ</strong><span>Giữ nội dung từ ${escapeHtml(cutoffLabel)} đến hôm nay.</span><span>Poster của các bài này cũng được xóa khỏi IndexedDB để giải phóng dung lượng.</span>${protectedOld.length ? `<span class="retention-protected">${protectedOld.length} bài cũ đang nằm trong lô/hàng đợi sẽ được giữ lại.</span>` : ''}`
    : `<strong>Chưa có bài cần dọn</strong><span>Thư viện hiện đã nằm trong phạm vi ${CONTENT_RETENTION_DAYS} ngày gần nhất.</span>`;
  if (el.confirmContentRetention) el.confirmContentRetention.disabled = !candidates.length;
  el.contentRetentionDialog.showModal();
}

async function deleteRemoteContentsForRetention(ids) {
  const remoteIds = ids.filter((id) => onlineContentIds.has(id));
  if (!remoteIds.length || !contentSyncEnabled) return remoteIds;
  const response = await fetch('/api/contents/retention', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ ids: remoteIds })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Không thể dọn nội dung cũ trên bản online.');
  remoteIds.forEach((id) => onlineContentIds.delete(id));
  return remoteIds;
}

async function deleteContentRetention() {
  const button = el.confirmContentRetention;
  if (button) {
    button.disabled = true;
    button.textContent = 'Đang dọn...';
  }
  try {
    const { candidates } = getContentRetentionPreview();
    if (!candidates.length) {
      closeContentRetentionDialog();
      updateContentRetentionStatus();
      showToast(`Không có bài cũ hơn ${CONTENT_RETENTION_DAYS} ngày cần dọn.`);
      return;
    }
    await deleteRemoteContentsForRetention(candidates.map((content) => content.id));
    const archive = loadContentArchive();
    saveContentArchive([...archive, ...candidates]);
    await Promise.all(candidates.map((content) => content.posterBlobId ? deletePosterBlob(content.posterBlobId).catch(() => {}) : Promise.resolve()));
    const candidateIds = new Set(candidates.map((content) => content.id));
    contents = contents.filter((content) => !candidateIds.has(content.id));
    if (candidateIds.has(selectedContentId)) selectedContentId = sortContentsByCreatedAt(contents)[0]?.id || null;
    if (candidateIds.has(batchSelection?.contentId)) {
      batchSelection = { ...batchSelection, contentId: '', groupIds: [], registryId: '', registryIds: [], fanpages: [], updatedAt: new Date().toISOString() };
      saveBatchSelection();
    }
    saveContents();
    postingHistoryCache = null;
    render();
    closeContentRetentionDialog();
    recordAudit('Dọn thư viện nội dung cũ', `Đã dọn ${candidates.length} bài · giữ ${CONTENT_RETENTION_DAYS} ngày gần nhất`);
    showToast(`Đã dọn ${candidates.length} bài cũ và poster tương ứng.`);
  } catch (error) {
    showToast(error.message || 'Không thể dọn thư viện nội dung cũ.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Dọn nội dung cũ';
    }
  }
}

function openPosterDb() {
  if (posterDbPromise) return posterDbPromise;
  if (!('indexedDB' in window)) return Promise.reject(new Error('Trình duyệt không hỗ trợ IndexedDB.'));
  posterDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(POSTER_DB_NAME, 1);
    const fail = (error) => {
      posterDbPromise = null;
      reject(error);
    };
    request.addEventListener('blocked', () => fail(new Error('Bộ nhớ poster đang bị khóa bởi một tab khác. Hãy đóng tab cũ rồi thử lại.')));
    request.addEventListener('error', () => fail(request.error || new Error('Không mở được bộ nhớ poster cục bộ.')));
    request.addEventListener('upgradeneeded', () => {
      if (!request.result.objectStoreNames.contains(POSTER_STORE_NAME)) request.result.createObjectStore(POSTER_STORE_NAME);
    });
    request.addEventListener('success', () => {
      const db = request.result;
      db.addEventListener('versionchange', () => db.close());
      resolve(db);
    });
  });
  return posterDbPromise;
}

function posterStoreRequest(mode, action) {
  const openPromise = openPosterDb();
  const openWithTimeout = Promise.race([
    openPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Mở bộ nhớ poster quá lâu. Hãy tải lại trang rồi thử lại.')), POSTER_OPERATION_TIMEOUT_MS))
  ]);
  return openWithTimeout.then((db) => new Promise((resolve, reject) => {
    let transaction;
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      callback(value);
    };
    const fail = (error) => finish(reject, error instanceof Error ? error : new Error('Không thao tác được với poster cục bộ.'));
    const timeoutId = setTimeout(() => {
      try { transaction?.abort(); } catch {}
      fail(new Error('Lưu poster quá lâu nên đã dừng để tránh khóa nút lưu. Hãy thử lại.'));
    }, POSTER_OPERATION_TIMEOUT_MS);
    try {
      transaction = db.transaction(POSTER_STORE_NAME, mode);
      transaction.addEventListener('error', () => fail(transaction.error || new Error('Giao dịch poster bị lỗi.')));
      transaction.addEventListener('abort', () => fail(new Error('Giao dịch poster đã bị hủy.')));
      const request = action(transaction.objectStore(POSTER_STORE_NAME));
      request.addEventListener('success', () => finish(resolve, request.result));
      request.addEventListener('error', () => fail(request.error || new Error('Không thao tác được với poster cục bộ.')));
    } catch (error) {
      fail(error);
    }
  }));
}

function getPosterBlob(id) {
  return id ? posterStoreRequest('readonly', (store) => store.get(id)) : Promise.resolve(null);
}

function putPosterBlob(id, blob) {
  return posterStoreRequest('readwrite', (store) => store.put(blob, id));
}

function deletePosterBlob(id) {
  return id ? posterStoreRequest('readwrite', (store) => store.delete(id)) : Promise.resolve();
}

function setPosterObjectUrl(content, blob) {
  if (!content || !blob) return;
  if (content.posterObjectUrl) URL.revokeObjectURL(content.posterObjectUrl);
  Object.defineProperty(content, 'posterObjectUrl', { value: URL.createObjectURL(blob), writable: true, configurable: true, enumerable: false });
}

function getPosterSrc(content) {
  return content?.posterObjectUrl || content?.posterDataUrl || '';
}

function hasPoster(content) {
  return Boolean(content?.posterBlobId || getPosterSrc(content));
}

async function hydratePosterAssets(targetContents = null) {
  let migrated = false;
  const sortedContents = sortContentsByCreatedAt(contents);
  const selectedContent = contents.find((content) => content.id === selectedContentId);
  const requestedContents = Array.isArray(targetContents)
    ? targetContents
    : sortedContents.slice(0, CONTENT_POSTER_HYDRATE_LIMIT);
  const hydrationTargets = [...new Map([...requestedContents, selectedContent].filter(Boolean).map((content) => [content.id, content])).values()];
  const migratedContents = [];
  for (const content of hydrationTargets) {
    if (content.posterObjectUrl) continue;
    if (content.posterBlobId) {
      const blob = await getPosterBlob(content.posterBlobId);
      if (blob) setPosterObjectUrl(content, blob);
      continue;
    }
    if (!content.posterDataUrl) continue;
    const blob = await fetch(content.posterDataUrl).then((response) => response.blob());
    try {
      await putPosterBlob(content.id, blob);
      content.posterBlobId = content.id;
      content.posterDataUrl = '';
      setPosterObjectUrl(content, blob);
      migrated = true;
      migratedContents.push(content);
    } catch {
      // Keep the original data URL when IndexedDB is blocked or unavailable.
      setPosterObjectUrl(content, blob);
    }
  }
  if (migrated) saveContents({ syncItems: migratedContents });
  if (Array.isArray(targetContents) && el.contentCards) {
    hydrationTargets.forEach((content) => {
      const image = el.contentCards.querySelector(`[data-content-id="${CSS.escape(content.id)}"] .content-poster`);
      const src = getPosterSrc(content);
      if (image && src) image.src = src;
    });
  }
}

function loadQueue() {
  if (queueCache) return queueCache;
  try {
    const saved = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY));
    const queue = Array.isArray(saved) ? saved : [];
    queueCache = normalizeQueuePostingHistory(queue);
    return queueCache;
  } catch {
    queueCache = [];
    return queueCache;
  }
}

function normalizeQueuePostingHistory(queue) {
  let changed = false;
  const normalized = queue.map((entry) => {
    const postingHistory = { ...(entry.postingHistory || {}) };
    const fanpagePostingHistory = Array.isArray(entry.fanpagePostingHistory) ? entry.fanpagePostingHistory : [];
    let entryChanged = false;
    (entry.groupIds || []).forEach((groupId) => {
      const existing = Array.isArray(postingHistory[groupId]) ? postingHistory[groupId] : [];
      if (existing.length || !['sent', 'approved'].includes(getQueueGroupStatus(entry, groupId)) || !entry.groupPostedAt?.[groupId]) {
        return;
      }
      postingHistory[groupId] = [{
        id: `legacy-${entry.id}-${groupId}`,
        entryId: entry.id,
        contentId: entry.contentId,
        groupId,
        status: getQueueGroupStatus(entry, groupId),
        at: entry.groupPostedAt[groupId],
        topic: groups.find((group) => group.id === groupId)?.topic || '',
        batchId: entry.id,
        batchCreatedAt: entry.createdAt || entry.updatedAt || entry.groupPostedAt[groupId]
      }];
      changed = true;
      entryChanged = true;
    });
    const fanpage = Array.isArray(entry.fanpages) ? entry.fanpages.find((item) => item?.name || item?.url) : null;
    if (fanpage && ['sent', 'approved'].includes(entry.fanpageStatus) && entry.fanpagePostedAt && !fanpagePostingHistory.length) {
      fanpagePostingHistory.push({
        id: `legacy-fanpage-${entry.id}`,
        entryId: entry.id,
        contentId: entry.contentId,
        fanpageName: fanpage.name || '',
        fanpageUrl: fanpage.url || '',
        status: entry.fanpageStatus,
        at: entry.fanpagePostedAt,
        batchId: entry.id,
        batchLabel: entry.runLabel || ''
      });
      changed = true;
      entryChanged = true;
    }
    return entryChanged ? { ...entry, postingHistory, fanpagePostingHistory } : entry;
  });
  if (changed) saveQueue(normalized);
  return normalized;
}

function mergeQueuePostingHistory(localHistory = {}, remoteHistory = {}) {
  const merged = {};
  const groupIds = new Set([...Object.keys(localHistory || {}), ...Object.keys(remoteHistory || {})]);
  groupIds.forEach((groupId) => {
    const byId = new Map();
    [...(localHistory?.[groupId] || []), ...(remoteHistory?.[groupId] || [])].forEach((event) => {
      if (!event || typeof event !== 'object') return;
      const id = event.id || `${event.entryId || ''}|${groupId}|${event.at || ''}`;
      byId.set(id, { ...event, id });
    });
    merged[groupId] = [...byId.values()].sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
  });
  return merged;
}

function saveQueue(queue) {
  queueCache = queue;
  postingHistoryCache = null;
  if (queueStorageMode === 'indexeddb') {
    void persistQueueToIndexedDb(queue).catch(() => {
      showToast('Không thể lưu hàng đợi vào bộ nhớ trình duyệt. Hãy tải lại trang và thử lại.');
    });
  } else {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      if (error?.name !== 'QuotaExceededError') throw error;
      queueStorageMode = 'indexeddb';
      void persistQueueToIndexedDb(queue).catch(() => {
        showToast('Không thể chuyển hàng đợi sang bộ nhớ dung lượng lớn. Hãy tải lại trang và thử lại.');
      });
    }
  }
  scheduleQueueAutoSync();
}

async function resetQueueOnly() {
  const confirmed = window.confirm('Bỏ riêng hàng đợi và lô đang chạy hiện tại?\n\nGiữ nguyên nội dung, group và fanpage. Các mục và lịch sử gắn với hàng đợi hiện tại sẽ được dọn để tạo lô mới; nhật ký thao tác vẫn giữ.');
  if (!confirmed) return;
  const button = el.resetQueueOnlyButton;
  if (button) button.disabled = true;
  clearTimeout(queueSyncTimer);
  let onlineCleared = false;
  try {
    const response = await fetch('/api/queue/clear', {
      method: 'POST',
      headers: { accept: 'application/json' }
    });
    onlineCleared = response.ok;
  } catch {
    // Continue with the local recovery so the operator can prepare a new batch.
  }
  queueCache = [];
  postingHistoryCache = null;
  localStorage.removeItem(QUEUE_STORAGE_KEY);
  savePostingRun(null);
  savePostingRunSummary(null);
  savePostingRunView(null);
  localStorage.removeItem(POSTING_BATCH_SCOPE_STORAGE_KEY);
  try {
    await persistQueueToIndexedDb([]);
  } catch {
    // localStorage has already been cleared; the next save can recreate IndexedDB.
  }
  render();
  recordAudit('Bỏ hàng đợi lỗi', 'Giữ nguyên nội dung, group và fanpage; dọn các mục hàng đợi hiện tại');
  showToast(onlineCleared
    ? 'Đã bỏ hàng đợi lỗi ở online và trình duyệt. Có thể chuẩn bị lô mới.'
    : 'Đã bỏ hàng đợi lỗi trên trình duyệt. Online chưa phản hồi; hãy kiểm tra đồng bộ trước khi tải lại.');
  if (button) button.disabled = false;
}

function loadDailyPostingLimits() {
  try {
    const saved = JSON.parse(localStorage.getItem(DAILY_POSTING_LIMITS_STORAGE_KEY));
    return {
      defaultLimit: Math.max(0, Number(saved?.defaultLimit) || 0),
      topicLimits: saved?.topicLimits && typeof saved.topicLimits === 'object' ? saved.topicLimits : {},
      batchLimits: saved?.batchLimits && typeof saved.batchLimits === 'object' ? saved.batchLimits : {},
      groupLimits: saved?.groupLimits && typeof saved.groupLimits === 'object' ? saved.groupLimits : {},
      updatedAt: saved?.updatedAt || ''
    };
  } catch {
    return { defaultLimit: 0, topicLimits: {}, batchLimits: {}, groupLimits: {}, updatedAt: '' };
  }
}

function saveDailyPostingLimits(settings) {
  localStorage.setItem(DAILY_POSTING_LIMITS_STORAGE_KEY, JSON.stringify({
    defaultLimit: Math.max(0, Number(settings.defaultLimit) || 0),
    topicLimits: settings.topicLimits || {},
    batchLimits: settings.batchLimits || {},
    groupLimits: settings.groupLimits || {},
    updatedAt: new Date().toISOString()
  }));
}

function getDailyPostingLimitTargetLabel(target) {
  if (!target || target === 'default') return 'Mặc định toàn hệ thống';
  const [scope, id] = target.split(':');
  if (scope === 'topic') return `Chủ đề: ${id}`;
  if (scope === 'batch') {
    const batch = getPostingQueueBatches().find((item) => item.entry.id === id);
    return `Lô: ${batch?.label || 'Lô đã chọn'}`;
  }
  if (scope === 'group') return `Group: ${groups.find((group) => group.id === id)?.name || 'Group đã chọn'}`;
  return 'Phạm vi đã chọn';
}

function getDailyPostingLimitForItem(item) {
  const settings = loadDailyPostingLimits();
  const topicKey = normalize(item.group?.topic || '');
  if (settings.groupLimits[item.groupId] > 0) return Number(settings.groupLimits[item.groupId]);
  if (topicKey && settings.topicLimits[topicKey] > 0) return Number(settings.topicLimits[topicKey]);
  if (settings.batchLimits[item.entry?.id] > 0) return Number(settings.batchLimits[item.entry.id]);
  return settings.defaultLimit > 0 ? settings.defaultLimit : 0;
}

function getDailyPostingLimitScope(item) {
  const settings = loadDailyPostingLimits();
  const topicKey = normalize(item.group?.topic || '');
  if (settings.groupLimits[item.groupId] > 0) return { type: 'group', value: item.groupId };
  if (topicKey && settings.topicLimits[topicKey] > 0) return { type: 'topic', value: topicKey };
  if (settings.batchLimits[item.entry?.id] > 0) return { type: 'batch', value: item.entry.id };
  return { type: 'default', value: 'default' };
}

function getDailyPostedItems(dateKey = getLocalRunDateKey()) {
  const cache = getPostingHistoryCache();
  if (!cache.dailyByDate.has(dateKey)) {
    cache.dailyByDate.set(dateKey, cache.dailyItems.filter((item) => getLocalRunDateKey(new Date(item.postedAt)) === dateKey));
  }
  return cache.dailyByDate.get(dateKey);
}

function getDailyPostedCountForItem(item, dateKey = getLocalRunDateKey()) {
  const dailyItems = getDailyPostedItems(dateKey);
  const scope = getDailyPostingLimitScope(item);
  const matchingItems = dailyItems.filter((candidate) => {
    if (scope.type === 'group') return candidate.groupId === scope.value;
    if (scope.type === 'topic') return normalize(candidate.group?.topic || '') === scope.value;
    if (scope.type === 'batch') return candidate.entry.id === scope.value;
    return true;
  });
  if (scope.type === 'group') return matchingItems.length;
  return new Set(matchingItems.map((candidate) => candidate.entry.id)).size;
}

function getDailyPostedCountForRegisteredBatch(batch, dateKey = getLocalRunDateKey()) {
  if (!batch?.groupIds?.length) return 0;
  const groupIds = new Set(batch.groupIds);
  return new Set(getDailyPostedItems(dateKey).filter((item) => groupIds.has(item.groupId)).map((item) => item.entry.id)).size;
}

function getDailyPostedCountForTopic(topic, dateKey = getLocalRunDateKey()) {
  const topicKey = normalize(topic || '');
  if (!topicKey) return 0;
  return new Set(getDailyPostedItems(dateKey).filter((item) => normalize(item.group?.topic || '') === topicKey).map((item) => item.entry.id)).size;
}

function getPostingHistoryItems() {
  return getPostingHistoryCache().groupHistory;
}

function getPersistentPostedCountForRegisteredBatch(batch) {
  if (!batch?.groupIds?.length) return 0;
  const groupIds = new Set(batch.groupIds);
  return new Set(getPostingHistoryItems().filter((item) => groupIds.has(item.groupId)).map((item) => item.entry.id)).size;
}

function getFanpagePostingHistoryItems() {
  return getPostingHistoryCache().fanpageHistory;
}

function getPostingHistoryCache() {
  if (postingHistoryCache) return postingHistoryCache;
  const queue = loadQueue();
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const contentById = new Map([...contents, ...loadContentArchive()].map((content) => [content.id, content]));
  const dailyItems = [];
  const groupHistory = [];
  const fanpageHistory = [];
  queue.forEach((entry) => {
    (entry.groupIds || []).forEach((groupId) => {
      const group = groupById.get(groupId);
      const status = getQueueGroupStatus(entry, groupId);
      const postedAt = entry.groupPostedAt?.[groupId] || '';
      if (group && ['sent', 'approved'].includes(status) && postedAt) dailyItems.push({ entry, group, groupId, status, postedAt });
    });
    Object.entries(entry.postingHistory || {}).forEach(([groupId, history]) => {
      const group = groupById.get(groupId);
      if (!group || !Array.isArray(history)) return;
      history.forEach((event) => {
        const content = contentById.get(event.contentId || entry.contentId);
        if (content && ['sent', 'approved'].includes(event.status)) groupHistory.push({ event, entry, groupId, group, content });
      });
    });
    (Array.isArray(entry.fanpagePostingHistory) ? entry.fanpagePostingHistory : []).forEach((event) => {
      const content = contentById.get(event.contentId || entry.contentId);
      if (content && ['sent', 'approved'].includes(event.status)) fanpageHistory.push({
        event,
        entry,
        fanpage: { name: event.fanpageName || entry.fanpages?.[0]?.name || '', url: event.fanpageUrl || entry.fanpages?.[0]?.url || '' },
        content
      });
    });
  });
  postingHistoryCache = { dailyItems, dailyByDate: new Map(), groupHistory, fanpageHistory };
  return postingHistoryCache;
}

function getFanpagePostingSummary(fanpage, dateKey = getLocalRunDateKey()) {
  const matches = getFanpagePostingHistoryItems().filter((item) => {
    const sameName = normalize(item.fanpage.name) === normalize(fanpage?.name || '');
    const sameUrl = item.fanpage.url && fanpage?.url ? item.fanpage.url === fanpage.url : true;
    return sameName && sameUrl;
  });
  const today = matches.filter((item) => getLocalRunDateKey(new Date(item.event.at)) === dateKey);
  const latest = matches.slice().sort((a, b) => new Date(b.event.at || 0) - new Date(a.event.at || 0))[0];
  return {
    totalCount: new Set(matches.map((item) => item.event.entryId || item.entry.id)).size,
    todayCount: new Set(today.map((item) => item.event.entryId || item.entry.id)).size,
    latestAt: latest?.event.at || '',
    latestLabel: latest?.event.batchLabel || ''
  };
}

function getPersistentPostedCountForTopic(topic) {
  const topicKey = normalize(topic || '');
  if (!topicKey) return 0;
  return new Set(getPostingHistoryItems().filter((item) => normalize(item.event.topic || item.group?.topic || '') === topicKey).map((item) => item.entry.id)).size;
}

function getPostingHistoryBatchName(item) {
  const registeredNames = batchRegistry
    .filter((batch) => (batch.groupIds || []).includes(item.groupId))
    .map((batch) => batch.name?.trim())
    .filter(Boolean);
  return registeredNames[0] || item.event.batchLabel || `Lô ${formatDateTime(item.entry.createdAt || item.event.at)}`;
}

function getContentPostingHistorySummary(content) {
  const postedItems = getPostingHistoryItems().filter((item) => item.content?.id === content?.id);
  const fanpagePostedItems = getFanpagePostingHistoryItems().filter((item) => item.content?.id === content?.id);
  const entryIds = new Set(postedItems.map((item) => item.entry.id));
  const groupIds = new Set(postedItems.map((item) => item.groupId));
  const topics = [...new Set(postedItems.map((item) => item.event.topic?.trim() || item.group?.topic?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  const registeredBatchNames = [...new Set(postedItems.map(getPostingHistoryBatchName))].sort((a, b) => a.localeCompare(b, 'vi'));
  const fanpageEntryIds = new Set(fanpagePostedItems.map((item) => item.event.entryId || item.entry.id));
  const fanpageBatches = [...new Set(fanpagePostedItems.map((item) => {
    const fanpageName = item.fanpage.name || item.fanpage.url || 'Fanpage';
    const batchName = item.event.batchLabel || `Lô ${formatDateTime(item.entry.createdAt || item.event.at)}`;
    return `${fanpageName} · ${batchName}`;
  }))].sort((a, b) => a.localeCompare(b, 'vi'));
  return {
    postCount: postedItems.length,
    batchCount: entryIds.size,
    groupCount: groupIds.size,
    topics,
    registeredBatchNames,
    fanpagePostCount: fanpagePostedItems.length,
    fanpageBatchCount: fanpageEntryIds.size,
    fanpageBatches
  };
}

function renderContentDailyPostingSummary(content) {
  const summary = getContentPostingHistorySummary(content);
  if (!summary.batchCount && !summary.fanpageBatchCount) {
    return '<span class="batch-content-posting-empty">Chưa có lịch sử đăng cho bài này.</span>';
  }
  const showNames = (items) => {
    const visible = items.slice(0, 4).map((item) => escapeHtml(item)).join(' · ');
    const remaining = items.length - Math.min(items.length, 4);
    return `${visible || 'Chưa gắn'}${remaining > 0 ? ` <em>+${remaining}</em>` : ''}`;
  };
  const groupSummary = summary.batchCount
    ? `<div class="batch-content-posting-head"><strong>Group: ${summary.batchCount} lô · ${summary.postCount} lượt đăng</strong><span>${summary.groupCount} group</span></div><div class="batch-content-posting-details"><span><b>Lô:</b> ${showNames(summary.registeredBatchNames)}</span><span><b>Chủ đề:</b> ${showNames(summary.topics)}</span></div>`
    : '';
  const fanpageSummary = summary.fanpageBatchCount
    ? `<div class="batch-content-posting-head batch-content-posting-fanpage-head"><strong>Fanpage: ${summary.fanpageBatchCount} lô · ${summary.fanpagePostCount} lượt đăng</strong><span>đã ghi nhận</span></div><div class="batch-content-posting-details"><span><b>Fanpage · lô:</b> ${showNames(summary.fanpageBatches)}</span></div>`
    : '';
  return `${groupSummary}${fanpageSummary}`;
}

function hasDailyPostingScopeEntry(item, dateKey = getLocalRunDateKey()) {
  const scope = getDailyPostingLimitScope(item);
  if (scope.type === 'group') return false;
  return getDailyPostedItems(dateKey).some((candidate) => {
    if (candidate.entry.id !== item.entry.id) return false;
    if (scope.type === 'topic') return normalize(candidate.group?.topic || '') === scope.value;
    if (scope.type === 'batch') return candidate.entry.id === scope.value;
    return true;
  });
}

function isDailyPostingLimitReached(item, dateKey = getLocalRunDateKey()) {
  const limit = getDailyPostingLimitForItem(item);
  return limit > 0 && getDailyPostedCountForItem(item, dateKey) >= limit;
}

function canRecordDailyPost(item) {
  if (!item) return false;
  const currentStatus = getQueueGroupStatus(item.entry, item.groupId);
  const postedAt = item.entry.groupPostedAt?.[item.groupId];
  const alreadyPostedToday = ['sent', 'approved'].includes(currentStatus) && postedAt && getLocalRunDateKey(new Date(postedAt)) === getLocalRunDateKey();
  return Boolean(alreadyPostedToday || hasDailyPostingScopeEntry(item) || !isDailyPostingLimitReached(item));
}

function formatDailyLimit(limit) {
  return limit > 0 ? String(limit) : 'Không giới hạn';
}

function getDailyPostingControlSnapshot() {
  const settings = loadDailyPostingLimits();
  const dailyItems = getDailyPostedItems();
  const activeItems = getPostingRunItems().filter(isPostingRunActionable);
  return { settings, dailyItems, availableItems: activeItems.filter((item) => !isDailyPostingLimitReached(item)) };
}

function renderDailyPostingControl() {
  if (!el.dailyPostingControl) return;
  const { settings, dailyItems, availableItems } = getDailyPostingControlSnapshot();
  const selectedScope = el.postingBatchScope?.value || 'all';
  const selectedScopeItems = selectedScope === 'all' ? [] : getPostingRunItemsForScope(selectedScope);
  const selectedLimit = selectedScopeItems[0] ? getDailyPostingLimitForItem(selectedScopeItems[0]) : settings.defaultLimit;
  const selectedUsed = selectedScopeItems.length ? getDailyPostedCountForItem(selectedScopeItems[0]) : dailyItems.length;
  const scopeLabel = selectedScopeItems[0] ? `Lô đang chọn: ${getContentDisplayTitle(selectedScopeItems[0].content)}` : 'Toàn hệ thống';
  const isBlocked = selectedLimit > 0 && selectedUsed >= selectedLimit;
  el.dailyPostingControl.className = `daily-posting-control${isBlocked ? ' is-blocked' : ''}`;
  el.dailyPostingControl.innerHTML = `<div class="daily-posting-control-copy"><strong>Kiểm soát lượt đăng hôm nay</strong><span>${scopeLabel} · ${selectedUsed}/${formatDailyLimit(selectedLimit)} lượt đã đăng</span><small>Chỉ “Đã đăng” và “Đã đăng &amp; duyệt” được tính. Bỏ qua không tính quota.</small></div><div class="daily-posting-control-actions"><span class="daily-posting-availability">${availableItems.length ? `Còn ${availableItems.length} mục có thể đăng` : 'Đã đạt giới hạn hoặc không còn mục chờ'}</span><button type="button" class="button secondary" id="openDailyPostingLimitButton">Cài giới hạn</button></div>`;
  el.openDailyPostingLimitButton = document.querySelector('#openDailyPostingLimitButton');
}

function populateDailyPostingLimitDialog() {
  if (!el.dailyPostingLimitScope || !el.dailyPostingLimitValue) return;
  const settings = loadDailyPostingLimits();
  const batches = getPostingQueueBatches();
  const topics = [...new Set(groups.map((group) => group.topic?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  const groupOptions = groups.slice().sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const options = [
    '<option value="default">Mặc định toàn hệ thống</option>',
    ...batches.map((batch) => `<option value="batch:${escapeHtml(batch.entry.id)}">Lô · ${escapeHtml(batch.label)}</option>`),
    ...topics.map((topic) => `<option value="topic:${escapeHtml(normalize(topic))}">Chủ đề · ${escapeHtml(topic)}</option>`),
    ...groupOptions.map((group) => `<option value="group:${escapeHtml(group.id)}">Group · ${escapeHtml(group.name)}</option>`)
  ];
  const previous = el.dailyPostingLimitScope.value || 'default';
  el.dailyPostingLimitScope.innerHTML = options.join('');
  el.dailyPostingLimitScope.value = options.some((option) => option.includes(`value="${previous}"`)) ? previous : 'default';
  const target = el.dailyPostingLimitScope.value;
  const [scope, id] = target.split(':');
  const value = target === 'default' ? settings.defaultLimit : scope === 'batch' ? settings.batchLimits[id] || 0 : scope === 'topic' ? settings.topicLimits[id] || 0 : settings.groupLimits[id] || 0;
  el.dailyPostingLimitValue.value = value || '';
  el.dailyPostingLimitScopeNote.textContent = `${getDailyPostingLimitTargetLabel(target)} · để trống hoặc nhập 0 = bỏ giới hạn riêng, dùng mặc định.`;
}

function openDailyPostingLimitDialog() {
  populateDailyPostingLimitDialog();
  el.dailyPostingLimitDialog?.showModal();
}

function saveDailyPostingLimitForm(event) {
  event.preventDefault();
  const target = el.dailyPostingLimitScope.value || 'default';
  const raw = el.dailyPostingLimitValue.value.trim();
  const number = Number(raw || 0);
  if (!Number.isFinite(number) || number < 0 || !Number.isInteger(number)) {
    el.dailyPostingLimitScopeNote.textContent = 'Giới hạn phải là số nguyên từ 0 trở lên.';
    return;
  }
  const value = Math.floor(number);
  const settings = loadDailyPostingLimits();
  if (target === 'default') settings.defaultLimit = value;
  else {
    const [scope, id] = target.split(':');
    const map = scope === 'batch' ? settings.batchLimits : scope === 'topic' ? settings.topicLimits : settings.groupLimits;
    if (value > 0) map[id] = value;
    else delete map[id];
  }
  saveDailyPostingLimits(settings);
  el.dailyPostingLimitDialog.close();
  renderPostingQueue();
  recordAudit('Cài giới hạn lượt đăng', `${getDailyPostingLimitTargetLabel(target)} · ${formatDailyLimit(value)}/ngày`);
  showToast(`Đã lưu giới hạn: ${getDailyPostingLimitTargetLabel(target)} · ${formatDailyLimit(value)}/ngày.`);
}

function mergeRemoteQueue(remoteEntry, localEntry) {
  return {
    ...(localEntry || {}),
    ...remoteEntry,
    groupStatuses: { ...(localEntry?.groupStatuses || {}), ...(remoteEntry.groupStatuses || {}) },
    groupPostedUrls: { ...(localEntry?.groupPostedUrls || {}), ...(remoteEntry.groupPostedUrls || {}) },
    groupPostedAt: { ...(localEntry?.groupPostedAt || {}), ...(remoteEntry.groupPostedAt || {}) },
    groupApprovalCheckedAt: { ...(localEntry?.groupApprovalCheckedAt || {}), ...(remoteEntry.groupApprovalCheckedAt || {}) },
    groupErrors: { ...(localEntry?.groupErrors || {}), ...(remoteEntry.groupErrors || {}) },
    nextChecks: { ...(localEntry?.nextChecks || {}) },
    metrics: { ...(localEntry?.metrics || {}) },
    metricsHistory: { ...(localEntry?.metricsHistory || {}) },
    decisions: { ...(localEntry?.decisions || {}), ...(remoteEntry.decisions || {}) },
    postingHistory: mergeQueuePostingHistory(localEntry?.postingHistory, remoteEntry.postingHistory),
  };
}

async function loadQueueFromSupabase() {
  const response = await fetch('/api/queue', { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Không thể tải hàng đợi từ Supabase.');
  const remoteQueue = Array.isArray(payload.queue) ? payload.queue : [];
  if (!remoteQueue.length) return 0;
  const localById = new Map(loadQueue().map((entry) => [entry.id, entry]));
  const remoteIds = new Set(remoteQueue.map((entry) => entry.id));
  const localOnly = loadQueue().filter((entry) => !remoteIds.has(entry.id));
  const mergedQueue = [...remoteQueue.map((remote) => mergeRemoteQueue(remote, localById.get(remote.id))), ...localOnly];
  const remoteDecisions = mergedQueue.reduce((all, entry) => {
    Object.entries(entry.decisions || {}).forEach(([groupId, value]) => {
      all[getBatchDecisionKey(entry.contentId, groupId)] = value;
    });
    return all;
  }, {});
  if (Object.keys(remoteDecisions).length) {
    saveBatchDecisions({ ...loadBatchDecisions(), ...remoteDecisions }, { sync: false });
  }
  saveQueue(mergedQueue);
  render();
  return remoteQueue.length;
}

function scheduleQueueAutoSync() {
  if (!queueSyncEnabled) return;
  clearTimeout(queueSyncTimer);
  queueSyncTimer = setTimeout(() => { syncQueueInBackground(); }, 2500);
}

async function syncQueueInBackground() {
  const queue = loadQueue();
  if (queueSyncInFlight) {
    queueSyncQueued = true;
    return;
  }
  const status = el.queueSyncStatus;
  if (!status || !queue.length) return;
  queueSyncInFlight = true;
  status.textContent = 'Hàng đợi: đang lưu online...';
  status.classList.remove('is-error', 'is-ready');
  try {
    const response = await fetch('/api/queue/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ queue })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể lưu hàng đợi lên Supabase.');
    status.textContent = `Hàng đợi: đang dùng ${payload.syncedItems || 0} mục online`;
    status.classList.add('is-ready');
  } catch (error) {
    status.textContent = 'Hàng đợi: đang ở bản trình duyệt · chờ đồng bộ';
    status.classList.add('is-error');
    showToast(error.message || 'Chưa đồng bộ được hàng đợi lên Supabase.');
  } finally {
    queueSyncInFlight = false;
    if (queueSyncQueued) {
      queueSyncQueued = false;
      scheduleQueueAutoSync();
    }
  }
}

async function syncQueueToSupabase() {
  const queue = loadQueue();
  if (!queue.length) {
    showToast('Chưa có hàng đợi để đồng bộ.');
    return;
  }
  const button = el.syncQueueButton;
  const status = el.queueSyncStatus;
  if (!button || !status) return;
  button.disabled = true;
  status.textContent = 'Đang kiểm tra hàng đợi...';
  status.classList.remove('is-error', 'is-ready');
  try {
    const previewResponse = await fetch('/api/queue/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ queue })
    });
    const preview = await previewResponse.json().catch(() => ({}));
    if (!previewResponse.ok) throw new Error(preview.message || 'Không thể kiểm tra hàng đợi.');
    const summary = [
      `Tổng lô: ${preview.totalBatches || 0}`,
      `Mục group hợp lệ: ${preview.totalItems || 0}`,
      `Lô hợp lệ: ${preview.validBatches || 0}`,
      `Bỏ qua do dữ liệu không hợp lệ: ${preview.invalidCount || 0}`,
      '',
      'Anh có muốn đồng bộ hàng đợi lên Supabase không?'
    ].join('\n');
    if (!window.confirm(summary)) {
      status.textContent = 'Hàng đợi: đã kiểm tra — chưa đồng bộ';
      return;
    }
    await syncQueueInBackground();
    recordAudit('Đồng bộ hàng đợi lên Supabase', `${preview.totalItems || 0} mục group`);
  } catch (error) {
    status.textContent = 'Đồng bộ lỗi';
    status.classList.add('is-error');
    showToast(error.message || 'Không thể đồng bộ hàng đợi.');
  } finally {
    button.disabled = false;
  }
}

function loadBatchSelection() {
  try {
    const saved = JSON.parse(localStorage.getItem(BATCH_SELECTION_STORAGE_KEY));
    return saved && typeof saved === 'object'
      ? { ...saved, mode: BATCH_MODE_LABELS[saved.mode] ? saved.mode : 'unknown', selectionMode: saved.selectionMode === 'registry' ? 'registry' : saved.selectionMode === 'manual' ? 'manual' : 'topic', topicFilters: Array.isArray(saved.topicFilters) ? saved.topicFilters : null, fanpages: Array.isArray(saved.fanpages) ? saved.fanpages : [] }
      : { contentId: '', groupIds: [], mode: 'unknown', selectionMode: 'topic', topicFilters: null, fanpages: [] };
  } catch {
    return { contentId: '', groupIds: [], mode: 'unknown', selectionMode: 'topic', topicFilters: null, fanpages: [] };
  }
}

function saveBatchSelection() {
  localStorage.setItem(BATCH_SELECTION_STORAGE_KEY, JSON.stringify(batchSelection));
}

function syncSelectedContentToBatchSelection({ resetGroups = true } = {}) {
  if (!selectedContentId || batchSelection.contentId === selectedContentId) return;
  const keepRegistryGroups = getBatchSelectionChoice() === 'registry';
  batchSelection = {
    ...batchSelection,
    contentId: selectedContentId,
    groupIds: resetGroups && !keepRegistryGroups ? [] : (batchSelection.groupIds || []),
    updatedAt: new Date().toISOString()
  };
  saveBatchSelection();
}

function loadBatchRegistry() {
  try {
    const saved = JSON.parse(localStorage.getItem(BATCH_REGISTRY_STORAGE_KEY));
    return Array.isArray(saved)
      ? saved.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && Array.isArray(item.groupIds))
        .map((item) => ({
          id: item.id,
          name: item.name.trim(),
          description: typeof item.description === 'string' ? item.description.trim() : '',
          fanpage: item.fanpage && typeof item.fanpage === 'object'
            ? { name: typeof item.fanpage.name === 'string' ? item.fanpage.name.trim() : '', url: typeof item.fanpage.url === 'string' ? item.fanpage.url.trim() : '' }
            : { name: typeof item.fanpageName === 'string' ? item.fanpageName.trim() : '', url: typeof item.fanpageUrl === 'string' ? item.fanpageUrl.trim() : '' },
          groupIds: [...new Set(item.groupIds.filter(Boolean))],
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
        }))
      : [];
  } catch {
    return [];
  }
}

function saveBatchRegistry() {
  localStorage.setItem(BATCH_REGISTRY_STORAGE_KEY, JSON.stringify(batchRegistry));
}

function loadBatchSchedules() {
  try {
    const saved = JSON.parse(localStorage.getItem(BATCH_SCHEDULES_STORAGE_KEY));
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).filter(([id, item]) => id && item && typeof item === 'object' && /^\d{2}:\d{2}$/.test(item.time || ''))
      .map(([id, item]) => [id, { time: item.time, dayOffset: Number.isInteger(item.dayOffset) && item.dayOffset >= 0 ? item.dayOffset : 0, enabled: item.enabled !== false, updatedAt: item.updatedAt || new Date().toISOString() }]));
  } catch {
    return {};
  }
}

function saveBatchSchedules() {
  localStorage.setItem(BATCH_SCHEDULES_STORAGE_KEY, JSON.stringify(batchSchedules));
}

function getSchedulableBatches() {
  return batchRegistry.filter((item) => Array.isArray(item.groupIds) && item.groupIds.length);
}

function parseScheduleMinutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 ? hours * 60 + minutes : null;
}

function formatScheduleMinutes(totalMinutes) {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMinutes)));
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

function getBatchScheduleWindow() {
  const start = parseScheduleMinutes(el.batchScheduleStartTime?.value) ?? 6 * 60;
  const end = parseScheduleMinutes(el.batchScheduleEndTime?.value) ?? 21 * 60;
  return { start, end };
}

function getDefaultBatchScheduleTime(index, count, start, end) {
  if (count <= 1) return formatScheduleMinutes(start);
  return formatScheduleMinutes(start + ((end - start) * index) / (count - 1));
}

function formatBatchScheduleLabel(schedule) {
  return `Giờ nhắc: ${schedule.time}`;
}

function updateBatchScheduleToggleControls() {
  const list = el.batchScheduleList;
  const shell = list?.closest('.batch-schedule-list-shell');
  if (!list) return;
  const expanded = shell?.classList.contains('is-expanded') === true;
  const hasRows = list.querySelector('.batch-schedule-row') !== null;
  if (el.batchScheduleScrollUpButton) {
    el.batchScheduleScrollUpButton.disabled = !expanded || !hasRows;
    el.batchScheduleScrollUpButton.setAttribute('aria-expanded', String(expanded));
  }
  if (el.batchScheduleScrollDownButton) {
    el.batchScheduleScrollDownButton.disabled = expanded || !hasRows;
    el.batchScheduleScrollDownButton.setAttribute('aria-expanded', String(expanded));
  }
  if (el.batchScheduleScrollPosition) el.batchScheduleScrollPosition.textContent = expanded ? 'Đang mở' : 'Đang thu gọn';
}

function toggleBatchScheduleList(direction) {
  const list = el.batchScheduleList;
  const shell = list?.closest('.batch-schedule-list-shell');
  if (!list || !shell) return;
  if (direction > 0 && !shell.classList.contains('is-expanded')) {
    shell.classList.add('is-expanded');
    list.scrollTop = 0;
  } else if (direction < 0 && shell.classList.contains('is-expanded')) {
    shell.classList.remove('is-expanded');
    list.scrollTop = 0;
  }
  updateBatchScheduleToggleControls();
}

function getBatchScheduleRows() {
  const batches = getSchedulableBatches();
  const { start, end } = getBatchScheduleWindow();
  return batches.map((batch, index) => {
    const saved = batchSchedules[batch.id];
    if (!saved) {
      batchSchedules[batch.id] = { time: getDefaultBatchScheduleTime(index, batches.length, start, end), dayOffset: 0, enabled: true, updatedAt: new Date().toISOString() };
    }
    return { batch, schedule: batchSchedules[batch.id], index };
  });
}

function renderBatchSchedule() {
  if (!el.batchScheduleList) return;
  const rows = getBatchScheduleRows();
  if (el.batchScheduleSummary) {
    const { start, end } = getBatchScheduleWindow();
    el.batchScheduleSummary.textContent = rows.length
      ? `${rows.length} lô group · ${formatScheduleMinutes(start)}–${formatScheduleMinutes(end)} · chỉ để nhắc`
      : 'Chưa có lô group để lập lịch';
  }
  el.batchScheduleList.innerHTML = rows.length
    ? rows.map(({ batch, schedule, index }) => {
      const fanpage = batch.fanpage?.name || batch.fanpage?.url ? ` · ${batch.fanpage.name || batch.fanpage.url}` : '';
      return `<div class="batch-schedule-row${schedule.enabled ? '' : ' is-disabled'}"><label class="batch-schedule-toggle"><input type="checkbox" data-batch-schedule-enabled="${escapeHtml(batch.id)}"${schedule.enabled ? ' checked' : ''}><span>${index + 1}</span></label><div class="batch-schedule-meta"><strong>${escapeHtml(batch.name)}</strong><small>${batch.groupIds.length} group${escapeHtml(fanpage)}</small></div><label class="batch-schedule-time"><span>${escapeHtml(formatBatchScheduleLabel(schedule))}</span><input type="time" value="${escapeHtml(schedule.time)}" data-batch-schedule-time="${escapeHtml(batch.id)}"${schedule.enabled ? '' : ' disabled'}></label></div>`;
    }).join('')
    : '<div class="batch-schedule-empty">Chưa có lô group đã đăng ký. Hãy tạo lô ở Bước 0 trước.</div>';
  if (el.batchScheduleNote) el.batchScheduleNote.textContent = rows.length
    ? 'Anh có thể đặt trùng giờ cho nhiều lô, bật/tắt từng lời nhắc và bấm “Lưu lịch”. App không giới hạn lượt và không tự đăng Facebook.'
    : 'Lịch chỉ áp dụng cho lô có group; fanpage đăng riêng không được tính vào 27 lô này.';
  window.requestAnimationFrame(updateBatchScheduleToggleControls);
}

function proposeBatchSchedule() {
  const rows = getBatchScheduleRows();
  const { start, end } = getBatchScheduleWindow();
  if (end < start) {
    showToast('Giờ kết thúc phải sau giờ bắt đầu.');
    return;
  }
  const now = new Date().toISOString();
  rows.forEach(({ batch }, index) => {
    batchSchedules[batch.id] = { time: getDefaultBatchScheduleTime(index, rows.length, start, end), dayOffset: 0, enabled: true, updatedAt: now };
  });
  renderBatchSchedule();
  showToast(`Đã đề xuất giờ nhắc cho ${rows.length} lô. Anh có thể đặt trùng giờ rồi bấm “Lưu lịch”.`);
}

function saveBatchScheduleSettings() {
  const rows = getBatchScheduleRows();
  const { start, end } = getBatchScheduleWindow();
  if (end < start) {
    showToast('Giờ kết thúc phải sau giờ bắt đầu.');
    return;
  }
  rows.forEach(({ batch }) => {
    const input = el.batchScheduleList.querySelector(`[data-batch-schedule-time="${CSS.escape(batch.id)}"]`);
    const enabledInput = el.batchScheduleList.querySelector(`[data-batch-schedule-enabled="${CSS.escape(batch.id)}"]`);
    const time = input?.value || batchSchedules[batch.id].time;
    if (parseScheduleMinutes(time) === null) return;
    batchSchedules[batch.id] = { time, dayOffset: 0, enabled: Boolean(enabledInput?.checked), updatedAt: new Date().toISOString() };
  });
  saveBatchSchedules();
  renderBatchSchedule();
  renderBatchRegistrySelect();
  renderBatchRegistry();
  recordAudit('Lưu lịch đăng theo lô', `${rows.length} lô · ${formatScheduleMinutes(start)}–${formatScheduleMinutes(end)}`);
  showToast(`Đã lưu lịch đăng cho ${rows.length} lô group.`);
}

function getRegisteredBatch(id = batchSelection?.registryId) {
  const resolvedId = id || getSelectedRegistryIds()[0] || '';
  return batchRegistry.find((item) => item.id === resolvedId) || null;
}

function getSelectedRegistryIds() {
  const storedIds = Array.isArray(batchSelection?.registryIds) ? batchSelection.registryIds : [];
  return [...new Set([...storedIds, batchSelection?.registryId].filter(Boolean))];
}

function getRegisteredBatches(ids = getSelectedRegistryIds()) {
  const selectedIds = new Set(ids);
  return batchRegistry.filter((item) => selectedIds.has(item.id));
}

function getSelectedRegistryGroupIds() {
  return [...new Set(getRegisteredBatches().flatMap((item) => item.groupIds || []))];
}

function getSelectedRegistryFanpages(ids = getSelectedRegistryIds()) {
  return getRegisteredBatches(ids)
    .map((item) => item.fanpage)
    .filter((fanpage) => fanpage?.name || fanpage?.url)
    .filter((fanpage, index, items) => items.findIndex((candidate) => normalize(candidate.name) === normalize(fanpage.name) && candidate.url === fanpage.url) === index);
}

function getRegistryEligibleGroups() {
  return groups
    .filter((group) => !['rejected', 'inactive'].includes(group.status))
    .filter((group) => Boolean(group.url && group.topic?.trim() && group.audience?.trim()))
    .sort((a, b) => String(a.topic || '').localeCompare(String(b.topic || ''), 'vi') || String(a.name || '').localeCompare(String(b.name || ''), 'vi'));
}

function getRegistryGroupMemberships(groupId) {
  return batchRegistry.filter((item) => item.groupIds.includes(groupId));
}

function getVisibleRegistryGroups() {
  const search = normalize(el.batchRegistryGroupSearch?.value || '');
  const membershipFilter = el.batchRegistryMembershipFilter?.value || 'all';
  const queuedGroupIds = new Set(loadQueue().flatMap((entry) => entry.groupIds || []));
  return getRegistryEligibleGroups()
    .filter((group) => !search || normalize(`${group.name} ${group.topic} ${group.audience}`).includes(search))
    .filter((group) => {
      const memberships = getRegistryGroupMemberships(group.id);
      if (membershipFilter === 'unregistered') return memberships.length === 0;
      if (membershipFilter === 'registered') return memberships.length > 0;
      if (membershipFilter === 'selected') return registryDraftGroupIds.has(group.id);
      if (membershipFilter === 'unselected') return !registryDraftGroupIds.has(group.id);
      if (membershipFilter === 'editing') return editingBatchRegistryGroupIds.has(group.id);
      if (membershipFilter === 'not-queued') return !queuedGroupIds.has(group.id);
      return true;
    });
}

function renderBatchRegistryGroupList() {
  if (!el.batchRegistryGroupList) return;
  const eligibleGroups = getRegistryEligibleGroups();
  const eligibleIds = new Set(eligibleGroups.map((group) => group.id));
  registryDraftGroupIds = new Set([...registryDraftGroupIds].filter((id) => eligibleIds.has(id)));
  const visibleGroups = getVisibleRegistryGroups();
  el.batchRegistryGroupList.innerHTML = visibleGroups.length
    ? visibleGroups.map((group) => {
      const memberships = getRegistryGroupMemberships(group.id);
      const membershipText = memberships.length
        ? `Đã thuộc: ${memberships.map((item) => item.name).join(' · ')}`
        : 'Chưa thuộc lô đăng ký nào';
      return `<label class="batch-registry-group-row"><input type="checkbox" data-registry-group value="${escapeHtml(group.id)}"${registryDraftGroupIds.has(group.id) ? ' checked' : ''}><span><strong>${escapeHtml(group.name)}</strong><small>${escapeHtml(group.topic)} · ${escapeHtml(group.audience)}</small><em class="batch-registry-membership${memberships.length ? ' is-registered' : ''}">${escapeHtml(membershipText)}</em></span></label>`;
    }).join('')
    : '<span class="batch-registry-empty">Không có group phù hợp để chọn.</span>';
  const selectedCount = registryDraftGroupIds.size;
  if (el.batchRegistrySelectedCount) el.batchRegistrySelectedCount.textContent = `${selectedCount} đã chọn · ${visibleGroups.length}/${eligibleGroups.length} đang hiển thị`;
  if (el.batchRegistrySelectAll) {
    el.batchRegistrySelectAll.checked = visibleGroups.length > 0 && visibleGroups.every((group) => registryDraftGroupIds.has(group.id));
    el.batchRegistrySelectAll.indeterminate = visibleGroups.some((group) => registryDraftGroupIds.has(group.id)) && !el.batchRegistrySelectAll.checked;
    el.batchRegistrySelectAll.disabled = visibleGroups.length === 0;
  }
}

function renderBatchRegistry() {
  renderBatchRegistryGroupList();
  if (!el.batchRegistryList) return;
  const eligibleIds = new Set(getRegistryEligibleGroups().map((group) => group.id));
  const records = batchRegistry.filter((item) => item.groupIds.some((groupId) => eligibleIds.has(groupId)) || item.fanpage?.name || item.fanpage?.url);
  el.batchRegistryList.innerHTML = records.length
    ? records.map((item) => {
      const validGroupCount = item.groupIds.filter((groupId) => eligibleIds.has(groupId)).length;
      const topicSummary = [...new Set(item.groupIds.map((groupId) => groups.find((group) => group.id === groupId)?.topic).filter(Boolean))];
      const fanpage = item.fanpage?.name || item.fanpage?.url ? `<p class="batch-registry-fanpage-summary"><b>Fanpage:</b> ${item.fanpage.url ? `<a href="${escapeHtml(safeUrl(item.fanpage.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.fanpage.name || item.fanpage.url)}</a>` : escapeHtml(item.fanpage.name)}</p>` : '';
      const isFanpageOnly = validGroupCount === 0 && Boolean(item.fanpage?.name || item.fanpage?.url);
      return `<article class="batch-registry-card"><div><strong>${escapeHtml(item.name)}</strong><small>${validGroupCount} group · ${escapeHtml(topicSummary.join(' · ') || (isFanpageOnly ? 'Fanpage đã lưu' : 'Chưa phân loại'))}</small>${fanpage}${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}</div><div class="batch-registry-card-actions"><button type="button" class="button primary" data-apply-registered-batch="${escapeHtml(item.id)}">${isFanpageOnly ? 'Chọn fanpage này' : 'Chọn lô này'}</button><button type="button" class="button secondary" data-edit-registered-batch="${escapeHtml(item.id)}">Sửa</button><button type="button" class="button danger" data-delete-registered-batch="${escapeHtml(item.id)}">Xóa</button></div></article>`;
    }).join('')
    : '<div class="batch-registry-empty-card">Chưa có fanpage hoặc lô nào được đăng ký. Anh có thể lưu fanpage riêng trước, rồi gán group sau.</div>';
}

function applyRegisteredBatch(registryId) {
  const record = getRegisteredBatch(registryId);
  if (!record) return;
  const approvedContents = sortContentsByCreatedAt(contents.filter(isApprovedContent));
  if (!approvedContents.some((content) => content.id === selectedContentId)) selectedContentId = approvedContents[0]?.id || selectedContentId;
  batchSelection = {
    ...batchSelection,
    contentId: selectedContentId || batchSelection.contentId || '',
    groupIds: [...record.groupIds],
    registryId: record.id,
    registryIds: [record.id],
    fanpages: record.fanpage?.name || record.fanpage?.url ? [record.fanpage] : [],
    selectionMode: 'registry',
    topicFilters: null,
    updatedAt: new Date().toISOString()
  };
  saveBatchSelection();
  renderContentLibrary();
  renderTable();
  document.querySelector('#batch-prep')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  recordAudit('Chọn lô đã đăng ký', `${record.name} · ${record.groupIds.length} group`);
  showToast(`Đã nạp lô “${record.name}” gồm ${record.groupIds.length} group${record.fanpage?.name ? ` và fanpage “${record.fanpage.name}”` : ''}.`);
}

function deleteRegisteredBatch(registryId) {
  const record = getRegisteredBatch(registryId);
  if (!record || !window.confirm(`Xóa đăng ký lô “${record.name}”?\n\nDanh sách group hiện tại không bị xóa.`)) return;
  batchRegistry = batchRegistry.filter((item) => item.id !== registryId);
  saveBatchRegistry();
  if (getSelectedRegistryIds().includes(registryId)) {
    const remainingRegistryIds = getSelectedRegistryIds().filter((id) => id !== registryId);
    const remainingGroupIds = [...new Set(batchRegistry.filter((item) => remainingRegistryIds.includes(item.id)).flatMap((item) => item.groupIds || []))];
    batchSelection = {
      ...batchSelection,
      registryId: remainingRegistryIds.length === 1 ? remainingRegistryIds[0] : '',
      registryIds: remainingRegistryIds,
      groupIds: remainingGroupIds,
      fanpages: getSelectedRegistryFanpages(remainingRegistryIds),
      selectionMode: remainingRegistryIds.length ? 'registry' : 'topic',
      topicFilters: remainingRegistryIds.length ? null : batchSelection.topicFilters,
      updatedAt: new Date().toISOString()
    };
    saveBatchSelection();
  }
  if (editingBatchRegistryId === registryId) cancelRegisteredBatchEdit();
  renderContentLibrary();
  renderTable();
  recordAudit('Xóa đăng ký lô', record.name);
  showToast('Đã xóa đăng ký lô. Dữ liệu group vẫn được giữ nguyên.');
}

function editRegisteredBatch(registryId) {
  const record = getRegisteredBatch(registryId);
  if (!record) return;
  editingBatchRegistryId = record.id;
  editingBatchRegistryGroupIds = new Set(record.groupIds);
  registryDraftGroupIds = new Set(record.groupIds);
  if (el.batchRegistryName) el.batchRegistryName.value = record.name;
  if (el.batchRegistryDescription) el.batchRegistryDescription.value = record.description || '';
  if (el.batchRegistryFanpageName) el.batchRegistryFanpageName.value = record.fanpage?.name || '';
  if (el.batchRegistryFanpageUrl) el.batchRegistryFanpageUrl.value = record.fanpage?.url || '';
  if (el.batchRegistryGroupSearch) el.batchRegistryGroupSearch.value = '';
  if (el.batchRegistryMembershipFilter) {
    const editingOption = el.batchRegistryMembershipFilter.querySelector('option[value="editing"]');
    if (editingOption) editingOption.disabled = false;
    el.batchRegistryMembershipFilter.value = 'editing';
  }
  if (el.batchRegistryFormTitle) el.batchRegistryFormTitle.textContent = `Sửa lô: ${record.name}`;
  if (el.batchRegistryFormNote) el.batchRegistryFormNote.textContent = 'Tích thêm hoặc bỏ group, sau đó bấm Lưu thay đổi.';
  if (el.batchRegistrySaveButton) el.batchRegistrySaveButton.textContent = 'Lưu thay đổi';
  if (el.batchRegistryCancelEditButton) el.batchRegistryCancelEditButton.hidden = false;
  if (el.batchRegistryMessage) el.batchRegistryMessage.textContent = '';
  renderBatchRegistryGroupList();
  document.querySelector('#batch-registry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`Đang sửa lô “${record.name}”. Anh có thể thêm hoặc bỏ group.`);
}

function cancelRegisteredBatchEdit() {
  editingBatchRegistryId = '';
  editingBatchRegistryGroupIds = new Set();
  registryDraftGroupIds = new Set();
  el.batchRegistryForm?.reset();
  if (el.batchRegistryMembershipFilter) {
    el.batchRegistryMembershipFilter.value = 'all';
    const editingOption = el.batchRegistryMembershipFilter.querySelector('option[value="editing"]');
    if (editingOption) editingOption.disabled = true;
  }
  if (el.batchRegistryFormTitle) el.batchRegistryFormTitle.textContent = 'Đăng ký fanpage / lô group';
  if (el.batchRegistryFormNote) el.batchRegistryFormNote.textContent = 'Chọn fanpage để lưu riêng hoặc chọn các group muốn đi cùng nhau trong một lô.';
  if (el.batchRegistrySaveButton) el.batchRegistrySaveButton.textContent = 'Lưu đăng ký lô';
  if (el.batchRegistryCancelEditButton) el.batchRegistryCancelEditButton.hidden = true;
  if (el.batchRegistryMessage) el.batchRegistryMessage.textContent = '';
  renderBatchRegistryGroupList();
}

function saveRegisteredBatch(event) {
  event.preventDefault();
  const enteredName = el.batchRegistryName?.value.trim() || '';
  const description = el.batchRegistryDescription?.value.trim() || '';
  const fanpageName = el.batchRegistryFanpageName?.value.trim() || '';
  const enteredFanpageUrl = el.batchRegistryFanpageUrl?.value.trim() || '';
  const fanpageUrl = enteredFanpageUrl && !/^https?:\/\//i.test(enteredFanpageUrl) ? `https://${enteredFanpageUrl}` : enteredFanpageUrl;
  const name = enteredName || fanpageName || (fanpageUrl ? 'Fanpage chưa đặt tên' : '');
  const groupIds = [...registryDraftGroupIds];
  if (!name) {
    if (el.batchRegistryMessage) el.batchRegistryMessage.textContent = 'Hãy nhập tên lô hoặc tên fanpage.';
    el.batchRegistryName?.focus();
    return;
  }
  if (!groupIds.length && !fanpageName && !fanpageUrl) {
    if (el.batchRegistryMessage) el.batchRegistryMessage.textContent = 'Hãy nhập fanpage hoặc chọn ít nhất một group.';
    return;
  }
  const duplicateName = batchRegistry.find((item) => item.id !== editingBatchRegistryId && normalize(item.name) === normalize(name));
  if (duplicateName) {
    if (el.batchRegistryMessage) el.batchRegistryMessage.textContent = `Tên lô này đã tồn tại ở “${duplicateName.name}”.`;
    el.batchRegistryName?.focus();
    return;
  }
  const now = new Date().toISOString();
  const existing = editingBatchRegistryId ? getRegisteredBatch(editingBatchRegistryId) : null;
  const fanpage = fanpageName || fanpageUrl ? { name: fanpageName, url: fanpageUrl } : null;
  const record = { id: existing?.id || createId(), name, description, fanpage, groupIds, createdAt: existing?.createdAt || now, updatedAt: now };
  batchRegistry = existing
    ? batchRegistry.map((item) => item.id === existing.id ? record : item)
    : [record, ...batchRegistry];
  saveBatchRegistry();
  if (existing && getSelectedRegistryIds().includes(existing.id)) {
    batchSelection = { ...batchSelection, groupIds: getSelectedRegistryGroupIds(), fanpages: getSelectedRegistryFanpages(), updatedAt: now };
    saveBatchSelection();
  }
  const action = existing ? (groupIds.length ? 'Cập nhật lô group' : 'Cập nhật fanpage') : (groupIds.length ? 'Đăng ký lô group' : 'Đăng ký fanpage');
  const message = existing
    ? `Đã cập nhật “${name}”${groupIds.length ? ` gồm ${groupIds.length} group` : ''}${fanpage ? ' và fanpage' : ''}.`
    : `Đã lưu ${groupIds.length ? `lô “${name}” gồm ${groupIds.length} group` : `fanpage “${name}”`}${fanpageUrl ? '.' : ''}`;
  cancelRegisteredBatchEdit();
  renderContentLibrary();
  renderTable();
  recordAudit(action, `${name} · ${groupIds.length} group`);
  showToast(message);
}

function getBatchMode() {
  return BATCH_MODE_LABELS[batchSelection?.mode] ? batchSelection.mode : 'unknown';
}

function getBatchModeLabel(mode = getBatchMode()) {
  return BATCH_MODE_LABELS[mode] || BATCH_MODE_LABELS.unknown;
}

function getBatchSelectionMode() {
  return batchSelection?.selectionMode === 'registry' || getSelectedRegistryIds().length ? 'manual' : 'topic';
}

function getBatchSelectionChoice() {
  return batchSelection?.selectionMode === 'registry' || getSelectedRegistryIds().length ? 'registry' : 'topic';
}

function updateBatchMode(mode) {
  if (!BATCH_MODE_LABELS[mode]) return;
  const nextSelection = { ...batchSelection, mode, updatedAt: new Date().toISOString() };
  if (mode !== 'real') delete nextSelection.inheritedFrom;
  batchSelection = nextSelection;
  saveBatchSelection();
  const content = contents.find((item) => item.id === batchSelection.contentId);
  recordAudit('Đổi loại dữ liệu lô', `${getBatchModeLabel(mode)}${content ? ` · ${content.title}` : ''}`);
  render();
  showToast(`Đã đặt lô hiện tại là ${getBatchModeLabel(mode)}.`);
}

function loadAuditLog() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveAuditLog(log) {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(log.slice(0, 100)));
  scheduleAuditSync();
}

function clearOperationalData() {
  const message = 'Xóa toàn bộ dữ liệu vận hành trên trình duyệt này?\n\nSẽ xóa group, nội dung, hàng đợi, lịch sử, số liệu, quyết định, bản chụp cục bộ và poster IndexedDB. App và tài khoản không bị xóa.';
  if (!confirm(message)) return;
  sessionStorage.setItem(RESET_PENDING_SESSION_KEY, '1');
  [groupSyncTimer, contentSyncTimer, queueSyncTimer, auditSyncTimer].forEach((timer) => clearTimeout(timer));
  groupSyncEnabled = false;
  contentSyncEnabled = false;
  queueSyncEnabled = false;
  auditSyncEnabled = false;
  groups = [];
  contents = [];
  selectedContentId = null;
  batchSelection = { contentId: '', groupIds: [], mode: 'unknown', topicFilters: null };
  Object.keys(localStorage)
    .filter((key) => key.startsWith('mkt-fanpage.'))
    .forEach((key) => localStorage.removeItem(key));
  const request = indexedDB.deleteDatabase(POSTER_DB_NAME);
  request.onsuccess = () => window.location.reload();
  request.onerror = () => window.location.reload();
  request.onblocked = () => window.location.reload();
}

function recordAudit(action, detail) {
  const log = loadAuditLog();
  log.unshift({ id: createId(), action, detail, at: new Date().toISOString() });
  saveAuditLog(log);
  renderAuditLog();
}

function scheduleAuditSync() {
  if (!auditSyncEnabled) return;
  clearTimeout(auditSyncTimer);
  auditSyncTimer = setTimeout(() => { syncAuditToOnline(); }, 900);
}

async function loadAuditFromOnline() {
  const response = await fetch('/api/audit', { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Không thể tải nhật ký online.');
  const remote = Array.isArray(payload.audit) ? payload.audit : [];
  const local = loadAuditLog();
  const merged = [...remote, ...local].reduce((items, item) => {
    if (item?.id && !items.some((saved) => saved.id === item.id)) items.push(item);
    return items;
  }, []).sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime()).slice(0, 100);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(merged));
  renderAuditLog();
  return remote.length;
}

async function syncAuditToOnline() {
  if (!auditSyncEnabled || auditSyncInFlight) return;
  auditSyncInFlight = true;
  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ audit: loadAuditLog() })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể lưu nhật ký online.');
    const status = document.querySelector('#auditSyncStatus');
    if (status) { status.textContent = 'Nhật ký: đang đồng bộ online'; status.classList.add('is-ready'); status.classList.remove('is-error'); }
  } catch {
    const status = document.querySelector('#auditSyncStatus');
    if (status) { status.textContent = 'Nhật ký: đang ở bản trình duyệt · chờ đồng bộ'; status.classList.add('is-error'); status.classList.remove('is-ready'); }
  } finally {
    auditSyncInFlight = false;
  }
}

function loadBatchDecisions() {
  try {
    const saved = JSON.parse(localStorage.getItem(DECISION_STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function saveBatchDecisions(decisions) {
  localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify(decisions));
  persistDecisionsToQueue(decisions);
}

function persistDecisionsToQueue(decisions) {
  const queue = loadQueue();
  let changed = false;
  queue.forEach((entry) => {
    const next = {};
    (entry.groupIds || []).forEach((groupId) => {
      const decision = decisions[getBatchDecisionKey(entry.contentId, groupId)];
      if (decision) next[groupId] = decision;
    });
    if (JSON.stringify(entry.decisions || {}) !== JSON.stringify(next)) {
      entry.decisions = next;
      changed = true;
    }
  });
  if (changed) saveQueue(queue);
}

function getBatchDecisionKey(contentId, groupId) {
  return `${contentId}::${groupId}`;
}

function normalizeAudience(value = '') {
  return normalize(value).replace(/[,.;|/]+/g, ' ').split(/\s+/).filter((word) => word.length > 2);
}

function getGroupTopicOptions() {
  const topics = new Map();
  groups.forEach((group) => {
    const topic = typeof group.topic === 'string' ? group.topic.trim() : '';
    if (topic && !topics.has(normalize(topic))) topics.set(normalize(topic), topic);
  });
  return [...topics.values()].sort((a, b) => a.localeCompare(b, 'vi'));
}

function getSelectedBatchTopics(content, topicOptions = getGroupTopicOptions()) {
  if (Array.isArray(batchSelection.topicFilters)) {
    const selectedKeys = new Set(batchSelection.topicFilters.map(normalize));
    return topicOptions.filter((topic) => selectedKeys.has(normalize(topic)));
  }
  const contentTopic = typeof content?.topic === 'string' ? content.topic.trim() : '';
  const contentKey = normalize(contentTopic);
  return topicOptions.filter((topic) => normalize(topic) === contentKey);
}

function getMatchingGroups(content, topicScope) {
  const contentTopic = normalize(content.topic);
  const selectedTopics = topicScope === undefined ? getSelectedBatchTopics(content) : topicScope;
  const topicKeys = new Set((selectedTopics || []).map(normalize).filter(Boolean));
  if (!contentTopic && !topicKeys.size) return [];
  const contentAudience = new Set(normalizeAudience(content.audience));
  return groups
    .filter((group) => topicKeys.has(normalize(group.topic)))
    .filter((group) => !['rejected', 'inactive'].includes(group.status))
    .map((group) => {
      const overlap = normalizeAudience(group.audience).filter((word) => contentAudience.has(word)).length;
      return { group, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap || (Number(b.group.approvalRate) || 0) - (Number(a.group.approvalRate) || 0));
}

function getManualBatchGroups() {
  return groups
    .filter((group) => !['rejected', 'inactive'].includes(group.status))
    .filter((group) => Boolean(group.url && group.topic?.trim() && group.audience?.trim()))
    .sort((a, b) => String(a.topic || '').localeCompare(String(b.topic || ''), 'vi') || String(a.name || '').localeCompare(String(b.name || ''), 'vi'))
    .map((group) => ({ group, overlap: 0 }));
}

function getBatchCandidates(content, topicScope) {
  if (getBatchSelectionChoice() === 'registry') {
    const registeredIds = new Set(getSelectedRegistryGroupIds());
    if (!registeredIds.size) return [];
    return getManualBatchGroups().filter(({ group }) => registeredIds.has(group.id));
  }
  return getBatchSelectionMode() === 'manual'
    ? getManualBatchGroups()
    : getMatchingGroups(content, topicScope);
}

function getQueuedGroupIdsForBatch(contentId, mode = getBatchMode()) {
  if (!contentId) return new Set();
  return new Set(loadQueue()
    .filter((entry) => entry.contentId === contentId && (entry.mode || 'unknown') === mode)
    .flatMap((entry) => entry.groupIds || []));
}

function getAvailableMatchingGroups(content) {
  const queuedIds = getQueuedGroupIdsForBatch(content?.id);
  return getBatchCandidates(content).filter(({ group }) => !queuedIds.has(group.id));
}

function normalize(value = '') {
  return value.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeUrl(value = '') {
  return value.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/[/?#]+$/, '');
}

function normalizeGroupUrlKey(value = '') {
  const href = safeUrl(value);
  if (!href) return normalizeUrl(value);
  const parsed = new URL(href);
  const hostname = parsed.hostname.toLowerCase().replace(/^(?:www|m|mbasic|web)\./, '');
  const pathParts = parsed.pathname.split('/').filter(Boolean);
  if (hostname === 'facebook.com') {
    const groupsIndex = pathParts.findIndex((part) => part.toLowerCase() === 'groups');
    const groupIdentifier = groupsIndex >= 0 ? pathParts[groupsIndex + 1] : '';
    if (groupIdentifier) return `facebook.com/groups/${groupIdentifier.toLowerCase()}`;
  }
  const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
  return `${hostname}${pathname}`.toLowerCase();
}

function findDuplicateGroup({ url = '' }, candidates = groups, ignoreId = '') {
  const urlKey = normalizeGroupUrlKey(url);
  const duplicateByUrl = candidates.find((group) => group.id !== ignoreId && normalizeGroupUrlKey(group.url) === urlKey);
  return duplicateByUrl ? { group: duplicateByUrl, reason: 'id' } : null;
}

function getDuplicateKeeperScore(group) {
  const statusScore = { ready: 500, testing: 400, pending: 300, inactive: 200, rejected: 100 }[group.status] || 0;
  const completeness = [group.topic, group.audience, group.notes].filter((value) => String(value || '').trim()).length * 20;
  const directFacebookLink = normalizeGroupUrlKey(group.url).startsWith('facebook.com/groups/') ? 40 : 0;
  const approval = Math.max(0, Math.min(100, Number(group.approvalRate) || 0));
  return statusScore + completeness + directFacebookLink + approval;
}

function getDuplicateGroupClusters() {
  const parent = new Map(groups.map((group) => [group.id, group.id]));
  const order = new Map(groups.map((group, index) => [group.id, index]));
  const find = (id) => {
    const current = parent.get(id);
    if (!current || current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  const union = (firstId, secondId) => {
    const firstRoot = find(firstId);
    const secondRoot = find(secondId);
    if (firstRoot !== secondRoot) parent.set(secondRoot, firstRoot);
  };
  const firstByGroupId = new Map();
  groups.forEach((group) => {
    const groupIdKey = normalizeGroupUrlKey(group.url);
    if (groupIdKey) {
      if (firstByGroupId.has(groupIdKey)) union(firstByGroupId.get(groupIdKey), group.id);
      else firstByGroupId.set(groupIdKey, group.id);
    }
  });
  const buckets = new Map();
  groups.forEach((group) => {
    const root = find(group.id);
    if (!buckets.has(root)) buckets.set(root, []);
    buckets.get(root).push(group);
  });
  return [...buckets.values()].filter((items) => items.length > 1).map((items) => {
    const sorted = [...items].sort((a, b) => getDuplicateKeeperScore(b) - getDuplicateKeeperScore(a)
      || Date.parse(b.updatedAt || '') - Date.parse(a.updatedAt || '')
      || (order.get(a.id) || 0) - (order.get(b.id) || 0));
    const groupIdCounts = new Map();
    items.forEach((group) => {
      const groupIdKey = normalizeGroupUrlKey(group.url);
      if (groupIdKey) groupIdCounts.set(groupIdKey, (groupIdCounts.get(groupIdKey) || 0) + 1);
    });
    const reasons = [...groupIdCounts.values()].some((count) => count > 1) ? ['trùng ID/link group'] : [];
    return { keeper: sorted[0], duplicates: sorted.slice(1), reasons };
  });
}

function updateDuplicateDeleteButton() {
  if (!el.deleteSelectedDuplicateGroups || !el.duplicateGroupsList) return;
  const count = el.duplicateGroupsList.querySelectorAll('[data-duplicate-delete]:checked').length;
  el.deleteSelectedDuplicateGroups.disabled = count === 0;
  el.deleteSelectedDuplicateGroups.textContent = count ? `Xóa ${count} group đã chọn` : 'Xóa group đã chọn';
}

function openDuplicateGroupsDialog() {
  if (!el.duplicateGroupsDialog || !el.duplicateGroupsList || !el.duplicateGroupsSummary) return;
  duplicateGroupClusters = getDuplicateGroupClusters();
  const duplicateCount = duplicateGroupClusters.reduce((sum, cluster) => sum + cluster.duplicates.length, 0);
  el.duplicateGroupsSummary.textContent = duplicateGroupClusters.length
    ? `Tìm thấy ${duplicateGroupClusters.length} cụm trùng · ${duplicateCount} bản có thể xóa. App đã chọn sẵn bản nên giữ; anh có thể bỏ tích trước khi xóa.`
    : 'Không phát hiện group trùng theo ID/link group.';
  el.duplicateGroupsList.innerHTML = duplicateGroupClusters.length ? duplicateGroupClusters.map((cluster, clusterIndex) => {
    const keeper = cluster.keeper;
    const duplicateRows = cluster.duplicates.map((group) => `<label class="duplicate-group-row"><input type="checkbox" data-duplicate-delete value="${escapeHtml(group.id)}" data-duplicate-keeper="${escapeHtml(keeper.id)}" checked><span class="duplicate-group-copy"><strong>${escapeHtml(group.name)}</strong><small>${escapeHtml(group.url)} · ${escapeHtml(statusLabels[group.status] || 'Không rõ')}</small></span><span class="duplicate-group-badge is-delete">Xóa</span></label>`).join('');
    return `<section class="duplicate-group-cluster"><div class="duplicate-group-cluster-heading"><strong>Cụm trùng ${clusterIndex + 1}</strong><small>${escapeHtml(cluster.reasons.join(' + ') || 'trùng dữ liệu')}</small></div><div class="duplicate-group-row is-keeper"><span aria-hidden="true">✓</span><span class="duplicate-group-copy"><strong>${escapeHtml(keeper.name)}</strong><small>${escapeHtml(keeper.url)} · ${escapeHtml(statusLabels[keeper.status] || 'Không rõ')}</small></span><span class="duplicate-group-badge">Giữ lại</span></div>${duplicateRows}</section>`;
  }).join('') : '<div class="duplicate-groups-empty"><strong>Dữ liệu đã sạch</strong><br><small>Không có group nào cần xóa.</small></div>';
  updateDuplicateDeleteButton();
  el.duplicateGroupsDialog.showModal();
}

function closeDuplicateGroupsDialog() {
  el.duplicateGroupsDialog?.close();
  duplicateGroupClusters = [];
}

function remapGroupIdList(groupIds, replacements) {
  return [...new Set((groupIds || []).map((groupId) => replacements.get(groupId) || groupId).filter(Boolean))];
}

function remapGroupKeyedData(source, replacements, fieldName) {
  if (!source || typeof source !== 'object') return source;
  const next = { ...source };
  const statusRank = { approved: 8, sent: 7, pending: 6, rejected: 5, error: 4, skipped: 3, draft: 2 };
  replacements.forEach((keeperId, duplicateId) => {
    if (!Object.prototype.hasOwnProperty.call(next, duplicateId)) return;
    const duplicateValue = next[duplicateId];
    if (!Object.prototype.hasOwnProperty.call(next, keeperId)) next[keeperId] = duplicateValue;
    else if (fieldName === 'groupStatuses' && (statusRank[duplicateValue] || 0) > (statusRank[next[keeperId]] || 0)) next[keeperId] = duplicateValue;
    else if (fieldName === 'metricsHistory' && Array.isArray(duplicateValue) && Array.isArray(next[keeperId])) {
      next[keeperId] = [...next[keeperId], ...duplicateValue].slice(-10);
    } else if (fieldName === 'postingHistory' && Array.isArray(duplicateValue) && Array.isArray(next[keeperId])) {
      const events = new Map([...next[keeperId], ...duplicateValue].map((event) => [event.id || `${event.entryId || ''}|${event.at || ''}`, event]));
      next[keeperId] = [...events.values()].sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
    }
    delete next[duplicateId];
  });
  return next;
}

function remapPostingRunItemKey(key, replacements) {
  const parts = String(key || '').split('|');
  if (parts.length < 2) return key;
  const groupId = parts.pop();
  return [...parts, replacements.get(groupId) || groupId].join('|');
}

function remapPostingRunRecord(record, replacements) {
  if (!record || typeof record !== 'object') return record;
  const next = { ...record };
  if (next.groupId) next.groupId = replacements.get(next.groupId) || next.groupId;
  if (Array.isArray(next.itemKeys)) next.itemKeys = [...new Set(next.itemKeys.map((key) => remapPostingRunItemKey(key, replacements)))];
  if (Array.isArray(next.groupResults)) {
    next.groupResults = next.groupResults.map((item) => ({ ...item, groupId: replacements.get(item.groupId) || item.groupId }))
      .filter((item, index, items) => items.findIndex((candidate) => candidate.groupId === item.groupId) === index);
  }
  return next;
}

function deleteSelectedDuplicateGroups() {
  if (!el.duplicateGroupsList) return;
  const selected = [...el.duplicateGroupsList.querySelectorAll('[data-duplicate-delete]:checked')];
  if (!selected.length) {
    showToast('Chưa chọn group trùng nào để xóa.');
    return;
  }
  const replacements = new Map(selected.map((input) => [input.value, input.dataset.duplicateKeeper]));
  if (!window.confirm(`Xóa ${replacements.size} group trùng đã chọn?\n\nApp sẽ giữ lại bản chính, chuyển tham chiếu trong lô và hàng đợi sang bản đó, đồng thời tạo một bản chụp cục bộ để có thể khôi phục.`)) return;
  if (!createPreRestoreSnapshot({ recordAuditEntry: false })) {
    showToast('Không tạo được bản chụp an toàn nên chưa xóa group trùng.');
    return;
  }

  const queue = loadQueue().map((entry) => {
    const next = { ...entry, groupIds: remapGroupIdList(entry.groupIds, replacements), updatedAt: new Date().toISOString() };
    ['groupStatuses', 'groupPostedUrls', 'groupPostedAt', 'groupApprovalCheckedAt', 'groupErrors', 'nextChecks', 'metrics', 'metricsHistory', 'decisions', 'postingHistory'].forEach((field) => {
      if (entry[field]) next[field] = remapGroupKeyedData(entry[field], replacements, field);
    });
    return next;
  });
  saveQueue(queue);

  batchSelection = { ...batchSelection, groupIds: remapGroupIdList(batchSelection.groupIds, replacements), updatedAt: new Date().toISOString() };
  saveBatchSelection();
  batchRegistry = batchRegistry.map((item) => ({ ...item, groupIds: remapGroupIdList(item.groupIds, replacements), updatedAt: new Date().toISOString() }));
  saveBatchRegistry();
  registryDraftGroupIds = new Set(remapGroupIdList([...registryDraftGroupIds], replacements));

  const decisions = loadBatchDecisions();
  Object.entries({ ...decisions }).forEach(([key, value]) => {
    const divider = key.lastIndexOf('::');
    if (divider < 0) return;
    const contentId = key.slice(0, divider);
    const groupId = key.slice(divider + 2);
    const keeperId = replacements.get(groupId);
    if (!keeperId) return;
    const keeperKey = getBatchDecisionKey(contentId, keeperId);
    if (!decisions[keeperKey]) decisions[keeperKey] = value;
    delete decisions[key];
  });
  saveBatchDecisions(decisions);

  const activeRun = loadPostingRun();
  if (activeRun) savePostingRun(remapPostingRunRecord(activeRun, replacements));
  const runView = loadPostingRunView();
  if (runView) savePostingRunView(remapPostingRunRecord(runView, replacements));
  const runSummary = loadPostingRunSummary();
  if (runSummary) savePostingRunSummary(remapPostingRunRecord(runSummary, replacements));
  const runHistory = loadPostingRunHistory().map((item) => remapPostingRunRecord(item, replacements));
  writePostingRunHistory(runHistory);

  groups = groups.filter((group) => !replacements.has(group.id));
  saveGroups();
  closeDuplicateGroupsDialog();
  render();
  recordAudit('Xóa group trùng', `${replacements.size} group · đã giữ và chuyển tham chiếu sang bản chính`);
  showToast(`Đã xóa ${replacements.size} group trùng. Có bản chụp cục bộ để khôi phục nếu cần.`);
}

function safeUrl(value = '') {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

async function syncGroupsToSupabase() {
  if (!groups.length) {
    showToast('Chưa có group để đồng bộ.');
    return;
  }
  const button = el.syncGroupsButton;
  const status = el.syncGroupsStatus;
  if (!button || !status) return;
  button.disabled = true;
  status.textContent = 'Đang kiểm tra trước khi đồng bộ...';
  status.classList.remove('is-error', 'is-ready');
  try {
    const previewResponse = await fetch('/api/groups/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ groups, replace: true })
    });
    const preview = await previewResponse.json().catch(() => ({}));
    if (!previewResponse.ok) throw new Error(preview.message || 'Không thể kiểm tra danh sách group.');

    const summary = [
      `Tổng dữ liệu hiện tại: ${preview.total || 0} group`,
      `Sẽ thêm mới: ${preview.newCount || 0} group`,
      `Sẽ cập nhật: ${preview.updateCount || 0} group`,
      `Bỏ qua do trùng trong danh sách: ${preview.duplicateCount || 0} group`,
      `Bỏ qua do thiếu tên hoặc link hợp lệ: ${preview.invalidCount || 0} group`,
      '',
      'Anh có muốn đồng bộ lên Supabase không?'
    ].join('\n');
    if (!window.confirm(summary)) {
      status.textContent = 'Đã kiểm tra — chưa đồng bộ';
      showToast('Đã hủy. Chưa có dữ liệu group nào được ghi lên Supabase.');
      return;
    }

    status.textContent = 'Đang đồng bộ...';
    const response = await fetch('/api/groups/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ groups })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể đồng bộ group.');
    const synced = Number(payload.synced) || 0;
    status.textContent = `Đã đồng bộ ${synced} group`;
    status.classList.add('is-ready');
    showToast(`Đã đồng bộ ${synced} group lên Supabase.`);
    recordAudit('Đồng bộ group lên Supabase', `${synced} group`);
  } catch (error) {
    status.textContent = 'Đồng bộ lỗi';
    status.classList.add('is-error');
    showToast(error.message || 'Không thể đồng bộ group.');
  } finally {
    button.disabled = false;
  }
}

function escapeHtml(value = '') {
  return value.toString().replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function getFilteredGroups() {
  const query = normalize(el.search.value);
  const topic = el.topic.value;
  const status = el.status.value;
  const batchMembership = el.batchMembership?.value || 'all';
  const registeredGroupIds = new Set(batchRegistry.flatMap((item) => item.groupIds || []));
  const queuedGroupIds = new Set(loadQueue().flatMap((entry) => entry.groupIds || []));
  const currentBatchGroupIds = new Set(getSelectedRegistryGroupIds());
  return groups
    .filter((group) => topic === 'all' || group.topic === topic)
    .filter((group) => status === 'all' || group.status === status)
    .filter((group) => {
      if (batchMembership === 'unregistered') return !registeredGroupIds.has(group.id);
      if (batchMembership === 'registered') return registeredGroupIds.has(group.id);
      if (batchMembership === 'not-queued') return !queuedGroupIds.has(group.id);
      if (batchMembership === 'not-current') return !currentBatchGroupIds.has(group.id);
      return true;
    })
    .filter((group) => !query || normalize([group.name, group.topic, group.audience, group.notes].join(' ')).includes(query))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function renderStats() {
  const total = groups.length;
  const ready = groups.filter((group) => group.status === 'ready').length;
  const pending = groups.filter((group) => ['testing', 'pending'].includes(group.status)).length;
  const attention = groups.filter((group) => group.status === 'rejected' || !group.topic || !group.url).length;
  el.total.textContent = total;
  el.ready.textContent = ready;
  el.readyRate.textContent = `${total ? Math.round((ready / total) * 100) : 0}% tổng danh mục`;
  el.pending.textContent = pending;
  el.attention.textContent = attention;
}

function renderTopics() {
  const current = el.topic.value || 'all';
  const topics = [...new Set(groups.map((group) => group.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  el.topic.innerHTML = '<option value="all">Tất cả chủ đề</option>' + topics.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join('');
  el.topic.value = topics.includes(current) ? current : 'all';
}

function renderRouting() {
  const hasClassification = (group) => Boolean(group.topic?.trim() && group.audience?.trim());
  const routable = groups.filter((group) => hasClassification(group) && !['rejected', 'inactive'].includes(group.status));
  const testing = groups.filter((group) => ['testing', 'pending'].includes(group.status));
  const unclassified = groups.filter((group) => !hasClassification(group));
  el.routableGroups.textContent = routable.length;
  el.testGroups.textContent = testing.length;
  el.unclassifiedGroups.textContent = unclassified.length;

  const byTopic = groups.reduce((map, group) => {
    const topic = group.topic?.trim() || 'Chưa phân loại';
    if (!map.has(topic)) map.set(topic, []);
    map.get(topic).push(group);
    return map;
  }, new Map());
  const cards = [...byTopic.entries()].sort((a, b) => b[1].length - a[1].length).map(([topic, topicGroups]) => {
    const average = Math.round(topicGroups.reduce((sum, group) => sum + (Number(group.approvalRate) || 0), 0) / topicGroups.length);
    const audiences = [...new Set(topicGroups.map((group) => group.audience?.trim()).filter(Boolean))].slice(0, 2);
    const audienceText = audiences.length ? `Tệp: ${audiences.join(' · ')}` : 'Chưa có tệp người xem';
    return `<article class="topic-card"><div class="topic-card-head"><strong>${escapeHtml(topic)}</strong><span class="topic-count">${topicGroups.length} group</span></div><p>${escapeHtml(audienceText)}<br>TB tỷ lệ duyệt: ${average}%</p><button type="button" data-topic-route="${escapeHtml(topic)}">Xem các group này →</button></article>`;
  }).join('');
  el.topicCards.innerHTML = cards || '<p class="updated">Chưa có dữ liệu chủ đề.</p>';
}

function scheduleContentBatchRefresh() {
  clearTimeout(contentBatchRefreshTimer);
  contentBatchRefreshTimer = setTimeout(() => {
    contentBatchRefreshTimer = null;
    renderBatchPreparation();
    renderBatchQueueDraft();
    renderBatchQueueReview();
    renderBatchStatusTracking();
  }, 120);
}

function renderContentLibrary({ renderBatchSections = true } = {}) {
  syncSelectedContentToBatchSelection();
  updateContentRetentionStatus();
  const approved = contents.filter(isApprovedContent).length;
  el.totalContent.textContent = contents.length;
  el.draftContent.textContent = contents.length - approved;
  el.approvedContent.textContent = approved;
  if (renderBatchSections) {
    renderBatchRegistry();
    renderBatchSchedule();
    renderBatchPreparation();
    renderBatchQueueDraft();
    renderBatchQueueReview();
    renderBatchStatusTracking();
  }
  if (!contents.length) {
    el.contentCards.innerHTML = '<div class="content-empty">Chưa có nội dung. Hãy thêm bản tóm tắt đầu tiên để bắt đầu ghép group.</div>';
    el.matchingPanel.innerHTML = '<div class="matching-empty"><span aria-hidden="true">↗</span><strong>Chọn một nội dung</strong><p>App sẽ tìm các group cùng chủ đề và loại bỏ group đã tạm dừng hoặc bị từ chối.</p></div>';
    return;
  }
  if (!contents.some((content) => content.id === selectedContentId)) selectedContentId = sortContentsByCreatedAt(contents)[0].id;
  syncSelectedContentToBatchSelection();
  const sortedContents = sortContentsByCreatedAt(contents);
  const visibleContents = sortedContents.slice(0, contentVisibleLimit);
  const hiddenCount = Math.max(0, sortedContents.length - visibleContents.length);
  const contentListFooter = hiddenCount
    ? `<div class="content-list-footer"><span>Đang hiển thị ${visibleContents.length.toLocaleString('vi-VN')} / ${sortedContents.length.toLocaleString('vi-VN')} bài</span><button type="button" class="button secondary" data-load-more-content>Hiển thị thêm ${Math.min(CONTENT_VISIBLE_PAGE_SIZE, hiddenCount)} bài</button></div>`
    : `<div class="content-list-footer"><span>Đang hiển thị ${sortedContents.length.toLocaleString('vi-VN')} bài</span></div>`;
  el.contentCards.innerHTML = visibleContents.map((content) => `
    <article class="content-card${content.id === selectedContentId ? ' selected' : ''}" data-content-id="${escapeHtml(content.id)}">
      <div class="content-card-top"><strong>${escapeHtml(getContentDisplayTitle(content))}</strong><span class="content-status ${isApprovedContent(content) ? 'approved' : ''}">${isApprovedContent(content) ? 'Đã duyệt' : 'Bản nháp'}</span></div>
      ${hasPoster(content) && getPosterSrc(content) ? `<img class="content-poster" src="${escapeHtml(getPosterSrc(content))}" alt="Poster của ${escapeHtml(getContentDisplayTitle(content))}">` : ''}
      <p>${escapeHtml(content.summary)}</p>
      <div class="content-meta"><span class="content-tag">${escapeHtml(content.topic)}</span><span class="content-tag">${escapeHtml(content.format === 'poster' ? 'Bài + poster' : content.format === 'short' ? 'Bài ngắn' : 'Bài viết')}</span></div>
      <div class="content-card-actions"><span>${hasPoster(content) ? 'Có poster · Lưu cục bộ' : 'Chưa có poster'}</span><div class="content-card-action-buttons"><button type="button" class="button ${content.id === selectedContentId ? 'primary' : 'secondary'}" data-select-content="${escapeHtml(content.id)}">${content.id === selectedContentId ? 'Đang chọn' : 'Chọn bài'}</button><button type="button" class="button secondary" data-edit-content="${escapeHtml(content.id)}">Sửa nội dung</button><button type="button" class="button danger" data-delete-content="${escapeHtml(content.id)}">Xóa bài</button></div></div>
    </article>`).join('') + contentListFooter;
  renderMatching();
  void hydratePosterAssets(visibleContents.slice(0, CONTENT_POSTER_HYDRATE_LIMIT)).catch(() => {});
}

function getBatchQueueGroups() {
  const content = contents.find((item) => item.id === batchSelection.contentId && isApprovedContent(item));
  if (!content) return { content: null, groups: [] };
  const matchingIds = new Set(getBatchCandidates(content).map(({ group }) => group.id));
  const selectedIds = [...new Set(batchSelection.groupIds || [])].filter((groupId) => matchingIds.has(groupId));
  return { content, groups: selectedIds.map((groupId) => groups.find((group) => group.id === groupId)).filter(Boolean) };
}

function renderBatchQueueDraft() {
  if (!el.createBatchQueueButton) return;
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  const selectedFanpages = getBatchSelectionChoice() === 'registry' ? getSelectedRegistryFanpages() : [];
  const queue = loadQueue();
  const existingIds = new Set(queue.filter((entry) => entry.contentId === content?.id && (entry.mode || 'unknown') === getBatchMode()).flatMap((entry) => entry.groupIds || []));
  const newGroups = selectedGroups.filter((group) => !existingIds.has(group.id));
  const existingCount = selectedGroups.length - newGroups.length;
  const fanpageAlreadyQueued = selectedFanpages.some((fanpage) => queue.some((entry) => entry.contentId === content?.id && (entry.mode || 'unknown') === getBatchMode() && (entry.fanpages || []).some((candidate) => normalize(candidate.name) === normalize(fanpage.name) && candidate.url === fanpage.url)));

  el.batchQueueContentLabel.textContent = content ? getContentDisplayTitle(content) : 'Chưa có danh sách';
  el.batchQueueContentNote.textContent = content ? `${selectedGroups.length} group${selectedFanpages.length ? ` · ${selectedFanpages.length} fanpage` : ''} đã xác nhận · ${getBatchModeLabel()} · ${hasPoster(content) ? 'Có poster cục bộ' : 'Chưa có poster'}` : 'Hãy hoàn tất bước 2 trước.';
  if (el.batchQueueFanpageSummary) {
    el.batchQueueFanpageSummary.innerHTML = selectedFanpages.length
      ? `<strong>Fanpage đã xác nhận</strong><div>${selectedFanpages.map((fanpage) => {
          const alreadyQueued = queue.some((entry) => entry.contentId === content?.id && (entry.mode || 'unknown') === getBatchMode() && (entry.fanpages || []).some((candidate) => normalize(candidate.name) === normalize(fanpage.name) && candidate.url === fanpage.url));
          return `<span class="batch-queue-fanpage-chip"><b>${escapeHtml(fanpage.name || fanpage.url || 'Fanpage')}</b><small>${alreadyQueued ? 'Đã có trong hàng đợi' : 'Sẽ thêm vào hàng đợi nháp'}</small></span>`;
        }).join('')}</div>`
      : '<span class="batch-queue-fanpage-empty">Chưa có fanpage được xác nhận ở bước 2.</span>';
  }
  el.batchQueueNewCount.textContent = String(newGroups.length);
  el.batchQueueExistingCount.textContent = String(existingCount);
  if (!content || (!selectedGroups.length && !selectedFanpages.length)) {
    el.batchQueueMessage.textContent = 'Chưa có group hoặc fanpage đã chọn.';
    el.createBatchQueueButton.disabled = true;
    el.createBatchQueueButton.textContent = 'Tạo hàng đợi nháp';
    return;
  }
  if (!newGroups.length && (!selectedFanpages.length || fanpageAlreadyQueued)) {
    el.batchQueueMessage.textContent = selectedFanpages.length && fanpageAlreadyQueued
      ? 'Group và fanpage đã chọn đều đã có trong hàng đợi của nội dung này.'
      : 'Các group đã chọn đều đã có trong hàng đợi của nội dung này.';
    el.createBatchQueueButton.disabled = true;
    el.createBatchQueueButton.textContent = 'Đã có trong hàng đợi';
    return;
  }
  el.batchQueueMessage.textContent = `Sẵn sàng thêm ${newGroups.length} group${selectedFanpages.length ? ` và ${selectedFanpages.length} fanpage` : ''} vào hàng đợi nháp.`;
  el.createBatchQueueButton.disabled = false;
  el.createBatchQueueButton.textContent = `Tạo hàng đợi nháp (${newGroups.length} group${selectedFanpages.length ? ` · ${selectedFanpages.length} fanpage` : ''})`;
}

function renderBatchQueueReview() {
  if (!el.openPostingQueueButton) return;
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  const queue = loadQueue();
  const items = selectedGroups.map((group) => {
    const entry = queue.find((candidate) => candidate.contentId === content?.id && (candidate.mode || 'unknown') === getBatchMode() && (candidate.groupIds || []).includes(group.id));
    return entry ? { group, entry } : null;
  }).filter(Boolean);
  const mode = getBatchMode();
  const queuedItemsForMode = queue.flatMap((entry) => (entry.groupIds || []).map((groupId) => ({
    entry,
    group: groups.find((item) => item.id === groupId),
    content: contents.find((item) => item.id === entry.contentId),
    groupId
  }))).filter((item) => item.group && item.content && (mode === 'unknown' || (item.entry.mode || 'unknown') === mode));
  const pendingItemsForMode = queuedItemsForMode.filter((item) => getQueueGroupStatus(item.entry, item.groupId) === 'draft');
  const attentionItems = items.filter(({ entry, group }) => ['error', 'rejected'].includes(getQueueGroupStatus(entry, group.id)));
  const readyCount = content && items.length ? items.length : 0;

  el.batchReviewQueueCount.textContent = String(items.length);
  el.batchReviewQueueNote.textContent = content
    ? `${getContentDisplayTitle(content)} · ${selectedGroups.length} group đã xác nhận · ${pendingItemsForMode.length} group chưa đăng trong các lô ${getBatchModeLabel()}`
    : pendingItemsForMode.length ? `${pendingItemsForMode.length} group chưa đăng trong các lô ${getBatchModeLabel()}` : 'Chưa có hàng đợi cho danh sách đã chọn.';
  el.batchReviewReadyCount.textContent = String(readyCount);
  el.batchReviewAttentionCount.textContent = String(attentionItems.length);
  el.batchReviewAttentionNote.textContent = attentionItems.length ? 'Có group bị từ chối hoặc gặp lỗi.' : 'Không có group bị lỗi hoặc từ chối.';
  el.batchReviewQueueMessage.textContent = items.length ? 'Mở Hàng đợi đăng bài để xem toàn bộ group chưa đăng của các lô và sao chép caption/poster.' : 'Hãy tạo hàng đợi nháp trước khi rà soát.';
  el.openPostingQueueButton.disabled = !items.length && !pendingItemsForMode.length;
}

function renderBatchStatusTracking() {
  if (!el.openBatchStatusQueueButton) return;
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  const queue = loadQueue();
  const items = selectedGroups.map((group) => {
    const entry = queue.find((candidate) => candidate.contentId === content?.id && (candidate.mode || 'unknown') === getBatchMode() && (candidate.groupIds || []).includes(group.id));
    return entry ? { group, entry } : null;
  }).filter(Boolean);
  const counts = items.reduce((summary, { entry, group }) => {
    const status = getQueueGroupStatus(entry, group.id);
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});
  const attentionCount = (counts.rejected || 0) + (counts.error || 0);
  const needsUpdate = (counts.draft || 0) + (counts.sent || 0);
  el.batchStatusSentCount.textContent = String(counts.sent || 0);
  el.batchStatusPendingCount.textContent = String(counts.pending || 0);
  el.batchStatusApprovedCount.textContent = String(counts.approved || 0);
  el.batchStatusAttentionCount.textContent = String(attentionCount);
  el.batchStatusAttentionNote.textContent = attentionCount ? `${counts.rejected || 0} bị từ chối · ${counts.error || 0} lỗi.` : 'Không có group bị từ chối hoặc lỗi.';
  if (!items.length) {
    el.batchStatusMessage.textContent = 'Chưa có hàng đợi để theo dõi trạng thái.';
    el.openBatchStatusQueueButton.disabled = true;
    return;
  }
  el.batchStatusMessage.textContent = needsUpdate ? `Còn ${needsUpdate} group cần cập nhật trạng thái sau khi đăng.` : 'Các group trong lô đã có trạng thái duyệt để theo dõi.';
  el.openBatchStatusQueueButton.disabled = false;
}

function renderBatchRegistrySelect() {
  if (!el.batchRegistrySelect) return;
  const available = batchRegistry.filter((item) => item.groupIds.some((groupId) => groups.some((group) => group.id === groupId)) || item.fanpage?.name || item.fanpage?.url);
  const availableIds = new Set(available.map((item) => item.id));
  const selectedIds = getSelectedRegistryIds().filter((id) => availableIds.has(id));
  if (selectedIds.length !== getSelectedRegistryIds().length) {
    batchSelection = {
      ...batchSelection,
      registryIds: selectedIds,
      registryId: selectedIds.length === 1 ? selectedIds[0] : '',
      groupIds: [...new Set(available.filter((item) => selectedIds.includes(item.id)).flatMap((item) => item.groupIds || []))],
      fanpages: getSelectedRegistryFanpages(selectedIds),
      updatedAt: new Date().toISOString()
    };
    saveBatchSelection();
  }
  el.batchRegistrySelect.innerHTML = available.length
    ? available.map((item) => {
      const yesterdayPostedCount = getDailyPostedCountForRegisteredBatch(item, getPreviousLocalRunDateKey());
      const todayPostedCount = getDailyPostedCountForRegisteredBatch(item);
      const totalPostedCount = getPersistentPostedCountForRegisteredBatch(item);
      const fanpageLabel = item.fanpage?.name || item.fanpage?.url ? `Fanpage: ${item.fanpage.name || item.fanpage.url}` : 'Chưa có fanpage';
      const kindLabel = item.groupIds.length ? `${item.groupIds.length} group` : 'Fanpage riêng';
      const schedule = batchSchedules[item.id];
      const scheduleLabel = item.groupIds.length && schedule ? (schedule.enabled ? `Lịch: ${formatBatchScheduleLabel(schedule)}` : 'Lịch: tạm tắt') : '';
      return `<label class="batch-registry-option"><input type="checkbox" data-batch-registry value="${escapeHtml(item.id)}"${selectedIds.includes(item.id) ? ' checked' : ''}><span><strong>${escapeHtml(item.name)}</strong><small>${kindLabel}</small><small>${escapeHtml(fanpageLabel)}</small>${scheduleLabel ? `<small class="batch-registry-schedule">${escapeHtml(scheduleLabel)}</small>` : ''}<small class="batch-registry-daily-count">Hôm qua (${formatLocalRunDateKey(getPreviousLocalRunDateKey())}): ${yesterdayPostedCount} lô · Hôm nay: ${todayPostedCount} lô · Tổng: ${totalPostedCount} lô</small></span></label>`;
    }).join('')
    : '<span class="batch-topic-empty">Chưa có lô hoặc fanpage đã lưu.</span>';
  if (el.batchRegistrySelectNote) {
    const selectedBatches = getRegisteredBatches(selectedIds);
    const groupCount = new Set(selectedBatches.flatMap((item) => item.groupIds || [])).size;
    const fanpageCount = getSelectedRegistryFanpages(selectedIds).length;
    el.batchRegistrySelectNote.textContent = selectedBatches.length
      ? `Đã chọn ${selectedBatches.length} lô · ${groupCount} group${fanpageCount ? ` · ${fanpageCount} fanpage` : ''}, tự bỏ group trùng · có thể chỉnh thêm ở bước 2.`
      : available.length
        ? `${available.length} lô đã lưu · tích một hoặc nhiều lô để nạp group.`
        : 'Chưa có lô hoặc fanpage đã lưu. Tạo tại bước “Đăng ký lô”.';
  }
}

function renderBatchPreparation() {
  if (!el.batchContentSelect) return;
  renderBatchRegistrySelect();
  const selectionChoice = getBatchSelectionChoice();
  if (el.batchGroupSelectionMode) el.batchGroupSelectionMode.value = selectionChoice;
  if (el.batchRegistrySelect) {
    el.batchRegistrySelect.classList.toggle('is-hidden', selectionChoice !== 'registry');
    el.batchRegistrySelect.setAttribute('aria-hidden', String(selectionChoice !== 'registry'));
  }
  if (el.batchRegistrySelectNote) el.batchRegistrySelectNote.classList.toggle('is-hidden', selectionChoice !== 'registry');
  if (el.batchTopicPicker) {
    el.batchTopicPicker.classList.toggle('is-hidden', selectionChoice === 'registry');
    el.batchTopicPicker.setAttribute('aria-hidden', String(selectionChoice === 'registry'));
  }
  if (el.batchTopicNote) el.batchTopicNote.classList.toggle('is-hidden', selectionChoice === 'registry');
  if (el.batchGroupSelectionLabel) el.batchGroupSelectionLabel.textContent = selectionChoice === 'registry' ? 'Chọn theo lô' : 'Chọn theo chủ đề';
  const selectedRegistryIds = new Set(getSelectedRegistryIds());
  const selectedFanpages = getSelectedRegistryFanpages();
  const fanpageRegistryRecords = batchRegistry.filter((item) => item.fanpage?.name || item.fanpage?.url);
  if (el.batchFanpageSummary) {
    el.batchFanpageSummary.classList.remove('is-hidden');
    el.batchFanpageSummary.setAttribute('aria-hidden', 'false');
  }
  if (el.batchFanpageList) {
    el.batchFanpageList.innerHTML = fanpageRegistryRecords.length
      ? fanpageRegistryRecords.map((record) => {
          const label = record.fanpage.name || record.fanpage.url || 'Fanpage';
          const href = safeUrl(record.fanpage.url || '');
          const history = getFanpagePostingSummary(record.fanpage);
          const latest = history.latestLabel
            ? ` · Lô gần nhất ${escapeHtml(history.latestLabel)}`
            : history.latestAt
              ? ` · Gần nhất ${formatDateTime(history.latestAt)}`
              : '';
          return `<label class="batch-fanpage-option"><input type="checkbox" data-batch-fanpage-registry value="${escapeHtml(record.id)}"${selectedRegistryIds.has(record.id) ? ' checked' : ''}><span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(record.name)} · ${record.groupIds.length} group</small><small class="batch-fanpage-history">Hôm nay: ${history.todayCount} lô · Tổng: ${history.totalCount} lượt${latest}</small></span>${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="Mở ${escapeHtml(label)}">↗</a>` : ''}</label>`;
        }).join('')
      : '<span class="batch-fanpage-empty">Chưa có fanpage đăng ký. Bấm “Chọn fanpage” để thêm.</span>';
  }
  if (el.batchFanpageNote) el.batchFanpageNote.textContent = selectedFanpages.length
    ? `${selectedFanpages.length} fanpage đã chọn; lô tương ứng sẽ đi cùng hàng đợi.`
    : 'Tích fanpage/lô ở đây để nạp fanpage vào hàng đợi; không cần đổi bộ lọc chủ đề.';
  const approvedContents = sortContentsByCreatedAt(contents.filter(isApprovedContent));
  if (!approvedContents.length) {
    el.batchContentSelect.innerHTML = '<option value="">Chưa có nội dung đã duyệt</option>';
    el.batchContentSelect.disabled = true;
    if (el.batchGroupSelectionMode) el.batchGroupSelectionMode.disabled = true;
    el.batchContentStatus.textContent = 'Hãy duyệt ít nhất một nội dung trước khi chuẩn bị lô.';
    if (el.batchContentPreview) el.batchContentPreview.innerHTML = '<span>Chưa có bài đã duyệt để xem mô tả.</span>';
    if (el.batchContentPostingSummary) el.batchContentPostingSummary.innerHTML = '<span class="batch-content-posting-empty">Chưa có lịch sử đăng để hiển thị.</span>';
    if (el.batchTopicPicker) el.batchTopicPicker.innerHTML = '<span class="batch-topic-empty">Chưa có chủ đề group.</span>';
    if (el.batchTopicNote) el.batchTopicNote.textContent = 'Hãy nạp group trước khi chọn chủ đề.';
    if (el.batchFanpageSummary) {
      el.batchFanpageSummary.classList.add('is-hidden');
      el.batchFanpageSummary.setAttribute('aria-hidden', 'true');
    }
    if (el.batchFanpageList) el.batchFanpageList.innerHTML = '';
    el.batchScopeLabel.textContent = 'Chưa có nội dung';
    el.batchScopeNote.textContent = 'Chưa thể tính group phù hợp.';
    el.batchMatchCount.textContent = '0';
    el.batchExcludedCount.textContent = '0';
    el.batchPrepMessage.textContent = 'Cần có nội dung đã duyệt để tiếp tục.';
    el.batchPrepNextButton.disabled = true;
    return;
  }
  if (!approvedContents.some((content) => content.id === selectedContentId)) selectedContentId = approvedContents[0].id;
  el.batchContentSelect.disabled = false;
  if (el.batchGroupSelectionMode) el.batchGroupSelectionMode.disabled = false;
  el.batchContentSelect.innerHTML = approvedContents.map((content) => `<option value="${escapeHtml(content.id)}">${escapeHtml(getContentDisplayTitle(content))}</option>`).join('');
  el.batchContentSelect.value = selectedContentId;
  if (el.batchModeOptions) {
    el.batchModeOptions.querySelectorAll('[data-batch-mode]').forEach((input) => {
      input.checked = input.value === getBatchMode();
    });
  }
  const content = approvedContents.find((item) => item.id === selectedContentId) || approvedContents[0];
  const selectionMode = getBatchSelectionMode();
  const topicOptions = getGroupTopicOptions();
  const selectedTopics = getSelectedBatchTopics(content, topicOptions);
  if (el.batchTopicPicker) {
    el.batchTopicPicker.innerHTML = topicOptions.length
      ? topicOptions.map((topic) => `<label class="batch-topic-option"><input type="checkbox" data-batch-topic value="${escapeHtml(topic)}"${selectedTopics.some((selected) => normalize(selected) === normalize(topic)) ? ' checked' : ''}><span><strong>${escapeHtml(topic)}</strong><small>Hôm nay: ${getDailyPostedCountForTopic(topic)} lô · Tổng: ${getPersistentPostedCountForTopic(topic)} lô</small></span></label>`).join('')
      : '<span class="batch-topic-empty">Chưa có chủ đề group.</span>';
  }
  if (el.batchTopicNote) {
    el.batchTopicNote.textContent = selectedTopics.length
      ? `${selectedTopics.length} chủ đề đang chọn · tích thêm để mở rộng phạm vi.`
      : 'Chưa chọn chủ đề group nên chưa thể tìm group phù hợp.';
  }
  if (el.batchContentPreview) {
    el.batchContentPreview.innerHTML = `<strong>${escapeHtml(getContentDisplayTitle(content))}</strong><span>${escapeHtml(getContentDescription(content))}</span>`;
  }
  if (el.batchContentPostingSummary) el.batchContentPostingSummary.innerHTML = renderContentDailyPostingSummary(content);
  const allMatches = getBatchCandidates(content, selectedTopics);
  const queuedIds = getQueuedGroupIdsForBatch(content.id);
  const matches = allMatches.filter(({ group }) => !queuedIds.has(group.id));
  const excluded = groups.filter((group) => !matches.some(({ group: matchedGroup }) => matchedGroup.id === group.id));
  el.batchContentStatus.textContent = `${approvedContents.length} bài đã duyệt · ${hasPoster(content) ? 'Có poster' : 'Chưa có poster'} · Lô ${getBatchModeLabel()}`;
  if (el.batchModeNote) {
    el.batchModeNote.textContent = batchSelection.inheritedFrom
      ? `Lô thực tế kế thừa từ giả lập lúc ${formatDateTime(batchSelection.inheritedFrom.inheritedAt)} · chưa có số liệu thực tế.`
      : getBatchMode() === 'unknown' ? 'Hãy chọn Thực tế hoặc Giả lập trước khi nhập số liệu.' : `Số liệu của lô này được ghi là ${getBatchModeLabel()}.`;
  }
  const registeredBatches = getRegisteredBatches();
  const registeredGroupCount = new Set(registeredBatches.flatMap((item) => item.groupIds || [])).size;
  el.batchScopeLabel.textContent = selectionChoice === 'registry'
    ? registeredBatches.length === 1 ? `Lô “${registeredBatches[0].name}” · ${registeredGroupCount} group` : registeredBatches.length ? `${registeredBatches.length} lô đã chọn · ${registeredGroupCount} group` : 'Chưa chọn lô đã đăng ký'
    : selectedTopics.length === 1
      ? `Các group chủ đề “${selectedTopics[0]}”`
      : selectedTopics.length ? `${selectedTopics.length} chủ đề group đã chọn` : 'Chưa chọn chủ đề group';
  el.batchScopeNote.textContent = queuedIds.size
    ? `Tự loại ${queuedIds.size} group đã có trong hàng đợi cùng nội dung và loại lô; không xóa dữ liệu cũ.`
    : selectionChoice === 'registry'
      ? registeredBatches.length ? `Đã gộp group từ các lô đã chọn${selectedFanpages.length ? ` · kèm ${selectedFanpages.length} fanpage` : ''}; sang bước 2 để kiểm tra và xác nhận.` : 'Hãy chọn ít nhất một lô đã đăng ký để tính phạm vi.'
      : selectedTopics.length
      ? `Phạm vi: ${selectedTopics.join(' · ')}. Bỏ qua group tạm dừng hoặc bị từ chối.`
      : 'Hãy chọn ít nhất một chủ đề group để tính phạm vi.';
  el.batchMatchCount.textContent = String(matches.length);
  el.batchExcludedCount.textContent = String(excluded.length);
  el.batchPrepMessage.textContent = matches.length
    ? selectionChoice === 'registry'
      ? 'Sang bước 2 để kiểm tra các group trong lô đã đăng ký.'
      : 'Chỉ hiển thị group chưa có trong lô này. Anh kiểm tra lại phạm vi, sau đó sang bước 2.'
    : allMatches.length && queuedIds.size
      ? `Các group phù hợp đều đã có trong hàng đợi của lô này (${queuedIds.size} group).`
    : selectionChoice === 'registry' && !registeredBatches.length ? 'Hãy chọn ít nhất một lô đã đăng ký trước khi tiếp tục.' : selectedTopics.length ? 'Chưa có group phù hợp với các chủ đề đã chọn.' : 'Chưa có chủ đề group để tìm kiếm.';
  el.batchPrepNextButton.disabled = !matches.length;
}

function renderMatching() {
  const content = contents.find((item) => item.id === selectedContentId);
  if (!content) return;
  const selectionMode = getBatchSelectionMode();
  const selectedTopics = selectionMode === 'manual' ? [] : getSelectedBatchTopics(content);
  if (selectionMode === 'topic' && !content.topic.trim() && !selectedTopics.length) {
    el.matchingPanel.innerHTML = `<div class="matching-header"><div><p class="eyebrow">CHẠY THEO LÔ · BƯỚC 2</p><h3>Kiểm tra group phù hợp</h3><p>${escapeHtml(getContentDisplayTitle(content))} · Chưa thể kiểm tra</p></div><span class="content-tag">Thiếu chủ đề</span></div><div class="content-empty">Bổ sung chủ đề cho nội dung để app tìm group phù hợp.</div><div class="match-actions"><span class="match-count">Chủ đề là thông tin cần có để kiểm tra group.</span><button type="button" class="button primary" id="confirmBatchGroupsButton" disabled>Xác nhận danh sách →</button></div>`;
    return;
  }
  const allMatches = getBatchCandidates(content, selectedTopics);
  const queuedIds = getQueuedGroupIdsForBatch(content.id);
  const matches = allMatches.filter(({ group }) => !queuedIds.has(group.id));
  const availableIds = new Set(matches.map(({ group }) => group.id));
  const savedIds = batchSelection.contentId === content.id && getBatchSelectionMode() === selectionMode
    ? new Set((batchSelection.groupIds || []).filter((groupId) => availableIds.has(groupId)))
    : new Set();
  const rows = matches.map(({ group, overlap }) => {
    const registeredBatches = getRegistryGroupMemberships(group.id);
    const membershipText = registeredBatches.length
      ? `Thuộc lô: ${registeredBatches.map((item) => item.name).join(' · ')}`
      : 'Chưa thuộc lô đăng ký nào';
    return `<div class="match-row"><input class="match-check" type="checkbox" id="match-${escapeHtml(group.id)}" value="${escapeHtml(group.id)}"${savedIds.has(group.id) ? ' checked' : ''}><label for="match-${escapeHtml(group.id)}"><strong>${escapeHtml(group.name)}</strong><small>${escapeHtml(group.topic || 'Chưa phân loại')} · ${escapeHtml(group.audience || 'Chưa xác định')} · ${selectionMode === 'manual' ? 'Chọn thủ công' : (overlap ? 'Khớp cả chủ đề và tệp' : 'Khớp chủ đề')} · Duyệt ${Math.max(0, Math.min(100, Number(group.approvalRate) || 0))}%</small><em class="match-batch-membership${registeredBatches.length ? ' is-registered' : ''}" title="${escapeHtml(membershipText)}">${escapeHtml(membershipText)}</em></label></div>`;
  }).join('');
  const emptyMessage = allMatches.length && queuedIds.size
    ? `Các group phù hợp đều đã có trong hàng đợi cùng nội dung và loại lô (${queuedIds.size} group).`
    : selectionMode === 'manual' ? 'Chưa có group đủ điều kiện để chọn.' : selectedTopics.length ? 'Chưa có group nào thuộc các chủ đề đã chọn còn hoạt động.' : 'Chưa có group nào thuộc chủ đề đã chọn còn hoạt động.';
  const topicLabel = selectionMode === 'manual' ? 'Chọn thủ công · nhiều chủ đề' : selectedTopics.length ? selectedTopics.join(' · ') : content.topic || 'Chưa chọn chủ đề';
  const heading = selectionMode === 'manual' ? 'Chọn group vào lô' : 'Kiểm tra group phù hợp';
  const intro = selectionMode === 'manual' ? 'Một lô có thể gồm group thuộc nhiều chủ đề khác nhau.' : 'Danh sách được lọc theo các chủ đề đã chọn.';
  el.matchingPanel.innerHTML = `<div class="matching-header"><div><p class="eyebrow">CHẠY THEO LÔ · BƯỚC 2</p><h3>${heading}</h3><p>${escapeHtml(getContentDisplayTitle(content))} · ${matches.length} group chưa có trong lô này${queuedIds.size ? ` · đã tự loại ${queuedIds.size}` : ''}</p></div><span class="content-tag">${escapeHtml(topicLabel)}</span></div><p class="match-mode-note">${intro}</p><div class="match-list">${rows || `<div class="content-empty">${emptyMessage}</div>`}</div><div class="match-actions"><label class="match-select-all"><input type="checkbox" id="selectAllMatchGroups"${matches.length && savedIds.size === matches.length ? ' checked' : ''}${matches.length ? '' : ' disabled'}><span>Chọn tất cả</span></label><span class="match-count" id="batchReviewMessage">Đang chọn ${savedIds.size}/${matches.length} group.</span><button type="button" class="button primary" id="confirmBatchGroupsButton"${savedIds.size || !matches.length ? '' : ' disabled'}>Xác nhận danh sách →</button></div>`;
}

function updateBatchReviewSummary() {
  const checks = [...el.matchingPanel.querySelectorAll('.match-check')];
  const selected = checks.filter((input) => input.checked).length;
  const selectAll = el.matchingPanel.querySelector('#selectAllMatchGroups');
  const message = el.matchingPanel.querySelector('#batchReviewMessage');
  const button = el.matchingPanel.querySelector('#confirmBatchGroupsButton');
  if (message) message.textContent = `Đang chọn ${selected}/${checks.length} group.`;
  if (selectAll) {
    selectAll.checked = checks.length > 0 && selected === checks.length;
    selectAll.indeterminate = selected > 0 && selected < checks.length;
    selectAll.disabled = checks.length === 0;
  }
  if (button) button.disabled = selected === 0;
}

function confirmBatchGroups() {
  const content = contents.find((item) => item.id === selectedContentId);
  const groupIds = [...el.matchingPanel.querySelectorAll('.match-check:checked')].map((input) => input.value);
  if (!content || !groupIds.length) {
    showToast('Hãy chọn ít nhất một group trước.');
    return;
  }
  batchSelection = { ...batchSelection, contentId: content.id, groupIds, updatedAt: new Date().toISOString() };
  saveBatchSelection();
  updateBatchReviewSummary();
  const button = el.matchingPanel.querySelector('#confirmBatchGroupsButton');
  if (button) button.textContent = `Đã xác nhận ${groupIds.length} group`;
  showToast(`Đã xác nhận danh sách ${groupIds.length} group. Chưa tạo hàng đợi.`);
  recordAudit('Xác nhận danh sách lô', `${groupIds.length} group · ${content.title}`);
  renderBatchQueueDraft();
  renderBatchQueueReview();
  renderBatchStatusTracking();
}

function getQueueGroupStatus(entry, groupId) {
  return entry.groupStatuses?.[groupId] || entry.status || 'draft';
}

function getQueueFanpage(entry) {
  return Array.isArray(entry?.fanpages) ? entry.fanpages.find((item) => item?.name || item?.url) : null;
}

function getQueueFanpageStatus(entry) {
  return fanpageStatusLabels[entry?.fanpageStatus] ? entry.fanpageStatus : 'draft';
}

function updateQueueFanpageStatus(entryId, status) {
  const queue = loadQueue();
  const entry = queue.find((item) => item.id === entryId);
  const fanpage = getQueueFanpage(entry);
  if (!entry || !fanpage || !fanpageStatusLabels[status]) return;
  const previousStatus = getQueueFanpageStatus(entry);
  const wasPosted = ['sent', 'approved'].includes(previousStatus);
  const now = new Date().toISOString();
  entry.fanpageStatus = status;
  entry.fanpagePostedAt = ['sent', 'approved'].includes(status) ? (entry.fanpagePostedAt || now) : '';
  const fanpagePostingHistory = Array.isArray(entry.fanpagePostingHistory) ? [...entry.fanpagePostingHistory] : [];
  if (['sent', 'approved'].includes(status)) {
    if (!wasPosted) {
      fanpagePostingHistory.push({
        id: createId(),
        entryId: entry.id,
        contentId: entry.contentId,
        fanpageName: fanpage.name || '',
        fanpageUrl: fanpage.url || '',
        status,
        at: now,
        batchId: entry.id,
        batchLabel: getQueuePostingHistoryLabel(entry)
      });
    } else if (fanpagePostingHistory.length) {
      const lastIndex = fanpagePostingHistory.length - 1;
      fanpagePostingHistory[lastIndex] = {
        ...fanpagePostingHistory[lastIndex],
        status,
        fanpageName: fanpage.name || fanpagePostingHistory[lastIndex].fanpageName || '',
        fanpageUrl: fanpage.url || fanpagePostingHistory[lastIndex].fanpageUrl || ''
      };
    }
  }
  entry.fanpagePostingHistory = fanpagePostingHistory;
  entry.updatedAt = now;
  saveQueue(queue);
  renderPostingQueue();
  recordAudit('Cập nhật trạng thái fanpage', `${fanpage.name || fanpage.url} · ${fanpageStatusLabels[status]}`);
  showToast(`Đã cập nhật fanpage: ${fanpageStatusLabels[status]}.`);
}

function getQueuePostingHistoryLabel(entry) {
  const content = contents.find((item) => item.id === entry?.contentId);
  return getPostingQueueBatchLabel({ entry, content });
}

function appendQueuePostingHistoryEvent(entry, groupId, status, at) {
  const history = Array.isArray(entry.postingHistory?.[groupId]) ? entry.postingHistory[groupId] : [];
  const event = {
    id: createId(),
    entryId: entry.id,
    contentId: entry.contentId,
    groupId,
    status,
    at,
    topic: groups.find((group) => group.id === groupId)?.topic || '',
    batchId: entry.id,
    batchCreatedAt: entry.createdAt || at,
    batchLabel: getQueuePostingHistoryLabel(entry)
  };
  entry.postingHistory = { ...(entry.postingHistory || {}), [groupId]: [...history, event] };
}

function markLatestQueuePostingHistoryApproved(entry, groupId, at) {
  const history = Array.isArray(entry.postingHistory?.[groupId]) ? entry.postingHistory[groupId] : [];
  const latest = [...history].reverse().find((event) => ['sent', 'approved'].includes(event.status));
  if (!latest) {
    appendQueuePostingHistoryEvent(entry, groupId, 'approved', at);
    return;
  }
  entry.postingHistory = {
    ...(entry.postingHistory || {}),
    [groupId]: history.map((event) => event.id === latest.id ? { ...event, status: 'approved', approvedAt: at } : event)
  };
}

function loadPostingRun() {
  try {
    const saved = JSON.parse(localStorage.getItem(POSTING_RUN_STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : null;
  } catch {
    return null;
  }
}

function savePostingRun(run) {
  if (run) localStorage.setItem(POSTING_RUN_STORAGE_KEY, JSON.stringify(run));
  else localStorage.removeItem(POSTING_RUN_STORAGE_KEY);
}

function loadPostingRunSummary() {
  try {
    const summary = JSON.parse(localStorage.getItem(POSTING_RUN_SUMMARY_STORAGE_KEY));
    return summary && typeof summary === 'object' ? summary : null;
  } catch {
    return null;
  }
}

function savePostingRunSummary(summary) {
  if (!summary) {
    localStorage.removeItem(POSTING_RUN_SUMMARY_STORAGE_KEY);
    return true;
  }
  try {
    localStorage.setItem(POSTING_RUN_SUMMARY_STORAGE_KEY, JSON.stringify(summary));
    return true;
  } catch (error) {
    if (!isStorageQuotaError(error)) return false;
    try {
      localStorage.setItem(POSTING_RUN_SUMMARY_STORAGE_KEY, JSON.stringify(compactPostingRunHistoryRecord(summary)));
      return true;
    } catch {
      return false;
    }
  }
}

function isStorageQuotaError(error) {
  return error?.name === 'QuotaExceededError' || /quota|exceeded/i.test(error?.message || '');
}

function retainRecentPostingRunHistory(history, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (POSTING_RUN_HISTORY_RETENTION_DAYS - 1));
  return history
    .filter((item) => {
      const completedAt = new Date(item?.completedAt || 0);
      return !Number.isNaN(completedAt.getTime()) && completedAt >= cutoff;
    })
    .slice(0, POSTING_RUN_HISTORY_MAX_ENTRIES);
}

function compactPostingRunHistoryRecord(item) {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    itemKeys: [],
    groupResults: Array.isArray(item.groupResults)
      ? item.groupResults.map(({ groupId, groupName, status }) => ({ groupId, groupName, status }))
      : []
  };
}

function writePostingRunHistory(history) {
  const recent = retainRecentPostingRunHistory(history);
  const candidates = [
    recent,
    recent.map(compactPostingRunHistoryRecord),
    recent.slice(0, Math.min(60, recent.length)).map(compactPostingRunHistoryRecord)
  ];
  for (const candidate of candidates) {
    try {
      localStorage.setItem(POSTING_RUN_HISTORY_STORAGE_KEY, JSON.stringify(candidate));
      return true;
    } catch (error) {
      if (!isStorageQuotaError(error)) return false;
    }
  }
  return false;
}

function loadPostingRunHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(POSTING_RUN_HISTORY_STORAGE_KEY));
    const history = retainRecentPostingRunHistory(Array.isArray(saved) ? saved : []);
    const lastSummary = loadPostingRunSummary();
    if (lastSummary?.completedAt && !history.some((item) => item.completedAt === lastSummary.completedAt)) {
      return retainRecentPostingRunHistory([lastSummary, ...history]);
    }
    return history;
  } catch {
    return [];
  }
}

function savePostingRunHistory(summary) {
  const history = [summary, ...loadPostingRunHistory()]
    .filter((item, index, items) => item?.completedAt && items.findIndex((candidate) => candidate.completedAt === item.completedAt) === index);
  return writePostingRunHistory(history);
}

function loadPostingRunView() {
  try {
    const saved = JSON.parse(localStorage.getItem(POSTING_RUN_VIEW_STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : null;
  } catch {
    return null;
  }
}

function savePostingRunView(view) {
  if (view) localStorage.setItem(POSTING_RUN_VIEW_STORAGE_KEY, JSON.stringify(view));
  else localStorage.removeItem(POSTING_RUN_VIEW_STORAGE_KEY);
}

function getPostingRunDisplayName(item) {
  return item.runLabel || item.contentTitle || 'Nội dung chưa đặt tên';
}

function getUsedPostingRunLabels() {
  return new Set(loadPostingRunHistory()
    .map((item) => getPostingRunDisplayName(item).trim())
    .filter(Boolean));
}

function getUniquePostingRunLabel(baseLabel) {
  const normalized = String(baseLabel || '').trim() || 'Lô chưa đặt tên';
  const usedLabels = getUsedPostingRunLabels();
  if (!usedLabels.has(normalized)) return normalized;
  const base = normalized.replace(/\s+\(\d+\)$/, '').trim() || normalized;
  let suffix = 1;
  let candidate = `${base} (${suffix})`;
  while (usedLabels.has(candidate)) {
    suffix += 1;
    candidate = `${base} (${suffix})`;
  }
  return candidate;
}

function padRunDatePart(value) {
  return String(value).padStart(2, '0');
}

function getLocalRunDateKey(date = new Date()) {
  return `${date.getFullYear()}-${padRunDatePart(date.getMonth() + 1)}-${padRunDatePart(date.getDate())}`;
}

function getPreviousLocalRunDateKey(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return getLocalRunDateKey(previous);
}

function formatLocalRunDateKey(dateKey) {
  const [, month, day] = String(dateKey || '').split('-');
  return month && day ? `${day}/${month}` : 'ngày trước';
}

function getLocalRunDateTimeLabel(date = new Date()) {
  return `${padRunDatePart(date.getDate())}/${padRunDatePart(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)} ${padRunDatePart(date.getHours())}:${padRunDatePart(date.getMinutes())}`;
}

function peekPostingRunNumber(date = new Date()) {
  try {
    const saved = JSON.parse(localStorage.getItem(POSTING_RUN_SEQUENCE_STORAGE_KEY));
    return saved?.date === getLocalRunDateKey(date) && Number(saved.next) > 0 ? Number(saved.next) : 1;
  } catch {
    return 1;
  }
}

function allocatePostingRunNumber(date = new Date()) {
  const next = peekPostingRunNumber(date);
  localStorage.setItem(POSTING_RUN_SEQUENCE_STORAGE_KEY, JSON.stringify({ date: getLocalRunDateKey(date), next: next + 1 }));
  return next;
}

function getPostingTopicCode(topic = '') {
  const normalizedTopic = topic.trim().toLocaleLowerCase('vi-VN');
  const topicEntry = Object.entries(POSTING_TOPIC_CODES).find(([label]) => label.toLocaleLowerCase('vi-VN') === normalizedTopic);
  if (topicEntry) return topicEntry[1];
  if (POSTING_TOPIC_CODE_ALIASES[normalizedTopic]) return POSTING_TOPIC_CODE_ALIASES[normalizedTopic];
  const initials = normalizedTopic
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  return initials || 'KHA';
}

function getPostingTopicNoteHtml() {
  const knownTopics = Object.entries(POSTING_TOPIC_CODES)
    .map(([label, code]) => `${escapeHtml(label)} <b>${escapeHtml(code)}</b>`)
    .join(' · ');
  return `<span class="posting-topic-note-title">Mã chủ đề:</span> ${knownTopics} · <span class="posting-topic-note-fallback">Chủ đề mới: tự lấy chữ cái đầu</span>`;
}

function getSuggestedPostingRunLabel(runNumber = peekPostingRunNumber(), date = new Date(), selectedContent = null) {
  const { content } = getBatchQueueGroups();
  const contentForLabel = selectedContent || content;
  const rawTitle = typeof contentForLabel?.title === 'string' ? contentForLabel.title.trim() : '';
  const placeholderTitles = new Set(['bài viết chưa đặt tiêu đề', 'nội dung chưa đặt tên', 'no title']);
  const title = contentForLabel && rawTitle && !placeholderTitles.has(rawTitle.toLocaleLowerCase('vi-VN')) ? rawTitle : contentForLabel ? 'No Title' : 'Chưa chọn nội dung';
  const shortTitle = title.length > 28 ? `${title.slice(0, 28).trim()}…` : title;
  const topicCode = getPostingTopicCode(contentForLabel?.topic || '');
  return `L${String(runNumber).padStart(2, '0')} · ${getLocalRunDateTimeLabel(date)} · ${getBatchModeLabel()} · ${topicCode} · ${shortTitle}`;
}

function renderPostingRunHistoryDetails(item) {
  if (!Array.isArray(item.groupResults) || !item.groupResults.length) {
    return '<small class="posting-run-history-legacy">Chi tiết group chưa được lưu ở lô cũ</small>';
  }
  return `<details class="posting-run-history-details"><summary>Chi tiết ${item.groupResults.length} group</summary><div>${item.groupResults.map((group) => `<span><strong>${escapeHtml(group.groupName || 'Group chưa đặt tên')}</strong><small>${escapeHtml(queueStatusLabels[group.status] || group.status || 'Chưa xác định')}</small></span>`).join('')}</div></details>`;
}

function exportPostingRunHistoryCsv() {
  const history = loadPostingRunHistory();
  if (!history.length) {
    showToast('Chưa có lịch sử chạy lô để xuất.');
    return;
  }
  const headers = ['runNumber', 'runLabel', 'content', 'mode', 'completedAt', 'total', 'sent', 'skipped', 'approved', 'pending', 'rejected', 'draft', 'groups', 'groupStatuses'];
  const rows = history.map((item) => ({
    runNumber: item.runNumber || '',
    runLabel: item.runLabel || '',
    content: item.contentTitle || 'Nội dung chưa đặt tên',
    mode: getBatchModeLabel(item.mode || 'unknown'),
    completedAt: item.completedAt || '',
    total: item.total || 0,
    sent: item.sent || 0,
    skipped: item.skipped || 0,
    approved: item.approved || 0,
    pending: item.pending || 0,
    rejected: item.rejected || 0,
    draft: item.draft || 0,
    groups: Array.isArray(item.groupResults) ? item.groupResults.map((group) => group.groupName || 'Group chưa đặt tên').join(' | ') : '',
    groupStatuses: Array.isArray(item.groupResults) ? item.groupResults.map((group) => queueStatusLabels[group.status] || group.status || 'Chưa xác định').join(' | ') : ''
  }));
  const lines = [headers.join(','), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(','))];
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mkt-fanpage-run-history-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`Đã xuất lịch sử ${rows.length} lô.`);
}

function renderPostingRunHistory() {
  if (!el.postingRunHistory) return;
  const history = loadPostingRunHistory();
  if (!history.length) {
    el.postingRunHistory.hidden = true;
    el.postingRunHistory.innerHTML = '';
    return;
  }
  el.postingRunHistory.hidden = false;
  el.postingRunHistory.innerHTML = `<details class="posting-run-history-details-wrap"><summary class="posting-run-history-summary"><span><strong>Lịch sử chạy lô</strong><small>${history.length} lần đã lưu · không tự reset</small></span><span class="posting-run-history-chevron" aria-hidden="true">▾</span></summary><div class="posting-run-history-body"><div class="posting-run-history-heading"><span>Chọn “Xem lô” để mở lại một lô cũ ở chế độ chỉ xem.</span><button type="button" class="button secondary" data-export-run-history>Xuất CSV</button></div><div class="posting-run-history-list">${history.map((item) => { const displayName = getPostingRunDisplayName(item); const contentLine = item.runLabel && item.contentTitle && item.runLabel !== item.contentTitle ? `${item.contentTitle} · ` : ''; return `<div class="posting-run-history-row"><div><strong>${escapeHtml(displayName)}</strong><small>${escapeHtml(contentLine)}${escapeHtml(getBatchModeLabel(item.mode || 'unknown'))} · ${formatDateTime(item.completedAt)}</small></div><span>${item.total || 0} group · ${item.sent || 0} đã đăng · ${item.skipped || 0} bỏ qua · ${item.draft || 0} xử lý lại</span>${renderPostingRunHistoryDetails(item)}<button type="button" class="button secondary" data-open-run-history data-content-id="${escapeHtml(item.contentId || '')}" data-mode="${escapeHtml(item.mode || 'unknown')}" data-completed-at="${escapeHtml(item.completedAt || '')}" data-item-keys="${escapeHtml(JSON.stringify(Array.isArray(item.itemKeys) ? item.itemKeys : []))}">Xem lô</button></div>`; }).join('')}</div></div></details>`;
}

function getPostingRunItems() {
  const queue = loadQueue().filter((entry) => entry && typeof entry === 'object');
  const mode = getBatchMode();
  return queue.flatMap((entry) => (entry.groupIds || []).map((groupId) => ({
    entry,
    group: groups.find((item) => item.id === groupId),
    content: contents.find((item) => item.id === entry.contentId),
    groupId
  }))).filter((item) => item.group && item.content && (mode === 'unknown' || (item.entry.mode || 'unknown') === mode));
}

function loadPostingBatchScope() {
  try {
    const saved = localStorage.getItem(POSTING_BATCH_SCOPE_STORAGE_KEY);
    return typeof saved === 'string' && saved ? saved : '';
  } catch {
    return '';
  }
}

function savePostingBatchScope(scopeId) {
  localStorage.setItem(POSTING_BATCH_SCOPE_STORAGE_KEY, scopeId || 'all');
}

function getPostingQueueBatchLabel(batch) {
  const date = formatDateTime(batch.entry.createdAt || batch.entry.updatedAt);
  const mode = getBatchModeLabel(batch.entry.mode || 'unknown');
  const title = getContentDisplayTitle(batch.content);
  const fanpage = (batch.entry.fanpages || []).map((item) => item.name || item.url).filter(Boolean).join(' · ');
  return `${date} · ${mode} · ${title}${fanpage ? ` · Fanpage: ${fanpage}` : ''}`;
}

function getPostingQueueBatches() {
  const items = getPostingRunItems();
  const byEntry = new Map();
  items.forEach((item) => {
    if (!byEntry.has(item.entry.id)) byEntry.set(item.entry.id, { entry: item.entry, content: item.content, items: [] });
    byEntry.get(item.entry.id).items.push(item);
  });
  return [...byEntry.values()]
    .map((batch) => ({ ...batch, actionableItems: batch.items.filter(isPostingRunActionable), label: getPostingQueueBatchLabel(batch) }))
    .sort((a, b) => new Date(b.entry.createdAt || b.entry.updatedAt || 0) - new Date(a.entry.createdAt || a.entry.updatedAt || 0));
}

function renderPostingBatchScopeOptions() {
  if (!el.postingBatchScope) return [];
  const batches = getPostingQueueBatches();
  const savedScope = loadPostingBatchScope();
  const previous = savedScope || (el.postingBatchScope.value !== 'all' ? el.postingBatchScope.value : '');
  el.postingBatchScope.innerHTML = ['<option value="all">Tất cả lô đang chờ</option>', ...batches.map((batch) => `<option value="${escapeHtml(batch.entry.id)}">${escapeHtml(batch.label)} · ${batch.actionableItems.length}/${batch.items.length} group cần xử lý</option>`)].join('');
  const hasPrevious = previous === 'all' || batches.some((batch) => batch.entry.id === previous);
  const nextValue = hasPrevious ? previous : (batches.find((batch) => batch.actionableItems.length)?.entry.id || batches[0]?.entry.id || 'all');
  el.postingBatchScope.value = nextValue;
  savePostingBatchScope(nextValue);
  return batches;
}

function getPostingRunItemsForScope(scopeId = 'all') {
  const items = getPostingRunItems();
  return scopeId === 'all' ? items : items.filter((item) => item.entry.id === scopeId);
}

function isPostingRunActionable(item) {
  return !['sent', 'pending', 'approved', 'rejected', 'skipped'].includes(getQueueGroupStatus(item.entry, item.groupId));
}

function renderPostingRun() {
  if (!el.postingRunPanel) return;
  const run = loadPostingRun();
  if (!run) { el.postingRunPanel.hidden = true; el.postingRunPanel.innerHTML = ''; return; }
  const allItems = getPostingRunItems();
  const itemByKey = new Map(allItems.map((item) => [`${item.entry.id}|${item.groupId}`, item]));
  const sequence = (Array.isArray(run.itemKeys) ? run.itemKeys : allItems.map((item) => `${item.entry.id}|${item.groupId}`)).map((key) => itemByKey.get(key)).filter(Boolean);
  const runStrategy = run.runStrategy || 'chunk';
  const runBatchIds = Array.isArray(run.batchScopeIds) && run.batchScopeIds.length
    ? run.batchScopeIds.filter((entryId) => sequence.some((candidate) => candidate.entry.id === entryId))
    : [...new Set(sequence.map((candidate) => candidate.entry.id))];
  const currentRunBatchIndex = Math.max(0, runBatchIds.indexOf(run.entryId));
  const currentRunBatchItems = sequence.filter((candidate) => candidate.entry.id === run.entryId);
  const chunkSize = Number(run.chunkSize) || POSTING_RUN_CHUNK_SIZE;
  const chunkIndex = Number(run.chunkIndex) || 0;
  const chunkStart = chunkIndex * chunkSize;
  const chunk = runStrategy === 'all' ? currentRunBatchItems : sequence.slice(chunkStart, chunkStart + chunkSize);
  const index = chunk.findIndex((item) => item.entry.id === run.entryId && item.groupId === run.groupId);
  if (index < 0) { savePostingRun(null); el.postingRunPanel.hidden = true; el.postingRunPanel.innerHTML = ''; return; }
  const item = chunk[index];
  const link = safeUrl(item.group.url);
  const fanpage = getQueueFanpage(item.entry);
  const fanpageStatus = getQueueFanpageStatus(item.entry);
  const fanpageLink = safeUrl(fanpage?.url || '');
  const status = getQueueGroupStatus(item.entry, item.groupId);
  const chunkGroupRows = chunk.map((chunkItem, chunkItemIndex) => {
    const groupKey = `${chunkItem.entry.id}|${chunkItem.groupId}`;
    const isCurrent = chunkItemIndex === index;
    return `<div class="posting-run-group-row${isCurrent ? ' is-current' : ''}"><span class="posting-run-group-name">${escapeHtml(chunkItem.group.name)}${isCurrent ? ' <small>Đang xử lý</small>' : ''}</span><button type="button" class="button secondary" data-run-copy-group-name="${escapeHtml(groupKey)}">Copy tên</button></div>`;
  }).join('');
  el.postingRunPanel.hidden = false;
  const totalChunks = Math.max(1, Math.ceil(sequence.length / chunkSize));
  const runScopeLabel = runStrategy === 'all' ? `LÔ ${currentRunBatchIndex + 1}/${runBatchIds.length}` : runStrategy === 'batch' ? 'LÔ ĐÃ CHỌN' : `CỤM ${chunkIndex + 1}/${totalChunks}`;
  const runPaused = Boolean(run.paused);
  const runActions = runPaused
    ? '<button type="button" class="button primary" data-run-resume>Tiếp tục lô này</button>'
    : `<button type="button" class="button secondary" data-run-copy-caption>Copy nội dung bài</button><button type="button" class="button secondary" data-run-copy-pinned-comment>Copy bình luận ghim</button>${hasPoster(item.content) ? '<button type="button" class="button secondary" data-run-copy-poster>Copy poster</button>' : ''}<button type="button" class="button primary" data-run-multi-group>Đăng nhiều nhóm</button>${link ? `<a class="button secondary" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Mở group</a>` : '<span class="updated">Link group không hợp lệ</span>'}<button type="button" class="button secondary" data-run-mark-sent>Đánh dấu đã đăng</button><button type="button" class="button secondary" data-run-next>Bỏ qua mục này</button>`;
  const runNote = runStrategy === 'all'
    ? `Đang xử lý riêng lô này: ${chunk.length} group. Khi hết lô ${currentRunBatchIndex + 1}/${runBatchIds.length}, app mới chuyển sang lô tiếp theo.`
    : runStrategy === 'batch'
      ? 'Đang mở riêng lô đã chọn. App không trộn group của lô khác vào lô này.'
      : `Chế độ phụ: mỗi cụm tối đa ${chunkSize} group.`;
  const multiGroupNote = runPaused ? '' : '<small class="posting-run-multi-note">Nút này mở group đầu tiên và copy tên các group còn xử lý trong lô; anh vẫn tự bấm “Thêm nhóm” và chọn trên Facebook.</small>';
  const fanpageBlock = fanpage ? `<div class="posting-run-fanpage"><div class="posting-run-fanpage-head"><div><span class="posting-run-label">Fanpage kèm lô</span><strong>${escapeHtml(fanpage.name || fanpage.url || 'Fanpage chưa đặt tên')}</strong><small>${escapeHtml(fanpageStatusLabels[fanpageStatus] || fanpageStatus)}</small></div>${fanpageLink ? `<a class="button secondary" href="${escapeHtml(fanpageLink)}" target="_blank" rel="noopener noreferrer">Mở fanpage</a>` : '<span class="updated">Fanpage chưa có link</span>'}</div><div class="posting-run-actions posting-run-fanpage-actions"><button type="button" class="button secondary" data-run-copy-fanpage-caption>Copy nội dung fanpage</button><button type="button" class="button secondary" data-run-copy-fanpage-pinned-comment>Copy bình luận ghim fanpage</button>${hasPoster(item.content) ? '<button type="button" class="button secondary" data-run-copy-fanpage-poster>Copy poster fanpage</button>' : ''}${fanpageStatus === 'draft' || fanpageStatus === 'skipped' ? '<button type="button" class="button secondary" data-run-mark-fanpage-sent>Đánh dấu đã đăng fanpage</button>' : ''}${fanpageStatus === 'sent' ? '<button type="button" class="button secondary" data-run-mark-fanpage-approved>Đã đăng &amp; duyệt fanpage</button>' : ''}</div><small class="posting-run-multi-note">Fanpage là một lượt đăng riêng của lô; trạng thái fanpage không làm thay đổi trạng thái các group.</small></div>` : '';
  el.postingRunPanel.innerHTML = `<div class="posting-run-heading"><div><p class="eyebrow">${runScopeLabel} · GROUP ${index + 1}/${chunk.length}</p><h3>${escapeHtml(item.group.name)}</h3><p>${escapeHtml(getContentDisplayTitle(item.content))} · ${escapeHtml(getBatchModeLabel(item.entry.mode || getBatchMode()))} · ${escapeHtml(queueStatusLabels[status] || status)}${runPaused ? ' · Đã tạm dừng' : ''}</p></div>${runPaused ? '<span class="updated">Đang tạm dừng</span>' : '<button type="button" class="button secondary" data-run-stop>Dừng chạy lô</button>'}</div>${fanpageBlock}<div class="posting-run-group-list"><span class="posting-run-label">Tên group trong ${runStrategy === 'chunk' ? 'cụm' : 'lô'}</span>${chunkGroupRows}</div><p class="posting-run-note">Mỗi group có nút copy riêng. ${runNote} Facebook vẫn quyết định group nào được đăng hoặc chờ duyệt.</p><div class="posting-run-actions">${runActions}</div>${multiGroupNote}`;
}

function getPostingRunItemByKey(key) {
  const allItems = getPostingRunItems();
  const itemByKey = new Map(allItems.map((item) => [`${item.entry.id}|${item.groupId}`, item]));
  return itemByKey.get(key);
}

async function copyPostingRunGroupName(key) {
  const item = getPostingRunItemByKey(key);
  if (!item) return;
  await copyText(item.group.name);
  showToast(`Đã sao chép tên group: ${item.group.name}.`);
}

async function prepareMultiGroupPosting(run) {
  const batchItems = getPostingRunItems().filter((item) => item.entry.id === run.entryId && isPostingRunActionable(item));
  if (!batchItems.length) {
    showToast('Lô hiện tại không còn group cần chuẩn bị.');
    return;
  }
  const groupNames = batchItems.map((item) => item.group.name).join('\n');
  const firstLink = safeUrl(batchItems[0].group.url);
  await copyText(groupNames);
  if (firstLink) window.open(firstLink, '_blank', 'noopener,noreferrer');
  recordAudit('Chuẩn bị đăng nhiều nhóm', `${batchItems.length} group · ${getContentDisplayTitle(batchItems[0].content)}`);
  showToast(`Đã mở group đầu tiên và copy ${batchItems.length} tên group. Trên Facebook, bấm “Thêm nhóm” rồi tìm/tích các group trong danh sách.`);
}

function startPostingRun() {
  const savedRun = loadPostingRun();
  const savedKey = savedRun ? `${savedRun.entryId}|${savedRun.groupId}` : '';
  const savedItem = savedKey ? getPostingRunItemByKey(savedKey) : null;
  if (savedRun && savedItem && isPostingRunActionable(savedItem)) {
    savePostingRun({ ...savedRun, paused: false });
    renderPostingRun();
    document.querySelector('#posting-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Đã tiếp tục từ group: ${savedItem.group.name}.`);
    return;
  }
  const batches = getPostingQueueBatches();
  const selectedScope = el.postingBatchScope?.value || loadPostingBatchScope();
  const strategy = el.postingRunStrategy?.value || 'batch';
  const firstActionableBatch = batches.find((batch) => batch.actionableItems.length);
  const effectiveScope = strategy === 'all' ? 'all' : selectedScope === 'all' ? (firstActionableBatch?.entry.id || 'all') : selectedScope;
  const allActionableItems = getPostingRunItems().filter(isPostingRunActionable);
  const selectedActionableItems = selectedScope === 'all'
    ? []
    : allActionableItems.filter((item) => item.entry.id === selectedScope);
  const orderedAllItems = selectedActionableItems.length
    ? [...selectedActionableItems, ...allActionableItems.filter((item) => item.entry.id !== selectedScope)]
    : allActionableItems;
  const items = strategy === 'all' ? orderedAllItems : getPostingRunItemsForScope(effectiveScope).filter(isPostingRunActionable);
  if (!items.length) { showToast('Không còn group chưa xử lý trong lô đã chọn.'); return; }
  if (!items.some((item) => !isDailyPostingLimitReached(item))) {
    showToast('Lô này đã đạt giới hạn lượt đăng trong ngày. Hãy chỉnh giới hạn hoặc chọn lô khác.');
    return;
  }
  const startedAt = new Date();
  const typedLabel = el.postingRunLabel?.value.trim() || '';
  const usesSuggestedLabel = !typedLabel || typedLabel === el.postingRunLabel?.dataset.autoValue;
  const runNumber = allocatePostingRunNumber(startedAt);
  const suggestedLabel = getSuggestedPostingRunLabel(runNumber, startedAt, items[0].content);
  const baseRunLabel = usesSuggestedLabel ? suggestedLabel : typedLabel;
  const runLabel = getUniquePostingRunLabel(baseRunLabel);
  const labelWasAdjusted = runLabel !== baseRunLabel;
  if (el.postingRunLabel) {
    el.postingRunLabel.value = runLabel;
    el.postingRunLabel.dataset.autoValue = usesSuggestedLabel ? runLabel : '';
  }
  savePostingRunSummary(null);
  const chunkSize = strategy === 'chunk' ? POSTING_RUN_CHUNK_SIZE : Math.max(1, items.length);
  const batchScopeIds = [...new Set(items.map((item) => item.entry.id))];
  savePostingRun({ entryId: items[0].entry.id, groupId: items[0].groupId, contentId: items[0].entry.contentId, contentTitle: getContentDisplayTitle(items[0].content), runNumber, runLabel, mode: items[0].entry.mode || getBatchMode(), runStrategy: strategy, scopeId: effectiveScope, batchScopeIds, itemKeys: items.map((item) => `${item.entry.id}|${item.groupId}`), chunkIndex: 0, chunkSize, startedAt: startedAt.toISOString() });
  renderPostingRun();
  document.querySelector('#posting-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(labelWasAdjusted
    ? `Tên lô bị trùng, đã đổi thành: ${runLabel}.`
    : strategy === 'all'
      ? `Đã bắt đầu theo từng lô · ${batchScopeIds.length} lô, tổng ${items.length} group.`
      : strategy === 'batch'
        ? `Đã mở lô riêng · ${items.length} group chưa xử lý.`
        : `Đã bắt đầu cụm 10 · ${items.length} group trong phạm vi đã chọn.`);
}

function advancePostingRun() {
  const run = loadPostingRun();
  if (!run) return;
  const items = getPostingRunItems();
  const itemByKey = new Map(items.map((item) => [`${item.entry.id}|${item.groupId}`, item]));
  const sequence = (Array.isArray(run.itemKeys) ? run.itemKeys : items.map((item) => `${item.entry.id}|${item.groupId}`)).map((key) => itemByKey.get(key)).filter(Boolean);
  const currentIndex = sequence.findIndex((item) => item.entry.id === run.entryId && item.groupId === run.groupId);
  const nextIndex = currentIndex + 1;
  const next = nextIndex < sequence.length ? sequence[nextIndex] : null;
  if (next) savePostingRun({ ...run, entryId: next.entry.id, groupId: next.groupId, chunkIndex: Math.floor(nextIndex / (Number(run.chunkSize) || POSTING_RUN_CHUNK_SIZE)), paused: false });
  else {
    const statusCounts = sequence.reduce((counts, item) => {
      const status = getQueueGroupStatus(item.entry, item.groupId);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    const completedSummary = {
      completedAt: new Date().toISOString(),
      contentId: run.contentId || sequence[0]?.entry.contentId || '',
      contentTitle: run.contentTitle || getContentDisplayTitle(contents.find((content) => content.id === (run.contentId || sequence[0]?.entry.contentId))),
      runNumber: run.runNumber || '',
      runLabel: run.runLabel || '',
      mode: run.mode || sequence[0]?.entry.mode || getBatchMode(),
      itemKeys: sequence.map((item) => `${item.entry.id}|${item.groupId}`),
      groupResults: sequence.map((item) => ({ groupId: item.groupId, groupName: item.group.name, status: getQueueGroupStatus(item.entry, item.groupId) })),
      total: sequence.length,
      sent: statusCounts.sent || 0,
      skipped: statusCounts.skipped || 0,
      approved: statusCounts.approved || 0,
      pending: statusCounts.pending || 0,
      rejected: statusCounts.rejected || 0,
      draft: statusCounts.draft || 0
    };
    // Prune oversized history before saving the current summary so an old
    // record can never block marking the current group as posted.
    savePostingRunHistory(completedSummary);
    savePostingRunSummary(completedSummary);
    savePostingRun(null);
    showToast('Đã đi hết các group cần xử lý trong lô.');
  }
  renderPostingQueue();
}

function getQueueMetrics(entry, groupId) {
  return entry.metrics?.[groupId] || {};
}

function getQueueNextCheck(entry, groupId) {
  return entry.nextChecks?.[groupId] || '';
}

function isQueueMetricsEligible(status) {
  return !['rejected', 'skipped', 'error'].includes(status);
}

function toDateTimeLocalValue(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isQueueCheckDue(entry, groupId) {
  const nextCheck = getQueueNextCheck(entry, groupId);
  return Boolean(nextCheck) && new Date(nextCheck).getTime() <= Date.now() && isQueueMetricsEligible(getQueueGroupStatus(entry, groupId)) && !['approved'].includes(getQueueGroupStatus(entry, groupId));
}

function getQueueMetricHistory(entry, groupId) {
  return Array.isArray(entry.metricsHistory?.[groupId]) ? entry.metricsHistory[groupId] : [];
}

function hasQueueMetrics(metrics) {
  return ['views', 'viewers', 'interactions', 'income', 'follows', 'impressions', 'comments']
    .some((key) => Object.prototype.hasOwnProperty.call(metrics, key) && metrics[key] !== '' && metrics[key] != null);
}

function ensureAutomaticQueueChecks(queue) {
  let changed = false;
  queue.forEach((entry) => {
    (entry.groupIds || []).forEach((groupId) => {
      const status = getQueueGroupStatus(entry, groupId);
      if (status === 'sent' && !entry.nextChecks?.[groupId]) {
        entry.nextChecks = { ...(entry.nextChecks || {}), [groupId]: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() };
        changed = true;
      }
    });
  });
  if (changed) saveQueue(queue);
  return changed;
}

function formatMetric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(number) : '0';
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function buildQueueText(content) {
  const summary = typeof content.summary === 'string' ? content.summary.trim() : '';
  const cta = typeof content.cta === 'string' ? content.cta.trim() : '';
  return [
    summary,
    cta
  ].filter(Boolean).join('\n\n');
}

function renderPostingQueue() {
  const queue = loadQueue().filter((entry) => entry && typeof entry === 'object');
  ensureAutomaticQueueChecks(queue);
  const items = queue.flatMap((entry) => entry.groupIds.map((groupId) => ({ entry, group: groups.find((item) => item.id === groupId), content: contents.find((item) => item.id === entry.contentId), groupId })));
  const validItems = items.filter((item) => item.group && item.content);
  const queueFilter = el.queueFilter?.value || 'all';
  const postingRunView = loadPostingRunView();
  const currentBatch = getBatchQueueGroups();
  const batchGroupIds = new Set(currentBatch.groups.map((group) => group.id));
  const postingBatches = renderPostingBatchScopeOptions();
  const selectedPostingScope = el.postingBatchScope?.value || 'all';
  const selectedScopeItems = getPostingRunItemsForScope(selectedPostingScope).filter(isPostingRunActionable);
  const postingRunStrategy = el.postingRunStrategy?.value || 'batch';
  const allActionableRunItems = getPostingRunItems().filter(isPostingRunActionable);
  const actionableRunItems = postingRunStrategy === 'all' || selectedPostingScope === 'all' ? allActionableRunItems : selectedScopeItems;
  renderDailyPostingControl();
  const quotaAvailable = actionableRunItems.some((item) => !isDailyPostingLimitReached(item));
  const savedRun = loadPostingRun();
  const savedRunItem = savedRun ? getPostingRunItemByKey(`${savedRun.entryId}|${savedRun.groupId}`) : null;
  const canResumeSavedRun = Boolean(savedRun && savedRunItem && isPostingRunActionable(savedRunItem));
  if (el.postingTopicNote) el.postingTopicNote.innerHTML = getPostingTopicNoteHtml();
  if (el.postingRunLabel) {
    if (canResumeSavedRun && savedRun?.runLabel && !el.postingRunLabel.value) {
      el.postingRunLabel.value = savedRun.runLabel;
      el.postingRunLabel.dataset.autoValue = '';
    } else if (!canResumeSavedRun || !savedRun?.runLabel) {
      const suggestedLabel = getSuggestedPostingRunLabel();
      el.postingRunLabel.placeholder = suggestedLabel;
      const currentValue = el.postingRunLabel.value.trim();
      const isStaleSavedLabel = savedRun?.runLabel && currentValue === savedRun.runLabel;
      const isGeneratedRunLabel = /^(?:Lô\s*)?\d{1,2}\s·\s\d{2}\/\d{2}\/\d{2,4}\s\d{2}:\d{2}\s·\s(?:Thực tế|Giả lập|Chưa xác định)\s·\s/i.test(currentValue);
      if (!currentValue || currentValue === el.postingRunLabel.dataset.autoValue || isStaleSavedLabel || isGeneratedRunLabel) {
        el.postingRunLabel.value = suggestedLabel;
        el.postingRunLabel.dataset.autoValue = suggestedLabel;
      }
    }
  }
  if (el.startPostingRunButton) {
    el.startPostingRunButton.disabled = actionableRunItems.length === 0 || !quotaAvailable;
    const countLabel = postingRunStrategy === 'chunk' ? Math.min(POSTING_RUN_CHUNK_SIZE, actionableRunItems.length) : actionableRunItems.length;
    const actionableBatchCount = postingBatches.filter((batch) => batch.actionableItems.length).length;
    const selectedBatchFirstLabel = selectedPostingScope !== 'all' && postingRunStrategy === 'all' ? 'Bắt đầu lô đã chọn trước' : 'Bắt đầu theo lô';
    el.startPostingRunButton.textContent = actionableRunItems.length && quotaAvailable
      ? `${canResumeSavedRun ? 'Tiếp tục lô' : postingRunStrategy === 'all' ? selectedBatchFirstLabel : postingRunStrategy === 'chunk' ? 'Bắt đầu cụm' : 'Bắt đầu lô'} · ${postingRunStrategy === 'all' ? `${actionableBatchCount} lô` : `${countLabel} group`}`
      : actionableRunItems.length ? 'Đã đạt giới hạn hôm nay' : 'Không còn group cần xử lý';
  }
  const filteredItems = validItems.filter((item) => {
    if (selectedPostingScope !== 'all' && item.entry.id !== selectedPostingScope) return false;
    if (queueFilter === 'simulation') return (item.entry.mode || 'unknown') === 'simulation';
    if (queueFilter === 'real') return (item.entry.mode || 'unknown') === 'real';
    if (queueFilter === 'due') return isQueueCheckDue(item.entry, item.groupId);
    if (queueFilter === 'missing') return !hasQueueMetrics(getQueueMetrics(item.entry, item.groupId));
    if (queueFilter === 'batch') return currentBatch.content && item.entry.contentId === currentBatch.content.id && (item.entry.mode || 'unknown') === getBatchMode() && batchGroupIds.has(item.groupId);
    if (queueFilter === 'history') {
      if (!postingRunView?.contentId || !postingRunView?.mode) return false;
      const itemKey = `${item.entry.id}|${item.groupId}`;
      if (Array.isArray(postingRunView.itemKeys) && postingRunView.itemKeys.length) return postingRunView.itemKeys.includes(itemKey);
      return item.entry.contentId === postingRunView.contentId && (item.entry.mode || 'unknown') === postingRunView.mode;
    }
    return queueFilter === 'all' || getQueueGroupStatus(item.entry, item.groupId) === queueFilter;
  });
  const fanpageOnlyItems = queue.filter((entry) => {
    const fanpage = getQueueFanpage(entry);
    const content = contents.find((item) => item.id === entry.contentId);
    if ((entry.groupIds || []).length || !fanpage || !content) return false;
    if (selectedPostingScope !== 'all' && entry.id !== selectedPostingScope) return false;
    if (queueFilter === 'simulation') return (entry.mode || 'unknown') === 'simulation';
    if (queueFilter === 'real') return (entry.mode || 'unknown') === 'real';
    if (['due', 'missing', 'batch', 'history'].includes(queueFilter)) return false;
    return queueFilter === 'all' || getQueueFanpageStatus(entry) === queueFilter;
  });
  const visibleItems = filteredItems.slice(0, queueVisibleLimit);
  const hasMoreQueueItems = filteredItems.length > visibleItems.length;
  visibleQueueItemKeys = visibleItems.map((item) => `${item.entry.id}|${item.groupId}`);
  if (el.markAllQueueApprovedButton) {
    const candidateCount = visibleItems.filter((item) => getQueueGroupStatus(item.entry, item.groupId) === 'sent').length;
    el.markAllQueueApprovedButton.disabled = candidateCount === 0;
    el.markAllQueueApprovedButton.title = candidateCount
      ? `Đánh dấu đã duyệt cho ${candidateCount} mục đã đăng đang hiển thị`
      : 'Không có mục Đã đăng phù hợp trong phạm vi đang hiển thị';
  }
  if (el.queueModeGuard) {
    const mode = getBatchMode();
    el.queueModeGuard.className = `queue-mode-guard mode-${escapeHtml(mode)}`;
    el.queueModeGuard.innerHTML = mode === 'simulation'
      ? '<strong>Đang ở lô GIẢ LẬP.</strong> Không dùng nút sao chép để đăng thật; hãy kiểm tra kết quả rồi kế thừa sang lô Thực tế.'
      : mode === 'real'
        ? '<strong>Đang ở lô THỰC TẾ.</strong> Chỉ sao chép khi đã kiểm tra đúng nội dung, group và trạng thái duyệt.'
        : '<strong>Chưa chọn loại lô.</strong> Hãy chọn Giả lập hoặc Thực tế trước khi tạo hàng đợi.';
  }
  if (el.queuePreflight) {
    const mode = getBatchMode();
    const queueScopeItems = validItems.filter((item) => mode === 'unknown' || (item.entry.mode || 'unknown') === mode);
    const checks = [
      { ok: Boolean(currentBatch.content), label: currentBatch.content ? 'Đã chọn nội dung' : 'Chưa chọn nội dung' },
      { ok: currentBatch.content?.status === 'approved', label: currentBatch.content?.status === 'approved' ? 'Nội dung đã duyệt' : 'Nội dung chưa ở trạng thái Đã duyệt' },
      { ok: mode === 'simulation' || mode === 'real', label: mode === 'simulation' || mode === 'real' ? `Đã chọn lô ${getBatchModeLabel(mode)}` : 'Chưa chọn Giả lập hoặc Thực tế' },
      { ok: currentBatch.groups.length > 0, label: currentBatch.groups.length ? `Đã chọn ${currentBatch.groups.length} group` : 'Chưa chọn group' },
      { ok: currentBatch.groups.every((group) => Boolean(safeUrl(group.url))), label: currentBatch.groups.every((group) => Boolean(safeUrl(group.url))) ? 'Link group hợp lệ' : 'Có group thiếu link hợp lệ' },
      { ok: Boolean(currentBatch.content && hasPoster(currentBatch.content)), label: currentBatch.content && hasPoster(currentBatch.content) ? 'Đã có poster' : 'Chưa có poster' },
      { ok: queueScopeItems.length > 0, label: queueScopeItems.length ? `Đã có ${queueScopeItems.length} mục trong các lô đang chờ` : 'Chưa tạo hàng đợi cho loại lô này' },
    ];
    const passed = checks.filter((check) => check.ok).length;
    const ready = passed === checks.length;
    el.queuePreflight.className = `queue-preflight ${ready ? 'is-ready' : 'is-warning'}`;
    el.queuePreflight.innerHTML = `<strong>${ready ? 'Sẵn sàng thao tác' : 'Cần rà trước khi đăng'} · ${passed}/${checks.length}</strong><div>${checks.map((check) => `<span class="preflight-check ${check.ok ? 'is-pass' : 'is-fail'}">${check.ok ? '✓' : '!'} ${escapeHtml(check.label)}</span>`).join('')}</div>`;
  }
  el.queueCount.textContent = filteredItems.length + fanpageOnlyItems.length;
  const counts = filteredItems.reduce((map, item) => {
    const status = getQueueGroupStatus(item.entry, item.groupId);
    map[status] = (map[status] || 0) + 1;
    return map;
  }, {});
  const metricsSummary = filteredItems.reduce((summary, item) => {
    const metrics = getQueueMetrics(item.entry, item.groupId);
    const status = getQueueGroupStatus(item.entry, item.groupId);
    if (isQueueMetricsEligible(status)) {
      if (hasQueueMetrics(metrics)) summary.tracked += 1;
      summary.views += Number(metrics.views) || 0;
      summary.interactions += Number(metrics.interactions) || 0;
      summary.follows += Number(metrics.follows) || 0;
      summary.income += Number(metrics.income) || 0;
    }
    return summary;
  }, { tracked: 0, views: 0, interactions: 0, follows: 0, income: 0 });
  const dueForCheck = filteredItems.filter((item) => isQueueCheckDue(item.entry, item.groupId)).length;
  const missingMetrics = filteredItems.filter((item) => isQueueMetricsEligible(getQueueGroupStatus(item.entry, item.groupId)) && !hasQueueMetrics(getQueueMetrics(item.entry, item.groupId))).length;
  const scheduledChecks = filteredItems.map((item) => getQueueNextCheck(item.entry, item.groupId)).filter((value) => value && new Date(value).getTime() > Date.now()).sort();
  if (el.queueGuidance) {
    const lastRunSummary = loadPostingRunSummary();
    const summaryMatchesCurrentBatch = lastRunSummary?.contentId === currentBatch.content?.id
      && (lastRunSummary.mode || 'unknown') === getBatchMode();
    if (queueFilter === 'history' && postingRunView?.contentId) {
      el.queueGuidance.innerHTML = `<strong>Đang xem lô cũ:</strong> ${escapeHtml(postingRunView.contentTitle || 'Nội dung đã chạy')} · ${escapeHtml(getBatchModeLabel(postingRunView.mode || 'unknown'))} · hoàn tất lúc ${formatDateTime(postingRunView.completedAt)}. Đây là chế độ xem, không đổi lô hiện tại và không chạy lại. <button type="button" class="button secondary queue-guidance-button" data-clear-run-history>Bỏ lọc lô cũ</button>`;
    } else if (dueForCheck) {
      el.queueGuidance.innerHTML = `<strong>Việc cần làm:</strong> ${dueForCheck} group đã đến hạn kiểm tra. <button type="button" class="button secondary queue-guidance-button" data-queue-guidance-filter="due">Xem các mục này</button>`;
    } else if (missingMetrics) {
      el.queueGuidance.innerHTML = `<strong>Đang chờ số liệu:</strong> ${missingMetrics} mục chưa có số liệu. Sau khi Facebook đủ thời gian phân phối, nhập mốc đo vào từng dòng hoặc dùng CSV. <button type="button" class="button secondary queue-guidance-button" data-queue-guidance-filter="missing">Xem các mục này</button>`;
    } else if (scheduledChecks.length) {
      el.queueGuidance.innerHTML = `<strong>Đã đặt lịch:</strong> mốc kiểm tra gần nhất là ${formatDateTime(scheduledChecks[0])}.`;
    } else if (lastRunSummary?.completedAt && summaryMatchesCurrentBatch) {
      el.queueGuidance.innerHTML = `<strong>Cụm gần nhất đã hoàn tất:</strong> ${lastRunSummary.total || 0} group · đã đăng ${lastRunSummary.sent || 0} · bỏ qua ${lastRunSummary.skipped || 0} · chờ xử lý lại ${lastRunSummary.draft || 0}. Hoàn tất lúc ${formatDateTime(lastRunSummary.completedAt)}.`;
    } else {
      el.queueGuidance.innerHTML = '<strong>Đã sẵn sàng:</strong> chưa có group nào cần cập nhật ngay.';
    }
  }
  renderPostingRunHistory();
  el.queueSummary.innerHTML = [
    ...Object.entries(queueStatusLabels).map(([status, label]) => `<span class="queue-stat queue-stat-${status}"><strong>${counts[status] || 0}</strong>${label}</span>`),
    `<span class="queue-stat queue-stat-check"><strong>${dueForCheck}</strong>Cần kiểm tra</span>`,
    `<span class="queue-stat"><strong>${metricsSummary.tracked}/${filteredItems.length}</strong>Đã nhập số liệu</span>`,
    `<span class="queue-stat"><strong>${formatMetric(metricsSummary.views)}</strong>Lượt xem</span>`,
    `<span class="queue-stat"><strong>${formatMetric(metricsSummary.interactions)}</strong>Tương tác</span>`,
    `<span class="queue-stat"><strong>${formatMetric(metricsSummary.follows)}</strong>Follow</span>`,
    `<span class="queue-stat"><strong>$${metricsSummary.income.toFixed(2)}</strong>Thu nhập</span>`
  ].join('');
  if (!filteredItems.length && !fanpageOnlyItems.length) {
    el.queueList.innerHTML = validItems.length
      ? '<div class="queue-empty"><strong>Không có mục phù hợp.</strong><span>Hãy đổi bộ lọc hàng đợi để xem các group khác.</span></div>'
      : '<div class="queue-empty"><strong>Chưa có hàng đợi.</strong><span>Chọn nội dung đã duyệt và group phù hợp để tạo hàng đợi nháp.</span></div>';
    renderPostingRun();
    return;
  }
  const fanpageOnlyHtml = fanpageOnlyItems.map((entry) => {
    const fanpage = getQueueFanpage(entry);
    const content = contents.find((item) => item.id === entry.contentId);
    const fanpageStatus = getQueueFanpageStatus(entry);
    const fanpageLink = safeUrl(fanpage?.url || '');
    return `<article class="queue-item queue-fanpage-only-item"><div class="queue-item-main">${getPosterSrc(content) ? `<img class="queue-poster" src="${escapeHtml(getPosterSrc(content))}" alt="Poster của ${escapeHtml(getContentDisplayTitle(content))}">` : '<div class="queue-poster queue-poster-empty">Không ảnh</div>'}<div class="queue-item-copy"><strong>Fanpage: ${escapeHtml(fanpage.name || fanpage.url || 'Chưa đặt tên')}</strong><span>${escapeHtml(getContentDisplayTitle(content))}</span><small>Fanpage riêng · ${escapeHtml(getBatchModeLabel(entry.mode || getBatchMode()))} · ${escapeHtml(fanpageStatusLabels[fanpageStatus] || fanpageStatus)}</small></div></div><div class="queue-item-actions"><div class="queue-fanpage-actions"><div class="queue-fanpage-head"><strong>Lượt đăng fanpage của lô</strong><span>${escapeHtml(fanpageStatusLabels[fanpageStatus] || fanpageStatus)}</span></div><div class="queue-fanpage-buttons">${fanpageLink ? `<a class="button secondary" href="${escapeHtml(fanpageLink)}" target="_blank" rel="noopener noreferrer">Mở fanpage</a>` : '<span class="updated">Chưa có link fanpage</span>'}<button type="button" class="button secondary" data-copy-fanpage="${escapeHtml(entry.id)}">Copy nội dung fanpage</button><button type="button" class="button secondary" data-copy-fanpage-pinned-comment="${escapeHtml(entry.id)}">Copy bình luận ghim fanpage</button>${hasPoster(content) ? `<button type="button" class="button secondary" data-copy-fanpage-poster="${escapeHtml(entry.id)}">Copy poster fanpage</button>` : ''}${fanpageStatus === 'draft' || fanpageStatus === 'skipped' ? `<button type="button" class="button secondary" data-mark-fanpage-sent="${escapeHtml(entry.id)}">Đánh dấu đã đăng fanpage</button>` : ''}${fanpageStatus === 'sent' ? `<button type="button" class="button secondary" data-mark-fanpage-approved="${escapeHtml(entry.id)}">Đã đăng &amp; duyệt fanpage</button>` : ''}</div></div></div></article>`;
  }).join('');
  const queueLoadMoreHtml = hasMoreQueueItems
    ? `<div class="queue-load-more"><span>Đang hiển thị ${visibleItems.length}/${filteredItems.length} mục group.</span><button type="button" class="button secondary" data-load-more-queue>Xem thêm ${Math.min(QUEUE_VISIBLE_PAGE_SIZE, filteredItems.length - visibleItems.length)} mục</button></div>`
    : filteredItems.length > QUEUE_VISIBLE_PAGE_SIZE
      ? `<div class="queue-load-more queue-load-more-complete"><span>Đã hiển thị đủ ${filteredItems.length} mục group theo bộ lọc.</span></div>`
      : '';
  el.queueList.innerHTML = fanpageOnlyHtml + visibleItems.map(({ entry, group, content, groupId }) => {
    const status = getQueueGroupStatus(entry, groupId);
    const fanpage = getQueueFanpage(entry);
    const fanpageStatus = getQueueFanpageStatus(entry);
    const fanpageLink = safeUrl(fanpage?.url || '');
    const firstVisibleItem = filteredItems.find((candidate) => candidate.entry.id === entry.id);
    const showFanpageActions = Boolean(fanpage && firstVisibleItem?.groupId === groupId);
    const metrics = getQueueMetrics(entry, groupId);
    const history = getQueueMetricHistory(entry, groupId);
    const nextCheck = getQueueNextCheck(entry, groupId);
    const isDueForCheck = isQueueCheckDue(entry, groupId);
    const link = safeUrl(group.url);
    return `<article class="queue-item">
      <div class="queue-item-main">
        ${getPosterSrc(content) ? `<img class="queue-poster" src="${escapeHtml(getPosterSrc(content))}" alt="Poster của ${escapeHtml(getContentDisplayTitle(content))}">` : '<div class="queue-poster queue-poster-empty">Không ảnh</div>'}
        <div class="queue-item-copy"><strong>${escapeHtml(group.name)}</strong><span>${escapeHtml(getContentDisplayTitle(content))}</span><small>${escapeHtml(group.topic)} · ${escapeHtml(getBatchModeLabel(entry.mode || getBatchMode()))} · Tỷ lệ duyệt ${Math.max(0, Math.min(100, Number(group.approvalRate) || 0))}%</small></div>
      </div>
      <div class="queue-metrics" data-metrics-entry="${escapeHtml(entry.id)}" data-metrics-group="${escapeHtml(groupId)}">
        <div class="queue-metrics-head"><strong>Hiệu quả bài đăng</strong><span>${metrics.updatedAt ? `Cập nhật ${formatDateTime(metrics.updatedAt)}` : 'Chưa nhập số liệu'}${isDueForCheck ? ' · <b class="check-overdue">Đã đến hạn kiểm tra</b>' : ''}</span></div>
        <div class="queue-metrics-grid">
          <label>Lượt xem<input type="number" name="views" min="0" step="1" inputmode="numeric" value="${escapeHtml(metrics.views ?? '')}" placeholder="0"></label>
          <label>Người xem<input type="number" name="viewers" min="0" step="1" inputmode="numeric" value="${escapeHtml(metrics.viewers ?? '')}" placeholder="0"></label>
          <label>Tương tác<input type="number" name="interactions" min="0" step="1" inputmode="numeric" value="${escapeHtml(metrics.interactions ?? '')}" placeholder="0"></label>
          <label>Thu nhập ($)<input type="number" name="income" min="0" step="0.01" inputmode="decimal" value="${escapeHtml(metrics.income ?? '')}" placeholder="0.00"></label>
          <label>Follow<input type="number" name="follows" min="0" step="1" inputmode="numeric" value="${escapeHtml(metrics.follows ?? '')}" placeholder="0"></label>
          <label>Lượt hiển thị<input type="number" name="impressions" min="0" step="1" inputmode="numeric" value="${escapeHtml(metrics.impressions ?? '')}" placeholder="0"></label>
          <label>Bình luận<input type="number" name="comments" min="0" step="1" inputmode="numeric" value="${escapeHtml(metrics.comments ?? '')}" placeholder="0"></label>
        </div>
        <div class="queue-metrics-actions">
          <label>Mốc đo<select name="checkpoint"><option value="2–4 giờ"${metrics.checkpoint === '2–4 giờ' ? ' selected' : ''}>Sau 2–4 giờ</option><option value="24 giờ"${metrics.checkpoint === '24 giờ' ? ' selected' : ''}>Sau 24 giờ</option><option value="Mốc mới nhất"${!metrics.checkpoint || metrics.checkpoint === 'Mốc mới nhất' ? ' selected' : ''}>Mốc mới nhất</option></select></label>
          <button type="button" class="button secondary" data-save-metrics>Lưu mốc đo</button>
          <span>${history.length ? `${history.length} mốc đã lưu` : 'Chưa có mốc lịch sử'}</span>
        </div>
        ${history.length ? `<div class="queue-metrics-history"><strong>Lịch sử:</strong>${history.slice().reverse().map((snapshot) => `<span>${escapeHtml(snapshot.checkpoint || 'Mốc đo')} · ${formatMetric(snapshot.views)} lượt xem · ${formatDateTime(snapshot.updatedAt)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="queue-item-actions">
        ${showFanpageActions ? `<div class="queue-fanpage-actions"><div class="queue-fanpage-head"><strong>Fanpage: ${escapeHtml(fanpage.name || fanpage.url || 'Chưa đặt tên')}</strong><span>${escapeHtml(fanpageStatusLabels[fanpageStatus] || fanpageStatus)}</span></div><div class="queue-fanpage-buttons">${fanpageLink ? `<a class="button secondary" href="${escapeHtml(fanpageLink)}" target="_blank" rel="noopener noreferrer">Mở fanpage</a>` : '<span class="updated">Chưa có link fanpage</span>'}<button type="button" class="button secondary" data-copy-fanpage="${escapeHtml(entry.id)}">Copy nội dung fanpage</button><button type="button" class="button secondary" data-copy-fanpage-pinned-comment="${escapeHtml(entry.id)}">Copy bình luận ghim fanpage</button>${hasPoster(content) ? `<button type="button" class="button secondary" data-copy-fanpage-poster="${escapeHtml(entry.id)}">Copy poster fanpage</button>` : ''}${fanpageStatus === 'draft' || fanpageStatus === 'skipped' ? `<button type="button" class="button secondary" data-mark-fanpage-sent="${escapeHtml(entry.id)}">Đánh dấu đã đăng fanpage</button>` : ''}${fanpageStatus === 'sent' ? `<button type="button" class="button secondary" data-mark-fanpage-approved="${escapeHtml(entry.id)}">Đã đăng &amp; duyệt fanpage</button>` : ''}</div></div>` : ''}
        <select class="queue-status-select status-${escapeHtml(status)}" data-queue-id="${escapeHtml(entry.id)}" data-group-id="${escapeHtml(groupId)}" aria-label="Trạng thái ${escapeHtml(group.name)}">${Object.entries(queueStatusLabels).map(([value, label]) => `<option value="${value}"${value === status ? ' selected' : ''}>${label}</option>`).join('')}</select>
        <label class="queue-check-time">Kiểm tra lại lúc<input type="datetime-local" name="nextCheckAt" value="${escapeHtml(toDateTimeLocalValue(nextCheck))}" data-entry-id="${escapeHtml(entry.id)}" data-group-id="${escapeHtml(groupId)}"></label>
        <button type="button" class="button secondary" data-save-check="${escapeHtml(entry.id)}|${escapeHtml(groupId)}">Lưu lịch kiểm tra</button>
        <button type="button" class="button secondary" data-copy-queue="${escapeHtml(entry.id)}|${escapeHtml(groupId)}">Copy nội dung bài</button>
        <button type="button" class="button secondary" data-copy-pinned-comment="${escapeHtml(entry.id)}|${escapeHtml(groupId)}">Copy bình luận ghim</button>
        ${hasPoster(content) ? `<button type="button" class="button secondary" data-copy-poster="${escapeHtml(entry.id)}|${escapeHtml(groupId)}">Copy poster</button>` : ''}
        ${status === 'sent' ? `<button type="button" class="button secondary" data-mark-approved="${escapeHtml(entry.id)}|${escapeHtml(groupId)}">Đã đăng &amp; duyệt</button>` : ''}
        ${status === 'skipped' ? `<button type="button" class="button secondary" data-retry-queue="${escapeHtml(entry.id)}|${escapeHtml(groupId)}">Đưa lại vào lô</button>` : ''}
        <button type="button" class="button danger" data-remove-queue="${escapeHtml(entry.id)}|${escapeHtml(groupId)}">Xóa</button>
        ${link ? `<a class="button primary" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Mở group</a>` : '<span class="updated">Link không hợp lệ</span>'}
      </div>
    </article>`;
  }).join('') + queueLoadMoreHtml;
  renderPostingRun();
}

function getAnalyticsItems() {
  const queue = loadQueue();
  return queue.flatMap((entry) => entry.groupIds.map((groupId) => ({
    entry,
    group: groups.find((item) => item.id === groupId),
    content: contents.find((item) => item.id === entry.contentId),
    groupId,
    mode: entry.mode || 'unknown',
    metrics: getQueueMetrics(entry, groupId),
    history: getQueueMetricHistory(entry, groupId)
  }))).filter((item) => item.group && item.content && hasQueueMetrics(item.metrics));
}

function updateAnalyticsFilters(items) {
  const batchFilter = document.querySelector('#analyticsBatchFilter');
  const modeFilter = el.analyticsModeFilter;
  const topicFilter = document.querySelector('#analyticsTopicFilter');
  const statusFilter = document.querySelector('#analyticsStatusFilter');
  const selectedBatch = batchFilter?.value || 'all';
  const selectedMode = modeFilter?.value || 'all';
  const selectedTopic = topicFilter.value;
  const selectedStatus = statusFilter.value;
  const currentBatch = getBatchQueueGroups();
  const batchGroupIds = new Set(currentBatch.groups.map((group) => group.id));
  if (batchFilter) {
    batchFilter.value = selectedBatch === 'batch' && currentBatch.content && currentBatch.groups.length ? 'batch' : 'all';
  }
  if (modeFilter) {
    modeFilter.innerHTML = '<option value="all">Tất cả loại lô</option>' + Object.entries(BATCH_MODE_LABELS).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('');
    modeFilter.value = Object.prototype.hasOwnProperty.call(BATCH_MODE_LABELS, selectedMode) ? selectedMode : 'all';
  }
  const topics = [...new Set(items.map((item) => item.group.topic || 'Chưa phân loại'))].sort((a, b) => a.localeCompare(b, 'vi'));
  topicFilter.innerHTML = '<option value="all">Tất cả chủ đề</option>' + topics.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join('');
  topicFilter.value = topics.includes(selectedTopic) ? selectedTopic : 'all';
  statusFilter.innerHTML = '<option value="all">Tất cả trạng thái</option>' + Object.entries(queueStatusLabels).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('');
  statusFilter.value = Object.prototype.hasOwnProperty.call(queueStatusLabels, selectedStatus) ? selectedStatus : 'all';
  return items.filter((item) => {
    const batchMatches = (batchFilter?.value || 'all') === 'all' || (currentBatch.content && item.entry.contentId === currentBatch.content.id && batchGroupIds.has(item.groupId));
    const modeMatches = (modeFilter?.value || 'all') === 'all' || (item.mode || 'unknown') === modeFilter.value;
    const topicMatches = topicFilter.value === 'all' || (item.group.topic || 'Chưa phân loại') === topicFilter.value;
    const statusMatches = statusFilter.value === 'all' || getQueueGroupStatus(item.entry, item.groupId) === statusFilter.value;
    return batchMatches && modeMatches && topicMatches && statusMatches;
  });
}

function renderBatchDecisions() {
  if (!el.batchDecisionList) return;
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  const summaryCount = document.querySelector('#batchDecisionSummaryCount');
  if (summaryCount) summaryCount.textContent = `${selectedGroups.length} group · hiển thị toàn bộ`;
  if (!content || !selectedGroups.length) {
    el.batchDecisionList.innerHTML = '<div class="analytics-empty">Chưa có lô hiện tại để chốt quyết định.</div>';
    return;
  }
  const measuredItems = getAnalyticsItems().filter((item) => item.entry.contentId === content.id && selectedGroups.some((group) => group.id === item.groupId));
  const decisions = loadBatchDecisions();
  const snapshots = selectedGroups.map((group) => {
    const item = measuredItems.find((candidate) => candidate.groupId === group.id);
    const early = item?.history.find((snapshot) => snapshot.checkpoint === '2–4 giờ');
    const late = item?.history.find((snapshot) => snapshot.checkpoint === '24 giờ');
    return { group, item, growth: early && late ? (Number(late.views) || 0) - (Number(early.views) || 0) : null };
  });
  const growthValues = snapshots.filter((item) => item.growth !== null).map((item) => item.growth);
  const maxGrowth = growthValues.length ? Math.max(...growthValues) : null;
  const minGrowth = growthValues.length ? Math.min(...growthValues) : null;
  const decisionLabels = { priority: 'Ưu tiên', keep: 'Giữ', reduce: 'Giảm tần suất', pause: 'Tạm dừng', pending: 'Chờ thêm dữ liệu' };
  el.batchDecisionList.innerHTML = snapshots.map(({ group, item, growth }) => {
    const key = getBatchDecisionKey(content.id, group.id);
    const saved = decisions[key]?.decision;
    const suggested = growth === null ? 'pending' : growth === maxGrowth ? 'priority' : growth === minGrowth ? 'reduce' : 'keep';
    const selected = saved && decisionLabels[saved] ? saved : suggested;
    const currentViews = item ? formatMetric(item.metrics.views) : 'Chưa có';
    const growthText = growth === null ? 'Chưa đủ mốc 24 giờ' : `Tăng ${formatMetric(growth)} lượt xem`;
    return `<div class="batch-decision-row"><div><strong>${escapeHtml(group.name)}</strong><small>${escapeHtml(group.topic)} · ${currentViews} lượt xem · ${growthText}</small></div><div class="batch-decision-controls"><select data-batch-decision-group="${escapeHtml(group.id)}" aria-label="Quyết định cho ${escapeHtml(group.name)}">${Object.entries(decisionLabels).map(([value, label]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`).join('')}</select><button type="button" class="button secondary" data-save-one-decision="${escapeHtml(group.id)}">Lưu nhóm này</button></div></div>`;
  }).join('');
}

function renderAnalytics() {
  renderBatchDecisions();
  const allItems = getAnalyticsItems();
  const items = updateAnalyticsFilters(allItems);
  if (!allItems.length) {
    el.analyticsSummary.innerHTML = '<div class="analytics-empty">Chưa có số liệu. Hãy nhập số liệu trong từng dòng của Hàng đợi đăng bài.</div>';
    el.groupAnalyticsTable.innerHTML = '';
    el.topicAnalyticsTable.innerHTML = '';
    el.analyticsGrowthTable.innerHTML = '<div class="analytics-empty">Khi có hai mốc đo, app sẽ hiển thị mức tăng trưởng tại đây.</div>';
    el.analyticsInsights.innerHTML = '<div class="insight-empty">Khi có số liệu, app sẽ chỉ ra group và chủ đề nên ưu tiên.</div>';
    el.analyticsNextBatch.innerHTML = '<div class="next-batch-empty">Chưa có dữ liệu để đề xuất lô tiếp theo.</div>';
    return;
  }
  if (!items.length) {
    const empty = '<div class="analytics-empty">Không có dòng nào khớp bộ lọc hiện tại. Hãy chọn lại chủ đề hoặc trạng thái.</div>';
    el.analyticsSummary.innerHTML = empty;
    el.groupAnalyticsTable.innerHTML = empty;
    el.topicAnalyticsTable.innerHTML = '';
    el.analyticsGrowthTable.innerHTML = '';
    el.analyticsInsights.innerHTML = '<div class="insight-empty">Chọn lại bộ lọc để xem kết luận nhanh.</div>';
    el.analyticsNextBatch.innerHTML = '<div class="next-batch-empty">Chọn lại bộ lọc để xem đề xuất lô tiếp theo.</div>';
    return;
  }
  const totals = items.reduce((summary, item) => {
    summary.views += Number(item.metrics.views) || 0;
    summary.viewers += Number(item.metrics.viewers) || 0;
    summary.interactions += Number(item.metrics.interactions) || 0;
    summary.follows += Number(item.metrics.follows) || 0;
    summary.income += Number(item.metrics.income) || 0;
    return summary;
  }, { views: 0, viewers: 0, interactions: 0, follows: 0, income: 0 });
  const modes = [...new Set(items.map((item) => item.mode || 'unknown'))];
  const modeLabel = modes.length === 1 ? getBatchModeLabel(modes[0]) : 'Hỗn hợp';
  el.analyticsSummary.innerHTML = [
    `<article class="analytics-stat"><span>Loại dữ liệu</span><strong>${escapeHtml(modeLabel)}</strong><small>Không trộn giả lập với thực tế</small></article>`,
    `<article class="analytics-stat"><span>Bài đã đo</span><strong>${items.length}</strong><small>trên tổng hàng đợi</small></article>`,
    `<article class="analytics-stat"><span>Lượt xem</span><strong>${formatMetric(totals.views)}</strong><small>${formatMetric(totals.viewers)} người xem</small></article>`,
    `<article class="analytics-stat"><span>Tương tác</span><strong>${formatMetric(totals.interactions)}</strong><small>tổng lượt tương tác</small></article>`,
    `<article class="analytics-stat"><span>Follow</span><strong>${formatMetric(totals.follows)}</strong><small>phát sinh từ các bài đã đo</small></article>`,
    `<article class="analytics-stat"><span>Thu nhập</span><strong>$${totals.income.toFixed(2)}</strong><small>tổng ghi nhận</small></article>`
  ].join('');

  const ranked = [...items].sort((a, b) => (Number(b.metrics.views) || 0) - (Number(a.metrics.views) || 0) || (Number(b.metrics.interactions) || 0) - (Number(a.metrics.interactions) || 0));
  el.groupAnalyticsTable.innerHTML = `<table class="analytics-table"><thead><tr><th>Group</th><th>Lượt xem</th><th>Tương tác</th><th>Follow</th><th>Tỷ lệ tương tác</th><th>Trạng thái</th></tr></thead><tbody>${ranked.map((item) => {
    const views = Number(item.metrics.views) || 0;
    const interactions = Number(item.metrics.interactions) || 0;
    const rate = views ? `${((interactions / views) * 100).toFixed(2)}%` : '—';
    return `<tr><td><strong>${escapeHtml(item.group.name)}</strong><small>${escapeHtml(item.group.topic)}</small></td><td>${formatMetric(views)}</td><td>${formatMetric(interactions)}</td><td>${formatMetric(item.metrics.follows)}</td><td>${rate}</td><td><span class="status-pill status-${escapeHtml(getQueueGroupStatus(item.entry, item.groupId))}">${escapeHtml(queueStatusLabels[getQueueGroupStatus(item.entry, item.groupId)] || 'Không rõ')}</span></td></tr>`;
  }).join('')}</tbody></table>`;

  const byTopic = [...items.reduce((map, item) => {
    const topic = item.group.topic || 'Chưa phân loại';
    if (!map.has(topic)) map.set(topic, { topic, count: 0, views: 0, interactions: 0, follows: 0, income: 0 });
    const row = map.get(topic);
    row.count += 1;
    row.views += Number(item.metrics.views) || 0;
    row.interactions += Number(item.metrics.interactions) || 0;
    row.follows += Number(item.metrics.follows) || 0;
    row.income += Number(item.metrics.income) || 0;
    return map;
  }, new Map()).values()].sort((a, b) => b.views - a.views);
  el.topicAnalyticsTable.innerHTML = `<table class="analytics-table"><thead><tr><th>Chủ đề</th><th>Số bài</th><th>Tổng lượt xem</th><th>Tương tác</th><th>Follow</th><th>Thu nhập</th></tr></thead><tbody>${byTopic.map((row) => `<tr><td><strong>${escapeHtml(row.topic)}</strong></td><td>${row.count}</td><td>${formatMetric(row.views)}</td><td>${formatMetric(row.interactions)}</td><td>${formatMetric(row.follows)}</td><td>$${row.income.toFixed(2)}</td></tr>`).join('')}</tbody></table>`;

  const growthRows = items.map((item) => {
    const early = item.history.find((snapshot) => snapshot.checkpoint === '2–4 giờ');
    const late = item.history.find((snapshot) => snapshot.checkpoint === '24 giờ');
    if (!early || !late) return null;
    const viewsDelta = (Number(late.views) || 0) - (Number(early.views) || 0);
    const interactionsDelta = (Number(late.interactions) || 0) - (Number(early.interactions) || 0);
    const incomeDelta = (Number(late.income) || 0) - (Number(early.income) || 0);
    return { item, early, late, viewsDelta, interactionsDelta, incomeDelta };
  }).filter(Boolean).sort((a, b) => b.viewsDelta - a.viewsDelta);
  el.analyticsGrowthTable.innerHTML = growthRows.length
    ? `<table class="analytics-table"><thead><tr><th>Group</th><th>2–4 giờ</th><th>24 giờ</th><th>Tăng lượt xem</th><th>Tăng tương tác</th><th>Tăng thu nhập</th><th>Đánh giá</th></tr></thead><tbody>${growthRows.map((row) => `<tr><td><strong>${escapeHtml(row.item.group.name)}</strong><small>${escapeHtml(row.item.group.topic)}</small></td><td>${formatMetric(row.early.views)}</td><td>${formatMetric(row.late.views)}</td><td class="${row.viewsDelta >= 0 ? 'growth-positive' : 'growth-negative'}">${row.viewsDelta >= 0 ? '+' : ''}${formatMetric(row.viewsDelta)}</td><td class="${row.interactionsDelta >= 0 ? 'growth-positive' : 'growth-negative'}">${row.interactionsDelta >= 0 ? '+' : ''}${formatMetric(row.interactionsDelta)}</td><td class="${row.incomeDelta >= 0 ? 'growth-positive' : 'growth-negative'}">${row.incomeDelta >= 0 ? '+' : ''}$${row.incomeDelta.toFixed(2)}</td><td><span class="status-pill ${row.viewsDelta > 0 ? 'status-ready' : 'status-rejected'}">${row.viewsDelta > 0 ? 'Đang tăng' : 'Không tăng'}</span></td></tr>`).join('')}</tbody></table>`
    : '<div class="analytics-empty">Chưa có group nào đủ cả mốc 2–4 giờ và 24 giờ. Hãy lưu đủ hai mốc trong Hàng đợi đăng bài.</div>';

  const bestViews = ranked[0];
  const bestEngagement = [...items].sort((a, b) => {
    const rate = (item) => (Number(item.metrics.views) || 0) ? (Number(item.metrics.interactions) || 0) / Number(item.metrics.views) : 0;
    return rate(b) - rate(a);
  })[0];
  const insights = [
    `<div class="insight-row"><span>Đang dẫn đầu lượt xem</span><strong>${escapeHtml(bestViews.group.name)} · ${formatMetric(bestViews.metrics.views)} lượt</strong></div>`,
    `<div class="insight-row"><span>Tỷ lệ tương tác tốt nhất</span><strong>${escapeHtml(bestEngagement.group.name)} · ${((Number(bestEngagement.metrics.interactions) || 0) / (Number(bestEngagement.metrics.views) || 1) * 100).toFixed(2)}%</strong></div>`,
    totals.follows === 0 ? '<div class="insight-note">Chưa có follow phát sinh. Nên thử CTA rõ hơn để kéo người xem về fanpage.</div>' : `<div class="insight-note">Đã ghi nhận ${formatMetric(totals.follows)} follow từ các bài đã đo.</div>`,
    growthRows.length ? `<div class="insight-note">Tăng trưởng tốt nhất: ${escapeHtml(growthRows[0].item.group.name)} · +${formatMetric(growthRows[0].viewsDelta)} lượt xem từ 2–4 giờ đến 24 giờ.</div>` : '<div class="insight-note">Chưa đủ hai mốc đo để kết luận tốc độ tăng trưởng.</div>',
    items.length < 3 ? '<div class="insight-note">Mới có ít dữ liệu; nên đo thêm vài group trước khi loại group khỏi danh sách.</div>' : '<div class="insight-note">Có thể bắt đầu ưu tiên group dẫn đầu và giảm tần suất ở nhóm kém hiệu quả.</div>'
  ];
  el.analyticsInsights.innerHTML = insights.join('');
  const lowestViews = [...items].sort((a, b) => (Number(a.metrics.views) || 0) - (Number(b.metrics.views) || 0))[0];
  const has24HourSnapshot = items.some((item) => item.history.some((snapshot) => snapshot.checkpoint === '24 giờ'));
  const recommendation = growthRows.length
    ? `Đã có mốc 24 giờ. Ưu tiên ${escapeHtml(bestViews.group.name)} cho lô tiếp theo và xem xét giảm tần suất ở ${escapeHtml(lowestViews.group.name)} nếu kết quả 24 giờ vẫn thấp.`
    : `Chưa chốt loại group. Giữ nguyên lô hiện tại đến khi có mốc 24 giờ; hiện có thể ưu tiên ${escapeHtml(bestViews.group.name)} và thử CTA rõ hơn để kéo follow.`;
  el.analyticsNextBatch.innerHTML = `<div class="next-batch-card"><strong>Đề xuất lô tiếp theo</strong><p>${recommendation}</p><small>${has24HourSnapshot ? 'Đề xuất đã dùng dữ liệu có mốc 24 giờ.' : 'Đề xuất tạm thời, chưa tự thay đổi trạng thái group.'}</small></div>`;
}

function openContentDialog(content = null) {
  editingContentId = content?.id || null;
  pendingPosterDataUrl = content?.posterDataUrl || '';
  pendingPosterBlob = null;
  pendingPosterBlobId = content?.posterBlobId || '';
  pendingPosterChanged = false;
  el.contentForm.reset();
  el.contentFormError.hidden = true;
  el.contentDialogTitle.textContent = content ? 'Cập nhật nội dung' : 'Thêm nội dung';
  if (content) {
    Object.entries(content).forEach(([key, value]) => {
      const field = el.contentForm.elements.namedItem(key);
      if (field) field.value = value ?? '';
    });
  } else {
    el.contentForm.elements.namedItem('status').value = 'draft';
    el.contentForm.elements.namedItem('format').value = 'post';
  }
  updateContentWordCount();
  renderPosterPreview();
  el.contentDialog.showModal();
  if (content?.posterBlobId) {
    getPosterBlob(content.posterBlobId).then(async (blob) => {
      if (!blob || editingContentId !== content.id || pendingPosterChanged) return;
      pendingPosterBlob = blob;
      pendingPosterDataUrl = await blobToDataUrl(blob);
      renderPosterPreview();
    }).catch(() => showToast('Không đọc được poster cục bộ; dữ liệu nội dung vẫn còn.'));
  }
  requestAnimationFrame(() => el.contentForm.elements.namedItem('title').focus());
}

function loadPosterFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Poster phải là file ảnh.');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    showToast('Poster tối đa 20MB để lưu cục bộ ổn định.');
    return;
  }
  pendingPosterBlob = file.slice(0, file.size, file.type);
  pendingPosterBlobId = '';
  pendingPosterChanged = true;
  const reader = new FileReader();
  reader.addEventListener('load', async () => {
    try {
      pendingPosterDataUrl = String(reader.result || '');
      renderPosterPreview();
      showToast('Đã nhận poster gốc và giữ nguyên trong bộ nhớ cục bộ.');
    } catch {
      showToast('Không thể xử lý poster này. Hãy thử ảnh PNG hoặc JPG khác.');
    }
  });
  reader.readAsDataURL(file);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', () => reject(reader.error || new Error('Không đọc được poster.')));
    reader.readAsDataURL(blob);
  });
}

async function pastePosterFromClipboard() {
  if (!navigator.clipboard?.read) {
    showToast('Trình duyệt chưa hỗ trợ đọc ảnh từ clipboard. Hãy bấm vào vùng xem trước rồi nhấn Ctrl+V/Cmd+V.');
    return;
  }
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith('image/'));
      if (!imageType) continue;
      const blob = await item.getType(imageType);
      loadPosterFile(new File([blob], 'pasted-poster', { type: imageType }));
      return;
    }
    showToast('Clipboard hiện không có ảnh poster.');
  } catch {
    showToast('Không thể đọc clipboard. Hãy cấp quyền hoặc dán trực tiếp vào vùng xem trước.');
  }
}

function renderPosterPreview() {
  if (!pendingPosterDataUrl) {
    el.posterUploadPreview.innerHTML = '<span>Chưa có poster</span><button type="button" class="button secondary" id="clearPosterButton" hidden>Xóa poster</button>';
    el.clearPosterButton = document.querySelector('#clearPosterButton');
    return;
  }
  el.posterUploadPreview.innerHTML = `<img src="${escapeHtml(pendingPosterDataUrl)}" alt="Poster xem trước"><span>Poster đã chọn</span><button type="button" class="button secondary" id="clearPosterButton">Xóa poster</button>`;
  el.clearPosterButton = document.querySelector('#clearPosterButton');
  el.clearPosterButton.addEventListener('click', () => {
    pendingPosterDataUrl = '';
    pendingPosterBlob = null;
    pendingPosterBlobId = '';
    pendingPosterChanged = true;
    el.posterFile.value = '';
    renderPosterPreview();
  });
}

function closeContentDialog() {
  el.contentDialog.close();
  editingContentId = null;
}

function getBriefFormValues() {
  const values = Object.fromEntries(new FormData(el.briefForm));
  return {
    topic: values.topic?.trim() || 'Chưa xác định',
    audience: values.audience?.trim() || 'Người dùng Facebook phù hợp với chủ đề',
    source: values.source?.trim() || 'Chưa có nguồn/link',
    format: values.format === 'poster' ? 'bài viết kèm poster' : values.format === 'short' ? 'bài ngắn' : 'bài viết Facebook',
    facts: values.facts?.trim() || 'Chưa có dữ kiện. Hãy yêu cầu kiểm tra nguồn trước khi xuất bản.',
    requirements: values.requirements?.trim() || 'Tóm tắt trung tính, không giật tít, không suy đoán; nêu rõ nguồn khi có.'
  };
}

function buildContentBrief(values) {
  return [
    'Bạn là biên tập viên nội dung Facebook.',
    `Chủ đề: ${values.topic}`,
    `Tệp người xem: ${values.audience}`,
    `Định dạng: ${values.format}`,
    `Nguồn/link nguồn: ${values.source}`,
    '',
    'Dữ kiện/tóm tắt gốc:',
    values.facts,
    '',
    'Yêu cầu biên tập:',
    '- Chỉ dùng dữ kiện được cung cấp; không tự bịa hoặc suy đoán.',
    '- Viết bằng tiếng Việt rõ ràng, trung tính, dễ đọc trên Facebook.',
    '- Tạo tiêu đề; nếu không có tiêu đề thì dùng "No Title".',
    '- Viết caption có mở đầu ngắn, thân bài mạch lạc và CTA nếu phù hợp.',
    '- Ghi nguồn/link nguồn ở cuối khi có nguồn.',
    values.requirements,
    '',
    'Đầu ra cần trả về:',
    '1) Tiêu đề',
    '2) Caption',
    '3) Gợi ý chữ trên poster nếu định dạng có poster',
    '4) Mô tả ngắn và các dữ kiện cần kiểm tra lại'
  ].join('\n');
}

function updateBriefOutput() {
  if (el.briefOutput) el.briefOutput.value = buildContentBrief(getBriefFormValues());
}

function openBriefDialog() {
  if (!el.briefDialog || !el.briefForm) return;
  el.briefForm.reset();
  el.briefForm.elements.namedItem('format').value = 'post';
  const selected = contents.find((item) => item.id === selectedContentId);
  if (selected) {
    el.briefForm.elements.namedItem('topic').value = selected.topic || '';
    el.briefForm.elements.namedItem('audience').value = selected.audience || '';
    el.briefForm.elements.namedItem('source').value = selected.sourceUrl || '';
    el.briefForm.elements.namedItem('facts').value = selected.summary || '';
    el.briefForm.elements.namedItem('format').value = selected.format || 'post';
  }
  updateBriefOutput();
  el.briefDialog.showModal();
}

async function copyBrief() {
  updateBriefOutput();
  try {
    await navigator.clipboard.writeText(el.briefOutput.value);
    showToast('Đã copy brief để dán sang ChatGPT.');
  } catch {
    el.briefOutput.select();
    document.execCommand('copy');
    showToast('Đã copy brief.');
  }
}

async function handleContentSubmit(event) {
  event.preventDefault();
  const submitButton = el.contentForm.querySelector('[type="submit"]');
  const values = Object.fromEntries(new FormData(el.contentForm));
  const wasEditing = Boolean(editingContentId);
  if (submitButton) submitButton.disabled = true;
  el.contentFormError.hidden = true;
  try {
    const summaryText = String(values.summary || '').trim();
    const summaryWordCount = countWords(summaryText);
    if (summaryWordCount > MAX_CONTENT_WORDS) {
      throw new Error(`Nội dung bài viết tối đa ${MAX_CONTENT_WORDS.toLocaleString('vi-VN')} từ. Hiện đang có ${summaryWordCount.toLocaleString('vi-VN')} từ.`);
    }
    const sourceUrl = String(values.sourceUrl || '').trim();
    if (sourceUrl && /^(https?:\/\/)/i.test(sourceUrl) && !safeUrl(sourceUrl)) {
      throw new Error('Link nguồn chưa hợp lệ. Hãy kiểm tra lại địa chỉ http:// hoặc https://.');
    }
    const existing = contents.find((item) => item.id === editingContentId);
    const recordId = editingContentId || createId();
    let posterBlobId = pendingPosterChanged ? (pendingPosterBlob ? recordId : '') : (existing?.posterBlobId || '');
    let posterDataUrl = '';
    let migratedLegacyPoster = null;
    if (!pendingPosterChanged && existing?.posterDataUrl && !existing?.posterBlobId) {
      showToast('Đang chuyển poster cũ sang bộ nhớ ảnh riêng...');
      migratedLegacyPoster = await fetch(existing.posterDataUrl).then((response) => response.blob());
      await putPosterBlob(recordId, migratedLegacyPoster);
      posterBlobId = recordId;
    }
    if (pendingPosterChanged) {
      if (pendingPosterBlob) {
        showToast('Đang lưu poster gốc vào bộ nhớ cục bộ...');
        try {
          await putPosterBlob(recordId, pendingPosterBlob);
        } catch (error) {
          throw new Error(`${error.message || 'IndexedDB không khả dụng.'} Ảnh chưa được lưu; hãy đóng tab cũ hoặc mở app bằng Chrome rồi thử lại.`);
        }
      }
      if (!pendingPosterBlob && existing?.posterBlobId) await deletePosterBlob(existing.posterBlobId);
    }
    const title = String(values.title || '').trim() || 'No Title';
    const record = {
      id: recordId,
      title,
      sourceUrl,
      topic: String(values.topic || '').trim(),
      audience: String(values.audience || '').trim(),
      format: values.format,
      status: values.status,
      summary: summaryText,
      cta: String(values.cta || '').trim(),
      pinnedComment: String(values.pinnedComment || '').trim(),
      posterDataUrl,
      posterBlobId,
      createdAt: existing?.createdAt || existing?.updatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (pendingPosterBlob) setPosterObjectUrl(record, pendingPosterBlob);
    else if (migratedLegacyPoster) setPosterObjectUrl(record, migratedLegacyPoster);
    else if (existing?.posterObjectUrl) Object.defineProperty(record, 'posterObjectUrl', { value: existing.posterObjectUrl, writable: true, configurable: true, enumerable: false });
    const nextContents = editingContentId
      ? contents.map((item) => item.id === editingContentId ? record : item)
      : [record, ...contents];
    const previousContents = contents;
    try {
      contents = nextContents;
      selectedContentId = record.id;
        saveContents({ syncItems: [record] });
    } catch (error) {
      contents = previousContents;
      throw error;
    }
    closeContentDialog();
    recordAudit(wasEditing ? 'Cập nhật nội dung' : 'Thêm nội dung', record.title || 'No Title');
    try {
      // Keep the save path local to the content workflow. Rebuilding the
      // whole operations dashboard here makes adding one item scale with all
      // groups, batches, queues and analytics instead of the changed content.
      renderContentLibrary({ renderBatchSections: false });
      renderPostingQueue();
      renderAuditLog();
      scheduleContentBatchRefresh();
    } catch (renderError) {
      console.error('Nội dung đã lưu nhưng giao diện cần tải lại:', renderError);
      renderContentLibrary();
    }
    showToast(wasEditing ? 'Đã cập nhật nội dung.' : 'Đã thêm nội dung vào thư viện.');
  } catch (error) {
    el.contentFormError.textContent = error?.message || 'Không thể lưu nội dung. Hãy thử lại.';
    el.contentFormError.hidden = false;
    el.contentFormError.scrollIntoView({ block: 'nearest' });
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

function openDeleteContentDialog(contentId) {
  const content = contents.find((item) => item.id === contentId);
  if (!content) return;
  if (el.cancelDeleteContent) el.cancelDeleteContent.textContent = 'Hủy bỏ';
  if (el.confirmDeleteContent) el.confirmDeleteContent.textContent = 'Xác nhận';
  const title = getContentDisplayTitle(content);
  const linkedQueue = loadQueue().filter((entry) => entry.contentId === contentId);
  pendingDeleteContentId = contentId;
  el.deleteContentMessage.textContent = `Xóa “${title}” khỏi thư viện nội dung? Thao tác này không thể hoàn tác.`;
  if (linkedQueue.length) {
    el.deleteContentQueueWarning.textContent = `Bài đang nằm trong ${linkedQueue.length} hàng đợi. Khi xác nhận, các mục hàng đợi gắn với bài này cũng sẽ được gỡ khỏi trình duyệt để không còn bản ghi mồ côi.`;
    el.deleteContentQueueWarning.hidden = false;
  } else {
    el.deleteContentQueueWarning.textContent = '';
    el.deleteContentQueueWarning.hidden = true;
  }
  el.deleteContentDialog.showModal();
}

function closeDeleteContentDialog() {
  pendingDeleteContentId = null;
  if (el.deleteContentMessage) el.deleteContentMessage.textContent = '';
  if (el.deleteContentQueueWarning) {
    el.deleteContentQueueWarning.textContent = '';
    el.deleteContentQueueWarning.hidden = true;
  }
  if (el.deleteContentDialog?.open) el.deleteContentDialog.close();
}

async function deleteContent(contentId) {
  const content = contents.find((item) => item.id === contentId);
  if (!content) return false;
  const title = getContentDisplayTitle(content);
  if (onlineContentIds.has(content.id)) {
    try {
      const response = await fetch(`/api/contents/${encodeURIComponent(content.id)}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Không thể xóa nội dung online.');
      onlineContentIds.delete(content.id);
    } catch (error) {
      showToast(error.message || 'Không thể xóa nội dung online.');
      return false;
    }
  }
  const queue = loadQueue();
  const nextQueue = queue.filter((entry) => entry.contentId !== contentId);
  if (nextQueue.length !== queue.length) saveQueue(nextQueue);
  if (content.posterBlobId) await deletePosterBlob(content.posterBlobId).catch(() => {});
  contents = contents.filter((item) => item.id !== contentId);
  if (selectedContentId === contentId) selectedContentId = contents[0]?.id || null;
  if (batchSelection?.contentId === contentId) {
    batchSelection = { ...batchSelection, contentId: '', groupIds: [], topicFilters: null, updatedAt: new Date().toISOString() };
    saveBatchSelection();
  }
  saveContents();
  try {
    render();
  } catch (error) {
    console.error('Đã xóa nội dung nhưng không thể dựng lại giao diện ngay:', error);
  }
  recordAudit('Xóa nội dung', title);
  showToast('Đã xóa bài khỏi thư viện.');
  return true;
}

async function confirmDeleteContent() {
  const contentId = pendingDeleteContentId;
  if (!contentId) return;
  const button = el.confirmDeleteContent;
  if (button) {
    button.disabled = true;
    button.textContent = 'Đang xóa...';
  }
  try {
    const deleted = await deleteContent(contentId);
    if (deleted) closeDeleteContentDialog();
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Xác nhận';
    }
  }
}

function createQueueDraft() {
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  const selectedFanpages = getBatchSelectionChoice() === 'registry' ? getSelectedRegistryFanpages() : [];
  const queue = loadQueue();
  const existingIds = new Set(queue.filter((entry) => entry.contentId === content?.id && (entry.mode || 'unknown') === getBatchMode()).flatMap((entry) => entry.groupIds || []));
  const ids = selectedGroups.map((group) => group.id).filter((groupId) => !existingIds.has(groupId));
  const fanpageAlreadyQueued = selectedFanpages.some((fanpage) => queue.some((entry) => entry.contentId === content?.id && (entry.mode || 'unknown') === getBatchMode() && (entry.fanpages || []).some((candidate) => normalize(candidate.name) === normalize(fanpage.name) && candidate.url === fanpage.url)));
  if (!content || (!ids.length && !selectedFanpages.length) || (!ids.length && fanpageAlreadyQueued)) {
    showToast(selectedFanpages.length && fanpageAlreadyQueued ? 'Fanpage này đã có trong hàng đợi của nội dung và loại lô này.' : 'Chưa có group hoặc fanpage mới để thêm vào hàng đợi.');
    return;
  }
  const groupStatuses = ids.reduce((map, groupId) => ({ ...map, [groupId]: 'draft' }), {});
  const decisions = loadBatchDecisions();
  const entryDecisions = ids.reduce((map, groupId) => {
    const decision = decisions[getBatchDecisionKey(content.id, groupId)];
    if (decision) map[groupId] = decision;
    return map;
  }, {});
  const now = new Date().toISOString();
  queue.unshift({ id: createId(), contentId: content.id, groupIds: ids, fanpages: selectedFanpages, fanpageStatus: selectedFanpages.length ? 'draft' : '', groupStatuses, decisions: entryDecisions, status: 'draft', mode: getBatchMode(), createdAt: now, updatedAt: now });
  saveQueue(queue);
  renderPostingQueue();
  renderBatchQueueDraft();
  recordAudit('Tạo hàng đợi nháp', `${ids.length} group${selectedFanpages.length ? ` · ${selectedFanpages.length} fanpage` : ''} · ${content.title}`);
  showToast(`Đã tạo hàng đợi nháp cho ${ids.length} group${selectedFanpages.length ? ` và ${selectedFanpages.length} fanpage` : ''}. Chưa đăng bài.`);
}

async function posterDataUrlToPngBlob(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  if (blob.type === 'image/png') return blob;
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext('2d').drawImage(image, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob((pngBlob) => pngBlob ? resolve(pngBlob) : reject(new Error('Không thể tạo ảnh PNG.')), 'image/png'));
}

async function posterBlobToPngBlob(blob) {
  if (blob.type === 'image/png') return blob;
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d').drawImage(image, 0, 0);
    return await new Promise((resolve, reject) => canvas.toBlob((pngBlob) => pngBlob ? resolve(pngBlob) : reject(new Error('Không thể tạo ảnh PNG.')), 'image/png'));
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const fallback = document.createElement('textarea');
    fallback.value = text;
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand('copy');
    fallback.remove();
  }
}

async function copyQueueContent(entryId, groupId) {
  const entry = loadQueue().find((item) => item.id === entryId);
  const content = contents.find((item) => item.id === entry?.contentId);
  const group = groups.find((item) => item.id === groupId);
  if (!entry || !content || (groupId && !group)) return;
  if (entry.mode === 'simulation' && !confirm('Đây là lô GIẢ LẬP. Anh vẫn muốn sao chép nội dung bài này để kiểm thử?')) return;
  const text = buildQueueText(content);
  await copyText(text);
  showToast(`Đã sao chép nội dung bài cho ${group ? `group ${group.name}` : 'fanpage'}.`);
}

async function copyQueuePoster(entryId, groupId) {
  const entry = loadQueue().find((item) => item.id === entryId);
  const content = contents.find((item) => item.id === entry?.contentId);
  const group = groups.find((item) => item.id === groupId);
  if (!entry || !content || (groupId && !group) || !hasPoster(content)) return;
  if (entry.mode === 'simulation' && !confirm('Đây là lô GIẢ LẬP. Anh vẫn muốn sao chép poster này để kiểm thử?')) return;
  try {
    if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('Clipboard image is not supported.');
    const originalBlob = content.posterBlobId ? await getPosterBlob(content.posterBlobId) : null;
    const posterBlob = originalBlob ? await posterBlobToPngBlob(originalBlob) : await posterDataUrlToPngBlob(content.posterDataUrl);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': posterBlob })]);
    showToast(`Đã sao chép poster cho ${group ? `group ${group.name}` : 'fanpage'}.`);
  } catch {
    showToast('Trình duyệt chưa cho phép sao chép poster. Hãy mở app bằng HTTPS và cấp quyền clipboard.');
  }
}

async function copyQueueFanpageContent(entryId) {
  await copyQueueContent(entryId, '');
}

async function copyQueueFanpagePoster(entryId) {
  await copyQueuePoster(entryId, '');
}

async function copyQueuePinnedComment(entryId, groupId = '') {
  const entry = loadQueue().find((item) => item.id === entryId);
  const content = contents.find((item) => item.id === entry?.contentId);
  const group = groups.find((item) => item.id === groupId);
  const pinnedComment = String(content?.pinnedComment || '').trim();
  if (!entry || !content || (groupId && !group)) return;
  if (!pinnedComment) {
    showToast('Bài này chưa có bình luận ghim. Hãy bổ sung trong Sửa nội dung.');
    return;
  }
  await copyText(pinnedComment);
  showToast(`Đã sao chép bình luận ghim${group ? ` cho group ${group.name}` : ' cho fanpage'}.`);
}

async function copyQueueFanpagePinnedComment(entryId) {
  await copyQueuePinnedComment(entryId, '');
}

function readMetric(container, name, decimals = 0) {
  const raw = container.querySelector(`[name="${name}"]`)?.value.trim() || '';
  if (!raw) return '';
  const number = Number(raw.replace(',', '.'));
  if (!Number.isFinite(number)) return '';
  const safe = Math.max(0, number);
  return decimals ? Math.round(safe * 100) / 100 : Math.round(safe);
}

function saveMetricsToQueue(queue, entry, groupId, values) {
  const checkpoint = values.checkpoint || 'Mốc mới nhất';
  const metrics = {
    views: values.views ?? '',
    viewers: values.viewers ?? '',
    interactions: values.interactions ?? '',
    income: values.income ?? '',
    follows: values.follows ?? '',
    impressions: values.impressions ?? '',
    comments: values.comments ?? '',
    checkpoint,
    updatedAt: values.updatedAt || new Date().toISOString()
  };
  entry.metrics = { ...(entry.metrics || {}), [groupId]: metrics };
  const history = [...(entry.metricsHistory?.[groupId] || [])];
  const existingIndex = history.findIndex((snapshot) => snapshot.checkpoint === checkpoint);
  if (existingIndex >= 0) history[existingIndex] = metrics;
  else history.push(metrics);
  entry.metricsHistory = { ...(entry.metricsHistory || {}), [groupId]: history.slice(-10) };
}

function saveQueueMetrics(entryId, groupId, container) {
  const queue = loadQueue();
  const entry = queue.find((item) => item.id === entryId);
  if (!entry) return;
  const values = {
    views: readMetric(container, 'views'),
    viewers: readMetric(container, 'viewers'),
    interactions: readMetric(container, 'interactions'),
    income: readMetric(container, 'income', 2),
    follows: readMetric(container, 'follows'),
    impressions: readMetric(container, 'impressions'),
    comments: readMetric(container, 'comments'),
    checkpoint: container.querySelector('[name="checkpoint"]')?.value || 'Mốc mới nhất'
  };
  const metricKeys = ['views', 'viewers', 'interactions', 'income', 'follows', 'impressions', 'comments'];
  if (!metricKeys.some((key) => values[key] !== '')) {
    showToast('Chưa có số liệu để lưu. Nhập ít nhất một chỉ số; nếu thực tế là 0, nhập số 0.');
    return;
  }
  saveMetricsToQueue(queue, entry, groupId, values);
  saveQueue(queue);
  renderPostingQueue();
  const group = groups.find((item) => item.id === groupId);
  recordAudit('Lưu mốc số liệu', `${group?.name || 'Group không rõ'} · ${container.querySelector('[name="checkpoint"]')?.value || 'Mốc mới nhất'}`);
  showToast('Đã lưu số liệu hiệu quả cho group.');
}

function updateQueueStatus(entryId, groupId, status) {
  const queue = loadQueue();
  const entry = queue.find((item) => item.id === entryId);
  if (!entry) return false;
  const previousStatus = getQueueGroupStatus(entry, groupId);
  const item = { entry, group: groups.find((group) => group.id === groupId), content: contents.find((content) => content.id === entry.contentId), groupId };
  if (['sent', 'approved'].includes(status) && !canRecordDailyPost(item)) {
    const limit = getDailyPostingLimitForItem(item);
    showToast(`Đã đạt giới hạn ${formatDailyLimit(limit)}/ngày cho phạm vi này. Có thể sửa lại giới hạn để tiếp tục.`);
    renderPostingQueue();
    return false;
  }
  let autoScheduled = false;
  const now = new Date().toISOString();
  entry.groupStatuses = { ...(entry.groupStatuses || {}), [groupId]: status };
  entry.status = status;
  entry.updatedAt = now;
  if (['sent', 'approved'].includes(status) && !entry.groupPostedAt?.[groupId]) entry.groupPostedAt = { ...(entry.groupPostedAt || {}), [groupId]: now };
  if (['draft', 'skipped', 'error'].includes(status) && entry.groupPostedAt) delete entry.groupPostedAt[groupId];
  if (status === 'sent' && previousStatus !== 'sent') appendQueuePostingHistoryEvent(entry, groupId, 'sent', now);
  if (status === 'approved' && previousStatus !== 'approved') {
    if (previousStatus === 'sent') markLatestQueuePostingHistoryApproved(entry, groupId, now);
    else appendQueuePostingHistoryEvent(entry, groupId, 'approved', now);
  }
  if (['pending', 'approved', 'rejected'].includes(status)) entry.groupApprovalCheckedAt = { ...(entry.groupApprovalCheckedAt || {}), [groupId]: now };
  if (['approved', 'rejected', 'skipped', 'error'].includes(status) && entry.nextChecks) delete entry.nextChecks[groupId];
  if (status !== 'error' && entry.groupErrors) delete entry.groupErrors[groupId];
  if (status === 'sent' && !entry.nextChecks?.[groupId]) {
    entry.nextChecks = { ...(entry.nextChecks || {}), [groupId]: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() };
    autoScheduled = true;
  }
  saveQueue(queue);
  renderPostingQueue();
  const group = groups.find((item) => item.id === groupId);
  recordAudit('Cập nhật trạng thái', `${group?.name || 'Group không rõ'} · ${queueStatusLabels[status] || status}`);
  showToast(autoScheduled ? `Đã cập nhật: ${queueStatusLabels[status]}. App tự hẹn kiểm tra sau 2 giờ.` : `Đã cập nhật: ${queueStatusLabels[status]}.`);
  return true;
}

function markQueuePostedAndApproved(entryId, groupId) {
  const queue = loadQueue();
  const entry = queue.find((item) => item.id === entryId);
  if (!entry || getQueueGroupStatus(entry, groupId) !== 'sent') {
    showToast('Chỉ có mục Đã đăng mới có thể đánh dấu Đã đăng & duyệt.');
    renderPostingQueue();
    return;
  }
  const now = new Date().toISOString();
  entry.groupStatuses = { ...(entry.groupStatuses || {}), [groupId]: 'approved' };
  entry.status = 'approved';
  if (!entry.groupPostedAt?.[groupId]) entry.groupPostedAt = { ...(entry.groupPostedAt || {}), [groupId]: now };
  markLatestQueuePostingHistoryApproved(entry, groupId, now);
  entry.groupApprovalCheckedAt = { ...(entry.groupApprovalCheckedAt || {}), [groupId]: now };
  if (entry.nextChecks) delete entry.nextChecks[groupId];
  if (entry.groupErrors) delete entry.groupErrors[groupId];
  entry.updatedAt = now;
  saveQueue(queue);
  renderPostingQueue();
  const group = groups.find((item) => item.id === groupId);
  recordAudit('Đánh dấu đã đăng và duyệt', group?.name || 'Group không rõ');
  showToast(`Đã ghi nhận ${group?.name || 'group'}: đã đăng và đã duyệt.`);
}

function markAllVisibleQueuePostedAndApproved() {
  const queue = loadQueue();
  const visibleKeys = new Set(visibleQueueItemKeys);
  const items = queue.flatMap((entry) => (entry.groupIds || []).map((groupId) => ({
    entry,
    group: groups.find((group) => group.id === groupId),
    content: contents.find((content) => content.id === entry.contentId),
    groupId
  }))).filter((item) => visibleKeys.has(`${item.entry.id}|${item.groupId}`));
  const candidates = items.filter((item) => getQueueGroupStatus(item.entry, item.groupId) === 'sent');
  if (!candidates.length) {
    showToast('Không có mục Đã đăng phù hợp trong phạm vi đang hiển thị.');
    return;
  }
  const available = candidates.filter(canRecordDailyPost);
  const blocked = candidates.length - available.length;
  if (!available.length) {
    showToast('Các mục Đã đăng đang chọn đã đạt giới hạn lượt đăng trong ngày.');
    return;
  }
  const suffix = blocked ? `\n\n${blocked} mục sẽ được giữ nguyên vì đã đạt giới hạn lượt đăng hôm nay.` : '';
  if (!window.confirm(`Đánh dấu ${available.length} mục Đã đăng đang hiển thị là “Đã đăng & duyệt”?\n\nThao tác này chỉ cập nhật trạng thái duyệt trong app, không tự đăng Facebook.${suffix}`)) return;
  const now = new Date().toISOString();
  available.forEach(({ entry, groupId }) => {
    entry.groupStatuses = { ...(entry.groupStatuses || {}), [groupId]: 'approved' };
    entry.status = 'approved';
    if (!entry.groupPostedAt?.[groupId]) entry.groupPostedAt = { ...(entry.groupPostedAt || {}), [groupId]: now };
    markLatestQueuePostingHistoryApproved(entry, groupId, now);
    entry.groupApprovalCheckedAt = { ...(entry.groupApprovalCheckedAt || {}), [groupId]: now };
    if (entry.nextChecks) delete entry.nextChecks[groupId];
    if (entry.groupErrors) delete entry.groupErrors[groupId];
    entry.updatedAt = now;
  });
  saveQueue(queue);
  renderPostingQueue();
  recordAudit('Duyệt tất cả mục đã đăng đang hiển thị', `${available.length} mục${blocked ? ` · ${blocked} mục giữ nguyên do giới hạn` : ''}`);
  showToast(`Đã duyệt ${available.length} mục đã đăng.`);
}

function saveQueueCheck(entryId, groupId, input) {
  const queue = loadQueue();
  const entry = queue.find((item) => item.id === entryId);
  if (!entry) return;
  const rawValue = input?.value || '';
  if (rawValue) {
    const parsed = new Date(rawValue);
    if (Number.isNaN(parsed.getTime())) { showToast('Thời điểm kiểm tra không hợp lệ.'); return; }
    entry.nextChecks = { ...(entry.nextChecks || {}), [groupId]: parsed.toISOString() };
  } else if (entry.nextChecks) {
    delete entry.nextChecks[groupId];
  }
  entry.updatedAt = new Date().toISOString();
  saveQueue(queue);
  renderPostingQueue();
  const group = groups.find((item) => item.id === groupId);
  recordAudit('Lưu lịch kiểm tra', group?.name || 'Group không rõ');
  showToast(rawValue ? 'Đã lưu lịch kiểm tra group.' : 'Đã xóa lịch kiểm tra group.');
}

function removeQueueItem(entryId, groupId) {
  const queue = loadQueue();
  const entry = queue.find((item) => item.id === entryId);
  if (!entry) return;
  entry.groupIds = entry.groupIds.filter((id) => id !== groupId);
  if (entry.groupStatuses) delete entry.groupStatuses[groupId];
  if (entry.metrics) delete entry.metrics[groupId];
  if (entry.metricsHistory) delete entry.metricsHistory[groupId];
  if (entry.nextChecks) delete entry.nextChecks[groupId];
  if (entry.postingHistory) delete entry.postingHistory[groupId];
  const nextQueue = entry.groupIds.length ? queue : queue.filter((item) => item.id !== entryId);
  saveQueue(nextQueue);
  renderPostingQueue();
  const group = groups.find((item) => item.id === groupId);
  const content = contents.find((item) => item.id === entry.contentId);
  recordAudit('Xóa khỏi hàng đợi', `${group?.name || 'Group không rõ'} · ${content?.title || 'Nội dung không rõ'}`);
  showToast('Đã xóa group khỏi hàng đợi.');
}

function renderTable() {
  const filtered = getFilteredGroups();
  el.visibleCount.textContent = filtered.length;
  el.empty.hidden = filtered.length > 0;
  el.rows.innerHTML = filtered.map((group) => {
    const initial = escapeHtml(group.name.trim().charAt(0).toUpperCase() || 'G');
    const rate = Math.max(0, Math.min(100, Number(group.approvalRate) || 0));
    const link = safeUrl(group.url);
    const linkMarkup = link
      ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(group.url)}">${escapeHtml(group.url)}</a>`
      : `<span class="updated">Link không hợp lệ</span>`;
    return `<tr>
      <td><div class="group-cell"><span class="group-avatar">${initial}</span><div><strong title="${escapeHtml(group.name)}">${escapeHtml(group.name)}</strong>${linkMarkup}</div></div></td>
      <td><button type="button" class="topic-pill topic-edit" data-action="edit-topic" data-id="${escapeHtml(group.id)}" title="Bấm để đổi chủ đề">${escapeHtml(group.topic || 'Chưa phân loại')}</button></td>
      <td>${escapeHtml(group.audience || '—')}</td>
      <td><span class="status-pill status-${escapeHtml(group.status)}">${statusLabels[group.status] || 'Không rõ'}</span></td>
      <td><div class="rate"><span class="rate-track"><i style="width:${rate}%"></i></span><span>${rate}%</span></div></td>
      <td><span class="updated">${formatDate(group.updatedAt)}</span></td>
      <td><div class="row-actions"><button class="icon-button edit" type="button" data-action="edit" data-id="${group.id}" aria-label="Sửa ${escapeHtml(group.name)}">✎</button><button class="icon-button delete" type="button" data-action="delete" data-id="${group.id}" aria-label="Xóa ${escapeHtml(group.name)}">×</button></div></td>
    </tr>`;
  }).join('');
}

function renderAuditLog() {
  if (!el.auditList) return;
  const logs = loadAuditLog();
  const count = document.querySelector('#auditHistorySummaryCount');
  if (count) count.textContent = `${logs.length} dòng · bấm mũi tên để xem`;
  el.auditList.innerHTML = logs.length
    ? logs.slice(0, 30).map((item) => `<div class="audit-row"><div><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.detail)}</span></div><time>${escapeHtml(formatDateTime(item.at))}</time></div>`).join('')
    : '<div class="audit-empty">Chưa có thao tác được ghi.</div>';
}

function render() {
  renderStats();
  renderTopics();
  renderRouting();
  renderContentLibrary();
  renderPostingQueue();
  renderAnalytics();
  renderAuditLog();
  renderTable();
}

function saveCurrentBatchDecisions() {
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  if (!content || !selectedGroups.length) {
    showToast('Chưa có lô hiện tại để lưu quyết định.');
    return;
  }
  const decisions = loadBatchDecisions();
  el.batchDecisionList.querySelectorAll('[data-batch-decision-group]').forEach((select) => {
    decisions[getBatchDecisionKey(content.id, select.dataset.batchDecisionGroup)] = { decision: select.value, updatedAt: new Date().toISOString() };
  });
  saveBatchDecisions(decisions);
  renderBatchDecisions();
  recordAudit('Chốt quyết định lô', `${selectedGroups.length} group · ${content.title}`);
  showToast(`Đã lưu quyết định cho ${selectedGroups.length} group. Chưa tự đổi trạng thái group.`);
}

function saveSingleBatchDecision(groupId) {
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  const group = selectedGroups.find((item) => item.id === groupId);
  const select = el.batchDecisionList.querySelector(`[data-batch-decision-group="${CSS.escape(groupId)}"]`);
  if (!content || !group || !select) return;
  const decisions = loadBatchDecisions();
  decisions[getBatchDecisionKey(content.id, groupId)] = { decision: select.value, updatedAt: new Date().toISOString() };
  saveBatchDecisions(decisions);
  renderBatchDecisions();
  recordAudit('Chốt quyết định group', `${group.name} · ${select.value}`);
  showToast(`Đã lưu quyết định riêng cho ${group.name}.`);
}

function applyCurrentBatchDecisions() {
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  if (!content || !selectedGroups.length) {
    showToast('Chưa có lô hiện tại để áp dụng quyết định.');
    return;
  }
  const decisions = loadBatchDecisions();
  const priorityGroups = selectedGroups.filter((group) => decisions[getBatchDecisionKey(content.id, group.id)]?.decision === 'priority');
  const pausedGroups = selectedGroups.filter((group) => decisions[getBatchDecisionKey(content.id, group.id)]?.decision === 'pause');
  if (!priorityGroups.length && !pausedGroups.length) {
    showToast('Chưa có quyết định Ưu tiên hoặc Tạm dừng đã lưu để áp dụng.');
    return;
  }
  const affected = [...priorityGroups, ...pausedGroups];
  const message = `Áp dụng cho ${affected.length} group?\n\nƯu tiên: ${priorityGroups.length}\nTạm dừng: ${pausedGroups.length}\n\nCác lựa chọn Giữ, Giảm tần suất và Chờ thêm dữ liệu sẽ không đổi trạng thái.`;
  if (!confirm(message)) return;
  const priorityIds = new Set(priorityGroups.map((group) => group.id));
  const pausedIds = new Set(pausedGroups.map((group) => group.id));
  groups = groups.map((group) => {
    if (priorityIds.has(group.id)) return { ...group, status: 'ready', updatedAt: new Date().toISOString() };
    if (pausedIds.has(group.id)) return { ...group, status: 'inactive', updatedAt: new Date().toISOString() };
    return group;
  });
  saveGroups();
  render();
  recordAudit('Áp dụng quyết định lô', `Ưu tiên ${priorityGroups.length} · Tạm dừng ${pausedGroups.length}`);
  showToast(`Đã áp dụng: ưu tiên ${priorityGroups.length}, tạm dừng ${pausedGroups.length}.`);
}

function prepareBatchFromDecisions() {
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  if (!content || !selectedGroups.length) {
    showToast('Chưa có lô hiện tại để chuẩn bị lại.');
    return;
  }
  const decisions = loadBatchDecisions();
  const selectedIds = selectedGroups
    .filter((group) => ['priority', 'keep'].includes(decisions[getBatchDecisionKey(content.id, group.id)]?.decision))
    .map((group) => group.id);
  if (!selectedIds.length) {
    showToast('Chưa có group nào được lưu quyết định Ưu tiên hoặc Giữ.');
    return;
  }
  batchSelection = { ...batchSelection, contentId: content.id, groupIds: selectedIds, updatedAt: new Date().toISOString() };
  selectedContentId = content.id;
  saveBatchSelection();
  render();
  document.querySelector('#batch-prep')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  recordAudit('Chuẩn bị lô theo quyết định', `${selectedIds.length} group · ${content.title}`);
  showToast(`Đã chọn sẵn ${selectedIds.length} group Ưu tiên/Giữ. Chưa tạo hàng đợi.`);
}

function inheritSimulationIntoReal() {
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  if (getBatchMode() !== 'simulation') {
    showToast('Hãy mở đúng lô Giả lập trước khi kế thừa sang thực tế.');
    return;
  }
  if (!content || !selectedGroups.length) {
    showToast('Lô giả lập hiện tại chưa có nội dung hoặc group.');
    return;
  }
  const decisions = loadBatchDecisions();
  const decisionRows = selectedGroups.map((group) => ({
    group,
    decision: decisions[getBatchDecisionKey(content.id, group.id)]?.decision || 'pending'
  }));
  const inheritedRows = decisionRows.filter(({ decision }) => ['priority', 'keep'].includes(decision));
  if (!inheritedRows.length) {
    showToast('Chưa có group Giữ hoặc Ưu tiên để kế thừa.');
    return;
  }
  const counts = decisionRows.reduce((map, row) => {
    map[row.decision] = (map[row.decision] || 0) + 1;
    return map;
  }, {});
  const message = `Tạo lô thực tế nháp từ kết quả giả lập?\n\nĐược kế thừa: ${inheritedRows.length} group (Giữ ${counts.keep || 0}, Ưu tiên ${counts.priority || 0})\nLoại khỏi lô: ${decisionRows.length - inheritedRows.length} group\n\nKhông sao chép lượt xem, doanh thu hoặc số liệu giả lập. Chưa tạo hàng đợi và chưa đăng bài.`;
  if (!confirm(message)) return;
  const inheritedAt = new Date().toISOString();
  batchSelection = {
    contentId: content.id,
    groupIds: inheritedRows.map(({ group }) => group.id),
    mode: 'real',
    inheritedFrom: {
      mode: 'simulation',
      contentId: content.id,
      sourceGroupIds: selectedGroups.map((group) => group.id),
      inheritedGroupIds: inheritedRows.map(({ group }) => group.id),
      decisionSnapshot: Object.fromEntries(decisionRows.map(({ group, decision }) => [group.id, decision])),
      inheritedAt
    },
    updatedAt: inheritedAt
  };
  saveBatchSelection();
  render();
  document.querySelector('#batch-prep')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  recordAudit('Kế thừa kết quả giả lập sang lô thực tế', `${inheritedRows.length} group · ${content.title}`);
  showToast(`Đã tạo lô thực tế nháp từ ${inheritedRows.length} group. Chưa tạo hàng đợi.`);
}

function showToast(message) {
  clearTimeout(toastTimer);
  el.toast.textContent = message;
  el.toast.classList.add('show');
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 3200);
}

function openDialog(group = null) {
  editingId = group?.id || null;
  el.form.reset();
  el.error.hidden = true;
  el.title.textContent = group ? 'Cập nhật group' : 'Thêm group mới';
  if (group) {
    Object.entries(group).forEach(([key, value]) => {
      const field = el.form.elements.namedItem(key);
      if (field) field.value = value ?? '';
    });
  } else {
    el.form.elements.namedItem('status').value = 'testing';
    el.form.elements.namedItem('approvalRate').value = '0';
  }
  el.dialog.showModal();
  requestAnimationFrame(() => el.form.elements.namedItem('name').focus());
}

function closeDialog() {
  el.dialog.close();
  editingId = null;
}

function handleSubmit(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(el.form));
  const wasEditing = Boolean(editingId);
  const previousGroup = groups.find((group) => group.id === editingId);
  if (!safeUrl(values.url)) {
    el.error.textContent = 'Link group phải bắt đầu bằng http:// hoặc https://.';
    el.error.hidden = false;
    return;
  }
  const duplicate = findDuplicateGroup({ url: values.url }, groups, editingId);
  if (duplicate) {
    el.error.textContent = `ID/link group này đã tồn tại trong “${duplicate.group.name}”.`;
    el.error.hidden = false;
    return;
  }
  const record = {
    id: editingId || createId(),
    name: values.name.trim(),
    url: values.url.trim(),
    topic: values.topic.trim(),
    audience: values.audience.trim(),
    status: values.status,
    approvalRate: Math.max(0, Math.min(100, Number(values.approvalRate) || 0)),
    notes: values.notes.trim(),
    updatedAt: new Date().toISOString()
  };
  if (editingId) groups = groups.map((group) => group.id === editingId ? record : group);
  else groups = [record, ...groups];
  saveGroups();
  closeDialog();
  render();
  recordAudit(wasEditing ? 'Cập nhật group' : 'Thêm group', record.name);
  const topicChanged = wasEditing && previousGroup && normalize(previousGroup.topic) !== normalize(record.topic);
  showToast(topicChanged ? `Đã chuyển group sang chủ đề “${record.topic}”. Hàng đợi hiện tại được giữ nguyên.` : wasEditing ? 'Đã cập nhật group.' : 'Đã thêm group mới.');
}

function deleteGroup(id) {
  const group = groups.find((item) => item.id === id);
  if (!group || !confirm(`Xóa “${group.name}” khỏi danh mục?`)) return;
  groups = groups.filter((item) => item.id !== id);
  saveGroups();
  render();
  recordAudit('Xóa group', group.name);
  showToast('Đã xóa group khỏi danh mục.');
}

async function openDeletedGroupsDialog() {
  if (!el.deletedGroupsDialog || !el.deletedGroupsList) return;
  if (!groupSyncEnabled) {
    showToast('Chưa kết nối Supabase nên chưa thể tải group đã xóa.');
    return;
  }
  el.deletedGroupsList.innerHTML = '<div class="archive-empty">Đang tải danh sách group đã xóa...</div>';
  el.deletedGroupsDialog.showModal();
  try {
    const response = await fetch('/api/groups/archived', { headers: { accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể tải group đã xóa.');
    const archived = Array.isArray(payload.groups) ? payload.groups : [];
    el.deletedGroupsList.innerHTML = archived.length ? archived.map((group) => `<div class="archive-row"><div><strong>${escapeHtml(group.name || 'Group không tên')}</strong><small>${escapeHtml(group.topic_label || 'Chưa phân loại')} · Xóa lúc ${escapeHtml(formatDateTime(group.deleted_at))}</small></div><button type="button" class="button secondary" data-restore-group="${escapeHtml(group.id)}">Khôi phục</button></div>`).join('') : '<div class="archive-empty">Chưa có group nào bị xóa mềm.</div>';
  } catch (error) {
    el.deletedGroupsList.innerHTML = `<div class="archive-empty">${escapeHtml(error.message || 'Không thể tải group đã xóa.')}</div>`;
  }
}

async function restoreDeletedGroup(id) {
  const groupName = el.deletedGroupsList?.querySelector(`[data-restore-group="${CSS.escape(id)}"]`)?.closest('.archive-row')?.querySelector('strong')?.textContent || 'group này';
  if (!confirm(`Khôi phục “${groupName}” về danh sách đang dùng?`)) return;
  try {
    const response = await fetch('/api/groups/restore', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ ids: [id] }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể khôi phục group.');
    await loadGroupsFromSupabase();
    recordAudit('Khôi phục group', groupName);
    el.deletedGroupsDialog?.close();
    showToast(`Đã khôi phục ${payload.restored || 1} group.`);
  } catch (error) {
    showToast(error.message || 'Không thể khôi phục group.');
  }
}

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const candidates = [',', ';', '\t'];
  const delimiter = candidates.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function headerIndex(headers, aliases) {
  return headers.findIndex((header) => aliases.includes(normalize(header).replace(/\s+/g, '')));
}

async function importCsv(file) {
  const rows = parseCsv(await file.text());
  if (rows.length < 2) throw new Error('File CSV không có dữ liệu.');
  const headers = rows[0];
  const indexes = {
    name: headerIndex(headers, ['name', 'ten', 'tengroup', 'groupname']),
    url: headerIndex(headers, ['url', 'link', 'linkgroup', 'groupurl']),
    topic: headerIndex(headers, ['topic', 'chude']),
    audience: headerIndex(headers, ['audience', 'tep', 'tepdoituong', 'doituong']),
    status: headerIndex(headers, ['status', 'trangthai']),
    approvalRate: headerIndex(headers, ['approvalrate', 'tyleduyet']),
    notes: headerIndex(headers, ['notes', 'ghichu'])
  };
  if (indexes.name < 0 || indexes.url < 0) throw new Error('CSV cần có ít nhất hai cột: name và url.');
  let added = 0, duplicateId = 0, invalid = 0;
  const knownGroupIds = new Set(groups.map((group) => normalizeGroupUrlKey(group.url)).filter(Boolean));
  rows.slice(1).forEach((row) => {
    const name = (row[indexes.name] || '').trim();
    const url = (row[indexes.url] || '').trim();
    if (!name || !url || !safeUrl(url)) { invalid += 1; return; }
    const groupIdKey = normalizeGroupUrlKey(url);
    if (knownGroupIds.has(groupIdKey)) { duplicateId += 1; return; }
    let status = indexes.status >= 0 ? normalize(row[indexes.status]).replace(/\s+/g, '') : 'testing';
    const statusMap = { sansang: 'ready', ready: 'ready', dangtest: 'testing', testing: 'testing', choduyet: 'pending', pending: 'pending', bituchoi: 'rejected', rejected: 'rejected', tamdung: 'inactive', inactive: 'inactive' };
    status = statusMap[status] || 'testing';
    groups.push({
      id: createId(), name, url,
      topic: indexes.topic >= 0 ? (row[indexes.topic] || 'Chưa phân loại').trim() : 'Chưa phân loại',
      audience: indexes.audience >= 0 ? (row[indexes.audience] || 'Chưa xác định').trim() : 'Chưa xác định',
      status,
      approvalRate: indexes.approvalRate >= 0 ? Math.max(0, Math.min(100, Number(row[indexes.approvalRate]) || 0)) : 0,
      notes: indexes.notes >= 0 ? (row[indexes.notes] || '').trim() : '',
      updatedAt: new Date().toISOString()
    });
    knownGroupIds.add(groupIdKey);
    added += 1;
  });
  saveGroups(); render();
  const duplicate = duplicateId;
  recordAudit('Nhập group CSV', `${added} group · lọc ${duplicate} trùng · ${invalid} lỗi`);
  showToast(`Đã nhập ${added} group · lọc ${duplicate} trùng theo ID/link · ${invalid} dòng lỗi.`);
}

function csvCell(value) {
  const text = value == null ? '' : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportAnalyticsCsv() {
  const rows = updateAnalyticsFilters(getAnalyticsItems()).map(({ entry, group, content, groupId, metrics, history }) => {
    const early = history.find((snapshot) => snapshot.checkpoint === '2–4 giờ') || {};
    const late = history.find((snapshot) => snapshot.checkpoint === '24 giờ') || {};
    return {
      group: group.name,
      topic: group.topic,
      audience: group.audience,
      content: content.title,
      status: queueStatusLabels[getQueueGroupStatus(entry, groupId)] || '',
      views: metrics.views,
      viewers: metrics.viewers,
      interactions: metrics.interactions,
      follows: metrics.follows,
      income: metrics.income,
      impressions: metrics.impressions,
      comments: metrics.comments,
      checkpoint: metrics.checkpoint || 'Mốc mới nhất',
      earlyViews: early.views || '',
      earlyInteractions: early.interactions || '',
      earlyIncome: early.income || '',
      lateViews: late.views || '',
      lateInteractions: late.interactions || '',
      lateIncome: late.income || '',
      updatedAt: metrics.updatedAt || ''
    };
  });
  if (!rows.length) {
    showToast('Chưa có số liệu để xuất báo cáo.');
    return;
  }
  const headers = ['group', 'topic', 'audience', 'content', 'status', 'views', 'viewers', 'interactions', 'follows', 'income', 'impressions', 'comments', 'checkpoint', 'views_2_4h', 'interactions_2_4h', 'income_2_4h', 'views_24h', 'interactions_24h', 'income_24h', 'updatedAt'];
  const lines = [headers.join(','), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(','))];
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mkt-fanpage-performance-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`Đã xuất báo cáo ${rows.length} dòng.`);
}

function downloadMetricsTemplate() {
  const headers = ['group', 'groupUrl', 'content', 'checkpoint', 'views', 'viewers', 'interactions', 'income', 'follows', 'impressions', 'comments'];
  const activeFilter = el.queueFilter?.value || 'all';
  const currentBatch = getBatchQueueGroups();
  const batchGroupIds = new Set(currentBatch.groups.map((group) => group.id));
  const rows = loadQueue().flatMap((entry) => entry.groupIds.map((groupId) => {
    const group = groups.find((item) => item.id === groupId);
    const content = contents.find((item) => item.id === entry.contentId);
    return group && content ? { entry, group, content, groupId } : null;
  }).filter(Boolean)).filter(({ entry, groupId }) => {
    if (activeFilter === 'due') return isQueueCheckDue(entry, groupId);
    if (activeFilter === 'missing') return !hasQueueMetrics(getQueueMetrics(entry, groupId));
    if (activeFilter === 'batch') return currentBatch.content && entry.contentId === currentBatch.content.id && (entry.mode || 'unknown') === getBatchMode() && batchGroupIds.has(groupId);
    return activeFilter === 'all' || getQueueGroupStatus(entry, groupId) === activeFilter;
  }).map(({ group, content }) => [group.name, group.url, content.title, '2–4 giờ', '', '', '', '', '', '', '']);
  const lines = [headers.join(','), ...rows.map((row) => row.map(csvCell).join(','))];
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mkt-fanpage-metrics-template-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`Đã tải mẫu ${rows.length} dòng${activeFilter === 'all' ? '' : ' theo bộ lọc hiện tại'}.`);
}

function downloadBatchMetricsTemplate() {
  const { content, groups: selectedGroups } = getBatchQueueGroups();
  const queue = loadQueue();
  const headers = ['group', 'groupUrl', 'content', 'checkpoint', 'views', 'viewers', 'interactions', 'income', 'follows', 'impressions', 'comments'];
  const rows = selectedGroups.map((group) => {
    const entry = queue.find((candidate) => candidate.contentId === content?.id && (candidate.mode || 'unknown') === getBatchMode() && (candidate.groupIds || []).includes(group.id));
    return entry && content ? [group.name, group.url, content.title, '2–4 giờ', '', '', '', '', '', '', ''] : null;
  }).filter(Boolean);
  if (!rows.length) {
    showToast('Lô hiện tại chưa có group trong hàng đợi.');
    return;
  }
  const lines = [headers.join(','), ...rows.map((row) => row.map(csvCell).join(','))];
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mkt-fanpage-batch-metrics-template-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`Đã tải mẫu số liệu cho ${rows.length} group của lô hiện tại.`);
}

function parseMetricValue(value, decimals = 0) {
  const raw = String(value ?? '').trim().replace(',', '.');
  if (!raw) return '';
  const number = Number(raw);
  if (!Number.isFinite(number)) return '';
  const safe = Math.max(0, number);
  return decimals ? Math.round(safe * 100) / 100 : Math.round(safe);
}

async function importMetricsCsv(file) {
  const rows = parseCsv(await file.text());
  if (rows.length < 2) throw new Error('File CSV số liệu không có dữ liệu.');
  const headers = rows[0];
  const indexes = {
    group: headerIndex(headers, ['group', 'name', 'tengroup', 'groupname']),
    groupUrl: headerIndex(headers, ['groupurl', 'url', 'link', 'linkgroup']),
    content: headerIndex(headers, ['content', 'noidung', 'title', 'tieude']),
    checkpoint: headerIndex(headers, ['checkpoint', 'mocdo', 'moc']),
    views: headerIndex(headers, ['views', 'luotxem']),
    viewers: headerIndex(headers, ['viewers', 'nguoi xem', 'nguoixem']),
    interactions: headerIndex(headers, ['interactions', 'tuongtac']),
    income: headerIndex(headers, ['income', 'thunhap']),
    follows: headerIndex(headers, ['follows', 'follow', 'luottheodoi']),
    impressions: headerIndex(headers, ['impressions', 'luothienthi']),
    comments: headerIndex(headers, ['comments', 'binhluan']),
    updatedAt: headerIndex(headers, ['updatedat', 'capnhat', 'thoigian'])
  };
  if (indexes.group < 0 || indexes.content < 0) throw new Error('CSV cần có ít nhất hai cột: group và content.');
  const queue = loadQueue();
  let imported = 0;
  let unmatched = 0;
  let invalid = 0;
  let emptyMetrics = 0;
  rows.slice(1).forEach((row) => {
    const groupName = (row[indexes.group] || '').trim();
    const groupUrl = indexes.groupUrl >= 0 ? normalizeUrl(row[indexes.groupUrl] || '') : '';
    const contentTitle = (row[indexes.content] || '').trim();
    if (!groupName || !contentTitle) { invalid += 1; return; }
    const matches = queue.flatMap((entry) => entry.groupIds.map((groupId) => ({
      entry,
      groupId,
      group: groups.find((item) => item.id === groupId),
      content: contents.find((item) => item.id === entry.contentId)
    }))).filter((item) => item.group && item.content && normalize(item.group.name) === normalize(groupName) && normalize(item.content.title) === normalize(contentTitle) && (!groupUrl || normalizeUrl(item.group.url) === groupUrl));
    if (!matches.length) { unmatched += 1; return; }
    const importedDate = indexes.updatedAt >= 0 && row[indexes.updatedAt] ? new Date(row[indexes.updatedAt]) : null;
    const values = {
      views: indexes.views >= 0 ? parseMetricValue(row[indexes.views]) : '',
      viewers: indexes.viewers >= 0 ? parseMetricValue(row[indexes.viewers]) : '',
      interactions: indexes.interactions >= 0 ? parseMetricValue(row[indexes.interactions]) : '',
      income: indexes.income >= 0 ? parseMetricValue(row[indexes.income], 2) : '',
      follows: indexes.follows >= 0 ? parseMetricValue(row[indexes.follows]) : '',
      impressions: indexes.impressions >= 0 ? parseMetricValue(row[indexes.impressions]) : '',
      comments: indexes.comments >= 0 ? parseMetricValue(row[indexes.comments]) : '',
      checkpoint: indexes.checkpoint >= 0 ? (row[indexes.checkpoint] || '').trim() : 'Mốc mới nhất',
      updatedAt: importedDate && !Number.isNaN(importedDate.getTime()) ? importedDate.toISOString() : new Date().toISOString()
    };
    if (!['views', 'viewers', 'interactions', 'income', 'follows', 'impressions', 'comments'].some((key) => values[key] !== '')) {
      emptyMetrics += 1;
      return;
    }
    matches.forEach(({ entry, groupId }) => saveMetricsToQueue(queue, entry, groupId, values));
    imported += matches.length;
  });
  if (!imported && (unmatched || invalid || emptyMetrics)) throw new Error(`Không có dòng số liệu hợp lệ để nhập (${unmatched} không khớp, ${invalid} lỗi, ${emptyMetrics} dòng còn trống).`);
  saveQueue(queue);
  renderPostingQueue();
  renderAnalytics();
  recordAudit('Nhập số liệu CSV', `${imported} dòng`);
  showToast(`Đã nhập ${imported} dòng số liệu · bỏ qua ${unmatched} không khớp · ${invalid} lỗi · ${emptyMetrics} dòng trống.`);
}

function buildBackup() {
  return {
    app: 'MKT-Fanpage',
    version: 1,
    exportedAt: new Date().toISOString(),
    groups,
    contents: contentsForStorage(),
    queue: loadQueue(),
    audit: loadAuditLog(),
    decisions: loadBatchDecisions(),
    batchRegistry,
    batchSchedules,
    batchSelection,
    dailyPostingLimits: loadDailyPostingLimits()
  };
}

function exportBackup() {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mkt-fanpage-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Đã tải bản sao lưu. Bấm “Mở Backups” để đưa file lên Google Drive.');
}

async function saveBackupOnline() {
  try {
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Sao lưu: đang lưu online...';
      el.backupStatus.classList.remove('is-error', 'is-ready', 'is-warning');
    }
    const response = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(buildBackup())
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể lưu bản sao lưu online.');
    if (el.backupStatus) {
      el.backupStatus.textContent = `Sao lưu: đã lưu ${new Date(payload.updatedAt || Date.now()).toLocaleString('vi-VN')}`;
      el.backupStatus.classList.add('is-ready');
    }
    showToast('Đã lưu bản sao lưu online. Poster vẫn giữ nguyên trong IndexedDB cục bộ.');
  } catch (error) {
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Sao lưu: chưa lưu · cần thử lại';
      el.backupStatus.classList.add('is-error');
    }
    showToast(error.message || 'Không thể lưu bản sao lưu online.');
  }
}

function restoreSummary(backup, sourceLabel) {
  const groupsCount = Array.isArray(backup?.groups) ? backup.groups.length : 0;
  const contentsCount = Array.isArray(backup?.contents) ? backup.contents.length : 0;
  const queueCount = Array.isArray(backup?.queue) ? backup.queue.length : 0;
  const auditCount = Array.isArray(backup?.audit) ? backup.audit.length : 0;
  const snapshotAt = backup?.snapshotAt ? new Date(backup.snapshotAt).toLocaleString('vi-VN') : '';
  const snapshotLine = snapshotAt ? `\nTạo lúc: ${snapshotAt}` : '';
  const snapshotAge = backup?.snapshotAt ? Date.now() - Date.parse(backup.snapshotAt) : 0;
  const ageWarning = snapshotAge > LOCAL_SNAPSHOT_MAX_AGE_MS ? '\nCảnh báo: bản chụp đã quá 24 giờ, nên tạo lại trước khi khôi phục.' : '';
  return `${sourceLabel}${snapshotLine}${ageWarning}\n\nGroup: ${groupsCount}\nNội dung: ${contentsCount}\nLô hàng đợi: ${queueCount}\nNhật ký: ${auditCount}\n\nDữ liệu hiện tại sẽ được thay thế. Poster vẫn giữ trong IndexedDB và không nằm trong JSON. Tiếp tục?`;
}

function readPreRestoreBackup() {
  try {
    const raw = localStorage.getItem(PRE_RESTORE_BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function refreshPreRestoreSnapshotState() {
  const snapshot = readPreRestoreBackup();
  const hasSnapshot = snapshot?.app === 'MKT-Fanpage'
    && Array.isArray(snapshot.groups)
    && Array.isArray(snapshot.contents)
    && Array.isArray(snapshot.queue);
  if (el.restoreLocalSnapshotButton) el.restoreLocalSnapshotButton.disabled = !hasSnapshot;
  if (el.deleteLocalSnapshotButton) el.deleteLocalSnapshotButton.disabled = !hasSnapshot;
  if (hasSnapshot && el.backupStatus && el.backupStatus.textContent === 'Sao lưu: chưa chạy') {
    const snapshotAt = snapshot.snapshotAt ? new Date(snapshot.snapshotAt).toLocaleString('vi-VN') : 'không rõ thời điểm';
    const snapshotAge = snapshot.snapshotAt ? Date.now() - Date.parse(snapshot.snapshotAt) : 0;
    const isStale = snapshotAge > LOCAL_SNAPSHOT_MAX_AGE_MS;
    el.backupStatus.textContent = `Sao lưu: có bản chụp cục bộ · ${snapshotAt} · ${snapshot.groups.length} group${isStale ? ' · đã cũ, nên chụp lại' : ''}`;
    el.backupStatus.classList.toggle('is-warning', isStale);
  }
  return hasSnapshot;
}

function deletePreRestoreSnapshot() {
  const snapshot = readPreRestoreBackup();
  if (!snapshot) {
    refreshPreRestoreSnapshotState();
    showToast('Chưa có bản chụp cục bộ để xóa.');
    return;
  }
  if (!confirm('Xóa bản chụp cục bộ này? Dữ liệu hiện tại và poster sẽ không bị ảnh hưởng.')) return;
  localStorage.removeItem(PRE_RESTORE_BACKUP_KEY);
  refreshPreRestoreSnapshotState();
  if (el.backupStatus) {
    el.backupStatus.textContent = 'Sao lưu: đã xóa bản chụp cục bộ';
    el.backupStatus.classList.remove('is-error', 'is-warning');
  }
  recordAudit('Xóa bản chụp cục bộ', `${snapshot.groups.length} group · ${snapshot.contents.length} nội dung`);
  showToast('Đã xóa bản chụp cục bộ. Dữ liệu vận hành hiện tại vẫn giữ nguyên.');
}

function createPreRestoreSnapshot({ recordAuditEntry = true } = {}) {
  try {
    const backup = {
      ...buildBackup(),
      snapshotType: 'local-pre-restore',
      snapshotAt: new Date().toISOString()
    };
    localStorage.setItem(PRE_RESTORE_BACKUP_KEY, JSON.stringify(backup));
    if (el.backupStatus) {
      el.backupStatus.textContent = `Sao lưu: đã chụp cục bộ ${new Date(backup.snapshotAt).toLocaleString('vi-VN')} · ${backup.groups.length} group`;
      el.backupStatus.classList.remove('is-error', 'is-warning');
      el.backupStatus.classList.add('is-ready');
    }
    refreshPreRestoreSnapshotState();
    if (recordAuditEntry) {
      recordAudit('Tạo bản chụp cục bộ', `${backup.groups.length} group · ${backup.contents.length} nội dung · ${backup.queue.length} mục hàng đợi`);
    }
    return backup;
  } catch {
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Sao lưu: không chụp được cục bộ';
      el.backupStatus.classList.remove('is-ready');
      el.backupStatus.classList.add('is-error');
    }
    return null;
  }
}

async function restoreOnlineBackup() {
  try {
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Sao lưu: đang đọc bản online...';
      el.backupStatus.classList.remove('is-error', 'is-ready', 'is-warning');
    }
    const response = await fetch('/api/backup', { headers: { accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Không thể tải bản sao lưu online.');
    if (!payload.backup) { showToast('Chưa có bản sao lưu online.'); return; }
    await applyBackup(payload.backup, restoreSummary(payload.backup, 'Bản sao lưu online'));
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Sao lưu: đã khôi phục';
      el.backupStatus.classList.add('is-ready');
    }
  } catch (error) {
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Sao lưu: khôi phục chưa hoàn tất';
      el.backupStatus.classList.add('is-error');
    }
    showToast(error.message || 'Không thể khôi phục bản sao lưu online.');
  }
}

async function applyBackup(backup, confirmationMessage = restoreSummary(backup, 'Bản sao lưu đã chọn'), auditAction = 'Khôi phục bản sao lưu') {
  if (backup?.app !== 'MKT-Fanpage' || !Array.isArray(backup.groups) || !Array.isArray(backup.contents) || !Array.isArray(backup.queue)) {
    throw new Error('File không đúng định dạng sao lưu MKT-Fanpage.');
  }
  if (!confirm(confirmationMessage)) return;
  if (!createPreRestoreSnapshot({ recordAuditEntry: false })) {
    showToast('Không tạo được bản chụp an toàn cục bộ; thao tác khôi phục đã dừng.');
    return;
  }
  groups = backup.groups;
  contents = normalizeContents(backup.contents);
  batchRegistry = Array.isArray(backup.batchRegistry) ? backup.batchRegistry : [];
  batchSchedules = backup.batchSchedules && typeof backup.batchSchedules === 'object' && !Array.isArray(backup.batchSchedules) ? backup.batchSchedules : {};
  batchSelection = backup.batchSelection && typeof backup.batchSelection === 'object'
    ? { ...loadBatchSelection(), ...backup.batchSelection }
    : loadBatchSelection();
  selectedContentId = sortContentsByCreatedAt(contents)[0]?.id || null;
  saveGroups();
  saveContents();
  saveQueue(backup.queue);
  saveAuditLog(Array.isArray(backup.audit) ? backup.audit : []);
  saveBatchDecisions(backup.decisions && typeof backup.decisions === 'object' ? backup.decisions : {});
  saveDailyPostingLimits(backup.dailyPostingLimits && typeof backup.dailyPostingLimits === 'object' ? backup.dailyPostingLimits : { defaultLimit: 0, topicLimits: {}, batchLimits: {}, groupLimits: {} });
  saveBatchRegistry();
  saveBatchSchedules();
  saveBatchSelection();
  render();
  recordAudit(auditAction, `${groups.length} group · ${contents.length} nội dung`);
  refreshPreRestoreSnapshotState();
  showToast(`Đã khôi phục ${groups.length} group, ${contents.length} nội dung và nhật ký thao tác.`);
}

async function restoreLocalSnapshot() {
  const snapshot = readPreRestoreBackup();
  if (!snapshot) {
    refreshPreRestoreSnapshotState();
    showToast('Chưa có bản chụp cục bộ trước khi khôi phục.');
    return;
  }
  try {
    await applyBackup(snapshot, restoreSummary(snapshot, 'Bản chụp cục bộ trước khôi phục'), 'Khôi phục bản chụp cục bộ');
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Sao lưu: đã khôi phục bản chụp cục bộ';
      el.backupStatus.classList.remove('is-error');
      el.backupStatus.classList.add('is-ready');
    }
  } catch (error) {
    showToast(error.message || 'Không thể khôi phục bản chụp cục bộ.');
  }
}

async function importBackup(file) {
  let backup;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    throw new Error('File sao lưu không phải JSON hợp lệ.');
  }
  await applyBackup(backup, restoreSummary(backup, `File ${file.name}`));
}

function migrationCount(backup) {
  return {
    groups: Array.isArray(backup?.groups) ? backup.groups.length : 0,
    contents: Array.isArray(backup?.contents) ? backup.contents.length : 0,
    queue: Array.isArray(backup?.queue) ? backup.queue.length : 0,
    audit: Array.isArray(backup?.audit) ? backup.audit.length : 0,
  };
}

async function postMigrationJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Không thể đồng bộ ${path}.`);
  return payload;
}

async function migrateBackupToOnline(file) {
  let backup;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    throw new Error('File chuyển dữ liệu không phải JSON hợp lệ.');
  }
  if (backup?.app !== 'MKT-Fanpage' || !Array.isArray(backup.groups) || !Array.isArray(backup.contents) || !Array.isArray(backup.queue)) {
    throw new Error('File không đúng định dạng sao lưu MKT-Fanpage.');
  }

  const counts = migrationCount(backup);
  const previewRequests = await Promise.all([
    postMigrationJson('/api/groups/preview', { groups: backup.groups, replace: false }),
    postMigrationJson('/api/contents/preview', { contents: backup.contents }),
    postMigrationJson('/api/queue/preview', { queue: backup.queue })
  ]);
  const [groupPreview, contentPreview, queuePreview] = previewRequests;
  const summary = [
    `File: ${file.name}`,
    `Group: ${counts.groups} · thêm mới ${groupPreview.newCount || 0} · cập nhật ${groupPreview.updateCount || 0} · lỗi ${groupPreview.invalidCount || 0}`,
    `Nội dung: ${counts.contents} · thêm mới ${contentPreview.newCount || 0} · cập nhật ${contentPreview.updateCount || 0} · lỗi ${contentPreview.invalidCount || 0}`,
    `Lô hàng đợi: ${counts.queue} · hợp lệ ${queuePreview.validBatches || 0} · mục group ${queuePreview.totalItems || 0}`,
    `Nhật ký: ${counts.audit}`,
    '',
    'Poster không nằm trong JSON và vẫn giữ ở IndexedDB trên máy này.',
    'Chỉ đồng bộ sau khi anh xác nhận. Tiếp tục?'
  ].join('\n');
  if (!window.confirm(summary)) {
    showToast('Đã hủy chuyển dữ liệu; chưa ghi dữ liệu mới lên online.');
    return;
  }

  const button = document.querySelector('#migrateOnlineButton');
  if (button) button.disabled = true;
  if (el.backupStatus) {
    el.backupStatus.textContent = 'Chuyển dữ liệu: đang đồng bộ...';
    el.backupStatus.classList.remove('is-error', 'is-warning', 'is-ready');
  }
  try {
    await postMigrationJson('/api/groups/sync', { groups: backup.groups });
    await postMigrationJson('/api/contents/sync', { contents: backup.contents });
    await postMigrationJson('/api/queue/sync', { queue: backup.queue });
    await postMigrationJson('/api/audit', { audit: Array.isArray(backup.audit) ? backup.audit : [] });
    await postMigrationJson('/api/backup', backup);

    if (!createPreRestoreSnapshot({ recordAuditEntry: false })) {
      throw new Error('Đã đồng bộ online nhưng không tạo được bản chụp an toàn cục bộ. Dữ liệu trình duyệt chưa thay đổi.');
    }
    groups = backup.groups;
    contents = normalizeContents(backup.contents);
    batchRegistry = Array.isArray(backup.batchRegistry) ? backup.batchRegistry : [];
    batchSchedules = backup.batchSchedules && typeof backup.batchSchedules === 'object' && !Array.isArray(backup.batchSchedules) ? backup.batchSchedules : {};
    batchSelection = backup.batchSelection && typeof backup.batchSelection === 'object'
      ? { ...loadBatchSelection(), ...backup.batchSelection }
      : loadBatchSelection();
    selectedContentId = sortContentsByCreatedAt(contents)[0]?.id || null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(contentsForStorage()));
    saveQueue(backup.queue);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(Array.isArray(backup.audit) ? backup.audit : []));
    localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify(backup.decisions && typeof backup.decisions === 'object' ? backup.decisions : {}));
    localStorage.setItem(BATCH_REGISTRY_STORAGE_KEY, JSON.stringify(batchRegistry));
    localStorage.setItem(BATCH_SCHEDULES_STORAGE_KEY, JSON.stringify(batchSchedules));
    localStorage.setItem(BATCH_SELECTION_STORAGE_KEY, JSON.stringify(batchSelection));
    render();
    recordAudit('Chuyển dữ liệu Giai đoạn 1 lên online', `${counts.groups} group · ${counts.contents} nội dung · ${counts.queue} lô`);
    if (el.backupStatus) {
      el.backupStatus.textContent = `Chuyển dữ liệu: đã xong · ${counts.groups} group · ${counts.contents} nội dung`;
      el.backupStatus.classList.add('is-ready');
    }
    showToast('Đã chuyển dữ liệu lên online và giữ bản chụp cục bộ để quay lại nếu cần.');
  } catch (error) {
    if (el.backupStatus) {
      el.backupStatus.textContent = 'Chuyển dữ liệu: chưa hoàn tất · cần thử lại';
      el.backupStatus.classList.add('is-error');
    }
    throw new Error(`${error.message} Dữ liệu hiện tại trên trình duyệt vẫn được giữ nguyên.`);
  } finally {
    if (button) button.disabled = false;
  }
}

function exportCsv() {
  const headers = ['name', 'Lô group', 'url', 'topic', 'audience', 'status', 'approvalRate', 'notes', 'updatedAt'];
  const lines = [headers.join(','), ...groups.map((group) => {
    const registeredBatchNames = getRegistryGroupMemberships(group.id)
      .map((batch) => batch.name?.trim())
      .filter(Boolean)
      .join(' | ') || 'Chưa thuộc lô nào';
    return [group.name, registeredBatchNames, group.url, group.topic, group.audience, group.status, group.approvalRate, group.notes, group.updatedAt]
      .map(csvCell)
      .join(',');
  })];
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mkt-fanpage-groups-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`Đã xuất ${groups.length} group.`);
}

function exportAuditCsv() {
  const headers = ['action', 'detail', 'at'];
  const rows = loadAuditLog().map((item) => headers.map((key) => item[key] || ''));
  const lines = [headers.join(','), ...rows.map((row) => row.map(csvCell).join(','))];
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mkt-fanpage-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`Đã xuất ${rows.length} dòng nhật ký.`);
}

document.querySelector('#addButton').addEventListener('click', () => openDialog());
document.querySelector('#importButton').addEventListener('click', () => el.file.click());
document.querySelector('#exportButton').addEventListener('click', exportCsv);
document.querySelector('#backupButton').addEventListener('click', exportBackup);
document.querySelector('#migrateOnlineButton')?.addEventListener('click', () => document.querySelector('#migrationFileInput')?.click());
el.refreshOnlineButton?.addEventListener('click', refreshOnlineData);
el.createLocalSnapshotButton?.addEventListener('click', () => {
  if (createPreRestoreSnapshot()) showToast('Đã tạo bản chụp cục bộ. Có thể dùng để quay lại trước khi khôi phục.');
  else showToast('Không tạo được bản chụp cục bộ.');
});
el.deleteLocalSnapshotButton?.addEventListener('click', deletePreRestoreSnapshot);
document.querySelector('#onlineBackupButton')?.addEventListener('click', saveBackupOnline);
document.querySelector('#restoreOnlineButton')?.addEventListener('click', restoreOnlineBackup);
document.querySelector('#restoreButton').addEventListener('click', () => document.querySelector('#backupFileInput').click());
el.restoreLocalSnapshotButton?.addEventListener('click', restoreLocalSnapshot);
document.querySelector('#backupFileInput').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try { await importBackup(file); } catch (error) { showToast(error.message || 'Không thể khôi phục bản sao lưu.'); }
  event.target.value = '';
});
document.querySelector('#migrationFileInput')?.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try { await migrateBackupToOnline(file); } catch (error) { showToast(error.message || 'Không thể chuyển dữ liệu lên online.'); }
  event.target.value = '';
});
refreshPreRestoreSnapshotState();
document.querySelector('#exportAnalyticsButton').addEventListener('click', exportAnalyticsCsv);
document.querySelector('#analyticsBatchFilter').addEventListener('change', renderAnalytics);
document.querySelector('#analyticsModeFilter')?.addEventListener('change', renderAnalytics);
document.querySelector('#analyticsTopicFilter').addEventListener('change', renderAnalytics);
document.querySelector('#analyticsStatusFilter').addEventListener('change', renderAnalytics);
el.saveBatchDecisionsButton?.addEventListener('click', saveCurrentBatchDecisions);
el.applyBatchDecisionsButton?.addEventListener('click', applyCurrentBatchDecisions);
el.prepareBatchFromDecisionsButton?.addEventListener('click', prepareBatchFromDecisions);
el.inheritSimulationButton?.addEventListener('click', inheritSimulationIntoReal);
el.batchDecisionList?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-save-one-decision]');
  if (button) saveSingleBatchDecision(button.dataset.saveOneDecision);
});
document.querySelector('#downloadMetricsTemplateButton').addEventListener('click', downloadMetricsTemplate);
document.querySelector('#downloadBatchMetricsTemplateButton').addEventListener('click', downloadBatchMetricsTemplate);
document.querySelector('#exportAuditButton')?.addEventListener('click', exportAuditCsv);
document.querySelector('#importMetricsButton').addEventListener('click', () => document.querySelector('#metricsFileInput').click());
document.querySelector('#queueFilter').addEventListener('change', () => {
  queueVisibleLimit = QUEUE_VISIBLE_PAGE_SIZE;
  renderPostingQueue();
});
el.dailyPostingControl?.addEventListener('click', (event) => {
  if (event.target.closest('#openDailyPostingLimitButton')) openDailyPostingLimitDialog();
});
el.dailyPostingLimitForm?.addEventListener('submit', saveDailyPostingLimitForm);
el.dailyPostingLimitScope?.addEventListener('change', populateDailyPostingLimitDialog);
el.closeDailyPostingLimitDialog?.addEventListener('click', () => el.dailyPostingLimitDialog.close());
el.cancelDailyPostingLimit?.addEventListener('click', () => el.dailyPostingLimitDialog.close());
el.postingBatchScope?.addEventListener('change', () => {
  queueVisibleLimit = QUEUE_VISIBLE_PAGE_SIZE;
  savePostingBatchScope(el.postingBatchScope.value || 'all');
  renderPostingQueue();
});
el.postingRunStrategy?.addEventListener('change', () => {
  queueVisibleLimit = QUEUE_VISIBLE_PAGE_SIZE;
  renderPostingQueue();
});
el.startPostingRunButton?.addEventListener('click', startPostingRun);
el.markAllQueueApprovedButton?.addEventListener('click', markAllVisibleQueuePostedAndApproved);
el.postingRunPanel?.addEventListener('click', (event) => {
  const run = loadPostingRun();
  if (!run) return;
  if (event.target.closest('[data-run-stop]')) {
    savePostingRun({ ...run, paused: true, pausedAt: new Date().toISOString() });
    renderPostingRun();
    showToast('Đã tạm dừng. Bấm “Tiếp tục lô” để chạy từ group đang dở.');
    return;
  }
  if (event.target.closest('[data-run-resume]')) {
    savePostingRun({ ...run, paused: false });
    renderPostingRun();
    showToast(`Đã tiếp tục từ group: ${getPostingRunItemByKey(`${run.entryId}|${run.groupId}`)?.group?.name || 'hiện tại'}.`);
    return;
  }
  if (event.target.closest('[data-run-copy-fanpage-caption]')) {
    copyQueueFanpageContent(run.entryId);
    return;
  }
  if (event.target.closest('[data-run-copy-fanpage-pinned-comment]')) {
    copyQueueFanpagePinnedComment(run.entryId);
    return;
  }
  if (event.target.closest('[data-run-copy-fanpage-poster]')) {
    copyQueueFanpagePoster(run.entryId);
    return;
  }
  if (event.target.closest('[data-run-mark-fanpage-sent]')) {
    updateQueueFanpageStatus(run.entryId, 'sent');
    return;
  }
  if (event.target.closest('[data-run-mark-fanpage-approved]')) {
    updateQueueFanpageStatus(run.entryId, 'approved');
    return;
  }
  if (event.target.closest('[data-run-copy-caption]')) {
    copyQueueContent(run.entryId, run.groupId);
    return;
  }
  if (event.target.closest('[data-run-copy-pinned-comment]')) {
    copyQueuePinnedComment(run.entryId, run.groupId);
    return;
  }
  if (event.target.closest('[data-run-multi-group]')) {
    prepareMultiGroupPosting(run);
    return;
  }
  const copyGroupButton = event.target.closest('[data-run-copy-group-name]');
  if (copyGroupButton) {
    copyPostingRunGroupName(copyGroupButton.dataset.runCopyGroupName);
    return;
  }
  if (event.target.closest('[data-run-copy-poster]')) {
    copyQueuePoster(run.entryId, run.groupId);
    return;
  }
  if (event.target.closest('[data-run-mark-sent]')) {
    if (updateQueueStatus(run.entryId, run.groupId, 'sent')) advancePostingRun();
    return;
  }
  if (event.target.closest('[data-run-next]')) {
    if (updateQueueStatus(run.entryId, run.groupId, 'skipped')) advancePostingRun();
  }
});
el.queueGuidance?.addEventListener('click', (event) => {
  const clearHistoryButton = event.target.closest('[data-clear-run-history]');
  if (clearHistoryButton) {
    savePostingRunView(null);
    el.queueFilter.value = 'all';
    renderPostingQueue();
    showToast('Đã trở về toàn bộ hàng đợi. Lô hiện tại không bị thay đổi.');
    return;
  }
  const button = event.target.closest('[data-queue-guidance-filter]');
  if (!button) return;
  el.queueFilter.value = button.dataset.queueGuidanceFilter;
  renderPostingQueue();
});
el.postingRunHistory?.addEventListener('click', (event) => {
  if (event.target.closest('[data-export-run-history]')) {
    exportPostingRunHistoryCsv();
    return;
  }
  const button = event.target.closest('[data-open-run-history]');
  if (!button) return;
  let itemKeys = [];
  try { itemKeys = JSON.parse(button.dataset.itemKeys || '[]'); } catch { itemKeys = []; }
  savePostingRunView({
    contentId: button.dataset.contentId || '',
    contentTitle: button.closest('.posting-run-history-row')?.querySelector('strong')?.textContent || '',
    mode: button.dataset.mode || 'unknown',
    completedAt: button.dataset.completedAt || '',
    itemKeys
  });
  el.queueFilter.value = 'history';
  renderPostingQueue();
  document.querySelector('#posting-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Đã mở lại lô đã chọn để xem. Không thay đổi lô hiện tại và không chạy lại.');
});
document.querySelector('#metricsFileInput').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try { await importMetricsCsv(file); } catch (error) { showToast(error.message || 'Không thể nhập CSV số liệu.'); }
  event.target.value = '';
});
document.querySelector('#addContentButton').addEventListener('click', () => openContentDialog());
el.openBriefButton?.addEventListener('click', openBriefDialog);
el.openContentRetentionButton?.addEventListener('click', openContentRetentionDialog);
el.closeContentRetentionDialog?.addEventListener('click', closeContentRetentionDialog);
el.cancelContentRetention?.addEventListener('click', closeContentRetentionDialog);
el.confirmContentRetention?.addEventListener('click', () => { void deleteContentRetention(); });
el.contentRetentionDialog?.addEventListener('click', (event) => {
  const rect = el.contentRetentionDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeContentRetentionDialog();
});
el.briefForm?.addEventListener('input', updateBriefOutput);
el.copyBriefButton?.addEventListener('click', copyBrief);
el.closeBriefDialog?.addEventListener('click', () => el.briefDialog?.close());
el.closeBriefDialogAction?.addEventListener('click', () => el.briefDialog?.close());
el.clearOperationalDataButton?.addEventListener('click', clearOperationalData);
el.briefDialog?.addEventListener('click', (event) => {
  const rect = el.briefDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) el.briefDialog.close();
});
document.querySelector('#closeContentDialog').addEventListener('click', closeContentDialog);
document.querySelector('#cancelContentDialog').addEventListener('click', closeContentDialog);
el.posterFile.addEventListener('change', () => {
  const file = el.posterFile.files?.[0];
  if (file) loadPosterFile(file);
  el.posterFile.value = '';
});
el.pastePosterButton?.addEventListener('click', pastePosterFromClipboard);
el.posterUploadPreview?.addEventListener('paste', (event) => {
  const imageItem = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith('image/'));
  if (!imageItem) return;
  event.preventDefault();
  loadPosterFile(imageItem.getAsFile());
});
el.contentForm.elements.namedItem('summary')?.addEventListener('input', updateContentWordCount);
el.contentForm.addEventListener('submit', handleContentSubmit);
el.deleteContentForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  void confirmDeleteContent();
});
el.closeDeleteContentDialog?.addEventListener('click', closeDeleteContentDialog);
el.cancelDeleteContent?.addEventListener('click', closeDeleteContentDialog);
el.deleteContentDialog?.addEventListener('click', (event) => {
  const rect = el.deleteContentDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDeleteContentDialog();
});
el.contentCards.addEventListener('click', (event) => {
  const loadMoreButton = event.target.closest('[data-load-more-content]');
  if (loadMoreButton) {
    event.preventDefault();
    event.stopPropagation();
    contentVisibleLimit += CONTENT_VISIBLE_PAGE_SIZE;
    renderContentLibrary();
    return;
  }
  const selectButton = event.target.closest('[data-select-content]');
  if (selectButton) {
    event.preventDefault();
    event.stopPropagation();
    selectedContentId = selectButton.dataset.selectContent;
    syncSelectedContentToBatchSelection();
    renderContentLibrary();
    showToast('Đã chọn bài để ghép group.');
    return;
  }
  const deleteButton = event.target.closest('[data-delete-content]');
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    openDeleteContentDialog(deleteButton.dataset.deleteContent);
    return;
  }
  const editButton = event.target.closest('[data-edit-content]');
  if (editButton) {
    event.preventDefault();
    const content = contents.find((item) => item.id === editButton.dataset.editContent);
    if (content) openContentDialog(content);
    return;
  }
  const card = event.target.closest('[data-content-id]');
  if (!card) return;
  selectedContentId = card.dataset.contentId;
  syncSelectedContentToBatchSelection();
  renderContentLibrary();
});
el.batchRegistryForm?.addEventListener('submit', saveRegisteredBatch);
el.batchRegistryCancelEditButton?.addEventListener('click', cancelRegisteredBatchEdit);
el.batchRegistryGroupSearch?.addEventListener('input', renderBatchRegistryGroupList);
el.batchRegistryMembershipFilter?.addEventListener('change', renderBatchRegistryGroupList);
el.batchRegistrySelectAll?.addEventListener('change', (event) => {
  getVisibleRegistryGroups().forEach((group) => {
      if (event.target.checked) registryDraftGroupIds.add(group.id);
      else registryDraftGroupIds.delete(group.id);
    });
  renderBatchRegistryGroupList();
});
el.batchRegistryGroupList?.addEventListener('change', (event) => {
  const input = event.target.closest('[data-registry-group]');
  if (!input) return;
  if (input.checked) registryDraftGroupIds.add(input.value);
  else registryDraftGroupIds.delete(input.value);
  renderBatchRegistryGroupList();
});
el.batchRegistryList?.addEventListener('click', (event) => {
  const applyButton = event.target.closest('[data-apply-registered-batch]');
  if (applyButton) {
    applyRegisteredBatch(applyButton.dataset.applyRegisteredBatch);
    return;
  }
  const editButton = event.target.closest('[data-edit-registered-batch]');
  if (editButton) {
    editRegisteredBatch(editButton.dataset.editRegisteredBatch);
    return;
  }
  const deleteButton = event.target.closest('[data-delete-registered-batch]');
  if (deleteButton) deleteRegisteredBatch(deleteButton.dataset.deleteRegisteredBatch);
});
el.batchScheduleProposalButton?.addEventListener('click', proposeBatchSchedule);
el.batchScheduleSaveButton?.addEventListener('click', saveBatchScheduleSettings);
el.batchScheduleScrollUpButton?.addEventListener('click', () => toggleBatchScheduleList(-1));
el.batchScheduleScrollDownButton?.addEventListener('click', () => toggleBatchScheduleList(1));
el.batchScheduleStartTime?.addEventListener('change', renderBatchSchedule);
el.batchScheduleEndTime?.addEventListener('change', renderBatchSchedule);
window.addEventListener('resize', updateBatchScheduleToggleControls);
el.batchScheduleList?.addEventListener('change', (event) => {
  const timeInput = event.target.closest('[data-batch-schedule-time]');
  const enabledInput = event.target.closest('[data-batch-schedule-enabled]');
  const batchId = timeInput?.dataset.batchScheduleTime || enabledInput?.dataset.batchScheduleEnabled;
  if (!batchId || !batchSchedules[batchId]) return;
  if (timeInput && parseScheduleMinutes(timeInput.value) !== null) batchSchedules[batchId].time = timeInput.value;
  if (enabledInput) batchSchedules[batchId].enabled = enabledInput.checked;
  batchSchedules[batchId].updatedAt = new Date().toISOString();
  renderBatchSchedule();
});
el.batchRegistrySelect?.addEventListener('change', (event) => {
  if (!event.target.closest('[data-batch-registry]')) return;
  const registryIds = [...el.batchRegistrySelect.querySelectorAll('[data-batch-registry]:checked')].map((input) => input.value);
  const groupIds = [...new Set(batchRegistry.filter((item) => registryIds.includes(item.id)).flatMap((item) => item.groupIds || []))];
  batchSelection = {
    ...batchSelection,
    contentId: selectedContentId || batchSelection.contentId || '',
    registryId: registryIds.length === 1 ? registryIds[0] : '',
    registryIds,
    groupIds,
    fanpages: getSelectedRegistryFanpages(registryIds),
    selectionMode: 'registry',
    topicFilters: null,
    updatedAt: new Date().toISOString()
  };
  saveBatchSelection();
  renderContentLibrary();
  renderTable();
  showToast(registryIds.length ? `Đã chọn ${registryIds.length} lô, gồm ${groupIds.length} group không trùng.` : 'Đã bỏ chọn các lô đăng ký.');
});
el.batchFanpageList?.addEventListener('change', (event) => {
  if (!event.target.closest('[data-batch-fanpage-registry]')) return;
  const registryIds = [...el.batchFanpageList.querySelectorAll('[data-batch-fanpage-registry]:checked')].map((input) => input.value);
  const groupIds = [...new Set(batchRegistry.filter((item) => registryIds.includes(item.id)).flatMap((item) => item.groupIds || []))];
  batchSelection = {
    ...batchSelection,
    contentId: selectedContentId || batchSelection.contentId || '',
    registryId: registryIds.length === 1 ? registryIds[0] : '',
    registryIds,
    groupIds,
    fanpages: getSelectedRegistryFanpages(registryIds),
    selectionMode: 'registry',
    topicFilters: null,
    updatedAt: new Date().toISOString()
  };
  saveBatchSelection();
  renderContentLibrary();
  renderTable();
  showToast(registryIds.length ? `Đã chọn ${registryIds.length} lô/fanpage, gồm ${groupIds.length} group.` : 'Đã bỏ chọn fanpage/lô.');
});
el.batchContentSelect?.addEventListener('change', (event) => {
  selectedContentId = event.target.value || null;
  batchSelection = {
    ...batchSelection,
    contentId: selectedContentId || '',
    groupIds: getSelectedRegistryIds().length ? batchSelection.groupIds : [],
    topicFilters: getSelectedRegistryIds().length ? null : null,
    updatedAt: new Date().toISOString()
  };
  saveBatchSelection();
  renderContentLibrary();
  renderTable();
});
el.batchModeOptions?.addEventListener('change', (event) => {
  const input = event.target.closest('[data-batch-mode]');
  if (!input) return;
  updateBatchMode(input.checked ? input.value : 'unknown');
});
el.batchGroupSelectionMode?.addEventListener('change', (event) => {
  const selectionMode = event.target.value === 'registry' ? 'registry' : 'topic';
  const registryIds = selectionMode === 'registry' ? getSelectedRegistryIds() : [];
  batchSelection = {
    ...batchSelection,
    contentId: selectedContentId || batchSelection.contentId,
    groupIds: registryIds.length ? batchSelection.groupIds : [],
    registryId: registryIds.length === 1 ? registryIds[0] : '',
    registryIds,
    fanpages: selectionMode === 'registry' ? getSelectedRegistryFanpages(registryIds) : [],
    selectionMode,
    topicFilters: selectionMode === 'registry' ? null : batchSelection.topicFilters,
    updatedAt: new Date().toISOString()
  };
  saveBatchSelection();
  renderContentLibrary();
  renderTable();
  showToast(selectionMode === 'registry' ? 'Đã chuyển sang chọn theo lô đăng ký.' : 'Đã chuyển về chọn group theo chủ đề.');
});
el.batchTopicPicker?.addEventListener('change', (event) => {
  if (!event.target.closest('[data-batch-topic]')) return;
  const topicFilters = [...el.batchTopicPicker.querySelectorAll('[data-batch-topic]:checked')].map((input) => input.value);
  batchSelection = { ...batchSelection, contentId: selectedContentId, groupIds: [], registryId: '', registryIds: [], topicFilters, selectionMode: 'topic', updatedAt: new Date().toISOString() };
  saveBatchSelection();
  renderContentLibrary();
  renderTable();
  showToast(topicFilters.length ? `Đã chọn ${topicFilters.length} chủ đề group.` : 'Đã bỏ chọn chủ đề group.');
});
el.batchPrepNextButton?.addEventListener('click', () => {
  document.querySelector('#matchingPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.matchingPanel?.querySelector('.match-check')?.focus();
  showToast('Đã mở bước 2: kiểm tra group phù hợp.');
});
el.matchingPanel.addEventListener('click', (event) => {
  if (event.target.closest('#confirmBatchGroupsButton')) confirmBatchGroups();
});
el.matchingPanel.addEventListener('change', (event) => {
  if (event.target.matches('#selectAllMatchGroups')) {
    el.matchingPanel.querySelectorAll('.match-check').forEach((input) => { input.checked = event.target.checked; });
    updateBatchReviewSummary();
    return;
  }
  if (event.target.closest('.match-check')) updateBatchReviewSummary();
});
el.createBatchQueueButton?.addEventListener('click', createQueueDraft);
el.openPostingQueueButton?.addEventListener('click', () => {
  el.queueFilter.value = 'draft';
  renderPostingQueue();
  document.querySelector('#posting-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Đã mở các group chưa đăng của tất cả lô.');
});
el.openBatchStatusQueueButton?.addEventListener('click', () => {
  el.queueFilter.value = 'batch';
  renderPostingQueue();
  document.querySelector('#posting-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Đã mở các group cần cập nhật trạng thái.');
});
el.queueList.addEventListener('click', (event) => {
  const loadMoreButton = event.target.closest('[data-load-more-queue]');
  if (loadMoreButton) {
    queueVisibleLimit += QUEUE_VISIBLE_PAGE_SIZE;
    renderPostingQueue();
    return;
  }
  const fanpageCopyButton = event.target.closest('[data-copy-fanpage]');
  if (fanpageCopyButton) {
    copyQueueFanpageContent(fanpageCopyButton.dataset.copyFanpage);
    return;
  }
  const fanpagePinnedCommentButton = event.target.closest('[data-copy-fanpage-pinned-comment]');
  if (fanpagePinnedCommentButton) {
    copyQueueFanpagePinnedComment(fanpagePinnedCommentButton.dataset.copyFanpagePinnedComment);
    return;
  }
  const fanpagePosterButton = event.target.closest('[data-copy-fanpage-poster]');
  if (fanpagePosterButton) {
    copyQueueFanpagePoster(fanpagePosterButton.dataset.copyFanpagePoster);
    return;
  }
  const fanpageSentButton = event.target.closest('[data-mark-fanpage-sent]');
  if (fanpageSentButton) {
    updateQueueFanpageStatus(fanpageSentButton.dataset.markFanpageSent, 'sent');
    return;
  }
  const fanpageApprovedButton = event.target.closest('[data-mark-fanpage-approved]');
  if (fanpageApprovedButton) {
    updateQueueFanpageStatus(fanpageApprovedButton.dataset.markFanpageApproved, 'approved');
    return;
  }
  const button = event.target.closest('[data-copy-queue]');
  if (button) {
    const [entryId, groupId] = button.dataset.copyQueue.split('|');
    copyQueueContent(entryId, groupId);
    return;
  }
  const pinnedCommentButton = event.target.closest('[data-copy-pinned-comment]');
  if (pinnedCommentButton) {
    const [entryId, groupId] = pinnedCommentButton.dataset.copyPinnedComment.split('|');
    copyQueuePinnedComment(entryId, groupId);
    return;
  }
  const posterButton = event.target.closest('[data-copy-poster]');
  if (posterButton) {
    const [entryId, groupId] = posterButton.dataset.copyPoster.split('|');
    copyQueuePoster(entryId, groupId);
    return;
  }
  const metricsButton = event.target.closest('[data-save-metrics]');
  if (metricsButton) {
    const metricsPanel = metricsButton.closest('[data-metrics-entry]');
    if (metricsPanel) saveQueueMetrics(metricsPanel.dataset.metricsEntry, metricsPanel.dataset.metricsGroup, metricsPanel);
    return;
  }
  const checkButton = event.target.closest('[data-save-check]');
  if (checkButton) {
    const [entryId, groupId] = checkButton.dataset.saveCheck.split('|');
    const checkInput = checkButton.closest('.queue-item-actions')?.querySelector(`[name="nextCheckAt"][data-entry-id="${entryId}"][data-group-id="${groupId}"]`);
    saveQueueCheck(entryId, groupId, checkInput);
    return;
  }
  const retryButton = event.target.closest('[data-retry-queue]');
  if (retryButton) {
    const [entryId, groupId] = retryButton.dataset.retryQueue.split('|');
    updateQueueStatus(entryId, groupId, 'draft');
    return;
  }
  const approvedButton = event.target.closest('[data-mark-approved]');
  if (approvedButton) {
    const [entryId, groupId] = approvedButton.dataset.markApproved.split('|');
    markQueuePostedAndApproved(entryId, groupId);
    return;
  }
  const removeButton = event.target.closest('[data-remove-queue]');
  if (!removeButton) return;
  const [entryId, groupId] = removeButton.dataset.removeQueue.split('|');
  removeQueueItem(entryId, groupId);
});
el.queueList.addEventListener('change', (event) => {
  const select = event.target.closest('.queue-status-select');
  if (!select) return;
  updateQueueStatus(select.dataset.queueId, select.dataset.groupId, select.value);
});
document.querySelector('#closeDialog').addEventListener('click', closeDialog);
document.querySelector('#cancelDialog').addEventListener('click', closeDialog);
document.querySelector('#clearFilters').addEventListener('click', () => { el.search.value = ''; el.topic.value = 'all'; el.status.value = 'all'; if (el.batchMembership) el.batchMembership.value = 'all'; renderTable(); });
el.routeAllButton.addEventListener('click', () => {
  el.search.value = '';
  el.topic.value = 'all';
  el.status.value = 'testing';
  renderTable();
  document.querySelector('#groups').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
el.topicCards.addEventListener('click', (event) => {
  const button = event.target.closest('[data-topic-route]');
  if (!button) return;
  el.topic.value = button.dataset.topicRoute;
  el.status.value = 'all';
  renderTable();
  document.querySelector('#groups').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.querySelector('#resetButton').addEventListener('click', () => {
  if (!confirm('Khôi phục dữ liệu mẫu? Dữ liệu group hiện tại trên trình duyệt sẽ bị thay thế.')) return;
  groups = structuredClone(seedGroups); saveGroups(); render(); recordAudit('Khôi phục dữ liệu mẫu', `${groups.length} group mẫu`); showToast('Đã khôi phục dữ liệu mẫu.');
});
el.form.addEventListener('submit', handleSubmit);
el.search.addEventListener('input', renderTable);
el.topic.addEventListener('change', renderTable);
el.status.addEventListener('change', renderTable);
el.batchMembership?.addEventListener('change', renderTable);
el.syncGroupsButton?.addEventListener('click', syncGroupsToSupabase);
el.restoreDeletedGroupsButton?.addEventListener('click', openDeletedGroupsDialog);
el.scanDuplicateGroupsButton?.addEventListener('click', openDuplicateGroupsDialog);
el.syncContentsButton?.addEventListener('click', syncContentsToSupabase);
el.syncQueueButton?.addEventListener('click', syncQueueToSupabase);
el.resetQueueOnlyButton?.addEventListener('click', () => { void resetQueueOnly(); });
el.rows.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'edit') openDialog(groups.find((group) => group.id === button.dataset.id));
  if (button.dataset.action === 'edit-topic') {
    const group = groups.find((item) => item.id === button.dataset.id);
    if (group) {
      openDialog(group);
      requestAnimationFrame(() => el.form.elements.namedItem('topic').focus());
    }
  }
  if (button.dataset.action === 'delete') deleteGroup(button.dataset.id);
});
el.file.addEventListener('change', async () => {
  const file = el.file.files[0];
  if (!file) return;
  try { await importCsv(file); } catch (error) { showToast(error.message || 'Không thể đọc file CSV.'); }
  el.file.value = '';
});
el.dialog.addEventListener('click', (event) => {
  const rect = el.dialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) closeDialog();
});
el.deletedGroupsDialog?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-restore-group]');
  if (button) restoreDeletedGroup(button.dataset.restoreGroup);
  if (event.target === el.deletedGroupsDialog) el.deletedGroupsDialog.close();
});
document.querySelector('#closeDeletedGroupsDialog')?.addEventListener('click', () => el.deletedGroupsDialog?.close());
el.duplicateGroupsList?.addEventListener('change', (event) => {
  if (event.target.matches('[data-duplicate-delete]')) updateDuplicateDeleteButton();
});
el.duplicateGroupsDialog?.addEventListener('click', (event) => {
  if (event.target === el.duplicateGroupsDialog) closeDuplicateGroupsDialog();
});
document.querySelector('#closeDuplicateGroupsDialog')?.addEventListener('click', closeDuplicateGroupsDialog);
document.querySelector('#cancelDuplicateGroups')?.addEventListener('click', closeDuplicateGroupsDialog);
el.deleteSelectedDuplicateGroups?.addEventListener('click', deleteSelectedDuplicateGroups);

render();
void hydrateQueueStorage().then(() => {
  renderPostingQueue();
  renderBatchQueueReview();
  renderBatchStatusTracking();
}).catch(() => {});

async function refreshOnlineData() {
  const button = el.refreshOnlineButton;
  if (!button) return;
  button.disabled = true;
  const originalLabel = button.textContent;
  button.textContent = 'Đang tải online...';
  try {
    const groupCount = await loadGroupsFromSupabase();
    const contentCount = await loadContentsFromSupabase();
    const queueCount = await loadQueueFromSupabase();
    const auditCount = await loadAuditFromOnline();
    groupSyncEnabled = true;
    contentSyncEnabled = true;
    queueSyncEnabled = true;
    auditSyncEnabled = true;
    updateSyncOverview();
    showToast(`Đã tải online: ${groupCount} group · ${contentCount} nội dung · ${queueCount} lô · ${auditCount} nhật ký.`);
  } catch (error) {
    showToast(error.message || 'Không thể tải lại dữ liệu online. Kiểm tra đăng nhập và kết nối rồi thử lại.');
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

async function initSessionStatus() {
  const node = document.querySelector('#sessionStatus');
  if (!node) return;
  try {
    const response = await fetch('/api/session', { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('unauthenticated');
    const session = await response.json();
    if (!session.authenticated) throw new Error('unauthenticated');
    const backendResponse = await fetch('/api/backend-health', { headers: { accept: 'application/json' } });
    const backend = await backendResponse.json();
    const backendReady = backendResponse.ok && backend.supabase === 'ok';
    node.textContent = backendReady
      ? 'Site + Supabase sẵn sàng · dữ liệu riêng tài khoản'
      : 'Đã xác thực Site · Chờ Supabase';
    node.classList.toggle('is-ready', backendReady);
    node.classList.toggle('is-error', !backendReady);
    if (backendReady) {
      if (resetPendingOnStartup) {
        sessionStorage.removeItem(RESET_PENDING_SESSION_KEY);
        updateSyncOverview();
        return;
      }
      try {
        const onlineAuditCount = await loadAuditFromOnline();
        auditSyncEnabled = true;
        updateSyncOverview();
        const auditStatus = document.querySelector('#auditSyncStatus');
        if (auditStatus) {
          auditStatus.textContent = onlineAuditCount ? `Nhật ký: đang dùng ${onlineAuditCount} dòng online` : 'Nhật ký: sẵn sàng đồng bộ online';
          auditStatus.classList.add('is-ready');
        }
        scheduleAuditSync();
      } catch {
        const auditStatus = document.querySelector('#auditSyncStatus');
        if (auditStatus) {
          auditStatus.textContent = 'Nhật ký: đang ở bản trình duyệt · chờ đồng bộ';
          auditStatus.classList.add('is-error');
        }
        updateSyncOverview();
      }
      try {
        const onlineCount = await loadGroupsFromSupabase();
        if (onlineCount) {
          el.syncGroupsStatus.textContent = `Đang dùng ${onlineCount} group từ Supabase`;
          el.syncGroupsStatus.classList.add('is-ready');
          groupSyncEnabled = true;
          updateSyncOverview();
          showToast(`Đã tải ${onlineCount} group từ Supabase.`);
        }
      } catch (error) {
        showToast(error.message || 'Không thể tải group từ Supabase; đang dùng bản trình duyệt.');
        updateSyncOverview();
      }
      try {
        const onlineContentCount = await loadContentsFromSupabase();
        contentSyncEnabled = true;
        updateSyncOverview();
        if (onlineContentCount) {
          el.contentSyncStatus.textContent = `Đang dùng ${onlineContentCount} nội dung online`;
          el.contentSyncStatus.classList.add('is-ready');
        } else if (contents.length) {
          scheduleContentAutoSync();
        }
      } catch (error) {
        el.contentSyncStatus.textContent = 'Đã xác thực Site · Chờ nội dung online';
        el.contentSyncStatus.classList.add('is-error');
        showToast(error.message || 'Không thể tải nội dung từ Supabase; đang dùng bản trình duyệt.');
        updateSyncOverview();
      }
      try {
        const onlineQueueCount = await loadQueueFromSupabase();
        queueSyncEnabled = true;
        updateSyncOverview();
        if (onlineQueueCount) {
          el.queueSyncStatus.textContent = `Hàng đợi: đang dùng ${onlineQueueCount} lô online`;
          el.queueSyncStatus.classList.add('is-ready');
        } else if (loadQueue().length) {
          scheduleQueueAutoSync();
        }
      } catch (error) {
        el.queueSyncStatus.textContent = 'Hàng đợi: đã xác thực Site · chờ online';
        el.queueSyncStatus.classList.add('is-error');
        showToast(error.message || 'Không thể tải hàng đợi từ Supabase; đang dùng bản trình duyệt.');
        updateSyncOverview();
      }
    }
    updateSyncOverview();
  } catch {
    node.textContent = 'Chưa xác thực Site';
    node.classList.add('is-error');
    updateSyncOverview();
  }
}

initSessionStatus();

const sidebarTabs = [...document.querySelectorAll('.sidebar-tab')];
const sidebarSections = sidebarTabs.map((tab) => document.querySelector(tab.getAttribute('href'))).filter(Boolean);
if (sidebarSections.length) {
  const updateSidebarTab = () => {
    const marker = window.scrollY + 110;
    let current = sidebarSections[0];
    sidebarSections.forEach((section) => {
      if (section.offsetTop <= marker) current = section;
    });
    sidebarTabs.forEach((tab) => tab.classList.toggle('active', tab.getAttribute('href') === `#${current.id}`));
  };
  window.addEventListener('scroll', updateSidebarTab, { passive: true });
  window.addEventListener('resize', updateSidebarTab);
  sidebarTabs.forEach((tab) => tab.addEventListener('click', () => requestAnimationFrame(updateSidebarTab)));
  updateSidebarTab();
}
