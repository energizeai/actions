import { CodeBlock } from "@/components/ui/codeblock"
import type { MDXComponents } from "mdx/types"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
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
          <code className={className} {...props}>
            {children}
          </code>
        )
      }

      return (
        <CodeBlock
          key={Math.random()}
          language={(match && match[1]) || ""}
          value={String(children).replace(/\n$/, "")}
          {...props}
        />
      )
    },
    ...components,
  }
}
