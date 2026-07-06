/*************************************************************
 * TRUNG TÂM ĐIỀU HÀNH TỔ KHCN – Backend Google Apps Script (v4)
 * Google Sheet làm database. Hỗ trợ:
 *   - doGet                     : ai cũng đọc dữ liệu chung (ẩn adminPin nếu không có token).
 *   - doPost action="save"      : admin (app) lưu dữ liệu — CÓ MERGE, không ghi đè trắng snaps.
 *   - doPost action="pushReport": AI AGENT push báo cáo theo KỲ (merge, chặn khi DB chưa init, VALIDATE payload).
 *   - doPost action="upsertEvents": thêm/cập nhật sự kiện–cuộc thi theo id.
 * An toàn v4 (05/07/2026):
 *   - LockService: 2 request cùng lúc không giẫm nhau.
 *   - save merge snaps từ server vào data client trước khi ghi → không mất push của agent.
 *   - JSON lưu CHIA NHỎ nhiều ô cột D (mỗi ô ≤45k kí tự) → không vỡ giới hạn 50k/ô của Sheets.
 *   - writeData_: CHẶN khi dữ liệu vượt CHUNK×MAX_CHUNKS (không ghi cụt DB); ghi độ dài vào C2.
 *   - readData_: parse lỗi thì NÉM lỗi (không im lặng trả {}), tránh nhìn DB như trống rồi ghi đè.
 *   - save: kiểm tra baseUpdatedAt của client; server mới hơn → yêu cầu tải lại (chống ghi đè bản mới).
 *   - pushReport: VALIDATE trackId/status/mảng/số theo whitelist, từ chối payload sai thay vì merge bẩn.
 * CÀI ĐẶT: tạo Google Sheet → Extensions/Apps Script → dán file này →
 *   đổi ADMIN_TOKEN → Deploy → Web app (Execute as: Me, Access: Anyone) →
 *   copy URL .../exec dán vào app (tab Đồng bộ). Admin bấm "Lưu lên máy chủ" LẦN ĐẦU trước khi agent push.
 *************************************************************/

const ADMIN_TOKEN = "KHCN-2627-doi-ma-nay"; // ⚠️ ĐỔI THÀNH CHUỖI BÍ MẬT
const DB_SHEET = "DB";
const CHUNK = 45000; // < giới hạn 50.000 kí tự/ô của Google Sheets
const MAX_CHUNKS = 60;

// Whitelist validate payload agent (khớp src/data/seed.js). t3 (buddy) dùng pairId b0..b4, KHÔNG dùng rowId roster.
const VALID_TRACKS = ["t0", "t1", "t2", "t3", "t4", "t5"];
const VALID_STATUS = ["—", "Đủ", "Thiếu", "Chưa", "Đã báo cáo", "Đạt", "Tốt nghiệp", "Đang buddy", "Cờ đỏ"];
const VALID_CLS_ST = ["—", "Đã điền", "Chưa điền", "Điền thiếu/sai"];
const VALID_MON_ST = ["—", "Đã chấm", "Chấm thiếu", "Chưa chấm"];
const VALID_MANG = ["canvas", "vo"];
const VALID_NUMKIND = ["lead", "dugio"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(DB_SHEET);
  if (!sh) { sh = ss.insertSheet(DB_SHEET); sh.getRange("A1").setValue(""); sh.getRange("A2").setValue("Cập nhật:"); }
  return sh;
}

