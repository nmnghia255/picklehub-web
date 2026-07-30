"use client"

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Search,
  Trash2,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
  deleteUser,
  getUserDetails,
  getUsersList,
  updateUser,
} from "../api/admin-service"
import type { AdminUser, UpdateUserPayload, UserListParams } from "../types"

export function UserManagementView() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Pagination
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Modal State (Reused for Edit & View)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"EDIT" | "VIEW">("EDIT")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState<UpdateUserPayload>({
    fullName: "",
    email: "",
    role: "USER",
    status: "ACTIVE",
    selfRating: 3.5,
    preferredHand: "RIGHT",
    phoneNumber: "",
    gender: "MALE",
    bio: "",
    address: "",
    city: "",
    district: "",
    dupr: null,
  })
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const params: UserListParams = {
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        page,
        limit,
      }
      const res = await getUsersList(params)
      setUsers(res.data || [])
      if (res.meta) {
        setTotal(res.meta.total)
        setTotalPages(
          res.meta.totalPages || Math.ceil(res.meta.total / limit) || 1
        )
      } else {
        setTotal(res.data?.length || 0)
        setTotalPages(1)
      }
    } catch {
      toast.error("Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page, limit])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers()
  }, [fetchUsers])

  const populateForm = (user: AdminUser) => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "USER",
      status: user.status || "ACTIVE",
      selfRating: user.selfRating ?? 3.5,
      preferredHand: user.preferredHand || "RIGHT",
      phoneNumber: user.phoneNumber || "",
      gender: user.gender || "MALE",
      bio: user.bio || "",
      address: user.address || "",
      city: user.city || "",
      district: user.district || "",
      dupr: user.dupr ?? null,
    })
  }

  const handleOpenEditModal = (user: AdminUser) => {
    setSelectedUser(user)
    setModalMode("EDIT")
    populateForm(user)
    setModalOpen(true)
  }

  const handleOpenViewModal = async (user: AdminUser) => {
    setSelectedUser(user)
    setModalMode("VIEW")
    populateForm(user)
    setModalOpen(true)
    setFetchingDetail(true)

    try {
      const details = await getUserDetails(user.id)
      if (details) {
        setSelectedUser(details)
        populateForm(details)
      }
    } catch {
      // Keep summary object
    } finally {
      setFetchingDetail(false)
    }
  }

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === "VIEW" || !selectedUser) {
      setModalOpen(false)
      return
    }

    setSubmitting(true)
    try {
      await updateUser(selectedUser.id, formData)
      toast.success("Cập nhật thông tin người dùng thành công!")
      setModalOpen(false)
      fetchUsers()
    } catch (error) {
      toast.error("Cập nhật người dùng thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa/vô hiệu hóa tài khoản người dùng này?"
      )
    )
      return

    try {
      await deleteUser(id)
      toast.success("Xóa tài khoản thành công")
      fetchUsers()
    } catch (error) {
      toast.error("Xóa tài khoản thất bại")
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý tài khoản, phân quyền & trạng thái người dùng.
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="userSearch"
                className="flex items-center gap-1.5 text-xs"
              >
                <Search className="size-3.5" /> Search
              </Label>
              <Input
                id="userSearch"
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="roleSelect"
                className="flex items-center gap-1.5 text-xs"
              >
                <Filter className="size-3.5" /> Role
              </Label>
              <NativeSelect
                id="roleSelect"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
              >
                <NativeSelectOption value="ALL">Tất cả Role</NativeSelectOption>
                <NativeSelectOption value="USER">USER</NativeSelectOption>
                <NativeSelectOption value="ADMIN">ADMIN</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="statusSelect"
                className="flex items-center gap-1.5 text-xs"
              >
                <Filter className="size-3.5" /> Status
              </Label>
              <NativeSelect
                id="statusSelect"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <NativeSelectOption value="ALL">
                  Tất cả Status
                </NativeSelectOption>
                <NativeSelectOption value="ACTIVE">ACTIVE</NativeSelectOption>
                <NativeSelectOption value="PENDING">PENDING</NativeSelectOption>
                <NativeSelectOption value="DEACTIVATED">
                  DEACTIVATED
                </NativeSelectOption>
                <NativeSelectOption value="PENDING_DELETION">
                  PENDING_DELETION
                </NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh Sách Người Dùng</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : users.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Không tìm thấy người dùng</EmptyTitle>
                <EmptyDescription>
                  Không có người dùng nào khớp với bộ lọc tìm kiếm.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        Full Name
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="w-[120px] text-xs whitespace-nowrap">
                        Role
                      </TableHead>
                      <TableHead className="w-[120px] text-xs whitespace-nowrap">
                        Status
                      </TableHead>
                      <TableHead className="w-[120px] text-xs whitespace-nowrap">
                        Self Rating
                      </TableHead>
                      <TableHead className="w-[120px] text-xs whitespace-nowrap">
                        Preferred Hand
                      </TableHead>
                      <TableHead className="w-[180px] text-right text-xs whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage
                                src={u.avatarUrl || ""}
                                alt={u.fullName}
                              />
                              <AvatarFallback>
                                {u.fullName?.substring(0, 2)?.toUpperCase() ||
                                  "US"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{u.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs break-all whitespace-normal text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell className="w-[90px] whitespace-nowrap">
                          <Badge
                            className={cn(
                              "border-0 px-1.5 py-0.5 text-[10px] font-semibold",
                              u.role === "ADMIN"
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                                : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                            )}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[100px] whitespace-nowrap">
                          <Badge
                            className={cn(
                              "border-0 px-1.5 py-0.5 text-[10px] font-semibold",
                              u.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : u.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                            )}
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[95px] text-xs font-semibold whitespace-nowrap">
                          {u.selfRating ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {u.preferredHand ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenViewModal(u)}
                              title="Xem chi tiết"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModal(u)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Xóa/Vô hiệu hóa"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Hiển thị <span className="font-medium">{users.length}</span> /{" "}
                  <span className="font-medium">{total}</span> người dùng
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="mr-1 size-4" /> Trước
                  </Button>
                  <span className="px-2 text-xs font-medium">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Sau <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reused Modal (Edit / View User) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "EDIT"
                ? "Chỉnh Sửa Người Dùng"
                : "Chi Tiết Tài Khoản Người Dùng"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "EDIT"
                ? "Cập nhật toàn bộ thông tin tài khoản người dùng."
                : "Xem toàn bộ chi tiết hồ sơ tài khoản người dùng."}
            </DialogDescription>
          </DialogHeader>

          {fetchingDetail ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : (
            <form onSubmit={handleSubmitModal} className="space-y-4">
              {/* Profile Header preview */}
              {selectedUser && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src={selectedUser.avatarUrl || ""}
                      alt={selectedUser.fullName}
                    />
                    <AvatarFallback>
                      {selectedUser.fullName?.substring(0, 2)?.toUpperCase() ||
                        "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.email}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      ID: {selectedUser.id}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editFullName">Full Name</Label>
                  <Input
                    id="editFullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    readOnly={modalMode === "VIEW"}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="cursor-not-allowed bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editRole">Role</Label>
                  {modalMode === "VIEW" ? (
                    <Input id="editRole" value={formData.role} readOnly />
                  ) : (
                    <NativeSelect
                      id="editRole"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <NativeSelectOption value="USER">USER</NativeSelectOption>
                      <NativeSelectOption value="ADMIN">
                        ADMIN
                      </NativeSelectOption>
                    </NativeSelect>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editStatus">Status</Label>
                  {modalMode === "VIEW" ? (
                    <Input id="editStatus" value={formData.status} readOnly />
                  ) : (
                    <NativeSelect
                      id="editStatus"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <NativeSelectOption value="ACTIVE">
                        ACTIVE
                      </NativeSelectOption>
                      <NativeSelectOption value="PENDING">
                        PENDING
                      </NativeSelectOption>
                      <NativeSelectOption value="DEACTIVATED">
                        DEACTIVATED
                      </NativeSelectOption>
                      <NativeSelectOption value="PENDING_DELETION">
                        PENDING_DELETION
                      </NativeSelectOption>
                    </NativeSelect>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editSelfRating">Self Rating</Label>
                  <Input
                    id="editSelfRating"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="6.0"
                    value={formData.selfRating ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selfRating: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    readOnly={modalMode === "VIEW"}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preferredHand">Preferred Hand</Label>
                  {modalMode === "VIEW" ? (
                    <Input
                      id="preferredHand"
                      value={formData.preferredHand || "N/A"}
                      readOnly
                    />
                  ) : (
                    <NativeSelect
                      id="preferredHand"
                      value={formData.preferredHand || "RIGHT"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferredHand: e.target.value,
                        })
                      }
                    >
                      <NativeSelectOption value="RIGHT">
                        RIGHT
                      </NativeSelectOption>
                      <NativeSelectOption value="LEFT">LEFT</NativeSelectOption>
                    </NativeSelect>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    readOnly={modalMode === "VIEW"}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  {modalMode === "VIEW" ? (
                    <Input
                      id="gender"
                      value={formData.gender || "N/A"}
                      readOnly
                    />
                  ) : (
                    <NativeSelect
                      id="gender"
                      value={formData.gender || "MALE"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    >
                      <NativeSelectOption value="MALE">MALE</NativeSelectOption>
                      <NativeSelectOption value="FEMALE">
                        FEMALE
                      </NativeSelectOption>
                      <NativeSelectOption value="OTHER">
                        OTHER
                      </NativeSelectOption>
                    </NativeSelect>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1.5">
                  <Label htmlFor="dupr">DUPR</Label>
                  <Input
                    id="dupr"
                    type="number"
                    step="0.1"
                    value={formData.dupr ?? ""}
                    readOnly
                    className="cursor-not-allowed bg-muted text-muted-foreground"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    readOnly={modalMode === "VIEW"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    readOnly={modalMode === "VIEW"}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    readOnly={modalMode === "VIEW"}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  readOnly={modalMode === "VIEW"}
                  className="text-xs"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  {modalMode === "VIEW" ? "Đóng" : "Hủy"}
                </Button>
                {modalMode === "EDIT" && (
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Spinner className="mr-2 size-4" />}
                    Lưu Thay Đổi
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
