interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={inputId}
        className="h-4 w-4 rounded border-slate-300 text-fire-600 focus:ring-fire-500"
        {...props}
      />
      <label htmlFor={inputId} className="text-sm text-slate-700">
        {label}
      </label>
    </div>
  );
}