// Đọc: ưu tiên định dạng chia ô (A1 = "CHUNKED:n", dữ liệu ở D1..Dn); tương thích ngược A1 = JSON cũ.
// Parse lỗi → NÉM lỗi (không trả {} im lặng) để phân biệt "DB trống" với "DB hỏng/bị cắt".
function readData_() {
  const sh = getSheet_();
  const a1 = String(sh.getRange("A1").getValue() || "");
  if (a1.indexOf("CHUNKED:") === 0) {
    const n = Math.min(parseInt(a1.slice(8), 10) || 0, MAX_CHUNKS);
    if (!n) return {};
    const vals = sh.getRange(1, 4, n, 1).getValues(); // cột D
    const raw = vals.map(function (r) { return r[0] || ""; }).join("");
    try { return JSON.parse(raw); }
    catch (e) { throw new Error("DB_CORRUPT: JSON trong DB không parse được (có thể bị cắt/hỏng). Không tự trả DB rỗng để tránh ghi đè nhầm."); }
  }
  if (a1.trim().charAt(0) === "{") {
    try { return JSON.parse(a1); }
    catch (e) { throw new Error("DB_CORRUPT: JSON (định dạng cũ) không parse được."); }
  }
  return {}; // thực sự trống
}

// Đọc an toàn cho nhánh cần "đọc để merge/khôi phục": DB hỏng thì coi như trống để admin còn ghi đè sửa lỗi.
function readDataSafe_() {
  try { return readData_(); } catch (e) { return {}; }
}

