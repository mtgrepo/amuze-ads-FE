import { useEffect } from "react"
import { z } from "zod"
import type { UseFormReturn, Path } from "react-hook-form"

// Matches:
// HTML tags like <script>, <img ...>, <iframe>, <svg>, etc.
// Inline event handlers like onerror=, onload=, onclick=
// javascript: or data:text/html protocols
// Any JS object.method(...) call like console.log(...), localStorage.getItem(...), document.write(...)
// Global JS calls like alert(...), confirm(...), prompt(...), eval(...), fetch(...)
// Browser storage & DOM globals like localStorage, sessionStorage, document.cookie, window.location
const DANGEROUS_INPUT_REGEX =
  /(<\s*\/?\s*[a-zA-Z][^>]*>)|(\bon\w+\s*=)|(javascript\s*:)|(data\s*:\s*text\/html)|(\b[a-zA-Z_$][\w$]*\.[a-zA-Z_$][\w$]*\s*\([\s\S]*\))|(\b(?:alert|confirm|prompt|eval|Function|setTimeout|setInterval|fetch)\s*\([\s\S]*\))|(\b(?:localStorage|sessionStorage|indexedDB|document\.cookie|document\.write|window\.location)\b)/i

export const SCRIPT_TAG_MESSAGE = "Scripts or HTML tags are not allowed."

export function hasScriptTag(value: string): boolean {
  return DANGEROUS_INPUT_REGEX.test(value)
}

/**
 * Reusable Zod refinement for any string schema
 * Usage: z.string().min(1, "Required").refine(noScriptTag, SCRIPT_TAG_MESSAGE)
 */
export const noScriptTag = (val?: string | null) =>
  !val || !hasScriptTag(val)

/**
 * Shorthand Zod string builder with script-tag protection built in
 */
export const safeString = (base = z.string()) =>
  base.refine(noScriptTag, { message: SCRIPT_TAG_MESSAGE })

/**
 * Hook that automatically clears any input when script/HTML is typed
 * and shows the message under that input via <FormMessage />
 */
export function usePreventScriptTag<T extends Record<string, any>>(
  form: UseFormReturn<T>
) {
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (!name) return
      const currentValue = values[name]

      if (typeof currentValue === "string" && hasScriptTag(currentValue)) {
        // Clear the input box automatically
        form.setValue(name as Path<T>, "" as any, { shouldValidate: false })

        // Show the message right under the related input (<FormMessage />)
        form.setError(name as Path<T>, {
          type: "manual",
          message: SCRIPT_TAG_MESSAGE,
        })
      } else if (typeof currentValue === "string" && currentValue.length > 0) {
        const fieldError = form.getFieldState(name as Path<T>).error
        if (
          fieldError?.type === "manual" &&
          fieldError.message === SCRIPT_TAG_MESSAGE
        ) {
          form.clearErrors(name as Path<T>)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])
}