import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { sportCenterWizardClient } from "../../api/sport-center-wizard-client"
import { sportCenterOwnerListQueryKey } from "../../queries"
import type { SportCenter } from "../../types/sport-center"
import { editDetailQueryKey, managementDetailQueryKey } from "./types"

export function SportCenterDeleteDialog({
  center,
  open,
  onClose,
}: {
  center: SportCenter | null
  open: boolean
  onClose: () => void
}) {
  const { t } = useSportCenterManagementTranslation()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (centerId: string) =>
      sportCenterWizardClient.deleteSportCenter(centerId),
    onSuccess: async (_, centerId) => {
      await queryClient.invalidateQueries({
        queryKey: sportCenterOwnerListQueryKey,
      })
      queryClient.removeQueries({
        queryKey: managementDetailQueryKey(centerId),
      })
      queryClient.removeQueries({ queryKey: editDetailQueryKey(centerId) })
      onClose()
      toast.success(t("centerList.toast.deleted"))
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("centerList.toast.deleteFailed")
      )
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) =>
        !isOpen && !deleteMutation.isPending && onClose()
      }
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("centerList.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("centerList.delete.description", {
              name: center?.name ?? "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteMutation.isPending}
            onClick={onClose}
          >
            {t("centerList.actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!center || deleteMutation.isPending}
            onClick={() => center && deleteMutation.mutate(center.id)}
          >
            {deleteMutation.isPending
              ? t("centerList.actions.deleting")
              : t("centerList.actions.confirmDelete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