function writeData_(obj) {
  const sh = getSheet_();
  obj.updatedAt = new Date().toISOString();
  const s = JSON.stringify(obj);
  if (s.length > CHUNK * MAX_CHUNKS)
    throw new Error("DB_TOO_LARGE: dữ liệu " + s.length + " ký tự vượt giới hạn " + (CHUNK * MAX_CHUNKS) + ". KHÔNG ghi để tránh cắt cụt DB; cần tách bớt kỳ cũ hoặc tăng MAX_CHUNKS / tách sheet.");
  const chunks = [];
  for (let i = 0; i < s.length; i += CHUNK) chunks.push([s.slice(i, i + CHUNK)]);
  sh.getRange(1, 4, MAX_CHUNKS, 1).clearContent();
  sh.getRange(1, 4, chunks.length, 1).setValues(chunks);
  sh.getRange("A1").setValue("CHUNKED:" + chunks.length);
  sh.getRange("B2").setValue(new Date());
  sh.getRange("C2").setValue(s.length); // độ dài để đối chiếu phát hiện cắt cụt
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Điền vào dst những nhánh/lá mà dst CHƯA có (không ghi đè giá trị dst đang có)
function mergeMissing_(dst, src) {
  Object.keys(src).forEach(function (k) {
    if (dst[k] === undefined || dst[k] === null) dst[k] = src[k];
    else if (typeof dst[k] === "object" && typeof src[k] === "object" && !Array.isArray(dst[k]) && !Array.isArray(src[k])) mergeMissing_(dst[k], src[k]);
  });
}

// Validate payload agent (pushReport). Trả {errors, warnings}.
// errors = sai cấu trúc/enum → TỪ CHỐI ghi. warnings = rid/lớp lạ → bỏ qua ô đó nhưng vẫn ghi phần hợp lệ.
function validatePush_(body, d) {
  const errors = [], warnings = [];
  const numOk = function (v) { return v === "" || v === undefined || v === null || (typeof v === "number" && v >= 0) || /^\d+$/.test(String(v)); };
  const ridsOf = function (tid) { const t = (d.tracks || []).filter(function (x) { return x.id === tid; })[0]; return t ? t.rows.map(function (r) { return r.id; }) : null; };
  const lopSet = {}, pairSet = {}, hasAssign = (d.assign || []).length > 0;
  (d.assign || []).forEach(function (a) { lopSet[a.lop] = 1; pairSet[a.lop + "|" + a.mon] = 1; });

  const snaps = body.snaps || {};
  Object.keys(snaps).forEach(function (tid) {
    if (VALID_TRACKS.indexOf(tid) < 0) { errors.push("trackId lạ: " + tid); return; }
    const rids = ridsOf(tid);
    Object.keys(snaps[tid]).forEach(function (rid) {
      const st = snaps[tid][rid] && snaps[tid][rid].status;
      if (st !== undefined && VALID_STATUS.indexOf(st) < 0) errors.push("status lạ ở " + tid + "." + rid + ": " + st);
      if (rids && rids.indexOf(rid) < 0) warnings.push("rid không có trong " + tid + ": " + rid + " (bỏ qua)");
    });
  });
  if (body.cls) Object.keys(body.cls).forEach(function (mang) {
    if (VALID_MANG.indexOf(mang) < 0) { errors.push("mảng lạ: " + mang); return; }
    Object.keys(body.cls[mang]).forEach(function (lop) {
      const st = body.cls[mang][lop] && body.cls[mang][lop].st;
      if (st !== undefined && VALID_CLS_ST.indexOf(st) < 0) errors.push("cls.st lạ ở " + mang + "." + lop + ": " + st);
      if (hasAssign && !lopSet[lop]) warnings.push("cls lớp lạ (" + mang + "): " + lop + " → bỏ qua");
    });
  });
  if (body.mon) Object.keys(body.mon).forEach(function (k) {
    if (k.indexOf("|") < 0) errors.push("khoá mon sai định dạng 'lớp|môn': " + k);
    const st = body.mon[k] && body.mon[k].st;
    if (st !== undefined && VALID_MON_ST.indexOf(st) < 0) errors.push("mon.st lạ ở " + k + ": " + st);
    if (hasAssign && k.indexOf("|") >= 0 && !pairSet[k]) warnings.push("mon key lạ: " + k + " → bỏ qua");
  });
  if (body.num) Object.keys(body.num).forEach(function (kind) {
    if (VALID_NUMKIND.indexOf(kind) < 0) { errors.push("num.kind lạ: " + kind); return; }
    Object.keys(body.num[kind]).forEach(function (rid) {
      const o = body.num[kind][rid] || {};
      Object.keys(o).forEach(function (f) { if (!numOk(o[f])) errors.push("num." + kind + "." + rid + "." + f + " không hợp lệ: " + o[f]); });
    });
  });
  return { errors: errors, warnings: warnings };
}

function doGet(e) {
  try {
    const sh = getSheet_(); const at = sh.getRange("B2").getValue();
    const d = readData_(); // parse lỗi → ném; báo cho client biết DB hỏng thay vì trả rỗng
    const token = (e && e.parameter && e.parameter.token) ? String(e.parameter.token) : "";
    if (token !== ADMIN_TOKEN) delete d.adminPin; // GET công khai: ẩn mã quản trị
    return json_({ ok: true, data: d, savedAt: at ? String(at) : "" });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (le) { return json_({ ok: false, error: "Máy chủ đang bận, thử lại sau ít giây" }); }
  try {
    const body = JSON.parse(e.postData.contents);
    if (String(body.token) !== ADMIN_TOKEN) return json_({ ok: false, error: "Sai mã quản trị" });
    const action = body.action || "save";

    if (action === "save") {
      if (!body.data || !body.data.weekly) return json_({ ok: false, error: "Dữ liệu không hợp lệ" });
      // đọc "an toàn": DB hỏng thì coi trống để admin còn ghi đè sửa lỗi được
      const d0 = readDataSafe_();
      // CHỐNG GHI ĐÈ khi client CHƯA từng tải server (thiếu baseUpdatedAt) mà server đã có dữ liệu → tránh đè bằng bản trống/mẫu
      if (d0 && d0.updatedAt && !body.baseUpdatedAt)
        return json_({ ok: false, error: "SERVER_HAS_DATA: máy chủ đã có dữ liệu; hãy bấm 'Tải từ máy chủ' trước rồi Lưu (tránh ghi đè bằng bản trống/mẫu).", serverUpdatedAt: d0.updatedAt });
      // CHỐNG GHI ĐÈ BẢN MỚI: client gửi baseUpdatedAt cũ hơn server → bắt tải lại
      if (body.baseUpdatedAt && d0 && d0.updatedAt && String(body.baseUpdatedAt) < String(d0.updatedAt))
        return json_({ ok: false, error: "SERVER_NEWER: máy chủ đã có bản mới hơn bản trên máy anh. Hãy bấm 'Tải từ máy chủ' rồi lưu lại.", serverUpdatedAt: d0.updatedAt });
      // MERGE: giữ lại mọi snaps server đang có mà client chưa có → không mất push của agent
      if (d0 && d0.snaps) {
        if (!body.data.snaps) body.data.snaps = {};
        mergeMissing_(body.data.snaps, d0.snaps);
      }
      writeData_(body.data);
      return json_({ ok: true, savedAt: new Date().toString(), mode: "save", updatedAt: body.data.updatedAt });
    }

    if (action === "pushReport") {
      const d = readData_();
      if (!d.weekly) return json_({ ok: false, error: "DB chưa khởi tạo — admin cần 'Lưu lên máy chủ' lần đầu trước khi agent push" });
      // VALIDATE trước khi merge: từ chối payload sai enum/cấu trúc
      const v = validatePush_(body, d);
      if (v.errors.length) return json_({ ok: false, error: "Payload không hợp lệ", errors: v.errors });
      if (!d.snaps) d.snaps = {};
      const key = (body.namHoc || d.namHoc || "") + "|" + (body.periodMode || d.periodMode || "Tuần") + "|" + (body.periodValue || d.periodValue || "");
      if (!d.snaps[key]) d.snaps[key] = {};
      const validRid = function (tid, rid) { const t = (d.tracks || []).filter(function (x) { return x.id === tid; })[0]; return !t || t.rows.some(function (r) { return r.id === rid; }); };
      const inc = body.snaps || {};
      Object.keys(inc).forEach(function (tid) {
        if (!d.snaps[key][tid]) d.snaps[key][tid] = {};
        Object.keys(inc[tid]).forEach(function (rid) { if (validRid(tid, rid)) d.snaps[key][tid][rid] = inc[tid][rid]; });
      });
      const lopSet = {}, pairSet = {}, hasAssign = (d.assign || []).length > 0;
      (d.assign || []).forEach(function (a) { lopSet[a.lop] = 1; pairSet[a.lop + "|" + a.mon] = 1; });
      if (body.cls) { if (!d.snaps[key].cls) d.snaps[key].cls = {}; Object.keys(body.cls).forEach(function (m) { if (!d.snaps[key].cls[m]) d.snaps[key].cls[m] = {}; Object.keys(body.cls[m]).forEach(function (lop) { if (!hasAssign || lopSet[lop]) d.snaps[key].cls[m][lop] = body.cls[m][lop]; }); }); }
      if (body.mon) { if (!d.snaps[key].mon) d.snaps[key].mon = {}; Object.keys(body.mon).forEach(function (k) { if (!hasAssign || pairSet[k]) d.snaps[key].mon[k] = body.mon[k]; }); }
      if (body.num) { if (!d.snaps[key].num) d.snaps[key].num = {}; Object.keys(body.num).forEach(function (kind) { if (!d.snaps[key].num[kind]) d.snaps[key].num[kind] = {}; Object.keys(body.num[kind]).forEach(function (rid) { d.snaps[key].num[kind][rid] = body.num[kind][rid]; }); }); }
      if (body.setCurrent) { d.periodMode = body.periodMode || d.periodMode; d.periodValue = body.periodValue || d.periodValue; if (body.namHoc) d.namHoc = body.namHoc; }
      writeData_(d);
      return json_({ ok: true, savedAt: new Date().toString(), mode: "pushReport", key: key, warnings: v.warnings });
    }

    if (action === "upsertEvents") {
      const d = readData_(); if (!d.events) d.events = [];
      (body.events || []).forEach(function (ev) {
        const i = d.events.findIndex(function (x) { return x.id === ev.id; });
        if (i >= 0) d.events[i] = Object.assign(d.events[i], ev); else d.events.push(ev);
      });
      writeData_(d);
      return json_({ ok: true, savedAt: new Date().toString(), mode: "upsertEvents" });
    }

    return json_({ ok: false, error: "action không hỗ trợ: " + action });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}

function setup() { getSheet_(); }
