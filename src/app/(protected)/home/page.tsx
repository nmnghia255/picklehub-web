import { PageContainer } from "@/components/page-container"

export default function HomePage() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Home</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to PickleHub. This is the home page.
      </p>
    </PageContainer>
  )
}
