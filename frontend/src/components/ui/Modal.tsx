import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "../../utils/cn";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  className?: string;
  onClose: () => void;
}

export function Modal({
  open,
  title,
  children,
  className,
  onClose,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

      if (!focusableElements?.length) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl",
          "sm:max-w-lg sm:rounded-2xl",
          className,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-heading">
            {title}
          </h2>

          <button
            type="button"
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-gray-100 hover:text-heading"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
