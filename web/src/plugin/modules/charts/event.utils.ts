export type Rect = {
  bottom: number
  left: number
  right: number
  top: number
}

export function stopEvent(e) {
  if (e.stopPropagation) e.stopPropagation()
  if (e.preventDefault) e.preventDefault()
  return false
}

export function stopPropagation(e) {
  if (e.stopPropagation) e.stopPropagation()
  return false
}

export class HtmlScrollingReaction {
  element: HTMLElement
  mouseX: number
  mouseY: number
  scrollX: number
  scrollY: number
  onMouseScroll: Function

  constructor(element: HTMLElement, event, onMouseScroll: Function) {
    stopEvent(event)
    this.element = element
    this.mouseX = event.screenX
    this.mouseY = event.screenY
    this.scrollX = element.scrollLeft
    this.scrollY = element.scrollTop
    this.onMouseScroll = onMouseScroll
    setCurrentGrabReaction(this)
  }
  scroll() {
    this.element.scrollLeft = this.scrollX
    this.element.scrollTop = this.scrollY
  }
  handleMouseMove(event) {
    stopEvent(event)
    this.scrollX += this.mouseX - event.screenX
    this.scrollY += this.mouseY - event.screenY
    this.mouseX = event.screenX
    this.mouseY = event.screenY
    if (this.onMouseScroll) this.onMouseScroll(this)
    else this.scroll()
  }
  handleCompleted() {
    removeCurrentGrabReaction(this)
  }
}

export class HtmlGrabReaction {
  element: HTMLElement
  mouseX: number
  mouseY: number
  fromX: number
  fromY: number
  deltaX: number
  deltaY: number
  left: number
  top: number
  onMouseGrab: Function
  onMouseRelease: Function

  constructor(element: HTMLElement, event: MouseEvent, onMouseGrab: Function, onMouseRelease?: Function) {
    this.element = element
    this.mouseX = this.fromX = event.clientX
    this.mouseY = this.fromY = event.clientY
    this.left = element.offsetLeft
    this.top = element.offsetTop
    this.onMouseGrab = onMouseGrab
    this.onMouseRelease = onMouseRelease
    setCurrentGrabReaction(this)
  }
  move() {
    this.element.style.left = this.left + "px"
    this.element.style.top = this.top + "px"
  }
  selection(): Rect {
    const r = this.element.getBoundingClientRect()
    return {
      left: (this.fromX < this.mouseX ? this.fromX : this.mouseX) - r.left,
      right: (this.fromX > this.mouseX ? this.fromX : this.mouseX) - r.left,
      top: (this.fromY < this.mouseY ? this.fromY : this.mouseY) - r.top,
      bottom: (this.fromY > this.mouseY ? this.fromY : this.mouseY) - r.top,
    }
  }
  handleMouseMove(event) {
    stopEvent(event)
    this.deltaX = event.clientX - this.mouseX
    this.deltaY = event.clientY - this.mouseY
    this.left += this.deltaX
    this.top += this.deltaY
    this.mouseX = event.clientX
    this.mouseY = event.clientY
    if (this.onMouseGrab) this.onMouseGrab(this)
    else this.move()
  }
  handleCompleted() {
    if (this.onMouseRelease) this.onMouseRelease(this)
    removeCurrentGrabReaction(this)
  }
}

export class SVGGrabReaction {
  element: any
  mouseX: number
  mouseY: number
  x: number
  y: number
  onMouseGrab: Function

  constructor(element: HTMLElement, event: MouseEvent, onMouseGrab: Function) {
    stopEvent(event)
    this.element = element
    this.mouseX = event.screenX
    this.mouseY = event.screenY
    this.x = this.element.x()
    this.y = this.element.y()
    this.onMouseGrab = onMouseGrab
    setCurrentGrabReaction(this)
  }
  move() {
    this.element.x(this.x)
    this.element.y(this.y)
  }
  handleMouseMove(event) {
    stopEvent(event)
    this.x += event.screenX - this.mouseX
    this.y += event.screenY - this.mouseY
    this.mouseX = event.screenX
    this.mouseY = event.screenY
    if (this.onMouseGrab) this.onMouseGrab(this)
    else this.move()
  }
  handleCompleted() {
    removeCurrentGrabReaction(this)
  }
}

let grabReaction = null
function setCurrentGrabReaction(reaction) {
  grabReaction && grabReaction.handleCompleted()
  grabReaction = reaction
}
function removeCurrentGrabReaction(reaction) {
  if (grabReaction === reaction) grabReaction = null
}
window.addEventListener("mousemove", function (e) {
  grabReaction && grabReaction.handleMouseMove(e)
})
window.addEventListener("mouseup", function () {
  grabReaction && grabReaction.handleCompleted()
})
