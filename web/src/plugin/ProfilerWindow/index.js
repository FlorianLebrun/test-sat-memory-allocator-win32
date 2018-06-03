import React from "react"
import Application from "@application"
import TreeNode from "@modules/TreeNode"
import ProfileSampler from "../modules/ProfileSampler"
import { ProfileView } from '../modules/ProfileView'

import ProfileViewSelector from "../modules/ProfileViewSelector"
import SamplesGraph from "../modules/views/SamplesGraph"
import StackHistogram from "../modules/views/StackHistogram"
import ObjectsBrowser from "../modules/views/ObjectsBrowser"

class ProfilerWindow extends Application.WindowComponent {
  props: Object
  globalView: ProfileView = null
  selectedView: ProfileView = null
  sampler: ProfileSampler = null

  componentWillMount() {
    const { inspector } = this.props
    this.sampler = new ProfileSampler(inspector, 256)
    this.handleRefresh()
  }
  handleRefresh = () => {
    this.sampler.getGlobalView().then((range) => {
      this.globalView = range
      if (!this.selectedView) this.selectedView = new ProfileView(range.start, range.end)
      else this.selectedView.clip(range.start, range.end)
      this.forceUpdate()
    })
  }
  render() {
    if (this.selectedView && this.globalView) {
      const { inspector } = this.props
      const { statistics } = this.sampler
      return (<div className="flex-col" style={styles.body}>
        <span className="btn btn-default flex-no" onClick={this.handleRefresh}>
          {"Update"}
        </span>
        {statistics && <span className="text-shade">
          <small className="padding-left-lg">rateLimit: {(statistics.samplingRateLimit / 1000) | 0} Khz</small>
          <small className="padding-left-lg">memory: {(statistics.memoryUse / 1000) | 0} Kbytes</small>
          <small className="padding-left-lg">samples: {statistics.samplingCycles}</small>
        </span>}
        <ProfileViewSelector selection={this.selectedView} range={this.globalView}>
          <SamplesGraph title="cpu" label="cpu-use" view={this.globalView} sampler={this.sampler} options={options.cpu} style={styles.cpu} />
          <SamplesGraph title="memory" label="memory-use" view={this.globalView} sampler={this.sampler} options={options.memory} style={styles.memory} />
        </ProfileViewSelector>
        <TreeNode
          noMargin
          header="Zoom"
          content={<React.Fragment>
            <SamplesGraph title="cpu" label="cpu-use" view={this.selectedView} sampler={this.sampler} options={options.cpu} style={styles.cpu} />
          </React.Fragment>}
        />
        <TreeNode
          header="Call Histogram"
          content={<React.Fragment>
            <StackHistogram view={this.selectedView} style={{ height: 500 }} inspector={inspector} />
          </React.Fragment>}
        />
        <TreeNode
          open
          header="Objects"
          content={<React.Fragment>
            <ObjectsBrowser view={this.selectedView} inspector={inspector} />
          </React.Fragment>}
        />
        {/* 
          <ChartSamples label="cpu" view={this.selectedView} sampler={sampler} key={"cpu-use"} options={options.cpu} style={styles.cpu} />
          <ObjectsView view={this.selectedView} className="flex-1" inspector={inspector} />
        */}
      </div>)
    }
    else {
      return (<div>Wait...</div>)
    }
  }
}

export default ProfilerWindow

const options = {
  cpu: {
    showHead: true,
  },
  memory: {
    showHead: false,
  }
}

const styles = {
  cpu: {
    height: 50,
  },
  memory: {
    height: 30,
  },
  body: {
    minHeight: "100%",
    backgroundColor: "white",
    color: "rgb(20,20,20)",
    font: "consolas, sans-serif",
  },
}
