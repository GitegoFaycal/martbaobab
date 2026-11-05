import { Camera, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useT } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MAX_EDGE = 1400;

// Shrinks a photo in the browser so uploads from phones stay small.
async function compressImage(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file).catch(() => null);

  if (!bitmap) {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

  if (scale === 1 && file.size < 600 * 1024) {
    bitmap.close?.();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85)
  );

  return blob
    ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })
    : file;
}

export async function uploadPhoto(file) {
  const prepared = await compressImage(file);
  const body = new FormData();
  body.append("image", prepared, prepared.name);

  const response = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    credentials: "include",
    body,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Non-JSON response; handled below.
  }

  if (!response.ok) {
    throw new Error(data.message || "The photo could not be uploaded");
  }

  return data.url;
}

// Multi-photo uploader: value is an array of URLs.
export default function ImageUploader({
  value = [],
  onChange,
  max = 6,
  label,
  hint,
}) {
  const t = useT();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).slice(0, max - value.length);

    if (files.length === 0) {
      return;
    }

    setError("");
    setBusy(files.length);
    const urls = [];

    for (const file of files) {
      try {
        urls.push(await uploadPhoto(file));
      } catch (uploadError) {
        setError(uploadError.message);
      } finally {
        setBusy((current) => current - 1);
      }
    }

    if (urls.length) {
      onChange([...value, ...urls]);
    }
  }

  return (
    <div>
      {label && <p className="mb-2 text-sm font-bold text-loco-ink">{label}</p>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, index) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-orange-100 bg-loco-cream">
            <img src={url} alt="" className="h-full w-full object-cover" />
            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-loco-wine px-2 py-0.5 text-[10px] font-bold text-white">
                {t("upload.main")}
              </span>
            )}
            <button
              type="button"
              aria-label={t("upload.remove")}
              onClick={() => onChange(value.filter((item) => item !== url))}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-600 shadow hover:bg-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {Array.from({ length: busy }).map((_, index) => (
          <div key={`busy-${index}`} className="grid aspect-square place-items-center rounded-xl border border-dashed border-orange-200 bg-loco-cream text-loco-orange">
            <LoaderCircle size={22} className="animate-spin" />
          </div>
        ))}

        {value.length + busy < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFiles(event.dataTransfer.files);
            }}
            className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-orange-200 bg-white text-loco-wine hover:border-loco-orange hover:bg-loco-cream"
          >
            <span className="flex flex-col items-center gap-1 text-xs font-bold">
              <ImagePlus size={24} />
              {t("upload.add")}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={max > 1}
        capture="environment"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-gray-500">{hint || t("upload.hint", { max })}</p>
      )}
    </div>
  );
}

// Single-photo uploader (logo, cover, avatar): value is a URL or "".
export function SingleImageUploader({ value, onChange, label, shape = "square", hint }) {
  const t = useT();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setBusy(true);

    try {
      onChange(await uploadPhoto(file));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
    }
  }

  const shapeClass = shape === "round" ? "rounded-full aspect-square w-28" : shape === "wide" ? "rounded-xl aspect-[3/1] w-full" : "rounded-xl aspect-square w-28";

  return (
    <div>
      {label && <p className="mb-2 text-sm font-bold text-loco-ink">{label}</p>}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`relative grid shrink-0 place-items-center overflow-hidden border-2 border-dashed border-orange-200 bg-loco-cream text-loco-wine hover:border-loco-orange ${shapeClass}`}
        >
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <Camera size={24} />}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/70 text-loco-orange">
              <LoaderCircle size={22} className="animate-spin" />
            </span>
          )}
        </button>
        <div className="text-sm">
          <button type="button" onClick={() => inputRef.current?.click()} className="font-bold text-loco-wine hover:text-loco-orange">
            {value ? t("upload.change") : t("upload.choose")}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="ml-3 font-bold text-red-600 hover:underline">
              {t("upload.remove")}
            </button>
          )}
          <p className="mt-1 text-xs text-gray-500">{error ? <span className="text-red-600">{error}</span> : hint || t("upload.single")}</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
