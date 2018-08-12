import React from "react"
import Application from "@application"

class MemoryWindow extends Application.WindowComponent {
  props: Object

  componentWillMount() {
  }
  render() {
    return (<div>{"MemoryWindow"}</div>)
  }
}

export default MemoryWindow

