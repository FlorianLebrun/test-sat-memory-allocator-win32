import { ProfileView } from './ProfileView'

type SamplesLoader = (blocks: Array<{ index: number, level: number }>) => Promise<Object>

type RangeType = {
  valueMin: number,
  valueMax: number
}

class SamplesBlock {
  block_next: SamplesBlock
  block_back: SamplesBlock
  loading: integer = 0
  index: integer
  level: integer
  samples: Object

  constructor(index: integer, level: integer, block_back: SamplesBlock, block_next: SamplesBlock) {
    this.index = index
    this.level = level
    this.block_back = block_back
    if (block_back) block_back.block_next = this
    this.block_next = block_next
    if (block_next) block_next.block_back = this
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

class ProfileSampler {
  inspector: SamplesLoader
  view: ProfileView
  loading: Promise

  blockLength: integer
  blockLevels: Array<Array<SamplesBlock>>

  constructor(inspector: SamplesLoader, blockLength: integer) {
    this.inspector = inspector
    this.blockLength = blockLength
    this.blockLevels = new Array(0)
  }
  loadBlocks(blocks: Array<SamplesBlock>) {
    let promise = this.inspector.fetchAPI("/inspector/sat/tick-sampling", {
      body: {
        blocks: blocks.map(b => b.location()),
        length: this.blockLength,
      }
    }).then((res: Array<Object>) => {
      const samples = res.json
      samples.map((data, i) => blocks[i].load(data))
      return this
    })
    if (!this.loading) this.loading = promise
    else this.loading = Promise.all([this.loading, promise])
    return this.loading
  }
  getBlockAt(index: integer, level: integer): SamplesBlock {
    let curBlock, prevBlock = this.blockLevels[level]
    for (curBlock = prevBlock; curBlock && curBlock.index < index; curBlock = curBlock.block_next) {
      prevBlock = curBlock
    }
    if (curBlock) {
      if (curBlock.index !== index) {
        curBlock = new SamplesBlock(index, level, prevBlock, curBlock)
        if (!prevBlock) this.blockLevels[level] = curBlock
      }
    }
    else {
      curBlock = new SamplesBlock(index, level, prevBlock, curBlock)
      if (!prevBlock) this.blockLevels[level] = curBlock
    }
    return curBlock
  }
  getBlockSpan(indexMin: integer, indexMax: integer, level: integer): Array<SamplesBlock> {
    const blocks = []
    let blockLoading = null
    let hasLoading = false

    let curBlock, prevBlock
    curBlock = this.getBlockAt(indexMin, level)
    for (let index = curBlock.index; index < indexMax; index++) {
      if (!curBlock || curBlock.index !== index) {
        curBlock = new SamplesBlock(index, level, prevBlock, curBlock)
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
      prevBlock = curBlock
      curBlock = curBlock.block_next
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
    }).then((res: Array<Object>) => {
      const data = res.json
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
  getRangeSamples(start: number, end: number, size: integer): Array<SamplesBlock> {
    const interval = end - start // Time interval in second
    const rate = size / (interval * this.blockLength) // Blocks rate in blocks per second
    const level = Math.ceil(Math.log2(rate))
    const indexMin = Math.floor(start * Math.pow(2, level))
    const indexMax = Math.ceil(end * Math.pow(2, level))
    return this.getBlockSpan(indexMin, indexMax, level)
  }
}

export default ProfileSampler