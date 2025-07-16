import { AppLayout } from '@/components/app-layout'
import { AdminClientPage } from './client-page'

export default function AdminPage() {
  return (
    <AppLayout role="admin">
      <AdminClientPage />
    </AppLayout>
  )
}
