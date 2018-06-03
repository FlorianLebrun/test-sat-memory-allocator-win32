import React from "react"
import Application from "@application"
import { ConsoleDisplay } from '@modules/console-display'

type PropsType = {
  inspector: InspectorSession,
}

class TerminalWindow extends Application.WindowComponent<void, PropsType, void> {
  props: PropsType

  render() {
    const { inspector } = this.props
    return (<ConsoleDisplay stream={inspector.stdout} style={{
      height: "100%",
      width: "100%",
      overflow: "auto",
    }} />)
  }
}

export default TerminalWindow
