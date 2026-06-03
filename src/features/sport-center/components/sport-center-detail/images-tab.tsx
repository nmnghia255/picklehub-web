import { Card, CardContent } from "@/components/ui/card"

interface ImagesTabProps {
  images: string[]
}

export function ImagesTab({ images }: ImagesTabProps) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Hình ảnh</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Sport center image ${index + 1}`}
              className="h-44 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
