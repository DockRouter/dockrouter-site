"use client";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyButton({
  text,
  label = "Copy command",
}: {
  text: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  }
  return (
    <span className="copy-wrap">
      <button
        type="button"
        className="copy-button"
        onClick={copy}
        aria-label={state === "copied" ? "Copied" : label}
      >
        {state === "copied" ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <span className="copy-status" role="status">
        {state === "copied"
          ? "Copied!"
          : state === "error"
            ? "Select and copy the code below."
            : ""}
      </span>
    </span>
  );
}
export function Code({
  children,
  title = "terminal",
}: {
  children: string;
  title?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>
          <i /> {title}
        </span>
        <CopyButton text={children} />
      </div>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex lint/a11y/useSemanticElements: Preserve preformatted code while making its horizontal scroll accessible to keyboard users. */}
      <pre tabIndex={0} role="region" aria-label={`${title} code`}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
