"use client"

import {
  Activity,
  Building,
  Calendar,
  CalendarClock,
  CreditCard,
  DollarSign,
  GitBranch,
  Grid,
  Heart,
  LayoutDashboard,
  ListOrdered,
  MoreHorizontal,
  Shield,
  Trophy,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"

import { BackButton } from "@/components/common/back-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingManagement } from "@/features/tournaments/components/booking-tab/booking-management"
import { BracketManagement } from "@/features/tournaments/components/bracket-tab/bracket-management"
import { TournamentDashboard } from "@/features/tournaments/components/dashboard-tab/tournament-dashboard"
import { EventManagement } from "@/features/tournaments/components/events-tab/event-management"
import { FinancialDashboard } from "@/features/tournaments/components/financial-tab/financial-dashboard"
import { GroupManagement } from "@/features/tournaments/components/group-tab/group-management"
import { LiveControlCenter } from "@/features/tournaments/components/live-control-center"
import { RegistrationManagement } from "@/features/tournaments/components/registrations-tab/registration-management"
import { Scheduling } from "@/features/tournaments/components/scheduling-tab/scheduling"
import { Seeding } from "@/features/tournaments/components/seeds-tab/seeding"
import { Sponsors } from "@/features/tournaments/components/sponsors-tab/sponsor"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import type { TournamentPrize } from "../types/prize"
import type { RegistrationResponse } from "../types/registration"
import type { Sponsor } from "../types/sponsor"
import type { Tournament } from "../types/tournament"
import type { TournamentEvent } from "../types/tournament-event"
import { PaymentTab } from "./payment-tab/payment"
import { PersonnelManagement } from "./personnel-tab/personnel-management"

const tabMetadata: Record<
  string,
  {
    labelKey: string
    defaultValue?: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  dashboard: { labelKey: "manager.tabs.dashboard", icon: LayoutDashboard },
  events: { labelKey: "manager.tabs.events", icon: Calendar },
  seeding: { labelKey: "manager.tabs.seeding", icon: ListOrdered },
  bookings: {
    labelKey: "manager.tabs.booking",
    defaultValue: "Venue Bookings",
    icon: Building,
  },
  registrations: { labelKey: "manager.tabs.registrations", icon: Users },
  groups: {
    labelKey: "manager.tabs.groups",
    defaultValue: "Group Stage",
    icon: Grid,
  },
  brackets: { labelKey: "manager.tabs.brackets", icon: GitBranch },
  schedule: { labelKey: "manager.tabs.schedule", icon: CalendarClock },
  live: { labelKey: "manager.tabs.live", icon: Activity },
  financials: { labelKey: "manager.tabs.financials", icon: DollarSign },
  payment: { labelKey: "manager.tabs.payment", icon: CreditCard },
  sponsors: { labelKey: "manager.tabs.sponsors", icon: Heart },
  personnel: {
    labelKey: "manager.tabs.personnel",
    defaultValue: "Personnel",
    icon: Shield,
  },
}

export function TournamentManager({
  tournament,
  events,
  prizes,
  isHost,
  sponsors,
}: {
  tournament: Tournament
  events: TournamentEvent[]
  prizes: TournamentPrize[]
  isHost: boolean
  sponsors?: Sponsor[]
  registrations?: RegistrationResponse[]
}) {
  const { t } = useTournamentTranslation()
  const [activeTab, setActiveTab] = useState("dashboard")

  const isSm = useMediaQuery("(min-width: 640px)")
  const isMd = useMediaQuery("(min-width: 768px)")
  const isLg = useMediaQuery("(min-width: 1024px)")
  const isXl = useMediaQuery("(min-width: 1280px)")

  const isTabNativelyVisible = (tabValue: string) => {
    switch (tabValue) {
      case "dashboard":
      case "events":
        return true
      case "registrations":
        return isSm
      case "brackets":
        return isMd
      case "schedule":
        return isLg
      case "bookings":
        return isXl
      case "seeding":
        return isXl
      case "groups":
        return isXl
      default:
        return false
    }
  }

  // All possible tabs in order of their default slots in the tab bar
  const defaultTabs = [
    "dashboard",
    "events",
    "registrations",
    "seeding",
    "bookings",
    "groups",
    "brackets",
    "schedule",
  ]

  // Compute which of these are natively visible
  const nativeTabs = defaultTabs.filter((tab) => isTabNativelyVisible(tab))

  // The list of tabs to render in the tab bar (excluding the "More" dropdown button itself)
  const displayTabs = [...nativeTabs]

  // If the active tab is not one of the natively visible tabs,
  // we alter the last tab in the display tablist to be the active tab.
  const isActiveTabHidden = !isTabNativelyVisible(activeTab)

  if (isActiveTabHidden && displayTabs.length > 0) {
    displayTabs[displayTabs.length - 1] = activeTab
  }

  // All selectables that can be in the "More" dropdown
  const allSelectableTabs = [
    "registrations",
    "seeding",
    "bookings",
    "groups",
    "brackets",
    "schedule",
    "live",
    "financials",
    "payment",
    "sponsors",
    "personnel",
  ]

  // The dropdown tabs are the ones not currently displayed in the tablist
  const dropdownTabs = allSelectableTabs.filter(
    (tab) => !displayTabs.includes(tab)
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    if (tab) {
      const timer = setTimeout(() => {
        setActiveTab(tab)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div
      className={cn(
        "flex flex-1 flex-col bg-background",
        activeTab === "brackets" || activeTab === "schedule"
          ? "h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-hidden"
          : ""
      )}
    >
      <div className="border-b bg-white dark:border-zinc-900 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                {t("manager.title")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {t("manager.subtitle")}
              </p>
            </div>
          </div>
          <BackButton />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0"
      >
        <div className="border-y border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto w-full max-w-7xl px-6">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b-0 bg-transparent p-0">
              {displayTabs.map((tabValue) => {
                const metadata = tabMetadata[tabValue]
                if (!metadata) return null
                const Icon = metadata.icon
                return (
                  <TabsTrigger
                    key={tabValue}
                    value={tabValue}
                    className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none dark:text-zinc-400 dark:data-[state=active]:text-emerald-400"
                  >
                    <Icon className="h-4 w-4" />
                    {metadata.defaultValue
                      ? t(metadata.labelKey, {
                          defaultValue: metadata.defaultValue,
                        })
                      : t(metadata.labelKey)}
                  </TabsTrigger>
                )
              })}

              {dropdownTabs.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative flex cursor-pointer items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 hover:text-emerald-600 focus:outline-hidden dark:text-zinc-400 dark:hover:text-emerald-400">
                      <MoreHorizontal className="h-4 w-4" />
                      <span>
                        {t("manager.tabs.more", { defaultValue: "Thêm" })}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-50 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                    {dropdownTabs.map((tabValue) => {
                      const metadata = tabMetadata[tabValue]
                      if (!metadata) return null
                      const Icon = metadata.icon
                      return (
                        <DropdownMenuItem
                          key={tabValue}
                          onClick={() => setActiveTab(tabValue)}
                          className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
                        >
                          <Icon className="h-4 w-4" />
                          {metadata.defaultValue
                            ? t(metadata.labelKey, {
                                defaultValue: metadata.defaultValue,
                              })
                            : t(metadata.labelKey)}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TabsList>
          </div>
        </div>

        <div
          className={cn(
            "min-h-0 w-full flex-1",
            activeTab === "brackets" || activeTab === "schedule"
              ? "flex flex-col overflow-hidden"
              : "mx-auto max-w-7xl overflow-y-auto p-0"
          )}
        >
          <TabsContent
            value="dashboard"
            className="m-0 border-none p-0 outline-none"
          >
            <TournamentDashboard
              tournament={tournament}
              events={events}
              prizes={prizes}
              sponsors={sponsors}
              isHost={isHost}
            />
          </TabsContent>
          <TabsContent
            value="events"
            className="m-0 border-none p-0 outline-none"
          >
            <EventManagement
              tournament={tournament}
              events={events}
              prizes={prizes}
              isHost={isHost}
            />
          </TabsContent>
          <TabsContent
            value="registrations"
            className="m-0 border-none p-0 outline-none"
          >
            <RegistrationManagement
              tournamentId={tournament.id.toString()}
              events={events}
            />
          </TabsContent>

          <TabsContent
            value="seeding"
            className="m-0 border-none p-0 outline-none"
          >
            <Seeding
              tournamentId={tournament.id}
              tournamentStatus={tournament.status}
              events={events}
              isHost={isHost}
            />
          </TabsContent>
          <TabsContent
            value="brackets"
            className="m-0 flex flex-1 flex-col overflow-hidden border-none p-0 outline-none"
          >
            <BracketManagement
              tournamentId={tournament.id}
              events={events}
              isHost={isHost}
              tournamentStatus={tournament.status}
            />
          </TabsContent>
          <TabsContent
            value="schedule"
            className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden border-none p-0 outline-none"
          >
            <Scheduling
              tournamentId={tournament.id}
              events={events}
              tournament={tournament}
            />
          </TabsContent>
          <TabsContent
            value="bookings"
            className="m-0 border-none p-0 outline-none"
          >
            <BookingManagement
              tournamentId={tournament.id}
              tournamentStartDate={tournament.startDate}
              tournamentEndDate={tournament.endDate}
            />
          </TabsContent>
          <TabsContent
            value="groups"
            className="m-0 border-none p-0 outline-none"
          >
            <GroupManagement
              tournamentId={tournament.id}
              events={events}
              isHost={isHost}
            />
          </TabsContent>
          <TabsContent
            value="live"
            className="m-0 border-none p-0 outline-none"
          >
            <LiveControlCenter tournamentId={tournament.id} events={events} />
          </TabsContent>
          <TabsContent
            value="financials"
            className="m-0 border-none p-0 outline-none"
          >
            <FinancialDashboard tournamentId={tournament.id.toString()} />
          </TabsContent>
          <TabsContent
            value="payment"
            className="m-0 border-none p-0 outline-none"
          >
            <PaymentTab tournament={tournament} isHost={isHost} />
          </TabsContent>
          <TabsContent
            value="sponsors"
            className="m-0 border-none p-0 outline-none"
          >
            <Sponsors tournamentId={tournament.id.toString()} />
          </TabsContent>
          <TabsContent
            value="personnel"
            className="m-0 border-none p-0 outline-none"
          >
            <PersonnelManagement
              tournamentId={tournament.id.toString()}
              events={events}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
