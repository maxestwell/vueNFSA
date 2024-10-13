<script lang="ts">
// https://blog.logrocket.com/data-visualization-vue-js-d3/

import * as d3 from 'd3'
import { useSearchDataStore } from '@/stores/searchData'
import { computed, watch } from 'vue'

export default {
  name: 'D3Test',
  data() {
    return {
      parsedData: []
    }
  },
  mounted() {
    const store = useSearchDataStore()
    const data = computed(() => store.theStoredData)
    // const data = store.theStoredData
    // console.log(data)

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

      // console.log(data)
      let filteredData = data.value.filter(
        (item: any) =>
          item['productionDates'] &&
          item['productionDates'][0]['fromYear'] !== undefined &&
          item['id'] !== undefined
      )
      console.log(filteredData)

      this.parsedData = filteredData.map((d: any) => ({
        date: d['productionDates'][0]['fromYear'],
        value: d['id']
      }))
      console.log(this.parsedData)

      // Set dimensions and margins
      const margin = { top: 20, right: 30, bottom: 40, left: 40 }
      // const width = window.innerWidth - margin.left - margin.right
      // const height = window.innerHeight - margin.top - margin.bottom

      const width = 800 - margin.left - margin.right
      const height = 600 - margin.top - margin.bottom

      // clear svg
      d3.select('svg').selectAll('*').remove()

      // Create SVG container
      const svg = d3
        .select(this.$refs.svg as SVGSVGElement)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Set scales
      const x = d3
        .scaleLinear()
        .domain([
          d3.min(this.parsedData, (d: any) => d.date),
          d3.max(this.parsedData, (d: any) => d.date)
        ])
        .range([0, width])

      const y = d3
        .scaleLinear()
        .domain([
          d3.min(this.parsedData, (d: any) => d.value),
          d3.max(this.parsedData, (d: any) => d.value)
        ])
        .nice()
        .range([height, 0])

      // Create line generator
      // const line = d3
      //   .line()
      //   .x((d: any) => x(d.value))
      //   .y((d: any) => y(d.date))
      // // Add the line path
      // svg
      //   .append('path')
      //   .datum(this.parsedData)
      //   .attr('fill', 'none')
      //   .attr('stroke', 'steelblue')
      //   .attr('stroke-width', 1.5)
      //   .attr('d', line)

      // Add X axis
      svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5))

      // Add Y axis
      svg.append('g').call(d3.axisLeft(y))

      // Draw dots
      svg
        .selectAll('.dot')
        .data(this.parsedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d: any) => x(d.date))
        .attr('cy', (d: any) => y(d.value))
        .attr('r', 4) // Radius of the dots
        .attr('fill', 'lightblue')
      svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
      svg.append('g').call(d3.axisLeft(y))
    }
  }
}
</script>

<template>
  <div>
    <h2>Vue.js and D3 Chart</h2>
    <svg ref="svg"></svg>
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
</style>
