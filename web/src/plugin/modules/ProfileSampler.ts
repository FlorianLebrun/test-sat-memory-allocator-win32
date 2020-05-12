import { ProfileView } from './ProfileView'
import { Inspector } from './Inspector'

export type SamplesLoader = (blocks: Array<{ index: number, level: number }>) => Promise<Object>

export type RangeType = {
  valueMin: number
  valueMax: number
}

export class SamplesBlock {
  loading: number = 0
  index: number
  level: number
  samples: any

  constructor(index: number, level: number) {
    this.index = index
    this.level = level
  }
  load(data) {
    this.samples = data.samples
    this.loading = 1
  }
  location(): Object {
    const { index, level } = this
    return { index, level }
  }
  getValueRange(label: string, range: RangeType) {
    let { valueMin, valueMax } = range
    const values = this.samples && this.samples[label]
    const count = values ? values.length : 0
    for (let i = 0; i < count; i++) {
      const value = values[i]
      if (value < valueMin) valueMin = value
      else if (value > valueMax) valueMax = value
    }
    range.valueMin = valueMin
    range.valueMax = valueMax
  }
}

export default class ProfileSampler {
  inspector: Inspector
  view: ProfileView
  loading: Promise<any>
  statistics: any

  blockLength: number
  blockLevels: SamplesBlock[][]

  constructor(inspector: Inspector, blockLength: number) {
    this.inspector = inspector
    this.blockLength = blockLength
    this.blockLevels = new Array(0)
  }
  loadBlocks(blocks: SamplesBlock[]) {
    let promise = this.inspector.fetchAPI("/inspector/sat/tick-sampling", {
      body: {
        blocks: blocks.map(b => b.location()),
        length: this.blockLength,
      }
    }).then((res) => {
      const samples = res.json
      samples.map((data, i) => blocks[i].load(data))
      return this
    })
    if (!this.loading) this.loading = promise
    else this.loading = Promise.all([this.loading, promise])
    return this.loading
  }
  getBlockSpan(indexMin: number, indexMax: number, level: number): Promise<SamplesBlock[]> {
    const blocks = []
    let blockLoading = null
    let hasLoading = false

    let blocksList = this.blockLevels[level]
    if (!blocksList) {
      this.blockLevels[level] = blocksList = new Array(0)
    }

    for (let index = indexMin; index <= indexMax; index++) {
      let curBlock = blocksList[index]
      if (!curBlock) {
        curBlock = new SamplesBlock(index, level)
        blocksList[index] = curBlock
      }
      if (curBlock.loading === 0) {
        curBlock.loading = -1
        if (!blockLoading) blockLoading = [curBlock]
        else blockLoading.push(curBlock)
      }
      else if (curBlock.loading < 0) {
        hasLoading = true
      }
      blocks.push(curBlock)
    }

    if (blockLoading) {
      return this.loadBlocks(blockLoading).then(() => blocks)
    }
    else if (hasLoading) {
      return this.loading.then(function () { return this }.bind(blocks))
    }
    return Promise.resolve(blocks)
  }
  getGlobalView(): Promise<ProfileView> {
    return this.inspector.fetchAPI("/inspector/sat/tick-sampling", {
      body: {
        length: 0,
      }
    }).then((res) => {
      const data = res.json
      if (data.stats) {
        this.statistics = data.stats
      }
      if (!this.view) {
        this.view = new ProfileView(data.timeStart, data.timeEnd)
      }
      else {
        this.view.clip(data.timeStart, data.timeEnd)
        this.view.set(data.timeStart, data.timeEnd)
      }
      return this.view
    })
  }
  getRangeSamples(start: number, end: number, size: number): Promise<SamplesBlock[]> {
    const interval = end - start // Time interval in second
    const rate = size / (interval * this.blockLength) // Blocks rate in blocks per second
    const level = Math.ceil(Math.log2(rate))
    const indexMin = Math.floor(start * Math.pow(2, level))
    const indexMax = Math.ceil(end * Math.pow(2, level))
    return this.getBlockSpan(indexMin, indexMax, level)
  }
}
