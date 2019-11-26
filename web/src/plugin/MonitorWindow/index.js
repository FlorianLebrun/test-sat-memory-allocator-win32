import React from "react"
import Application from "@application"
import TreeNode from "@modules/TreeNode"
import { NestedFlameChart } from "../modules/charts/chart-flame"

export default class MonitorWindow extends Application.WindowComponent {
  props: Object
  state = {
    profiles: []
  }

  componentWillMount() {
    const { inspector } = this.props
    inspector.eventSoure.addEventListener("/runtime/profile", (e) => {
      const { profiles } = this.state
      const data = JSON.parse(e.data)
      console.log("------ New Profile ------\n", data)
      this.setState({ profiles: [...profiles, data] })
    })
  }
  render() {
    const { profiles } = this.state
    return (<div className="flex-col" style={styles.body}>
      {profiles && profiles.map((profile, i) => {
        return <TreeNode
          key={i}
          header={`Profile Histogram: ${profile.title || i}`}
          content={<React.Fragment>
            <NestedFlameChart histogram={profile.histogram} style={{ height: 500 }} />
          </React.Fragment>}
        />
      })}
    </div>)
  }
}

const styles = {
  body: {
    minHeight: "100%",
    backgroundColor: "white",
    color: "rgb(20,20,20)",
    font: "consolas, sans-serif",
  },
}
