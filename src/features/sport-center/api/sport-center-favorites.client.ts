type FavoriteResponse = {
  message?: string
}

async function requestFavoriteChange(
  input: string,
  init: RequestInit
): Promise<void> {
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "same-origin",
  })

  const payload = (await response.json().catch(() => ({}))) as FavoriteResponse

  if (!response.ok) {
    throw new Error(payload.message || "Could not update favorite status.")
  }
}

export async function addFavoriteSportCenter(centerId: string): Promise<void> {
  await requestFavoriteChange("/api/proxy/sport-centers/favourites", {
    method: "POST",
    body: JSON.stringify({ centerId }),
  })
}

export async function removeFavoriteSportCenter(
  centerId: string
): Promise<void> {
  await requestFavoriteChange(
    `/api/proxy/sport-centers/favourites/${centerId}`,
    {
      method: "DELETE",
    }
  )
}
