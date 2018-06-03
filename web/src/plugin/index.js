import Application from "@application"

import ProfilerWindow from "./ProfilerWindow"
import TerminalWindow from "./TerminalWindow"

class ProfilerInspector {
  baseUrl: string
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }
  fetchAPI(url, options) {
    return Application.fetchAPI(this.baseUrl + url, options)
  }
}

class SatMemoryPlugin extends Application.PluginInstance {
  inspector: ProfilerInspector
  pluginDidMount() {
    this.inspector = new ProfilerInspector("http://localhost:42000")
    this.openWindow("profiler")
    this.openWindow("terminal")
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
    "profiler": {
      defaultTitle: "Profiler",
      defaultIcon: "globe",
      defaultDockId: "center",
      component: ProfilerWindow,
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
