import { Search, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { formatPhoneForDisplay } from "../../lib/rwanda";
import { Field, Input } from "../ui";

export const emptyOwner = { name: "", email: "", phone: "", password: "" };

// Lets an administrator choose who owns a shop: an existing LOCO user
// (searched by name, email or phone) or a brand-new seller account.
// Reports { mode, ownerId, owner, ready } on every change.
export default function OwnerPicker({ onChange, errors = {}, excludeUserId = "" }) {
  const [mode, setMode] = useState("new");
  const [query, setQuery] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [owner, setOwner] = useState(emptyOwner);

  const searchEnabled = mode === "existing" && query.trim().length >= 2;
  const { data: matches } = useFetch(`/admin/users?q=${encodeURIComponent(query.trim())}`, { enabled: searchEnabled });
  const candidates = searchEnabled ? (matches?.users || []).filter((item) => item.shops?.length === 0 && item.id !== excludeUserId) : [];
  const picked = candidates.find((item) => item.id === ownerId);

  useEffect(() => {
    const ready = mode === "existing" ? Boolean(ownerId) : Boolean(owner.name && owner.email && owner.phone && owner.password);
    onChange({ mode, ownerId, owner, ready });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ownerId, owner]);

  function handleOwnerChange(event) {
    const { name, value } = event.target;
    setOwner((current) => ({ ...current, [name]: value }));
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "new", icon: UserPlus, label: "New seller account", text: "Create their login now" },
          { key: "existing", icon: Users, label: "Existing user", text: "Someone already on LOCO" },
        ].map((option) => (
          <button key={option.key} type="button" onClick={() => setMode(option.key)} aria-pressed={mode === option.key} className={`rounded-2xl border bg-white p-4 text-left ${mode === option.key ? "border-loco-blue ring-2 ring-blue-100" : "border-gray-200 hover:border-loco-blue"}`}>
            <strong className="flex items-center gap-2 text-loco-ink"><option.icon size={16} /> {option.label}</strong>
            <span className="text-xs text-gray-500">{option.text}</span>
          </button>
        ))}
      </div>

      {mode === "existing" ? (
        <div className="mt-4 space-y-3">
          <Field label="Find the user" htmlFor="ownerQuery" error={errors.ownerId} hint="Search by name, email or phone. Users who already own a shop are not listed.">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input id="ownerQuery" value={query} onChange={(event) => { setQuery(event.target.value); setOwnerId(""); }} placeholder="e.g. Jeanne, 078..., name@example.com" className="pl-9" />
            </div>
          </Field>
          {searchEnabled && (
            <ul className="divide-y divide-blue-50 overflow-hidden rounded-xl border border-blue-100 bg-white">
              {candidates.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => setOwnerId(item.id)} className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-loco-ice ${ownerId === item.id ? "bg-loco-ice font-bold" : ""}`}>
                    <span className="min-w-0"><span className="block truncate text-loco-ink">{item.name}</span><span className="block truncate text-xs text-gray-500">{item.email} · {formatPhoneForDisplay(item.phone)}</span></span>
                    <span className="shrink-0 text-xs text-gray-400">{item.district || ""}</span>
                  </button>
                </li>
              ))}
              {candidates.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">No matching user without a shop.</li>}
            </ul>
          )}
          {picked && <p className="text-sm text-loco-navy">Owner: <strong>{picked.name}</strong>{picked.role === "CUSTOMER" ? " (will become a seller)" : ""}</p>}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Owner name" htmlFor="owner-name" error={errors["owner.name"]}>
            <Input id="owner-name" name="name" value={owner.name} onChange={handleOwnerChange} placeholder="e.g. Jeanne Uwase" error={errors["owner.name"]} required />
          </Field>
          <Field label="Owner phone" htmlFor="owner-phone" error={errors["owner.phone"]}>
            <Input id="owner-phone" name="phone" type="tel" value={owner.phone} onChange={handleOwnerChange} placeholder="078 123 4567" error={errors["owner.phone"]} required />
          </Field>
          <Field label="Owner email" htmlFor="owner-email" error={errors["owner.email"]} hint="They log in with this email.">
            <Input id="owner-email" name="email" type="email" value={owner.email} onChange={handleOwnerChange} placeholder="name@example.com" error={errors["owner.email"]} required />
          </Field>
          <Field label="Temporary password" htmlFor="owner-password" error={errors["owner.password"]} hint="8+ characters with upper, lower case and a number. Share it with the owner.">
            <Input id="owner-password" name="password" type="text" value={owner.password} onChange={handleOwnerChange} placeholder="e.g. Loco2026!" error={errors["owner.password"]} required />
          </Field>
        </div>
      )}
    </div>
  );
}
