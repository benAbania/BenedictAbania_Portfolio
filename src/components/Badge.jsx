export function Badge({ children, className = "" }) {
  return (
    <span className={`bg-[#0a0a0a] text-gray-300 px-4 py-2 rounded-xl text-sm border border-gray-800 shadow-sm flex items-center gap-2 w-fit ${className}`}>
      {children}
    </span>
  )
}