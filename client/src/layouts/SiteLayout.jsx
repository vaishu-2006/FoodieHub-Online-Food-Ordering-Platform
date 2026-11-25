import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import { useApp } from '../context/AppContext'

export default function SiteLayout() {
  const { toast } = useApp()
  return <><Navbar /><main className="page-main"><Outlet /></main><Footer /><Toast toast={toast} /></>
}
