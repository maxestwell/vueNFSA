<script lang="ts">
import { defineComponent } from 'vue'
import * as d3 from 'd3'
import { useSearchDataStore } from '@/stores/searchData'
import { computed, watch } from 'vue'

export default defineComponent({
  name: 'D3Test',
  data() {
    return {
      parsedData: [] as Array<{
        value: number
        date: number
        imgURL: string
        name: string
        summary: string
      }>,
      filteredItems: [] as Array<any>, // Define filteredItems here
      imgURL: 'https://media.nfsacollection.net/'
    }
  },
  mounted() {
    const store = useSearchDataStore()
    const data = computed(() => store.theStoredData)

    watch(
      () => store.theStoredData,
      () => {
        console.log('Watcher has watched')
        this.drawChart(data)
      }
    )

    this.drawChart(data)
  },
  methods: {
    drawChart(data: any) {
      console.log('chart is charting')

      let filteredData = data.value.filter(
        (item: any) =>
          item['productionDates'] &&
          item['productionDates'][0]['fromYear'] !== undefined &&
          item['id'] !== undefined
      )
      console.log(filteredData)

      this.parsedData = filteredData.map((d: any) => ({
        date: d['productionDates'][0]['fromYear'],
        value: d['id'],
        imgURL: d['imgURL'], // Ensure imgURL is included
        result: d['result'], // Ensure result is included
        summary: d['summary'] // Ensure summary is included
      }))
      console.log(this.parsedData)

      // Set dimensions and margins
      const margin = { top: 20, right: 30, bottom: 40, left: 40 }
      const width = 600 - margin.left - margin.right
      const height = 400 - margin.top - margin.bottom

      // Clear svg
      d3.select(this.$refs.svg as SVGElement)
        .selectAll('*')
        .remove()

      // Create SVG container
      const svg = d3
        .select(this.$refs.svg as SVGElement)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Set scales
      const x = d3
        .scaleLinear()
        .domain([
          d3.min(this.parsedData, (d) => d.value) as number,
          d3.max(this.parsedData, (d) => d.value) as number
        ])
        .range([0, width])

      const y = d3
        .scaleLinear()
        .domain([
          d3.min(this.parsedData, (d) => d.date) as number,
          d3.max(this.parsedData, (d) => d.date) as number
        ])
        .nice()
        .range([height, 0])

      // Define the line
      const line = d3
        .line<{ value: number; date: number }>()
        .x((d) => x(d.value))
        .y((d) => y(d.date))

      // Draw the line
      svg
        .append('path')
        .datum(this.parsedData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line)

      // Add X axis
      svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5))

      // Add Y axis
      svg.append('g').call(d3.axisLeft(y))

      // Tooltip
      const tooltip = d3.select(this.$refs.tooltip as HTMLDivElement)

      // Draw dots
      svg
        .selectAll('.dot')
        .data(this.parsedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.value))
        .attr('cy', (d) => y(d.date))
        .attr('r', 4) // Radius of the dots
        .attr('fill', 'yellow')
        .on('mouseover', (event, d) => {
          tooltip.transition().duration(200).style('opacity', 0.9)
          tooltip
            .html(
              `
              <div>
                <img src="${d.imgURL}" alt="Image" style="width: 50px; height: 50px;" />
                <p>Name: ${d.name}</p>
                <p>Date: ${d.date}</p>
                <p>Summary: ${d.summary}</p>
              </div>
            `
            )
            .style('left', event.pageX + 5 + 'px')
            .style('top', event.pageY - 28 + 'px')
        })
        .on('mouseout', () => {
          tooltip.transition().duration(500).style('opacity', 0)
        })
    }
  }
})
</script>

<template>
  <div>
    <h2>Vue.js and D3 Chart</h2>
    <svg ref="svg"></svg>
    <div ref="tooltip" class="tooltip" style="opacity: 0"></div>
  </div>
</template>

<style scoped>
.bar {
  fill: steelblue;
}
.bar:hover {
  fill: orange;
}
.axis {
  font: 10px sans-serif;
}
.dot {
  fill: white;
  stroke: white;
  stroke-width: 1.5;
}
.dot:hover {
  fill: orange;
}
.tooltip {
  position: absolute;
  text-align: center;
  width: auto;
  height: auto;
  padding: 8px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>
