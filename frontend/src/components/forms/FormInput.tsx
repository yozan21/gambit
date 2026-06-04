import { forwardRef, useState, useRef, useImperativeHandle } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  type?: string;
  error?: string;
  suffix?: React.ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    {
      id,
      label,
      type = "text",
      placeholder,
      error,
      required = false,
      suffix,
      ...props
    },
    forwardedRef,
  ) {
    const [showPassword, setShowPassword] = useState(false);

    // 1. Create a local ref to interact with the DOM element safely
    const localRef = useRef<HTMLInputElement>(null);

    // 2. Expose the local DOM node to the forwarded parent ref
    useImperativeHandle(forwardedRef, () => localRef.current!);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    // 3. Toggle and force focus on the input element
    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
      localRef.current?.focus();
    };

    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={id}
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        <div className="relative">
          <input
            id={id}
            type={inputType}
            placeholder={placeholder}
            ref={localRef} // 4. Attach the local ref here
            {...props}
            className="w-full rounded-lg px-4 py-3 text-foreground transition-all outline-none placeholder:text-sm placeholder:font-light"
            style={{
              background: "var(--bg-surface)",
              border: error
                ? "1px solid var(--destructive)"
                : "1px solid var(--border-default)",
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.border = "1px solid var(--border-gold)";
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.border = "1px solid var(--border-default)";
              }
            }}
          />

          {isPassword && (
            <button
              type="button"
              onClick={handleTogglePassword} // 5. Use the updated click handler
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          {suffix && !isPassword && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

export default FormInput;
