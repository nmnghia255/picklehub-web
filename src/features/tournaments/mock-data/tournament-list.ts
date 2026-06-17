import type { Tournament } from "../types/tournament"
export const tournaments: Tournament[] = [
  {
    id: 1,
    name: "San Diego Summer Slam 2026",
    venue: "Balboa Park Tennis & Pickleball Center",
    startDate: "June 15, 2026",
    endDate: "June 17, 2026",
    registered: 156,
    capacity: 200,
    status: "in_progress" as const,
    banner:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  },
  {
    id: 2,
    name: "Pacific Coast Open",
    venue: "La Jolla Recreation Center",
    startDate: "July 1, 2026",
    endDate: "July 3, 2026",
    registered: 89,
    capacity: 150,
    status: "open_registration" as const,
    banner:
      "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&q=80",
  },
  {
    id: 3,
    name: "SoCal Championship Series",
    venue: "Mission Valley Sports Complex",
    startDate: "August 12, 2026",
    endDate: "August 14, 2026",
    registered: 45,
    capacity: 180,
    status: "published" as const,
    banner:
      "https://images.unsplash.com/photo-1610438235354-a6ae5528385c?w=800&q=80",
  },
  {
    id: 4,
    name: "West Coast Masters",
    venue: "Del Mar Community Center",
    startDate: "September 5, 2026",
    endDate: "September 7, 2026",
    registered: 12,
    capacity: 120,
    status: "draft" as const,
    banner:
      "https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=800&q=80",
  },
  {
    id: 5,
    name: "Spring Invitational 2026",
    venue: "Carlsbad Pickleball Courts",
    startDate: "May 20, 2026",
    endDate: "May 22, 2026",
    registered: 200,
    capacity: 200,
    status: "completed" as const,
    banner:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  },
  {
    id: 6,
    name: "Memorial Day Classic",
    venue: "Point Loma Sports Park",
    startDate: "May 25, 2026",
    endDate: "May 27, 2026",
    registered: 175,
    capacity: 175,
    status: "completed" as const,
    banner:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  },
]
