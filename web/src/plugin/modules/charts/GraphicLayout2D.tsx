import React from "react"

export default class GraphicLayout2D extends React.Component {
  props: any
  timeout: any = -1
  width: number = 0
  height: number = 0
  refs: { canvas: HTMLCanvasElement }

  componentDidMount() {
    this.update()
  }
  componentDidUpdate() {
    this.update()
  }
  shouldComponentUpdate(nextProps) {
    return this.props.style !== nextProps.style
      || this.props.className !== nextProps.className
  }
  forceUpdate = () => {
    const { canvas } = this.refs
    const { clientWidth, clientHeight } = canvas
    this.timeout = -1
    if (canvas && clientWidth && clientHeight) {
      const ratio = window.devicePixelRatio || 1
      let width, height, smooth
      if (ratio < 2) {
        smooth = true
        width = Math.round(clientWidth * ratio * 1.5)
        height = Math.round(clientHeight * ratio * 1.5)
      }
      else {
        smooth = false
        width = Math.round(clientWidth * ratio)
        height = Math.round(clientHeight * ratio)
      }
      if (this.width !== width || this.height !== height) {
        const { onResize } = this.props
        this.width = width
        this.height = height
        canvas.width = width
        canvas.height = height
        onResize && onResize(clientWidth, clientHeight)
      }
      else {
        const { onDraw } = this.props
        const gl = canvas.getContext('2d') as any
        gl.width = clientWidth
        gl.height = clientHeight
        gl.imageSmoothingEnabled = smooth
        gl.setTransform(width / clientWidth, 0, 0, height / clientHeight, 0, 0)
        onDraw && onDraw(gl)
      }
    }
  }
  update() {
    if (this.timeout < 0) {
      this.timeout = setTimeout(this.forceUpdate, 0)
    }
  }
  render() {
    const { onResize, onDraw, style, frame, ...others } = this.props
    return (<div style={{ ...style, position: "relative" }} {...others}>
      <canvas ref="canvas" style={layerStyle as any} />
    </div>)
  }
}

const layerStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  width: "100%",
  height: "100%",
}

const textWidthCache = {}
const maxTextMeasureCacheLength = 200

export function measureTextWidth(context, text) {
  const font = context.font

  if (text.length > maxTextMeasureCacheLength) {
    return context.measureText(text).width
  }

  let textWidths
  if (textWidthCache.hasOwnProperty(font) === false) {
    textWidthCache[font] = textWidths = new Map()
  } else {
    textWidths = textWidthCache[font]
  }

  let width = textWidths.get(text)
  if (width == null) {
    const length = text.length
    width = 0
    for (let i = 0; i < length; i++) {
      const char = text[i]
      let charWidth = textWidths.get(char)
      if (charWidth == null) {
        charWidth = context.measureText(char).width
        textWidths.set(char, charWidth)
      }
      width += charWidth
    }
    textWidths.set(text, width)
  }

  return width
}

function trimFunction(text, maxLength) {
  if (text.length <= maxLength) {
    return text
  }
  return text.substr(0, maxLength - 3) + '\u2026'
}

export function trimTextRight(context, text, maxWidth) {
  const maxLength = 200
  if (maxWidth <= 10) {
    return ''
  }
  if (text.length > maxLength) {
    text = trimFunction(text, maxLength)
  }

  const textWidth = measureTextWidth(context, text)
  if (textWidth <= maxWidth) {
    return text
  }

  let l = 0
  let r = text.length
  let lv = 0
  let rv = textWidth
  while (l < r && lv !== rv && lv !== maxWidth) {
    const m = Math.ceil(l + (r - l) * (maxWidth - lv) / (rv - lv))
    const mv = measureTextWidth(context, trimFunction(text, m))
    if (mv <= maxWidth) {
      l = m
      lv = mv
    } else {
      r = m - 1
      rv = mv
    }
  }

  text = trimFunction(text, l)
  return text !== '\u2026' ? text : ''
}

