import React, { Component } from 'react'
import GraphicLayout2D, { trimTextRight } from "./GraphicLayout2D"
import { HtmlGrabReaction } from "./event.utils"
import { ProfileView, ProfileViewClient } from '../../ProfileView'
import { ScalarIntervalGrapher } from './chart-scalarInterval'
import chartStyles from "./chart-styles"

class NestedFlameGrapher {
  client: ProfileViewClient
  style: Object
  data: Array<Object>

  constructor(client: ProfileViewClient, data: Array<Object>, style: Object) {
    this.client = client
    this.style = style || chartStyles.flameStyle
    this.apply(data)
  }
  apply(data) {
    this.data = data || { subs: [] }
  }
  drawNodes(gl, subs, posX, level) {
    const { style, client } = this
    const y = (level * style.height)
    const h = style.height
    subs.sort((a, b) => b.time - a.time)
    for (let node of subs) {
      let width = node.time * client.scale
      let left = posX, right = posX + width
      if (left < client.size && right > 0) {

        // Displace rect into drawzone
        const leftOverflow = left < 0
        if (leftOverflow) {
          width += left
          left = 0
        }
        const rightOverflow = right > client.size
        if (rightOverflow) {
          width += client.size - right
          right = client.size
        }

        // Draw node
        if (y + h >= 0) {
          gl.fillStyle = style.backgroundColor
          gl.fillRect(left, y, width, h)
          if (width > 3) {
            gl.strokeRect(left, y, width, h)

            const text = trimTextRight(gl, node.name, width - style.textPadding * 2)
            if (text) {
              gl.fillStyle = style.textColor
              gl.fillText(text, left + style.textPadding, y + style.textBaseline)
            }

            if (leftOverflow || rightOverflow) {
              gl.fillStyle = "rgb(200,100,100)"
              leftOverflow && gl.fillRect(left + 1, y, 2, h)
              rightOverflow && gl.fillRect(right - 3, y, 2, h)
            }
          }
        }

        // Draw sub nodes
        if (width > 0.5 && y < gl.height) {
          node.subs && this.drawNodes(gl, node.subs, posX, level + 1)
        }
      }
      posX = right
    }
  }
  draw(gl: CanvasRenderingContext2D) {
    const data = this.data
    const client = this.client
    const style = this.style
    gl.font = style.textFont
    gl.textBaseline = "middle"
    gl.strokeStyle = style.borderColor
    gl.beginPath()
    data.subs && this.drawNodes(gl, data.subs, -client.offset, 0)
    gl.stroke()
  }
}

export class NestedFlameChart extends Component {
  props: Object
  rateClient: ProfileViewClient
  chart: NestedFlameGrapher
  grid: ScalarGridGrapher

  componentWillMount() {
    this.rateClient = new ProfileViewClient(new ProfileView(0, 1), this.update)
    this.rateClient.format = function (value) {
      return (value * 100).toFixed(Math.max(0, this.precision - 2)) + ' %';
    }
    this.chart = new NestedFlameGrapher(this.rateClient, this.props.histogram)
    this.grid = new ScalarIntervalGrapher(this.rateClient)
  }
  componentWillReceiveProps(nextProps) {
    const { histogram } = nextProps
    if (this.props.histogram !== histogram) {
      this.chart.apply(histogram)
      this.update()
    }
  }
  componentWillUnmount() {
    this.rateClient.unmap()
  }
  handleMouseDown = (e: SyntheticEvent) => {
    new HtmlGrabReaction(e.currentTarget, e, this.handleOffset)
  }
  handleOffset = (e: HtmlGrabReaction) => {
    const { rateClient } = this
    rateClient.translate(-e.deltaX)
  }
  handleScale = (e) => {
    const { rateClient } = this
    const rc = e.target.getBoundingClientRect()
    rateClient.rescale((e.deltaY < 0) ? 1.2 : 0.8, e.clientX - rc.left)
    e.preventDefault()
    e.stopPropagation()
  }
  resize = (w, h) => {
    const { rateClient } = this
    rateClient.resize(w)
  }
  update = () => {
    const { canvas } = this.refs
    canvas && canvas.update()
  }
  draw = (gl) => {
    const { chart, grid } = this
    gl.clearRect(0, 0, gl.width, gl.height)
    gl.translate(0, 20)
    chart.draw(gl)
    gl.translate(0, -20)
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
