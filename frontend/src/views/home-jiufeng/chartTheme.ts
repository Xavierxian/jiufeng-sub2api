import { Chart, type Plugin } from 'chart.js'

export const jiufengChartPalette = ['#347568', '#8bada1', '#c8aa70', '#768aa6', '#a28b9f', '#a9b8aa', '#b97764', '#677e7a']
const darkPalette = ['#7bc8b5', '#abcbbd', '#dec08b', '#9fbbda', '#c8a9c4', '#bfceaa', '#e8a491', '#90aca6']

function optionObject(parent: any, key: string) {
  const current = parent?.[key]
  if (current && typeof current === 'object') return current
  parent[key] = {}
  return parent[key]
}

// Registered once, but only styles canvases owned by a Jiufeng workspace.
// Status/error charts keep their semantic series colours; generic analytics
// explicitly opt into the brand palette with .jf-chart-palette.
const studioCharts: Plugin = {
  id: 'jiufeng-studio',
  beforeUpdate(chart) {
    const shell = chart.canvas.closest<HTMLElement>('.jf-studio')
    if (!shell) return
    const dark = document.documentElement.classList.contains('dark')
    const text = dark ? '#b6bcb7' : '#747b75'
    const grid = dark ? 'rgba(180,195,183,.09)' : 'rgba(73,89,78,.08)'
    const options = chart.options as any
    // Chart.js exposes resolved option objects as Proxy instances. Mutating
    // their known fields is supported; spreading them can violate Proxy
    // invariants and crash chart mounting.
    const font = optionObject(options, 'font')
    font.family = 'Inter, "Noto Sans SC", "Microsoft YaHei", sans-serif'
    font.size = 11
    options.color = text
    const elements = optionObject(options, 'elements')
    const point = optionObject(elements, 'point')
    point.radius = 0
    point.hoverRadius = 4
    point.hitRadius = 12
    const line = optionObject(elements, 'line')
    line.borderWidth = 2
    line.tension = 0.32
    const bar = optionObject(elements, 'bar')
    bar.borderRadius = 5
    bar.borderSkipped = false
    const legend = options.plugins?.legend as any
    if (legend) {
      const labels = optionObject(legend, 'labels')
      labels.color = text
      labels.boxWidth = 8
      labels.boxHeight = 8
      labels.padding = 18
      labels.usePointStyle = true
      labels.pointStyle = 'circle'
      const labelFont = optionObject(labels, 'font')
      labelFont.size = 11
      labelFont.family = 'Inter, "Microsoft YaHei", sans-serif'
    }
    const tooltip = options.plugins?.tooltip as any
    if (tooltip) {
      tooltip.backgroundColor = dark ? '#eceee9' : '#1e2924'
      tooltip.titleColor = dark ? '#1e2924' : '#fff'
      tooltip.bodyColor = dark ? '#1e2924' : '#e6ece8'
      tooltip.footerColor = dark ? '#57625b' : '#b4c9bd'
      tooltip.padding = 13
      tooltip.cornerRadius = 10
      tooltip.boxPadding = 5
      tooltip.displayColors = true
    }
    for (const id of Reflect.ownKeys(chart.scales)) {
      if (typeof id !== 'string') continue
      const axis = chart.scales[id]?.options as any
      if (!axis) continue
      const border = optionObject(axis, 'border')
      border.display = false
      const gridOptions = optionObject(axis, 'grid')
      gridOptions.color = grid
      gridOptions.drawTicks = false
      if (id.startsWith('x')) gridOptions.display = false
      const ticks = optionObject(axis, 'ticks')
      ticks.color = text
      ticks.padding = 10
      optionObject(ticks, 'font').size = 10
      if (id.startsWith('x')) {
        ticks.maxTicksLimit = 6
        ticks.maxRotation = 0
        ticks.minRotation = 0
      }
    }
    if (!chart.canvas.closest('.jf-chart-palette')) return
    const palette = dark ? darkPalette : jiufengChartPalette
    chart.data.datasets.forEach((dataset, index) => {
      const type = dataset.type || (chart.config as any).type
      if (type === 'doughnut' || type === 'pie') {
        dataset.backgroundColor = dataset.data.map((_, i) => palette[i % palette.length])
        dataset.borderColor = dark ? '#1a201c' : '#fff'
        dataset.borderWidth = 3
      } else {
        dataset.borderColor = palette[index % palette.length]
        dataset.backgroundColor = `${palette[index % palette.length]}18`
      }
    })
  },
}

Chart.register(studioCharts)

export function refreshJiufengCharts(shell: HTMLElement) {
  for (const chart of Object.values(Chart.instances)) {
    if (shell.contains(chart.canvas)) chart.update('none')
  }
}
