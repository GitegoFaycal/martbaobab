import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { fieldErrorsFrom } from "../../api/api";
import { SingleImageUploader } from "../../components/ImageUploader";
import { Button, Container, DistrictSelect, Field, Input, Message, Textarea } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useT } from "../../i18n";
import { formatPhoneForDisplay, saveDistrict } from "../../lib/rwanda";

export default function EditProfilePage() {
  const t = useT();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: user.name || "",
    phone: formatPhoneForDisplay(user.phone) || "",
    district: user.district || "",
    avatarUrl: user.avatarUrl || "",
    headline: user.headline || "",
    bio: user.bio || "",
    skills: (user.skills || []).join(", "),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        district: form.district,
        avatarUrl: form.avatarUrl,
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 8),
      });
      saveDistrict(form.district);
      setSuccess(response.message);
    } catch (requestError) {
      setErrors(fieldErrorsFrom(requestError));
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container className="max-w-2xl">
        <Link to="/profile" className="inline-flex items-center gap-2 font-bold text-loco-navy"><ArrowLeft size={18} /> {t("nav.myProfile")}</Link>

        <div className="mt-5 rounded-3xl bg-white p-6 shadow-lg sm:p-9">
          <p className="font-bold text-loco-blue">{t("nav.myProfile")}</p>
          <h1 className="mt-2 text-3xl font-black text-loco-navy">{t("common.edit")}</h1>

          {error && <Message className="mt-5">{error}</Message>}
          {success && <Message type="success" className="mt-5">{success}</Message>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <SingleImageUploader label={t("upload.avatar")} value={form.avatarUrl} onChange={(avatarUrl) => setForm((c) => ({ ...c, avatarUrl }))} shape="round" />

            <Field label={t("auth.fullName")} htmlFor="name" error={errors.name}>
              <Input id="name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
            </Field>
            <Field label={t("checkout.phone")} htmlFor="phone" error={errors.phone}>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="078 123 4567" error={errors.phone} required />
            </Field>
            <Field label={t("common.district")} htmlFor="district" error={errors.district}>
              <DistrictSelect id="district" name="district" value={form.district} onChange={handleChange} error={errors.district} placeholder={t("common.chooseDistrict")} required />
            </Field>
            <Field label={t("auth.email")} htmlFor="email">
              <Input id="email" value={user.email} disabled />
            </Field>

            <div className="rounded-2xl bg-loco-ice p-4">
              <p className="font-bold text-loco-navy">{t("people.yourProfile")}</p>
              <p className="mt-1 text-sm text-gray-600">{t("people.yourProfileText")}</p>
            </div>

            <Field label={t("people.headline")} htmlFor="headline" error={errors.headline} hint={t("people.headlineHint")}>
              <Input id="headline" name="headline" value={form.headline} onChange={handleChange} maxLength={80} error={errors.headline} />
            </Field>
            <Field label={t("people.bio")} htmlFor="bio" optional error={errors.bio} hint={t("people.bioHint")}>
              <Textarea id="bio" name="bio" rows={4} value={form.bio} onChange={handleChange} maxLength={600} error={errors.bio} />
            </Field>
            <Field label={t("people.skills")} htmlFor="skills" optional error={errors.skills} hint={t("people.skillsHint")}>
              <Input id="skills" name="skills" value={form.skills} onChange={handleChange} placeholder="Tailoring, Kitenge, School uniforms" error={errors.skills} />
            </Field>

            <Button type="submit" className="w-full" loading={submitting}>{submitting ? t("common.saving") : t("common.save")}</Button>
          </form>
        </div>
      </Container>
    </main>
  );
}
