import { CogIcon, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { getGroups } from "@/features/groups/api/groups-service"
import { AddGroupDrawer } from "@/features/groups/components/add-group-drawer"

export default async function GroupsPage() {
  const groups = await getGroups()

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nhóm</h1>
        <AddGroupDrawer />
      </div>

      {groups.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="text-lg">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span>{group.memberCount} thành viên</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CogIcon className="size-4" />
                  <span className="capitalize">{group.role}</span>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/groups/${group.id}`}>Truy cập</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
