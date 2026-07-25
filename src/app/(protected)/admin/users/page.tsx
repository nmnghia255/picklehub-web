import { UserManagementView } from "@/features/admin/components/user-management-view"

export const metadata = {
  title: "User Management | PickleHub Admin",
  description: "Quản lý người dùng toàn hệ thống",
}

export default function UserManagementPage() {
  return <UserManagementView />
}
