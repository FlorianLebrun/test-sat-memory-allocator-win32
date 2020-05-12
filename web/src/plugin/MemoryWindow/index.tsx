import React from "react"
import Application from "react-application-frame"
import DataFrame from "../modules/DataFrame"
import { Inspector } from "../modules/Inspector"

type PropsType = {
  inspector: Inspector
  pageIndex: number
  pageCount: number
  width: number
  className?: string
  style?: any
  onChange?: Function
}

class Pagination extends React.Component {
  props: PropsType
  handleNext = () => {
    const { pageIndex, pageCount, onChange } = this.props
    onChange && onChange(Math.min(pageCount - 1, pageIndex + 1))
  }
  handleBack = () => {
    const { pageIndex, onChange } = this.props
    onChange && onChange(Math.max(0, pageIndex - 1))
  }
  handleClick = (index) => () => {
    const { onChange } = this.props
    onChange && onChange(index)
  }
  render() {
    const { pageIndex, pageCount, width } = this.props
    const halfLength = (width / 2) | 0

    let startIndex = pageIndex - halfLength
    let endIndex = pageIndex + halfLength + 1
    if (startIndex < 0) {
      endIndex -= startIndex
      startIndex = 0
    }
    if (endIndex > pageCount) {
      startIndex = Math.max(0, startIndex - (endIndex - pageCount))
      endIndex = pageCount
    }

    const items = []
    for (let i = startIndex; i < endIndex; i++) {
      items.push(<li
        key={items.length}
        className={i === pageIndex ? "page-item active" : "page-item"}
        onClick={this.handleClick(i)}
      >
        <div className="page-link">{i}</div>
      </li>)
    }
    return (<ul className="pagination user-select-none">
      <li className={pageIndex > 0 ? "page-item cursor-pointer" : "page-item disabled"} onClick={this.handleBack}>
        <div className="page-link">
          <span>&laquo;</span>
        </div>
      </li>
      {items}
      <li className={pageIndex < pageCount - 1 ? "page-item cursor-pointer" : "page-item disabled"} onClick={this.handleNext}>
        <div className="page-link">
          <span>&raquo;</span>
        </div>
      </li>
    </ul>)
  }
}
const objectsPerPage = 32

class MemoryWindow extends Application.WindowComponent {
  props: PropsType
  state: any = { pageIndex: 0, pageCount: 0 }
  pending: Promise<any>

  componentWillMount() {
    this.update(0)
  }
  update(pageIndex) {
    const { inspector } = this.props
    this.pending = inspector.fetchAPI("/inspector/sat/memory/query", {
      body: {
        startIndex: pageIndex * objectsPerPage,
        maxObjects: objectsPerPage,
      }
    }).then((res) => {
      const data = res.json
      data.pageCount = Math.ceil(data.objectCount / objectsPerPage)
      data.pageIndex = Math.min(pageIndex, data.pageCount - 1)
      this.pending = null
      this.setState(data)
    }, () => {
      this.pending = null
    })
  }
  handlePage = (pageIndex) => {
    this.update(pageIndex)
  }
  render() {
    const { inspector, className, style } = this.props
    const { pageIndex, pageCount, objects, filter } = this.state
    const { objectCount, usedSize, heapObjectCount, heapUsedSize } = this.state
    return (<div className={className} style={style}>
      <input
        type="text"
        value={filter}
        onChange={this.handleFilter}
      />
      <button onClick={this.applyFilter}>Apply</button>
      <div>
        <span>{`${objectCount} / ${heapObjectCount} objects`}</span>
        <small className="text-shade padding-left">{`${(usedSize / 1000) | 0} / ${(heapUsedSize / 1000) | 0} Kbytes`}</small>
      </div>
      <Pagination
        inspector={inspector}
        pageIndex={pageIndex}
        pageCount={pageCount}
        width={8}
        onChange={this.handlePage}
      />
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

export default MemoryWindow

