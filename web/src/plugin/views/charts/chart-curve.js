import React, { Component } from 'react'
import GraphicLayout2D from "./GraphicLayout2D"
import { HtmlGrabReaction } from "./event.utils"
import { ProfileView, ProfileViewClient } from '../../ProfileView'
import { ScalarGridGrapher } from './chart-scalarGrid'
import chartStyles from "./chart-styles"

class CurveGrapher {
  client: ProfileViewClient
  data: Array<Object>
  label: string
  style: Object

  startIndex: number
  endIndex: number

  valueMax: number
  valueMin: number

  constructor(client: ProfileViewClient, label: string, data: Array<Object>, style: Object) {
    this.client = client
    this.label = label
    this.style = style || chartStyles.curveStyle
    this.apply(data)
  }
  apply(data) {
    this.data = data

    const times = [], values = []
    if (data && Array.isArray(data.times) && Array.isArray(data.values)) {
      const dataTimes = data.times
      const dataValues = data.values
      const step = 0.001

      let time = dataTimes[0], value = 0, i = 0
      this.valueMin = this.valueMax = value
      while (i < dataValues.length) {
        let count = 0, acc = 0
        while (i < dataValues.length && dataTimes[i] < time) {
          acc += dataValues[i++]
          count++
        }
        value = (count > 0) ? (acc / count) : value
        time += step

        this.valueMin = Math.min(this.valueMin, value)
        this.valueMax = Math.max(this.valueMax, value)
        times.push(time)
        values.push(value)
      }
    }
    this.values = values
    this.times = times
    this.startIndex = 0
    this.endIndex = times.length - 1
  }
  draw(gl, paddingTop, paddingBottom) {
    const { client, style, startIndex, endIndex, values, times } = this
    const { scale, offset, size } = client
    paddingTop = paddingTop || 5
    paddingBottom = paddingBottom || 5

    const valueInterval = this.valueMax - this.valueMin
    if (startIndex < endIndex && valueInterval > 0) {
      const valueScale = -(gl.height - paddingTop - paddingBottom) / valueInterval
      const valueOffset = -this.valueMax * valueScale + paddingTop
      let pos = times[0] * scale - offset

      gl.font = style.textFont
      gl.textAlign = "left"
      gl.textBaseline = "top"
      gl.fillStyle = style.textColor
      gl.fillText(this.label, 0, paddingTop)

      gl.fillStyle = style.areaColor
      gl.strokeStyle = style.areaOutline
      gl.beginPath()
      gl.moveTo(pos, valueOffset)
      for (let i = startIndex; i <= endIndex; i++) {
        pos = times[i] * scale - offset
        gl.lineTo(pos, values[i] * valueScale + valueOffset)
      }
      gl.lineTo(pos, valueOffset)
      gl.stroke()
      gl.closePath()
      gl.fill()

      gl.strokeStyle = style.axisColor
      gl.beginPath()
      gl.moveTo(0, valueOffset)
      gl.lineTo(size, valueOffset)
      gl.stroke();
    }
  }
}

type PropsType = {
  label: string,
  view: ProfileView,
  times: Array<number>,
  values: Array<number>,
  style: string,
  className: string,
}

class ChartCurve extends Component<void, PropsType, void> {
  props: PropsType
  timeClient: ProfileViewClient
  chart: CurveGrapher
  grid: ScalarGridGrapher

  componentWillMount() {
    const { label, view, times, values, options } = this.props
    this.timeClient = new ProfileViewClient(view || new ProfileView(0, 1), this.update)
    this.timeClient.format = function (value) {
      return value.toFixed(this.precision) + ' s';
    }
    this.chart = new CurveGrapher(this.timeClient, label, { times, values })
    this.grid = new ScalarGridGrapher(this.timeClient, options)
  }
  componentWillReceiveProps(nextProps) {
    const { times, values } = nextProps
    if (this.props.times !== times && this.props.values !== values) {
      this.chart.apply({ times, values })
      this.update()
    }
  }
  componentWillUnmount() {
    this.timeClient.unmap()
  }
  handleOffset = (e: HtmlGrabReaction) => {
    const { timeClient } = this
    timeClient.translate(-e.deltaX)
  }
  handleScale = (e) => {
    const { timeClient } = this
    const rc = e.target.getBoundingClientRect()
    timeClient.rescale((e.deltaY < 0) ? 1.2 : 0.8, e.clientX - rc.left)
    e.preventDefault()
    e.stopPropagation()
  }
  handleMouseDown = (e: SyntheticEvent) => {
    new HtmlGrabReaction(e.currentTarget, e, this.handleOffset)
  }
  resize = (w, h) => {
    const { timeClient } = this
    timeClient.resize(w)
  }
  update = () => {
    const { canvas } = this.refs
    canvas && canvas.update()
  }
  draw = (gl) => {
    const { chart, grid } = this
    const { options } = this.props
    const paddingTop = (options && options.showHead) ? 25 : 5
    gl.clearRect(0, 0, gl.width, gl.height)
    chart.draw(gl, paddingTop, 0)
    grid.draw(gl)
  }
  render() {
    const { className, style } = this.props
    return (<GraphicLayout2D
      ref="canvas"
      className={className}
      style={style}
      onWheel={this.handleScale}
      onMouseDown={this.handleMouseDown}
      onResize={this.resize}
      onDraw={this.draw}
    />)
  }
}

export default ChartCurve