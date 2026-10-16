"use client";

import { Camera, LoaderCircle, Mail, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "./auth-provider";
import { UserAvatar } from "./user-avatar";

type ProfileEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  km: boolean;
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfileEditorDialog({
  open,
  onOpenChange,
  km,
}: ProfileEditorDialogProps) {
  const { user, updateProfile } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [pronouns, setPronouns] = useState(user?.pronouns ?? "");
  const [aboutMe, setAboutMe] = useState(user?.aboutMe ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const nextPhoto = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    if (!nextPhoto) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(nextPhoto.type)) {
      setPhoto(null);
      setPreviewUrl(null);
      setError(
        km
          ? "សូមជ្រើសរើសរូបភាព JPEG, PNG ឬ WebP។"
          : "Choose a JPEG, PNG, or WebP image.",
      );
      return;
    }
    if (nextPhoto.size > MAX_PHOTO_SIZE) {
      setPhoto(null);
      setPreviewUrl(null);
      setError(
        km
          ? "រូបភាពត្រូវមានទំហំ ៥ MB ឬតិចជាងនេះ។"
          : "Choose a photo that is 5 MB or smaller.",
      );
      return;
    }

    setError(null);
    setPhoto(nextPhoto);
    setPreviewUrl(URL.createObjectURL(nextPhoto));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = fullName.trim();
    if (name.length < 2 || name.length > 60) {
      setError(
        km
          ? "ឈ្មោះត្រូវមានពី ២ ដល់ ៦០ តួអក្សរ។"
          : "Use a name between 2 and 60 characters.",
      );
      return;
    }
    if (pronouns.trim().length > 60) {
      setError(
        km
          ? "សព្វនាមត្រូវមាន ៦០ តួអក្សរ ឬតិចជាងនេះ។"
          : "Pronouns must be 60 characters or fewer.",
      );
      return;
    }
    if (aboutMe.trim().length > 280) {
      setError(
        km
          ? "អំពីអ្នកត្រូវមាន ២៨០ តួអក្សរ ឬតិចជាងនេះ។"
          : "About you must be 280 characters or fewer.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    const result = await updateProfile(
      { fullName: name, pronouns: pronouns.trim(), aboutMe: aboutMe.trim() },
      photo,
    );
    setSaving(false);

    if (result.ok) onOpenChange(false);
    else setError(result.message);
  }

  if (!user) return null;

  const label = (en: string, kh: string) => (km ? `${kh} (${en})` : en);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="profile-editor-title"
      aria-describedby="profile-editor-description"
      onClose={() => onOpenChange(false)}
      onCancel={(event) => {
        if (saving) event.preventDefault();
        else onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) {
          event.currentTarget.close();
        }
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none border-0 bg-transparent p-0 text-left backdrop:bg-ink/40 focus:outline-none sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[min(34rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2"
    >
      <div className="flex max-h-[min(88dvh,42rem)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_50px_rgba(16,42,32,0.18)] sm:rounded-3xl sm:shadow-[0_24px_72px_rgba(16,42,32,0.22)]">
        <header className="shrink-0 px-5 pb-3 pt-3 sm:px-6 sm:pt-5">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-arom-border sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="profile-editor-title" className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {label("Edit Profile", "កែប្រែប្រវត្តិរូប")}
              </h2>
              <p id="profile-editor-description" className="mt-1 text-sm text-ink-muted">
                {km
                  ? "កែរូបថត និងព័ត៌មានប្រវត្តិរូបរបស់អ្នក។"
                  : "Update your photo and profile details."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={saving}
              aria-label={km ? "បិទ (Close)" : "Close"}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arom-wash text-ink-muted transition-colors hover:text-arom focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-60"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
        </header>

        <form onSubmit={saveProfile} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-1 sm:px-6">
            <div className="flex items-center gap-3 rounded-2xl bg-arom-wash/60 p-3">
              <UserAvatar
                src={previewUrl ?? undefined}
                className="size-16 shrink-0 rounded-full text-lg ring-2 ring-white"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {label("Profile picture", "រូបថតប្រវត្តិរូប")}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {km ? "ជ្រើសរើសរូបភាពដែលអ្នកចូលចិត្ត។" : "Choose a picture that feels like you."}
                </p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={choosePhoto}
                className="sr-only"
                tabIndex={-1}
                aria-label={km ? "ជ្រើសរើសរូបថត (Choose photo)" : "Choose photo"}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-arom-border bg-white px-3 text-xs font-semibold text-arom-deep transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
              >
                <Camera aria-hidden="true" size={15} />
                {label("Change photo", "ប្តូររូបថត")}
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-editor-name" className="text-xs font-semibold text-ink">
                {label("Display name", "ឈ្មោះបង្ហាញ")}
              </label>
              <input
                id="profile-editor-name"
                name="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                maxLength={60}
                className="h-11 w-full rounded-xl border border-arom-border bg-white px-3 text-sm text-ink outline-none transition focus:border-arom focus:ring-4 focus:ring-arom/10"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-arom-border/80 px-3 py-2.5">
              <Mail aria-hidden="true" className="shrink-0 text-ink-muted" size={17} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.68rem] font-semibold text-ink-muted">
                  {label("Email address", "អាសយដ្ឋានអ៊ីមែល")}
                </p>
                <p className="truncate text-sm text-ink">{user.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-editor-pronouns" className="text-xs font-semibold text-ink">
                {label("Pronouns (optional)", "សព្វនាម មិនបាច់បំពេញក៏បាន")}
              </label>
              <input
                id="profile-editor-pronouns"
                name="pronouns"
                value={pronouns}
                onChange={(event) => setPronouns(event.target.value)}
                maxLength={60}
                placeholder={km ? "បន្ថែមសព្វនាមរបស់អ្នក" : "Add your pronouns"}
                className="h-11 w-full rounded-xl border border-arom-border bg-white px-3 text-sm text-ink placeholder:text-ink-muted/80 outline-none transition focus:border-arom focus:ring-4 focus:ring-arom/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-editor-about" className="text-xs font-semibold text-ink">
                {label("About you", "អំពីអ្នក")}
              </label>
              <textarea
                id="profile-editor-about"
                name="aboutMe"
                value={aboutMe}
                onChange={(event) => setAboutMe(event.target.value)}
                maxLength={280}
                rows={3}
                placeholder={km ? "ប្រាប់អំពីខ្លួនអ្នកបន្តិច" : "Share a little about yourself"}
                className="min-h-20 max-h-36 w-full resize-y rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/80 outline-none transition focus:border-arom focus:ring-4 focus:ring-arom/10"
              />
              <p className="text-xs text-ink-muted">
                {km
                  ? "ព័ត៌មានទាំងនេះអាចមើលឃើញតែនៅក្នុងការកំណត់ប្រវត្តិរូបរបស់អ្នក។"
                  : "Only you can see these details in profile settings."}
              </p>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-arom-danger">
                {error}
              </p>
            )}
          </div>

          <footer className="flex shrink-0 items-center gap-3 border-t border-arom-border/70 bg-white px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={saving}
              className="min-h-11 rounded-xl px-4 text-sm font-semibold text-ink-muted transition-colors hover:bg-arom-wash hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-60"
            >
              {label("Cancel", "បោះបង់")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-arom px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:cursor-wait disabled:opacity-70"
            >
              {saving && <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />}
              {saving
                ? km
                  ? "កំពុងរក្សាទុក"
                  : "Saving"
                : label("Save changes", "រក្សាទុកការផ្លាស់ប្តូរ")}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
