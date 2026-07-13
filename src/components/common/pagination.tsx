"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { useTranslation } from "react-i18next"

import {
  Pagination as UiPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

export interface PaginationProps {
  /**
   * The current active page (1-indexed).
   */
  currentPage: number
  /**
   * The total number of pages. If omitted, we will rely on hasNextPage/hasPreviousPage.
   */
  totalPages?: number
  /**
   * Callback fired when a page is changed.
   */
  onPageChange?: (page: number) => void
  /**
   * Callback fired when going to previous page. If not provided, defaults to onPageChange(currentPage - 1).
   */
  onPreviousPage?: () => void
  /**
   * Callback fired when going to next page. If not provided, defaults to onPageChange(currentPage + 1).
   */
  onNextPage?: () => void
  /**
   * Function to generate a URL/href for a given page.
   * If provided, pagination elements will use this href.
   */
  createHref?: (page: number) => string
  /**
   * If true, disables interaction.
   */
  disabled?: boolean
  /**
   * Layout style.
   * - "simple": shows previous, page indicator (e.g. Page X of Y), next.
   * - "full": shows previous, full range of numbered page links with ellipsis, next.
   * If omitted, defaults to "full" if totalPages is defined and > 1, otherwise "simple".
   */
  variant?: "simple" | "full"
  /**
   * Explicit override for whether a next page exists (useful when totalPages is unknown/not provided).
   */
  hasNextPage?: boolean
  /**
   * Explicit override for whether a previous page exists (useful when totalPages is unknown/not provided).
   */
  hasPreviousPage?: boolean

  /**
   * Sibling count to show on each side of the active page in full layout. Defaults to 1.
   */
  siblingCount?: number
  /**
   * Custom className for the root pagination container.
   */
  className?: string
}

const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

const DOTS = "..."

const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1
) => {
  const totalPageNumbers = siblingCount + 5

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1

  const firstPageIndex = 1
  const lastPageIndex = totalPages

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = range(1, leftItemCount)
    return [...leftRange, DOTS, totalPages]
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = range(totalPages - rightItemCount + 1, totalPages)
    return [firstPageIndex, DOTS, ...rightRange]
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
  }

  return []
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPreviousPage,
  onNextPage,
  createHref,
  disabled = false,
  variant,
  hasNextPage,
  hasPreviousPage,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const { t } = useTranslation("common")

  const hasPrev =
    hasPreviousPage !== undefined ? hasPreviousPage : currentPage > 1
  const hasNext =
    hasNextPage !== undefined
      ? hasNextPage
      : totalPages !== undefined
        ? currentPage < totalPages
        : false

  const determinedVariant =
    variant || (totalPages !== undefined && totalPages > 1 ? "full" : "simple")

  const prevText = t("pagination.previous")
  const nextText = t("pagination.next")

  const handlePrev = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled || !hasPrev) {
      event.preventDefault()
      return
    }
    if (onPreviousPage) {
      event.preventDefault()
      onPreviousPage()
    } else if (onPageChange) {
      event.preventDefault()
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled || !hasNext) {
      event.preventDefault()
      return
    }
    if (onNextPage) {
      event.preventDefault()
      onNextPage()
    } else if (onPageChange) {
      event.preventDefault()
      onPageChange(currentPage + 1)
    }
  }

  const prevHref = hasPrev && createHref ? createHref(currentPage - 1) : "#"
  const nextHref = hasNext && createHref ? createHref(currentPage + 1) : "#"

  return (
    <UiPagination className={className}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          {hasPrev ? (
            <PaginationPrevious
              href={prevHref}
              onClick={handlePrev}
              className={cn(
                "cursor-pointer",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <span className="hidden sm:block">{prevText}</span>
            </PaginationPrevious>
          ) : (
            <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium text-muted-foreground opacity-50 sm:pl-2.5">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:block">{prevText}</span>
            </span>
          )}
        </PaginationItem>

        {/* Content (Simple vs Full) */}
        {determinedVariant === "simple" ? (
          <PaginationItem>
            <span className="px-3 text-sm text-muted-foreground select-none">
              {totalPages !== undefined && totalPages > 1
                ? t("pagination.pageInfo", { currentPage, totalPages })
                : t("pagination.page", { page: currentPage })}
            </span>
          </PaginationItem>
        ) : (
          totalPages !== undefined &&
          getPaginationRange(currentPage, totalPages, siblingCount).map(
            (pageNumber, idx) => {
              if (pageNumber === DOTS) {
                return (
                  <PaginationItem key={`dots-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              const isCurrent = pageNumber === currentPage
              const pageHref = createHref
                ? createHref(pageNumber as number)
                : "#"

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={pageHref}
                    isActive={isCurrent}
                    onClick={(e) => {
                      if (isCurrent || disabled) {
                        e.preventDefault()
                        return
                      }
                      if (onPageChange) {
                        e.preventDefault()
                        onPageChange(pageNumber as number)
                      }
                    }}
                    className={cn(
                      "cursor-pointer",
                      disabled && "pointer-events-none opacity-50",
                      isCurrent && "pointer-events-none"
                    )}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            }
          )
        )}

        {/* Next Button */}
        <PaginationItem>
          {hasNext ? (
            <PaginationNext
              href={nextHref}
              onClick={handleNext}
              className={cn(
                "cursor-pointer",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <span className="hidden sm:block">{nextText}</span>
            </PaginationNext>
          ) : (
            <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium text-muted-foreground opacity-50 sm:pr-2.5">
              <span className="hidden sm:block">{nextText}</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </UiPagination>
  )
}
