export default function Logo({ size = 120, className = '' }) {
  return (
    <img
      className={`cpdo-logo ${className}`.trim()}
      src="/cpdo-logo.png"
      width={size}
      height={size}
      alt="City Planning and Development Office"
    />
  )
}
