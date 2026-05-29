import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BookingConfirmationEmptyState() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 md:px-6">
      <Alert variant="destructive" className="border-destructive/20">
        <AlertTitle>Không thể mở xác nhận đặt sân</AlertTitle>
        <AlertDescription>
          Không tìm thấy dữ liệu đặt sân. Vui lòng quay lại trang đặt sân và thử
          lại.
        </AlertDescription>
      </Alert>
    </div>
  )
}
