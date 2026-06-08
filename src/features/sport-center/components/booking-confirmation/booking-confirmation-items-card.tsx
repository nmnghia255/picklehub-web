import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

type LineItem = {
  id: string
  name: string
  price: number
  quantity: number
  lineTotal: number
}

type BookingConfirmationItemsCardProps = {
  serviceTotalDisplay: string
  productTotalDisplay: string
  selectedServices: LineItem[]
  selectedProducts: LineItem[]
}

export function BookingConfirmationItemsCard({
  serviceTotalDisplay,
  productTotalDisplay,
  selectedServices,
  selectedProducts,
}: BookingConfirmationItemsCardProps) {
  const { t } = useSportCenterTranslation()
  return (
    <Card className="border shadow-lg shadow-black/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {t("booking.confirmation.itemsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {t("booking.summary.serviceFee")}
            </h3>
            <span className="text-sm text-muted-foreground">
              {serviceTotalDisplay}
            </span>
          </div>
          {selectedServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("booking.confirmation.noExtraServices")}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.quantity} x {formatCurrencyVnd(service.price)}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrencyVnd(service.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {t("booking.summary.productFee")}
            </h3>
            <span className="text-sm text-muted-foreground">
              {productTotalDisplay}
            </span>
          </div>
          {selectedProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("booking.confirmation.noExtraProducts")}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} x {formatCurrencyVnd(product.price)}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrencyVnd(product.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
