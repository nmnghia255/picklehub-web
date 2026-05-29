"use client"

import { createSportCenterBookingsAction } from "@/features/sport-center/actions/create-booking"
import { fetchBulkCourtAvailabilityAction } from "@/features/sport-center/actions/fetch-bulk-court-availability"
import { fetchSportCenterProductsAction } from "@/features/sport-center/actions/fetch-sport-center-products"
import { fetchSportCenterServicesAction } from "@/features/sport-center/actions/fetch-sport-center-services"
import {
  type ProductSelectionState,
  type SelectedCourts,
  type ServiceSelectionState,
  useBookingStore,
} from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { CreateBookingRequest } from "@/features/sport-center/types/booking"
import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"

function formatBookingDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function parseBookingSlot(slot: string) {
  const [startTime = "", endTime = ""] = slot.split(" - ")

  return { startTime, endTime }
}

function buildBookingRequest(
  selectedDate: Date,
  selectedCourts: SelectedCourts,
  selectedServices: ServiceSelectionState,
  selectedProducts: ProductSelectionState,
  bookingNote: string,
  useCredit: boolean,
  services: Service[],
  products: Product[],
  availability: BulkCourtAvailability | null,
  basePrice: number
): CreateBookingRequest {
  const bookingDate = formatBookingDate(selectedDate)

  const serviceItems = services
    .filter((service) => selectedServices[service.id])
    .map((service) => ({ serviceId: service.id, quantity: 1 }))

  const productItems = products
    .map((product) => ({
      productId: product.id,
      quantity: selectedProducts[product.id] ?? 0,
      name: product.name,
    }))
    .filter((item) => item.quantity > 0)

  const selectedServiceNames = services
    .filter((service) => selectedServices[service.id])
    .map((service) => service.name)

  const selectedProductLines = productItems.map(
    (item) => `${item.name} x${item.quantity}`
  )

  const noteParts = [bookingNote.trim()]

  if (selectedServiceNames.length > 0) {
    noteParts.push(`Dịch vụ: ${selectedServiceNames.join(", ")}`)
  }

  if (selectedProductLines.length > 0) {
    noteParts.push(`Sản phẩm: ${selectedProductLines.join(", ")}`)
  }

  const note = noteParts.filter(Boolean).join("\n")

  const courtItems = Object.entries(selectedCourts).flatMap(
    ([courtId, slots]) =>
      Array.from(slots).map((slot) => {
        const { startTime, endTime } = parseBookingSlot(slot)
        const availabilityCourt = availability?.courts.find(
          (court) => court.courtId === courtId
        )
        const availabilitySlot = availabilityCourt?.slots.find(
          (item) => item.startTime === startTime && item.endTime === endTime
        )
        const pricePerHour = availabilitySlot?.pricePerHour ?? basePrice

        return {
          courtId: courtId.toString(),
          courtName: availabilityCourt?.courtName ?? `Sân ${courtId}`,
          startTime,
          endTime,
          durationHours: 1,
          breakdown: [
            {
              startTime,
              endTime,
              pricePerHour,
            },
          ],
          courtPrice: pricePerHour,
        }
      })
  )

  return {
    date: bookingDate,
    note,
    phoneNumber: "",
    useCredit,
    serviceItems,
    productItems: productItems.map(({ productId, quantity }) => ({
      productId,
      quantity,
    })),
    items: courtItems,
  }
}

export async function fetchCourtAvailabilityAction(
  centerId: string,
  date: Date
) {
  useBookingStore.setState({
    isLoadingAvailability: true,
    availabilityError: "",
  })

  try {
    const courtAvailability = await fetchBulkCourtAvailabilityAction(
      centerId,
      date
    )

    useBookingStore.setState({ courtAvailability })
  } catch (error) {
    useBookingStore.setState({
      courtAvailability: null,
      availabilityError:
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách sân trống.",
    })
  } finally {
    useBookingStore.setState({ isLoadingAvailability: false })
  }
}

export async function fetchServicesAction(centerId: string) {
  try {
    const services = (await fetchSportCenterServicesAction(centerId)).filter(
      (service) => service.isActive
    )
    const selectedServices = services.reduce<ServiceSelectionState>(
      (acc, service) => {
        acc[service.id] = false
        return acc
      },
      {}
    )

    useBookingStore.setState({ services, selectedServices })
  } catch {
    useBookingStore.setState({ services: [], selectedServices: {} })
  }
}

export async function fetchProductsAction(centerId: string) {
  try {
    const products = (await fetchSportCenterProductsAction(centerId)).filter(
      (product) => product.isActive
    )
    const selectedProducts = products.reduce<ProductSelectionState>(
      (acc, product) => {
        acc[product.id] = 0
        return acc
      },
      {}
    )

    useBookingStore.setState({ products, selectedProducts })
  } catch {
    useBookingStore.setState({ products: [], selectedProducts: {} })
  }
}

export async function submitBookingsAction() {
  const {
    selectedDate,
    selectedCourts,
    selectedServices,
    selectedProducts,
    bookingNote,
    useCredit,
    services,
    products,
    courtAvailability,
  } = useBookingStore.getState()

  const sportCenter = useSportCenterStore.getState().sportCenter
  const centerId = sportCenter.id

  if (!centerId) {
    useBookingStore.setState({ submitError: "Không tìm thấy mã sân." })
    return false
  }

  if (!selectedDate) {
    useBookingStore.setState({ submitError: "Vui lòng chọn ngày đặt sân." })
    return false
  }

  const bookingRequest = buildBookingRequest(
    selectedDate,
    selectedCourts,
    selectedServices,
    selectedProducts,
    bookingNote,
    useCredit,
    services,
    products,
    courtAvailability,
    sportCenter?.basePrice ?? 0
  )

  console.log("Booking Request:", bookingRequest)

  if (bookingRequest.items.length === 0) {
    useBookingStore.setState({
      submitError: "Vui lòng chọn ít nhất một sân và khung giờ.",
    })
    return false
  }

  useBookingStore.setState({
    isSubmitting: true,
    submitMessage: "",
    submitError: "",
    lastBookingId: null,
  })

  try {
    console.log("Submitting booking request for centerId:", bookingRequest)
    const result = await createSportCenterBookingsAction({
      centerId,
      bookingRequest,
    })

    if (!result.success) {
      useBookingStore.setState({
        submitError: result.error ?? "Không thể gửi yêu cầu đặt sân.",
      })
      return false
    }

    useBookingStore.setState({
      selectedCourts: {},
      selectedServices: services.reduce<ServiceSelectionState>(
        (acc, service) => {
          acc[service.id] = false
          return acc
        },
        {}
      ),
      selectedProducts: products.reduce<ProductSelectionState>(
        (acc, product) => {
          acc[product.id] = 0
          return acc
        },
        {}
      ),
      bookingNote: "",
      lastBookingId: result.booking?.id ?? null,
      submitMessage: result.message ?? "Đã gửi yêu cầu đặt sân thành công.",
    })

    return true
  } catch (error) {
    useBookingStore.setState({
      submitError:
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu đặt sân.",
    })
    return false
  } finally {
    useBookingStore.setState({ isSubmitting: false })
  }
}
