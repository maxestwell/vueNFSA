<script lang="ts">
// Use a Pinia store to hold the API results through the whole app
// Access the data by importing the store
import * as d3 from 'd3'
import { useSearchDataStore } from '@/stores/searchData'
import { computed, watch } from 'vue'
var store: any
function updateStore(newData: any) {
  // Define a variable to represent the store
  store = useSearchDataStore()
  // Then use store.theStoredData to get/set the collection
  store.theStoredData = newData
  return {
    theStoredData: store.theStoredData
  }
}
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },

  data() {
    return {
      theData: {},
      tempData: {},
      resultSet: [],
      tempResultSet: [],
      currentPage: 1,
      total: 0,
      imgURL: 'https://media.nfsacollection.net/',
      query: 'https://api.collection.nfsa.gov.au/search?limit=25&hasMedia=yes&query=',
      searchString: 'lobby',
      selectedCategories: [],
      parsedData: [] as Array<{
        value: number
        date: number
        imgURL: string
        name: string
        summary: string
      }>
    }
  },
  mounted() {
    const store = useSearchDataStore()
    // If there's already results, show them
    if (store) {
      this.resultSet = store.theStoredData
    } else {
      this.resultSet = []
    }
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
  computed: {
    filteredItems() {
      if (this.selectedCategories.length === 0) {
        return this.resultSet // Return all items if no category is selected
      }
      return this.resultSet.filter(
        (item) =>
          (item['forms'] && this.selectedCategories.includes(item['forms'][0])) ||
          (item['countries'] && this.selectedCategories.includes(item['countries'][0])) ||
          (item['parentTitle'] &&
            item['parentTitle']['genres'] &&
            this.selectedCategories.includes(item['parentTitle']['genres'][0]))
      )
    }
  },
  methods: {
    fetchData() {
      // use dynamic data to modify the API call
      // in this case we use a text box which sets searchString
      // and the currentPage to allow us to loop through the paginated results
      let queryString = this.query + this.searchString + '&page=' + this.currentPage
      // let queryString = 'https://api.collection.nfsa.gov.au/search?limit=25&query=dog&hasMedia=yes'
      console.log('API call: ' + queryString)
      fetch(queryString)
        .then((response) => {
          response.json().then((res) => {
            // build a temporary object, add the data from the current page on each call of fetchData()
            this.$data.tempData = { ...this.$data.tempData, ...res }
            // the same as above but with just the results array instead of the whole data object
            this.$data.tempResultSet = this.$data.tempResultSet.concat(res.results)
            // total items from the meta object (total number of items found in the search)
            this.$data.total = res.meta.count.total
            // if there are items
            if (this.$data.total > 0) {
              // check how many pages of results @ 25 per page
              if (this.currentPage * 25 < this.$data.total) {
                //if (this.currentPage * 25 < 500 && this.currentPage * 25 < this.$data.total) {
                // go to the next page
                this.currentPage++
                // call this function on itself (recursive) ! be careful, this can cause an infinite loop
                this.fetchData()
              } else {
                this.$data.theData = this.$data.tempData
                this.$data.tempData = {}
                this.$data.resultSet = this.$data.tempResultSet
                this.$data.tempResultSet = []
                // all items loaded, reset page, ready for next query
                this.currentPage = 1
                console.log('Pages: ' + Math.ceil(this.$data.total / 25))
                console.log('finished')
                updateStore(this.$data.resultSet)
              }
            } else {
              console.log('no results')
            }
          })
        })
        .catch((err) => {
          console.error(err)
        })
    },
    clearResults() {
      this.$data.resultSet = []
    },
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
        value: d['id'],
        // imgURL: d['imgURL'], // Ensure imgURL is included
        name: d['name'], // Ensure result is included
        summary: d['summary'] // Ensure summary is included
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

      const tooltip = d3.select(this.$refs.tooltip as HTMLDivElement)

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
        .on('mouseover', (event, d) => {
          tooltip.transition().duration(200).style('opacity', 0.9)
          tooltip
            .html(
              `
              <div>
                <img src="${d.imgURL}" alt="Image" style="width: 50px; height: 50px;" />
                <p>Title: ${d.name}</p>
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
      svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
      svg.append('g').call(d3.axisLeft(y))
    }
  }
}
</script>

<template>
  <div class="search">
    <h1 class="green">{{ msg }}</h1>

    <input v-model="searchString" placeholder="query" />
    <button @click="fetchData">fetch data</button>
    <button @click="clearResults">clear results</button>

    <p>Total: {{ total }}</p>

    <p>Filter Items with Checkboxes</p>
    <div>
      <label>
        <input type="checkbox" value="Lobby card" v-model="selectedCategories" /> Lobby card
      </label>
      <label>
        <input type="checkbox" value="Australia" v-model="selectedCategories" /> From Australia
      </label>
      <label>
        <input type="checkbox" value="Bushranger" v-model="selectedCategories" /> Genre: Bushranger
      </label>
    </div>
    <div>
      <h2>Vue.js and D3 Chart</h2>
      <svg ref="svg"></svg>
      <div ref="tooltip" class="tooltip" style="opacity: 0"></div>
    </div>

    <ul role="list" class="list-v">
      <!-- create a variable called result, 
      loop through the API results and add a list item for each result.
      Use result to access properties like 'title' and 'name' -->
      <li v-for="(result, index) in filteredItems" :key="result[index]">
        <!-- <li v-for="(result, index) in resultSet" :key="result[index]"> -->
        <p class="title">{{ result['title'] }}</p>
        <p>{{ result['name'] }}</p>
        <!-- check if there's any items in the preview array.  If so, put the biggest image in the view -->
        <!-- v-bind is used to update the src attribute when the data comes in -->
        <Transition>
          <img
            v-if="result['preview'] && result['preview'][0]"
            v-bind:src="imgURL + result['preview'][0]['filePath']"
            v-bind:alt="result['name']"
            v-bind:title="result['name']"
          />
        </Transition>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.v-enter-from {
  opacity: 0;
  translate: -100px 0;
}
.v-enter-to {
  opacity: 1;
  translate: 0 0;
}
.v-leave-from {
  opacity: 1;
  translate: 0 0;
}
.v-leave-to {
  opacity: 0;
  translate: 100px 0;
}
img {
  display: inline-block;
  max-width: 100%;
  transition: all 2s;
}

ul {
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
li {
  max-width: 300px;
  padding: 0.5rem;
  border: 1px solid #ffffff33;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.title {
  color: #eeeeee;
  font-weight: bold;
  font-size: 150%;
  line-height: 125%;
  margin-bottom: 0.5rem;
}

.search h1,
.search h3 {
  text-align: center;
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

@media (min-width: 1024px) {
  .search h1,
  .search h3 {
    text-align: left;
  }
}
</style>
