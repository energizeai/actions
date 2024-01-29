import { SearchIcon } from "lucide-react"
import * as React from "react"

import { cn } from "../utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <form
        className={cn(
          "relative flex gap-3 items-center h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <SearchIcon className="text-muted-foreground h-5 w-5" />
        <input
          ref={ref}
          type="search"
          name="search"
          placeholder={props.placeholder ?? "Search..."}
          className="flex-1 h-full py-2 border-0 bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          {...props}
        />
      </form>
    )
  }
)
SearchInput.displayName = "SearchInput"

const InputWithIcon = React.forwardRef<
  HTMLInputElement,
  InputProps & { icon: React.ReactNode }
>(({ className, icon, ...props }, ref) => {
  return (
    <div
      className={cn(
        "relative flex gap-3 items-center h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {icon}
      <input
        ref={ref}
        className="flex-1 h-full py-2 border-0 bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-0"
        {...props}
      />
    </div>
  )
})
InputWithIcon.displayName = "InputWithIcon"

export { Input, InputWithIcon, SearchInput }
