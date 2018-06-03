import React from "react"
import Application from "@application"
import ProfileSampler from "../ProfileSampler"
import { ProfileView } from '../ProfileView'

import SamplesGraph from "../views/SamplesGraph"
import ViewSelector from "../views/ViewSelector"
import StackHistogramView from "../views/StackHistogramView"
import "./index.css"

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
      if (!this.selectedView) this.selectedView = new ProfileView(range.timeStart, range.timeEnd)
      else this.selectedView.clip(range.timeStart, range.timeEnd)
      this.forceUpdate()
    })
  }
  render() {
    if (this.selectedView && this.globalView) {
      const { inspector } = this.props
      return (<div className="flex-col width-100 height-100">
        <span className="btn btn-default flex-no" onClick={this.handleRefresh}>
          {"Update"}
        </span>
        <ViewSelector selection={this.selectedView} range={this.globalView}>
          <SamplesGraph title="cpu" label="cpu-use" view={this.globalView} sampler={this.sampler} options={options.cpu} style={styles.cpu} />
          <SamplesGraph title="memory" label="memory-use" view={this.globalView} sampler={this.sampler} options={options.memory} style={styles.memory} />
        </ViewSelector>
        <SamplesGraph title="cpu" label="cpu-use" view={this.selectedView} sampler={this.sampler} options={options.cpu} style={styles.cpu} />
        <StackHistogramView view={this.selectedView} className="flex-1" inspector={inspector} />
        {/*
      <ChartSamples label="cpu" view={this.selectedView} sampler={sampler} key={"cpu-use"} options={options.cpu} style={styles.cpu} />
      <ObjectsView view={this.selectedView} className="flex-1" inspector={inspector} />*/}
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
  }
}
