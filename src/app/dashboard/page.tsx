import { AppLayout } from '@/components/app-layout'
import { DashboardClientPage } from './client-page'

export default function DashboardPage() {
  return (
    <AppLayout role="researcher">
      <DashboardClientPage />
    </AppLayout>
  )
}
