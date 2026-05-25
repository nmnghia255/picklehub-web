// Mock data for sport centers

import type { SportCenter } from "../types/sport-center"

export const SPORT_CENTERS: SportCenter[] = [
  {
    id: 1,
    name: "Pickle Dome Sukhumvit",
    address: "42 Sukhumvit 49, Watthana, Bangkok",
    region: "Bangkok",
    isFavorite: false,
    distanceKm: 3.2,
    openTime: "06:00 - 23:00",
    playTimeTags: ["morning", "afternoon", "evening", "night"],
    imageUrl:
      "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1200&q=80",
    logoUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    name: "Rally Court Riverside",
    address: "88 Charoen Nakhon Rd, Khlong San, Bangkok",
    region: "Bangkok",
    isFavorite: false,
    distanceKm: 7.8,
    openTime: "07:00 - 22:00",
    playTimeTags: ["morning", "afternoon", "evening"],
    imageUrl:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    logoUrl:
      "https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 3,
    name: "Ace Pickle North Park",
    address: "15 Chang Phueak, Mueang Chiang Mai",
    region: "Chiang Mai",
    isFavorite: true,
    distanceKm: 12.1,
    openTime: "08:00 - 21:30",
    playTimeTags: ["afternoon", "evening"],
    imageUrl:
      "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1200&q=80",
    logoUrl:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 4,
    name: "Baseline Pickle Club",
    address: "201 Rattana Beth, Mueang Nonthaburi",
    region: "Nonthaburi",
    isFavorite: true,
    distanceKm: 18.4,
    openTime: "06:30 - 23:30",
    playTimeTags: ["morning", "afternoon", "evening", "night"],
    imageUrl:
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80",
    logoUrl:
      "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 5,
    name: "Smash Point Pattaya",
    address: "120 Pattaya Sai 2 Rd, Chon Buri",
    region: "Chon Buri",
    isFavorite: true,
    distanceKm: 24.7,
    openTime: "09:00 - 21:00",
    playTimeTags: ["afternoon", "evening"],
    imageUrl:
      "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1200&q=80",
    logoUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=200&q=80",
  },
]
