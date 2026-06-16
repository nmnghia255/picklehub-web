"use client"

import {
  Activity,
  Calendar,
  CalendarClock,
  DollarSign,
  Eye,
  GitBranch,
  Heart,
  LayoutDashboard,
  ListOrdered,
  Trophy,
  Users,
  UsersRound,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BracketManagement } from "@/features/tournament/components/bracket-management"
import { EventManagement } from "@/features/tournament/components/event-management"
import { FinancialDashboard } from "@/features/tournament/components/financial-dashboard"
import { LiveControlCenter } from "@/features/tournament/components/live-control-center"
import { PlayerTournament } from "@/features/tournament/components/player-tournament"
import { RegistrationManagement } from "@/features/tournament/components/registration-management"
import { Scheduling } from "@/features/tournament/components/scheduling"
import { Seeding } from "@/features/tournament/components/seeding"
import { Sponsors } from "@/features/tournament/components/sponsor"
import { TeamMatching } from "@/features/tournament/components/team-matching"
import { TournamentDashboard } from "@/features/tournament/components/tournament-dashboard"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function TournamentManager() {
  const { t } = useTournamentTranslation()
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50/50">
      <div className="bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Trophy className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {t("manager.title")}
              </h1>
              <p className="text-sm text-gray-500">{t("manager.subtitle")}</p>
            </div>
          </div>
          <Link
            href="/tournament"
            className="text-sm font-medium text-gray-600 hover:text-emerald-600"
          >
            {t("manager.allTournaments")}
          </Link>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <div className="border-y border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-6">
            <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b-0 bg-transparent p-0">
              <TabsTrigger
                value="dashboard"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("manager.tabs.dashboard")}
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <Calendar className="h-4 w-4" />
                {t("manager.tabs.events")}
              </TabsTrigger>
              <TabsTrigger
                value="registrations"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <Users className="h-4 w-4" />
                {t("manager.tabs.registrations")}
              </TabsTrigger>
              <TabsTrigger
                value="team-matching"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <UsersRound className="h-4 w-4" />
                {t("manager.tabs.teamMatching")}
              </TabsTrigger>
              <TabsTrigger
                value="seeding"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <ListOrdered className="h-4 w-4" />
                {t("manager.tabs.seeding")}
              </TabsTrigger>
              <TabsTrigger
                value="brackets"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <GitBranch className="h-4 w-4" />
                {t("manager.tabs.brackets")}
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <CalendarClock className="h-4 w-4" />
                {t("manager.tabs.schedule")}
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <Activity className="h-4 w-4" />
                {t("manager.tabs.live")}
              </TabsTrigger>
              <TabsTrigger
                value="financials"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <DollarSign className="h-4 w-4" />
                {t("manager.tabs.financials")}
              </TabsTrigger>
              <TabsTrigger
                value="sponsors"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <Heart className="h-4 w-4" />
                {t("manager.tabs.sponsors")}
              </TabsTrigger>
              <TabsTrigger
                value="public"
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
              >
                <Eye className="h-4 w-4" />
                {t("manager.tabs.public")}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
          <TabsContent
            value="dashboard"
            className="m-0 border-none p-0 outline-none"
          >
            <TournamentDashboard />
          </TabsContent>
          <TabsContent
            value="events"
            className="m-0 border-none p-0 outline-none"
          >
            <EventManagement />
          </TabsContent>
          <TabsContent
            value="registrations"
            className="m-0 border-none p-0 outline-none"
          >
            <RegistrationManagement />
          </TabsContent>
          <TabsContent
            value="team-matching"
            className="m-0 border-none p-0 outline-none"
          >
            <TeamMatching />
          </TabsContent>
          <TabsContent
            value="seeding"
            className="m-0 border-none p-0 outline-none"
          >
            <Seeding />
          </TabsContent>
          <TabsContent
            value="brackets"
            className="m-0 border-none p-0 outline-none"
          >
            <BracketManagement />
          </TabsContent>
          <TabsContent
            value="schedule"
            className="m-0 border-none p-0 outline-none"
          >
            <Scheduling />
          </TabsContent>
          <TabsContent
            value="live"
            className="m-0 border-none p-0 outline-none"
          >
            <LiveControlCenter />
          </TabsContent>
          <TabsContent
            value="financials"
            className="m-0 border-none p-0 outline-none"
          >
            <FinancialDashboard />
          </TabsContent>
          <TabsContent
            value="sponsors"
            className="m-0 border-none p-0 outline-none"
          >
            <Sponsors />
          </TabsContent>
          <TabsContent
            value="public"
            className="m-0 border-none p-0 outline-none"
          >
            <PlayerTournament />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
