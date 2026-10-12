"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Professional } from "../_data/professionals";
import { useLanguage } from "../../_components/language-provider";
const inputClass = "mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15";
export function ProfessionalForm({ record, onSave, onClose }: { record: Professional | null; onSave: (record: Professional) => void; onClose: () => void }) {
 const dialog = useRef<HTMLDialogElement>(null); const { language } = useLanguage(); const km = language === "km";
 const [error, setError] = useState("");
 useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
 function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const specialties = text("specialties").split(",").map(s => s.trim()).filter(Boolean);
  const languages = form.getAll("languages").map(String);
  if (!text("name") || !text("role") || !text("about") || !specialties.length || !languages.length) { setError(km ? "សូមបំពេញព័ត៌មានចាំបាច់ និងជ្រើសរើសភាសា។" : "Complete the required fields and select at least one language."); return; }
  const session = text("session"); const status = text("status");
  onSave({ id: record?.id ?? crypto.randomUUID(), name: text("name"), kmName: text("kmName"), role: text("role"), kmRole: text("kmRole"), about: text("about"), kmAbout: text("kmAbout"), image: record?.image ?? "", specialties, languages, experience: text("experience"), session: session === "Both" ? "Both" : session === "In-person" ? "In-person" : "Online", status: status === "published" ? "published" : status === "archived" ? "archived" : "draft" });
 }
 const fields = [{ key: "name", label: km ? "ឈ្មោះជាភាសាអង់គ្លេស" : "Name (English)", required: true }, { key: "kmName", label: km ? "ឈ្មោះជាភាសាខ្មែរ" : "Name (Khmer)" }, { key: "role", label: km ? "មុខតំណែងជាភាសាអង់គ្លេស" : "Professional title (English)", required: true }, { key: "kmRole", label: km ? "មុខតំណែងជាភាសាខ្មែរ" : "Professional title (Khmer)" }, { key: "experience", label: km ? "បទពិសោធន៍" : "Experience" }] as const;
 return <dialog ref={dialog} onCancel={onClose} aria-labelledby="professional-form-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-arom-border bg-white p-0 text-ink shadow-card backdrop:bg-ink/35">
  <form onSubmit={submit}><div className="flex items-center justify-between border-b border-arom-border p-6"><div><h2 id="professional-form-title" className="text-xl font-semibold">{record ? (km ? "កែសម្រួលអ្នកជំនាញ" : "Edit professional") : (km ? "បន្ថែមអ្នកជំនាញ" : "Add professional")}</h2><p className="mt-1 text-xs text-ink-muted">{km ? "បំពេញប្រវត្តិរូបជាភាសាអង់គ្លេស និងខ្មែរ។" : "Prepare a profile in English and Khmer."}</p></div><button type="button" aria-label={km ? "បិទ" : "Close"} onClick={onClose} className="rounded-full p-2 hover:bg-arom-wash"><X size={20}/></button></div>
  <div className="grid gap-5 p-6 sm:grid-cols-2">{fields.map(({ key, label, ...options }) => <label key={key} className="text-sm font-medium">{label}{"required" in options && options.required ? " *" : ""}<input name={key} defaultValue={record?.[key] ?? ""} required={"required" in options && options.required} maxLength={120} className={inputClass}/></label>)}
  <label className="text-sm font-medium">{km ? "ជំនាញ (បំបែកដោយសញ្ញាក្បៀស)" : "Specialties (comma separated)"} *<input name="specialties" required defaultValue={record?.specialties.join(", ") ?? ""} maxLength={300} className={inputClass}/></label>
  <fieldset><legend className="text-sm font-medium">{km ? "ភាសា" : "Languages"} *</legend><div className="mt-3 flex gap-5">{["English", "Khmer"].map(lang => <label key={lang} className="flex items-center gap-2 text-sm"><input type="checkbox" name="languages" value={lang} defaultChecked={record?.languages.includes(lang)} className="accent-arom"/>{lang}</label>)}</div></fieldset>
  <label className="text-sm font-medium">{km ? "ប្រភេទជំនួប" : "Session type"}<select name="session" defaultValue={record?.session ?? "Online"} className={inputClass}><option value="Online">{km ? "អនឡាញ" : "Online"}</option><option value="In-person">{km ? "ជួបផ្ទាល់" : "In person"}</option><option value="Both">{km ? "ទាំងពីរ" : "Both"}</option></select></label>
  {[{ key: "about", label: km ? "ប្រវត្តិរូបជាភាសាអង់គ្លេស" : "Biography (English)", required: true }, { key: "kmAbout", label: km ? "ប្រវត្តិរូបជាភាសាខ្មែរ" : "Biography (Khmer)", required: false }].map(({key,label,required}) => <label key={key} className="text-sm font-medium sm:col-span-2">{label}{required ? " *" : ""}<textarea name={key} defaultValue={record?.[key as "about" | "kmAbout"] ?? ""} required={required} rows={3} maxLength={3000} className={inputClass}/></label>)}
  <label className="text-sm font-medium">{km ? "ស្ថានភាព" : "Publication status"}<select name="status" defaultValue={record?.status ?? "draft"} className={inputClass}><option value="draft">{km ? "សេចក្តីព្រាង" : "Draft"}</option><option value="published">{km ? "បានផ្សព្វផ្សាយ" : "Published"}</option><option value="archived">{km ? "បានទុកក្នុងបណ្ណសារ" : "Archived"}</option></select></label>
  {error && <p role="alert" className="text-sm text-arom-danger sm:col-span-2">{error}</p>}</div>
  <footer className="flex justify-end gap-3 border-t border-arom-border p-6"><button type="button" onClick={onClose} className="rounded-full border border-arom-border px-5 py-2.5 text-sm">{km ? "បោះបង់" : "Cancel"}</button><button className="rounded-full bg-arom px-5 py-2.5 text-sm text-white hover:bg-arom-deep">{km ? "រក្សាទុក" : "Save profile"}</button></footer></form>
 </dialog>;
}
