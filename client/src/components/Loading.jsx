export default function Loading({ label = 'Just a moment…' }) {
  return <div className="loading-state"><span className="spinner" /><p>{label}</p></div>
}
