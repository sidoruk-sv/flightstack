import { ThemeProvider } from "@/components/theme-provider"
import { Playground } from "@/playground/Playground"

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Playground />
    </ThemeProvider>
  )
}

export default App
