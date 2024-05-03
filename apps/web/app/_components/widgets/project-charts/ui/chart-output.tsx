"use client"
import { useEffect } from "react"
import { useCharts } from "../store/charts-store"
import { useSelectChart } from "../store/select-chart"
import { ChartBar } from "./chart-bar"

type Props = {
  data?: any[]
}
const ChartOutput = ({ data = [] }: Props) => {
  const { charts, setCharts } = useCharts()
  const selectedChart = useSelectChart(state => state.selected)
  const maxCount = Math.max(...data
    .map(item => item.result)
    .map(item => item.length || 0)
  )
  const chart = charts.find(chart => chart.short_id === selectedChart)
  console.log(chart)
  useEffect(() => {
    if (data.length !== 0) setCharts(data)
  }, [data])
  if (!chart) return (
    <div className="container">
      <div className="w-full h-[40dvh] flex items-end justify-end"></div>
    </div>
  )
  return (
    <div className="container">
      <div className="w-full h-[40dvh] flex items-end justify-end">
        {
          chart
            .result
            .map(
              (range: any) => <>
                {
                  range.map(
                    (item: any) =>
                      <ChartBar withDate date={item.custom_name} key={item.date} percent={10} />
                  )
                }
              </>
            )

        }
        {/* <ChartBar date="21 April" withDate percent={100} />
        <ChartBar percent={66} />
        <ChartBar date="23 April" withDate percent={75} />
        <ChartBar percent={50} />
        <ChartBar date="25 April" withDate percent={90} />
        <ChartBar percent={34} />
        <ChartBar date="27 April" withDate percent={16} />
        <ChartBar percent={5} /> */}
      </div>
    </div>
  )
}
export { ChartOutput }