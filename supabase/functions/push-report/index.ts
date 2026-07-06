// =====================================================================
//  Edge Function: push-report
//  OpenClaw (agent) cào dữ liệu từ link → POST vào đây để merge lên app_state.
//  Bảo mật: gác bằng header 'x-agent-secret' == AGENT_SECRET (secret riêng).
//  service_role NẰM TRONG hàm này (Supabase tự cấp qua env), KHÔNG lộ ra ngoài.
//
//  Deploy: Supabase → Edge Functions → Create function tên "push-report" → dán file này → Deploy.
//  Secret: Edge Functions → Manage secrets → thêm AGENT_SECRET = <chuỗi bí mật anh tự đặt>.
//  Gọi:  POST https://<project-ref>.functions.supabase.co/push-report
//        Headers: x-agent-secret: <AGENT_SECRET> ; Content-Type: application/json
//        Body: JSON giống agent/mau_pushReport.json (namHoc, periodMode, periodValue, snaps, cls, mon, num)
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VALID_TRACKS  = ["t0", "t1", "t2", "t3", "t4", "t5"];
const VALID_STATUS  = ["—", "Đủ", "Thiếu", "Chưa", "Đã báo cáo", "Đạt", "Tốt nghiệp", "Đang buddy", "Cờ đỏ"];
const VALID_CLS_ST  = ["—", "Đã điền", "Chưa điền", "Điền thiếu/sai"];
const VALID_MON_ST  = ["—", "Đã chấm", "Chấm thiếu", "Chưa chấm"];
const VALID_MANG    = ["canvas", "vo"];
const VALID_NUMKIND = ["lead", "dugio"];

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

const numOk = (v: unknown) =>
  v === "" || v === undefined || v === null ||
  (typeof v === "number" && v >= 0) || /^\d+$/.test(String(v));

function validate(body: any) {
  const errors: string[] = [];
  const snaps = body.snaps || {};
  for (const tid of Object.keys(snaps)) {
    if (!VALID_TRACKS.includes(tid)) { errors.push("trackId lạ: " + tid); continue; }
    for (const rid of Object.keys(snaps[tid])) {
      const st = snaps[tid][rid]?.status;
      if (st !== undefined && !VALID_STATUS.includes(st)) errors.push(`status lạ ${tid}.${rid}: ${st}`);
    }
  }
  if (body.cls) for (const mang of Object.keys(body.cls)) {
    if (!VALID_MANG.includes(mang)) { errors.push("mảng lạ: " + mang); continue; }
    for (const lop of Object.keys(body.cls[mang])) {
      const st = body.cls[mang][lop]?.st;
      if (st !== undefined && !VALID_CLS_ST.includes(st)) errors.push(`cls.st lạ ${mang}.${lop}: ${st}`);
    }
  }
  if (body.mon) for (const k of Object.keys(body.mon)) {
    if (!k.includes("|")) errors.push("khoá mon sai định dạng 'lớp|môn': " + k);
    const st = body.mon[k]?.st;
    if (st !== undefined && !VALID_MON_ST.includes(st)) errors.push(`mon.st lạ ${k}: ${st}`);
  }
  if (body.num) for (const kind of Object.keys(body.num)) {
    if (!VALID_NUMKIND.includes(kind)) { errors.push("num.kind lạ: " + kind); continue; }
    for (const rid of Object.keys(body.num[kind])) {
      const o = body.num[kind][rid] || {};
      for (const f of Object.keys(o)) if (!numOk(o[f])) errors.push(`num.${kind}.${rid}.${f} không hợp lệ: ${o[f]}`);
    }
  }
  return errors;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return json({ ok: false, error: "Chỉ nhận POST" }, 405);
    if (req.headers.get("x-agent-secret") !== Deno.env.get("AGENT_SECRET"))
      return json({ ok: false, error: "Sai mã agent" }, 401);

    const body = await req.json();
    const errors = validate(body);
    if (errors.length) return json({ ok: false, error: "Payload không hợp lệ", errors }, 400);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: row, error: readErr } = await sb.from("app_state").select("data").eq("id", 1).single();
    if (readErr) return json({ ok: false, error: "Đọc app_state lỗi: " + readErr.message }, 500);
    const d = row?.data ?? {};
    if (!d.snaps) d.snaps = {};

    const key = `${body.namHoc ?? d.namHoc ?? ""}|${body.periodMode ?? "Tuần"}|${body.periodValue ?? d.periodValue ?? ""}`;
    d.snaps[key] = d.snaps[key] ?? {};

    // MERGE CHỈ các trường agent gửi (không đè cả cục) — giống pushReport cũ
    const snaps = body.snaps || {};
    for (const tid of Object.keys(snaps)) {
      d.snaps[key][tid] = d.snaps[key][tid] ?? {};
      for (const rid of Object.keys(snaps[tid])) d.snaps[key][tid][rid] = snaps[tid][rid];
    }
    if (body.cls) { d.snaps[key].cls = d.snaps[key].cls ?? {}; for (const m of Object.keys(body.cls)) { d.snaps[key].cls[m] = d.snaps[key].cls[m] ?? {}; for (const lop of Object.keys(body.cls[m])) d.snaps[key].cls[m][lop] = body.cls[m][lop]; } }
    if (body.mon) { d.snaps[key].mon = d.snaps[key].mon ?? {}; for (const k of Object.keys(body.mon)) d.snaps[key].mon[k] = body.mon[k]; }
    if (body.num) { d.snaps[key].num = d.snaps[key].num ?? {}; for (const kind of Object.keys(body.num)) { d.snaps[key].num[kind] = d.snaps[key].num[kind] ?? {}; for (const rid of Object.keys(body.num[kind])) d.snaps[key].num[kind][rid] = body.num[kind][rid]; } }
    if (body.setCurrent) { d.periodMode = body.periodMode ?? d.periodMode; d.periodValue = body.periodValue ?? d.periodValue; if (body.namHoc) d.namHoc = body.namHoc; }

    const { error: upErr } = await sb.from("app_state")
      .update({ data: d, updated_at: new Date().toISOString(), updated_by: "agent:openclaw" }).eq("id", 1);
    if (upErr) return json({ ok: false, error: "Ghi app_state lỗi: " + upErr.message }, 500);

    await sb.from("audit_log").insert({
      actor: "agent:openclaw", role: "agent", action: "agent_push",
      target: key, summary: "OpenClaw push báo cáo cào từ link",
    });

    return json({ ok: true, key });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
