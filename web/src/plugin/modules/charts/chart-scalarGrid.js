import chartStyles from "./chart-styles"

export class ScalarGridGrapher {
  client: ProfileViewClient
  showHead: boolean
  style: Object

  constructor(client: ProfileViewClient, options: Object) {
    this.client = client
    this.showHead = (options && options.showHead) || false
    this.style = (options && options.style) || chartStyles.gridStyle
  }
  draw(gl: CanvasRenderingContext2D) {
    const { style, client } = this
    const { start, end } = client.view
    const { step } = client
    const t0 = Math.round(start / step) * step

    if (this.showHead) {
      gl.fillStyle = style.headColor
      gl.fillRect(0, 0, gl.width, style.headHeight)

      gl.font = style.headTextFont
      gl.textAlign = "left"
      gl.textBaseline = "middle"
      gl.fillStyle = style.headTextColor
      for (let t = t0; t < end; t += step) {
        const x = (t * client.scale - client.offset + style.headTextPadding)
        gl.fillText(client.format(t), x, style.headTextBaseline)
      }
    }

    gl.strokeWidth = 1
    gl.strokeStyle = style.gridColor
    gl.beginPath()
    for (let t = t0; t < end; t += step) {
      const x = (t * client.scale - client.offset)
      gl.moveTo(x, 0)
      gl.lineTo(x, gl.height)
    }
    gl.stroke()
  }
}
