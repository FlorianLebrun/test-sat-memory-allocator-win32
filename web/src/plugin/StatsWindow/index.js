import React from "react"
import Application from "@application"

class StatsWindow extends Application.WindowComponent {
  props: Object
  state = { threads: null }
  pending: Promise

  componentWillMount() {
    this.update()
  }
  update() {
    const { inspector } = this.props
    this.pending = inspector.fetchAPI("/inspector/sat/stats").then((res) => {
      const data = res.json
      this.pending = null
      this.setState(data)
    }, () => {
      this.pending = null
    })
  }
  handleThreadSwitch = (thread: Object) => () => {
    const { inspector } = this.props
    inspector.fetchAPI("/inspector/sat/thread", { body: { id: thread.id, watch: !thread.sampled } }).then((res) => {
      this.update()
      return res.json
    })
  }
  handleUpdate = (pageIndex) => {
    this.update(pageIndex)
  }
  render() {
    const { threads, heaps } = this.state
    return (<div>
      <h2>{"Threads"}</h2>
      {threads && threads.map((x) => {
        return (<div key={x.id}>
          <span className={x.sampled ? "fa fa-fw fa-eye text-success" : "fa fa-fw fa-eye-slash"} onClick={this.handleThreadSwitch(x)} />
          <span className="padding-left">{x.name}{" - "}{x.id}</span>
        </div>)
      })}
      <h2>{"Heaps"}</h2>
      {heaps && heaps.map((x) => {
        return (<div key={x.id}>
          <span className={"fa fa-fw fa-database text-primary"} />
          <span className="padding-left">{x.name}{" ("}{x.id}{") : "}{x.size}{"Mb"}</span>
        </div>)
      })}
    </div>)
  }
}

export default StatsWindow

