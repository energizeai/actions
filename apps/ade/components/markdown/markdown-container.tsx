export default function MarkdownContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="prose break-words leading-7 dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 pb-10">
      {children}
    </div>
  )
}
