import { SubmitButton } from "@/components/submit-button";

type ClientDefaults = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
};

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs uppercase tracking-label text-text-muted font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="border border-border rounded-input px-3 py-2 text-base bg-surface"
      />
    </div>
  );
}

export function ClientForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ClientDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-xl">
      <Field label="Name *" name="name" defaultValue={defaultValues?.name} required />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone" name="phone" defaultValue={defaultValues?.phone ?? undefined} />
        <Field label="Email" name="email" type="email" defaultValue={defaultValues?.email ?? undefined} />
      </div>
      <Field label="Company" name="company" defaultValue={defaultValues?.company ?? undefined} />
      <Field label="Address" name="address" defaultValue={defaultValues?.address ?? undefined} />
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-xs uppercase tracking-label text-text-muted font-semibold">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? undefined}
          rows={3}
          className="border border-border rounded-input px-3 py-2 text-base bg-surface"
        />
      </div>
      <SubmitButton
        pendingText="Saving..."
        className="self-start bg-text text-surface border border-text px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
