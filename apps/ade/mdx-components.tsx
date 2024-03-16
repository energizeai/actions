import { CodeBlock } from "@/components/ui/codeblock"
import type { MDXComponents } from "mdx/types"
import { Check, Info, Note, Tip, Warning } from "./components/ui/callout"
import MarkdownHeading from "./components/ui/markdown-heading-with-link"
import { ResponseField } from "./components/ui/response-field"
import { cn } from "./lib/utils"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Info: ({ children }) => <Info>{children}</Info>,
    Check: ({ children }) => <Check>{children}</Check>,
    Tip: ({ children }) => <Tip>{children}</Tip>,
    Warning: ({ children }) => <Warning>{children}</Warning>,
    Note: ({ children }) => <Note>{children}</Note>,
    ResponseField: (props) => <ResponseField {...props} />,
    h2: (props) => <MarkdownHeading {...props} tagname="H2" />,
    h3: (props) => <MarkdownHeading {...props} tagname="H3" />,
    a: (props) => (
      <a
        {...props}
        className={cn(
          props.className,
          "font-bold border-b border-primary !no-underline"
        )}
      />
    ),
    code: ({ className, children, ...props }) => {
      if (children && Array.isArray(children) && children.length) {
        if (children[0] == "▍") {
          return <span className="mt-1 animate-pulse cursor-default">▍</span>
        }

        children[0] = (children[0] as string).replace("`▍`", "▍")
      }

      const match = /language-(\w+)/.exec(className || "")

      if (!match && className !== "language-text") {
        return (
          <code
            className={cn(
              "bg-muted text-muted-foreground rounded px-1 py-0.5 font-mono text-sm border",
              className
            )}
            {...props}
          >
            {children}
          </code>
        )
      }

      return (
        <CodeBlock
          language={(match && match[1]) || ""}
          value={String(children).replace(/\n$/, "")}
          {...props}
          fileName={className?.includes(":") ? className.split(":")[1] : ""}
        />
      )
    },
    ...components,
  }
}
