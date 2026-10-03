import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function TabsDemo() {
  return (
    <>
      <div>
        <h2 className="font-medium">Tabs</h2>
        <p className="text-sm text-muted-foreground">
          Default and line variants with content panels.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Default</h3>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">
                Overview panel — brutal border and active offset.
              </p>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-sm text-muted-foreground">
                Settings panel content.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Line</h3>
          <Tabs defaultValue="telemetry">
            <TabsList variant="line">
              <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
              <TabsTrigger value="missions">Missions</TabsTrigger>
              <TabsTrigger value="fleet">Fleet</TabsTrigger>
            </TabsList>
            <TabsContent value="telemetry">
              <p className="text-sm text-muted-foreground">
                Line variant — underline indicator, no brutal chrome.
              </p>
            </TabsContent>
            <TabsContent value="missions">
              <p className="text-sm text-muted-foreground">Missions panel.</p>
            </TabsContent>
            <TabsContent value="fleet">
              <p className="text-sm text-muted-foreground">Fleet panel.</p>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </>
  )
}
