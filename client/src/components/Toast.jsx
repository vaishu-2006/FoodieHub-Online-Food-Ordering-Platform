import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

export default function Toast({ toast }) {
  if (!toast) return null
  const Icon = toast.kind === 'error' ? FiXCircle : FiCheckCircle
  return <div className={`toast toast-${toast.kind}`} role="status"><Icon />{toast.message}</div>
}
