import React from 'react'
import GraphicLayout2D from "../charts/GraphicLayout2D"
import { HtmlGrabReaction } from "../charts/event.utils"
import { ProfileView, ProfileViewClient } from '../ProfileView'
import { ScalarGridGrapher } from '../charts/chart-scalarGrid'
import chartStyles from "../charts/chart-styles"
import ProfileSampler, { SamplesBlock } from '../ProfileSampler'

export class SamplesGrapher {
  client: ProfileViewClient
  blocks: SamplesBlock[]
  label: string
  title: string
  style: any

  valueMax: number
  valueMin: number

  constructor(client: ProfileViewClient, label: string, title: string, style?: any) {
    this.client = client
    this.label = label
    this.title = title
    this.style = style || chartStyles.curveStyle
  }
  apply(blocks: SamplesBlock[]) {
    this.blocks = blocks
    if (Array.isArray(blocks)) {
      const range = { valueMin: 0, valueMax: 0 }
      for (const block of blocks) {
        block.getValueRange(this.label, range)
      }
      this.valueMin = range.valueMin
      this.valueMax = range.valueMax
    }
  }
  draw(gl, paddingTop, paddingBottom) {
    const { client, style } = this
    const { scale, offset, size } = client
    paddingTop = paddingTop || 5
    paddingBottom = paddingBottom || 5

    gl.font = style.textFont
    gl.textAlign = "left"
    gl.textBaseline = "top"
    gl.fillStyle = style.textColor
    gl.fillText(this.title, 0, paddingTop)

    let valueOffset
    const valueInterval = this.valueMax - this.valueMin
    if (valueInterval > 0) {
      const valueScale = -(gl.height - paddingTop - paddingBottom) / valueInterval
      valueOffset = -this.valueMax * valueScale + paddingTop

      gl.fillStyle = style.areaColor
      gl.strokeStyle = style.areaOutline
      gl.beginPath()
      if (Array.isArray(this.blocks)) {
        let pos = 0
        gl.moveTo(0, valueOffset)
        for (const block of this.blocks) {
          const times = block.samples.time
          const values = block.samples[this.label]
          if (values && times) {
            for (let i = 0; i < values.length; i++) {
              pos = times[i] * scale - offset
              gl.lineTo(pos, values[i] * valueScale + valueOffset)
            }
          }
        }
        gl.lineTo(pos, valueOffset)
      }
      gl.stroke()
      gl.closePath()
      gl.fill()
    }
    else {
      valueOffset = gl.height - paddingTop
    }

    gl.strokeStyle = style.axisColor
    gl.beginPath()
    gl.moveTo(0, valueOffset)
    gl.lineTo(size, valueOffset)
    gl.stroke()
  }
}

type PropsType = {
  label: string
  title: string
  view: ProfileView
  sampler: ProfileSampler
  style?: string
  className?: string
  options?: any
}

export default class ChartSamples extends React.Component {
  props: PropsType
  timeClient: ProfileViewClient
  chart: SamplesGrapher
  grid: ScalarGridGrapher
  refs: any

  componentWillMount() {
    const { title, label, view, options } = this.props
    this.timeClient = new ProfileViewClient(view || new ProfileView(0, 1), this.update)
    this.timeClient.format = function (value) {
      return value.toFixed(this.precision) + ' s'
    }
    this.chart = new SamplesGrapher(this.timeClient, label, title)
    this.grid = new ScalarGridGrapher(this.timeClient, options)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.sampler !== nextProps.sampler) {
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
  handleMouseDown = (e) => {
    new HtmlGrabReaction(e.currentTarget, e, this.handleOffset)
  }
  resize = (w, h) => {
    const { timeClient } = this
    timeClient.resize(w)
  }
  update = () => {
    const { view, sampler } = this.props
    sampler.getRangeSamples(view.start, view.end, 512).then((samples) => {
      const { canvas } = this.refs
      this.chart.apply(samples)
      canvas && canvas.update()
    })
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
