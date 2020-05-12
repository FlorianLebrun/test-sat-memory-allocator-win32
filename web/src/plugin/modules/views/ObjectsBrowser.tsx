import React from "react"
import { ProfileViewListener } from "../ProfileView"
import DataFrame from "../DataFrame"

class ObjectsView extends React.Component {
  props: any
  state = {
    objects: null,
    typeFilter: undefined,
    filter: undefined,
  }
  viewClient: ProfileViewListener
  typeFilter: string
  pending: any
  filter: string
  start = 0
  end = 0

  componentWillMount() {
    const { view } = this.props
    this.viewClient = new ProfileViewListener(view, this.updateRange)
    this.updateRange()
  }
  componentWillUnmount() {
    this.viewClient.unmap()
  }
  updateRange = () => {
    const { filter } = this
    const { inspector } = this.props
    const { start, end } = this.viewClient.view
    if (!this.pending && (this.start !== start || this.end !== end || this.state.filter !== filter)) {
      this.start = start
      this.end = end
      this.pending = inspector.fetchAPI("/inspector/sat/memory/query", {
        body: { start, end, filter }
      }).then((res) => {
        const data = res.json
        this.pending = null
        this.setState({ objects: data.objects, filter })
        this.updateRange()
      }, () => {
        this.pending = null
        this.updateRange()
      })
      this.setState({ objects: null })
    }
  }
  handleFilter = (e) => {
    this.filter = e.value || undefined
  }
  applyFilter = () => {
    this.updateRange()
  }
  render() {
    const { inspector, className, style } = this.props
    const { objects, filter } = this.state
    return (<div className={className} style={style}>
      <input
        type="text"
        value={filter}
        onChange={this.handleFilter}
      />
      <button onClick={this.applyFilter}>Apply</button>
      {objects && objects.map((x, i) => {
        return (<DataFrame
          key={i}
          name={x.$ref}
          value={x}
          inspector={inspector}
        />)
      })}
    </div>)
  }
}

export default ObjectsView