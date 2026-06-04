interface FormCheckboxProps {
  label: string;
  name: string;
  register?: any;
}

export default function FormCheckbox({
  label,
  name,
  register,
}: FormCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={name}
        type="checkbox"
        {...(register ? register(name) : {})}
        className="h-4 w-4 cursor-pointer rounded"
        style={{
          accentColor: "var(--gold)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
      />
      <label
        htmlFor={name}
        className="cursor-pointer text-sm text-muted-foreground select-none"
      >
        {label}
      </label>
    </div>
  );
}
