import { Modules, UI } from "@application"
import React, { Component } from 'react'

class ConsoleSegment {
  style: string
  text: string

  constructor(style: string = "", text: string = "") {
    this.style = style
    this.text = text
  }
  writeRaw(bytes: string) {
    this.text += bytes
  }
}

class ConsoleLine {
  segments: Array<ConsoleSegment> = []

  get last() {
    const { segments } = this
    if (!segments.length) segments.push(new ConsoleSegment())
    return segments[segments.length - 1]
  }
  writeRaw(bytes: string) {
    const parts = bytes.split("\u001b")
    if (parts[0] !== "") {
      this.last.writeRaw(parts[0])
    }
    for (let i = 1; i < parts.length; i++) {
      const segment = parseSegmentStyle(parts[i])
      this.segments.push(segment)
    }
  }
}

export class ConsoleStream extends Modules.Listenable {
  lines: Array<ConsoleLine> = []
  name: string

  constructor(name: string = "") {
    super()
    this.name = name
  }
  get last() {
    const { lines } = this
    if (!lines.length) lines.push(new ConsoleLine())
    return lines[lines.length - 1]
  }
  writeRaw(bytes: string) {
    const parts = bytes.split("\n")
    if (parts[0] !== "") {
      this.last.writeRaw(parts[0])
    }
    for (let i = 1; i < parts.length; i++) {
      const line = new ConsoleLine()
      if (parts[i] !== "") line.writeRaw(parts[i])
      this.lines.push(line)
    }
    this.setState()
  }
}

export class ConsoleDisplay extends Component {
  props: Object
  styles: Object

  componentWillMount() {
    this.styles = Object.assign({}, defaultStyles, this.props.styles)
  }
  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    const { host } = this.refs
    host.scrollTop = host.scrollHeight - host.clientHeight
  }
  getStyle(name: string) {
    let style = this.styles[name]
    if (!style) {
      style = {}
      for (const key of name.split(";")) {
        style = Object.assign(style, this.styles[key])
      }
      this.styles[name] = style
    }
    return style
  }
  update = () => {
    this.forceUpdate()
  }
  render() {
    const { stream, style } = this.props
    return (<UI.Listener object={stream} onEvent={this.update} >
      <div ref="host" style={style}>
        <div style={this.styles.default}>
          {stream && stream.lines.map((line, i) => {
            return <div key={i}>
              {line.segments.map((seg, k) => {
                return <span key={k} style={this.getStyle(seg.style)}>{seg.text}</span>
              })}
            </div>
          })}
        </div>
      </div>
    </UI.Listener>)
  }
}

function parseSegmentStyle(part: string): ConsoleSegment {
  const match = part.match(/\[([0-9;]*)/)
  if (match) {
    const text = part.substring(match[0].length + 1)
    return new ConsoleSegment(match[1], text)
  }
  return new ConsoleSegment("", part)
}

const defaultStyles = {
  "default": {
    minHeight: "100%",
    backgroundColor: "rgb(15,20,30)",
    color: "rgb(200,200,200)",
    font: "15px consolas, sans-serif",
  },
  "30": { color: "black" },
  "31": { color: "red" },
  "32": { color: "green" },
  "33": { color: "yellow" },
  "34": { color: "blue" },
  "35": { color: "purple" },
  "36": { color: "cyan" },
  "37": { color: "white" },
  "90": { color: "black" },
  "91": { color: "red" },
  "92": { color: "green" },
  "93": { color: "yellow" },
  "94": { color: "blue" },
  "95": { color: "purple" },
  "96": { color: "cyan" },
  "97": { color: "white" },
  "40": { backgroundColor: "black" },
  "41": { backgroundColor: "red" },
  "42": { backgroundColor: "green" },
  "43": { backgroundColor: "yellow" },
  "44": { backgroundColor: "blue" },
  "45": { backgroundColor: "purple" },
  "46": { backgroundColor: "cyan" },
  "47": { backgroundColor: "white" },
}

