export function BentoCard({ children, className = "p-6" }) {
  return (
    <div className={`bg-[#141414] rounded-3xl border border-gray-800/50 ${className}`}>
      {children}
    </div>
  )
}