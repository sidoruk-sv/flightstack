import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./tabs"

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    return (
      <Tabs defaultValue="overview" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-sm text-muted-foreground">
            Overview panel with neo-brutal active state.
          </p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="text-sm text-muted-foreground">Settings panel content.</p>
        </TabsContent>
      </Tabs>
    )
  },
}

export const Line: Story = {
  render: () => {
    return (
      <Tabs defaultValue="telemetry" className="w-full max-w-md">
        <TabsList variant="line">
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>
        <TabsContent value="telemetry">
          <p className="text-sm text-muted-foreground">
            Line variant with underline indicator.
          </p>
        </TabsContent>
        <TabsContent value="missions">
          <p className="text-sm text-muted-foreground">Missions panel.</p>
        </TabsContent>
        <TabsContent value="fleet">
          <p className="text-sm text-muted-foreground">Fleet panel.</p>
        </TabsContent>
      </Tabs>
    )
  },
}

export const Vertical: Story = {
  render: () => {
    return (
      <Tabs
        defaultValue="overview"
        orientation="vertical"
        className="w-full max-w-md"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-sm text-muted-foreground">Vertical tab layout.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="text-sm text-muted-foreground">Settings panel content.</p>
        </TabsContent>
      </Tabs>
    )
  },
}
