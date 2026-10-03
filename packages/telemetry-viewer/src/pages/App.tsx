import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from 'ui-kit/tabs'
import { ThemeProvider } from 'ui-kit/theme-provider'
import { CesiumMap } from '../components/CesiumMap'
import { LeafletMap } from '../components/LeafletMap'
import { MapLibreMap } from '../components/MapLibreMap'
import { MapTabPanel } from '../components/MapTabPanel'

const MAP_TABS = [
  { id: 'leaflet', label: 'Leaflet' },
  { id: 'maplibre', label: 'MapLibre GL' },
  { id: 'cesium', label: 'CesiumJS' },
] as const

type MapTabId = (typeof MAP_TABS)[number]['id']

const DEFAULT_TAB: MapTabId = 'leaflet'

function App() {
  const [activeTab, setActiveTab] = useState<MapTabId>(DEFAULT_TAB)
  const [mountedTabs, setMountedTabs] = useState<Set<MapTabId>>(
    () => new Set([DEFAULT_TAB]),
  )

  function handleTabChange(value: string | number | null) {
    if (value === null) {
      return
    }

    const tab = String(value) as MapTabId
    setActiveTab(tab)
    setMountedTabs((current) => {
      if (current.has(tab)) {
        return current
      }

      const next = new Set(current)
      next.add(tab)
      return next
    })
  }

  return (
    <ThemeProvider defaultTheme="system" uiStyle="neo-brutalism">
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <header className="border-b-2 border-border bg-card px-4 py-3 shadow-[var(--brutal-shadow-sm)]">
          <h1 className="text-lg font-semibold tracking-tight">Telemetry Viewer</h1>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b-2 border-border bg-card px-4 py-3">
            <TabsList>
              {MAP_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative min-h-0 flex-1">
            {mountedTabs.has('leaflet') && (
              <MapTabPanel active={activeTab === 'leaflet'}>
                <LeafletMap />
              </MapTabPanel>
            )}

            {mountedTabs.has('maplibre') && (
              <MapTabPanel active={activeTab === 'maplibre'}>
                <MapLibreMap />
              </MapTabPanel>
            )}

            {mountedTabs.has('cesium') && (
              <MapTabPanel active={activeTab === 'cesium'}>
                <CesiumMap />
              </MapTabPanel>
            )}
          </div>
        </Tabs>
      </div>
    </ThemeProvider>
  )
}

export default App
