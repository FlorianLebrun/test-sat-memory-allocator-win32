
const minStrideWidth = 80

export class ProfileViewLink {
  view: ProfileView

  constructor(view: ProfileView) {
    this.view = view
    this.map(view)
  }
  map(view) {
    if (this.view) this.unmap()
    this.view = view
    view.map(this)
  }
  unmap() {
    this.view.unmap(this)
    this.view = null
  }
  update() {
    console.log("ProfileViewLink update")
  }
}

export class ProfileViewListener extends ProfileViewLink {
  callback: Function
  constructor(view: ProfileView, callback: Function) {
    super(view)
    this.callback = callback
  }
  update() {
    const { callback } = this
    callback && callback(this)
  }
}

export class ProfileViewClient extends ProfileViewLink {
  step: number
  precision: number
  format: Function

  offset: number
  scale: number
  size: number

  draw: Function

  constructor(view: ProfileView, draw: Function, size: number) {
    super(view)
    this.draw = draw
    this.size = size || 1
    this.offset = 0
    this.scale = this.size
  }
  at(value: number): number {
    return value * this.scale + this.offset
  }
  translate(deltaX) {
    let { view, scale } = this
    view.translate(deltaX / scale)
  }
  rescale(factor, pos) {
    let { view, offset, scale, size } = this
    const prev_scale = scale
    const prev_offset = offset
    const at = (prev_offset + pos) / prev_scale
    scale = factor * prev_scale
    offset = at * scale - at * prev_scale + prev_offset
    view.set(offset / scale, (offset + size) / scale)
  }
  resize(size) {
    this.size = size
    this.update()
  }
  update() {
    const { start, interval } = this.view

    // Update draw properties
    this.scale = this.size / interval
    this.offset = start * this.scale

    // Update value display properties
    const base = interval * minStrideWidth / this.size;
    const decade = Math.ceil(Math.log(base) / Math.LN10);
    const pixelsDensity = this.size / interval;
    let step = Math.pow(10, decade);
    if (step * pixelsDensity >= 5 * minStrideWidth) step /= 5;
    if (step * pixelsDensity >= 2 * minStrideWidth) step /= 2;
    this.step = step
    this.precision = Math.max(0, -Math.floor(Math.log(step * 1.01) / Math.LN10))

    // Redraw
    if (this.draw) this.draw()
    else console.warn("A scalar client should have a draw.")
  }
  format(value: number) {
    return value.toFixed(this.precision);
  }
}

export class ProfileView {
  start: number
  end: number
  min: number
  max: number
  interval: number
  clients: ProfileViewClient
  onChange: Function

  constructor(min: number = 0, max: number = 1) {
    this.start = min
    this.end = max
    this.min = min
    this.max = max
    this.interval = max - min
    this.clients = []
  }
  set(start: number, end: number) {
    this.start = Math.max(start, this.min)
    this.end = Math.min(end, this.max)
    this.interval = this.end - this.start
    this.onChange && this.onChange(this)
    for (const c of this.clients) {
      c.update()
    }
  }
  map(client: ProfileViewClient) {
    this.clients.push(client)
  }
  unmap(client: ProfileViewClient) {
    const index = this.clients.indexOf(client)
    if (index >= 0) this.clients.splice(index, 1)
  }
  clip(min: number, max: number) {
    this.min = min
    this.max = max
    this.set(this.start, this.end)
  }
  translate(delta) {
    const start_delta = Math.max(this.start + delta, this.min) - this.start
    const end_delta = Math.min(this.end + delta, this.max) - this.end
    if (start_delta * start_delta < end_delta * end_delta) delta = start_delta
    else delta = end_delta
    this.set(this.start + delta, this.end + delta)
  }
}
