import Application from "@application"

import ProfilerWindow from "./ProfilerWindow"
import MonitorWindow from "./MonitorWindow"
import MemoryWindow from "./MemoryWindow"
import StatsWindow from "./StatsWindow"
import TerminalWindow from "./TerminalWindow"

class ProfilerInspector {
  baseUrl: string
  eventSoure: EventSource
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.eventSoure = new EventSource(baseUrl + "/.events")
  }
  fetchAPI(url, options) {
    return Application.fetchAPI(this.baseUrl + url, options)
  }
  fetchData(value: Object): Promise<Object> {
    return this.fetchAPI("/inspector/sat/memory/data", { body: value })
  }
}

class SatMemoryPlugin extends Application.PluginInstance {
  inspector: ProfilerInspector
  pluginDidMount() {
    this.inspector = new ProfilerInspector("http://localhost:9944/admin")
    //this.openWindow("memory")
    this.openWindow("monitor")
    this.openWindow("stats")
    //this.openWindow("terminal")
  }
  log = () => {
    console.log.apply(console, arguments)
  }
}

Application.installPlugin({
  name: "dev-console",
  title: "Dev Console",
  component: SatMemoryPlugin,
  windows: {
    "stats": {
      defaultTitle: "Stats",
      defaultIcon: "stats",
      defaultDockId: "left",
      component: StatsWindow,
      parameters: {
        "inspector": true,
      }
    },
    "profiler": {
      defaultTitle: "Profiler",
      defaultIcon: "globe",
      defaultDockId: "center",
      component: ProfilerWindow,
      parameters: {
        "inspector": true,
      }
    },
    "monitor": {
      defaultTitle: "Monitor",
      defaultIcon: "monitor",
      defaultDockId: "center",
      component: MonitorWindow,
      parameters: {
        "inspector": true,
      }
    },
    "memory": {
      defaultTitle: "Memory",
      defaultIcon: "globe",
      defaultDockId: "center",
      component: MemoryWindow,
      parameters: {
        "inspector": true,
      }
    },
    "terminal": {
      defaultTitle: "Terminal",
      defaultIcon: "terminal",
      defaultDockId: "bottom",
      component: TerminalWindow,
      parameters: {
        "inspector": true,
      }
    },
  },
})
