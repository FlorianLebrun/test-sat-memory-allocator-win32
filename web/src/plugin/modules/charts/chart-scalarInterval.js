import chartStyles from "./chart-styles"

export class ScalarIntervalGrapher {
  client: ProfileViewClient
  style: Object
  suffix: string

  constructor(client: ProfileViewClient, suffix: string, style: Object) {
    this.client = client
    this.suffix = suffix
    this.style = style || chartStyles.intervalStyle
  }
  draw(gl: CanvasRenderingContext2D) {
    const { style, client } = this
    const { interval } = client.view

    gl.fillStyle = "#fff"
    gl.fillRect(0, 0, gl.width, style.headHeight)

    gl.font = style.headTextFont
    gl.textAlign = "left"
    gl.textBaseline = "middle"
    gl.strokeStyle = style.headTextColor
    gl.fillStyle = style.headTextColor
    gl.strokeWidth = 1

    const middle = style.headHeight - 2
    drawArrow(gl, 0, middle, client.size - 2, middle, true, true)

    const headText = client.format(interval)
    gl.fillText(headText, client.size / 2, style.headTextBaseline)
  }
}

function drawArrow(gl, fromX, fromY, toX, toY, forward, backward) {
  let dirX = toX - fromX, dirY = toY - fromY
  const dirNorm = Math.sqrt(dirX * dirX + dirY * dirY) * 0.15
  dirX /= dirNorm
  dirY /= dirNorm

  const crossX = dirY * 0.5
  const crossY = -dirX * 0.5

  gl.beginPath()
  gl.moveTo(fromX, fromY)
  gl.lineTo(toX, toY)
  gl.stroke()

  // Forward arrow
  if (forward) {
    gl.moveTo(toX + crossX - dirX, toY + crossY - dirY)
    gl.lineTo(toX, toY)
    gl.lineTo(toX - crossX - dirX, toY - crossY - dirY)
  }

  // Backward arrow
  if (backward) {
    gl.moveTo(fromX + crossX + dirX, fromY + crossY + dirY)
    gl.lineTo(fromX, fromY)
    gl.lineTo(fromX - crossX + dirX, fromY - crossY + dirY)
  }

  gl.fill()

}