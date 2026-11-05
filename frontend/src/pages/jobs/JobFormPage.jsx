import { ArrowLeft, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import {
  Button,
  Container,
  DistrictSelect,
  Field,
  Input,
  Message,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { JOB_TYPES, PAY_PERIODS } from "../../lib/format";
import { formatPhoneForDisplay } from "../../lib/rwanda";

const empty = (user) => ({
  title: "",
  description: "",
  requirements: "",
  categoryId: "",
  district: user?.district || "",
  sector: "",
  jobType: "DAILY",
  payPeriod: "PER_DAY",
  payMin: "",
  payMax: "",
  workersNeeded: 1,
  startDate: "",
  durationText: "",
  contactPhone: formatPhoneForDisplay(user?.phone) || "",
  status: "OPEN",
});

export default function JobFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(() => empty(user));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: categoryData } = useFetch("/categories?kind=JOBS");
  const { data: mine, loading } = useFetch("/jobs/mine", { enabled: editing });

  useEffect(() => {
    if (!editing || !mine) return;
    const job = mine.jobs.find((item) => item.id === id);
    if (!job) {
      navigate("/hiring", { replace: true });
      return;
    }
    setForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements || "",
      categoryId: job.categoryId || "",
      district: job.district,
      sector: job.sector || "",
      jobType: job.jobType,
      payPeriod: job.payPeriod,
      payMin: job.payMin ?? "",
      payMax: job.payMax ?? "",
      workersNeeded: job.workersNeeded,
      startDate: job.startDate ? job.startDate.slice(0, 10) : "",
      durationText: job.durationText || "",
      contactPhone: formatPhoneForDisplay(job.contactPhone) || "",
      status: job.status,
    });
  }, [editing, mine, id, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const body = {
      ...form,
      payMin: form.payMin === "" ? null : Number(form.payMin),
      payMax: form.payMax === "" ? null : Number(form.payMax),
      workersNeeded: Number(form.workersNeeded) || 1,
    };

    try {
      const response = editing
        ? await apiRequest(`/jobs/${id}`, { method: "PATCH", body })
        : await apiRequest("/jobs", { method: "POST", body });

      navigate(`/jobs/${response.job.slug}`, { replace: true });
    } catch (requestError) {
      setErrors(fieldErrorsFrom(requestError));
      setError(requestError.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  if (editing && loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner /></main>;
  }

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container className="max-w-3xl">
        <Link to={editing ? "/hiring" : "/jobs"} className="inline-flex items-center gap-2 font-bold text-loco-wine"><ArrowLeft size={18} /> Back</Link>

        <div className="mt-5 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-9">
          <PageHeader
            eyebrow={editing ? "Edit job" : "Hire locally"}
            title={editing ? "Update your job post" : "Post a job"}
            description="Describe the work clearly. Workers in the district apply with their phone number and you call the ones you want."
          />

          {error && <Message className="mb-5">{error}</Message>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Job title" htmlFor="title" error={errors.title}>
              <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. 5 masons for house construction in Kicukiro" error={errors.title} required />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Type of work" htmlFor="categoryId" error={errors.categoryId} optional>
                <Select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange}>
                  <option value="">Choose a category</option>
                  {(categoryData?.categories || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </Select>
              </Field>
              <Field label="Job type" htmlFor="jobType" error={errors.jobType}>
                <Select id="jobType" name="jobType" value={form.jobType} onChange={handleChange}>
                  {Object.entries(JOB_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </Select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="District" htmlFor="district" error={errors.district}>
                <DistrictSelect id="district" name="district" value={form.district} onChange={handleChange} error={errors.district} required />
              </Field>
              <Field label="Sector or place" htmlFor="sector" optional error={errors.sector}>
                <Input id="sector" name="sector" value={form.sector} onChange={handleChange} placeholder="e.g. Kagarama, near the market" />
              </Field>
            </div>

            <Field label="Describe the work" htmlFor="description" error={errors.description}>
              <Textarea id="description" name="description" rows={5} value={form.description} onChange={handleChange} placeholder="What will the workers do each day? Where? For how long? Is food or transport provided?" error={errors.description} required />
            </Field>

            <Field label="Requirements" htmlFor="requirements" optional error={errors.requirements}>
              <Textarea id="requirements" name="requirements" rows={3} value={form.requirements} onChange={handleChange} placeholder="Experience, tools, ID, age, language..." />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Pay from (RWF)" htmlFor="payMin" optional error={errors.payMin}>
                <Input id="payMin" name="payMin" type="number" min="0" step="100" value={form.payMin} onChange={handleChange} placeholder="3000" error={errors.payMin} />
              </Field>
              <Field label="Pay up to (RWF)" htmlFor="payMax" optional error={errors.payMax}>
                <Input id="payMax" name="payMax" type="number" min="0" step="100" value={form.payMax} onChange={handleChange} placeholder="5000" error={errors.payMax} />
              </Field>
              <Field label="Paid" htmlFor="payPeriod" error={errors.payPeriod}>
                <Select id="payPeriod" name="payPeriod" value={form.payPeriod} onChange={handleChange}>
                  {Object.entries(PAY_PERIODS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </Select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Workers needed" htmlFor="workersNeeded" error={errors.workersNeeded}>
                <Input id="workersNeeded" name="workersNeeded" type="number" min="1" value={form.workersNeeded} onChange={handleChange} error={errors.workersNeeded} required />
              </Field>
              <Field label="Start date" htmlFor="startDate" optional error={errors.startDate}>
                <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} error={errors.startDate} />
              </Field>
              <Field label="Duration" htmlFor="durationText" optional error={errors.durationText}>
                <Input id="durationText" name="durationText" value={form.durationText} onChange={handleChange} placeholder="e.g. 3 months" />
              </Field>
            </div>

            <Field label="Contact phone" htmlFor="contactPhone" optional error={errors.contactPhone} hint="Shown on the job so workers can call or WhatsApp you directly.">
              <Input id="contactPhone" name="contactPhone" type="tel" value={form.contactPhone} onChange={handleChange} placeholder="078 123 4567" error={errors.contactPhone} />
            </Field>

            {editing && (
              <Field label="Status" htmlFor="status">
                <Select id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="OPEN">Open: taking applications</option>
                  <option value="FILLED">Filled: workers found</option>
                  <option value="CLOSED">Closed</option>
                </Select>
              </Field>
            )}

            <Button type="submit" variant="orange" className="w-full" loading={submitting}>
              <Briefcase size={18} /> {submitting ? "Saving..." : editing ? "Save changes" : "Publish job"}
            </Button>
          </form>
        </div>
      </Container>
    </main>
  );
}
