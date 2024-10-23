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
      searchString: 'NFSA',
      selectedCategories: [],
      parsedData: []
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
  filteredTitles(): string[] {
    return this.resultSet.map((item: { title: string }) => item.title)
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
      console.log(this.filteredItems)

      // console.log(data)
      let filteredData = data.value.filter(
        (item: any) =>
          item['productionDates'] &&
          item['productionDates'][0]['fromYear'] !== undefined &&
          item['id'] !== undefined &&
          item['preview'][0]['type'] === 'image'
      )
      console.log(filteredData)
      // this.parsedData = filteredData.map((d: any) => (

      const imgURL = 'https://media.nfsacollection.net/'

      this.parsedData = filteredData.map(function (d: any) {
        if (
          d['preview'][0]['type'] === 'image'
          // &&
          // d['productionDates'][0]['fromYear'] !== undefined
        ) {
          return {
            date: d['productionDates'][0]['fromYear'],
            value: d['id'],
            result: d['result'],
            title: d['title'],
            name: d['name'],
            imgURL: imgURL + d['preview'][0]['filePath']
          }
        } else {
          return false
        }
      })

      console.log(this.parsedData)

      // Set dimensions and margins
      const margin = { top: 75, right: 100, bottom: 50, left: 100 }
      const width = window.innerWidth - margin.left - margin.right
      const height = window.innerHeight - margin.top - margin.bottom

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
        .range([margin.left, width - margin.right])

      const y = d3
        .scaleLinear()
        .domain([
          d3.min(this.parsedData, (d: any) => d.value),
          d3.max(this.parsedData, (d: any) => d.value)
        ])
        .nice()
        .range([height - margin.bottom, margin.top])

      const color = d3
        .scaleSequential(d3.interpolateRgb('#330099', '#ffcc66'))
        .domain([
          d3.min(this.parsedData, (d: any) => d.value),
          d3.max(this.parsedData, (d: any) => d.value)
        ])

      // Add the x-axis.
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))

      // Add the y-axis.
      svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y))

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
        .attr('r', 5) // Radius of the dots
        .attr('fill', (d: { date: number; value: number }) => color(d.value))
        // add regex here to remove special characters
        .on(
          'click',
          (
            event,
            d: {
              imgURL: any
              title: string
              date: number
              name: string
            }
          ) => {
            tooltip.transition().duration(200).style('opacity', 1).style('display', 'unset')
            tooltip.html(
              `
              <img src="${d.imgURL}">
                <h2>${d.title}</h2>
                <h3>${d.date}</h3>
                <p>${d.name}</p>
            `
            )
            tooltip.on('click', () => {
              tooltip.transition().duration(500).style('opacity', 0).style('display', 'none')
              console.log('clicked')
            })
          }
        )
    }
  }
}
</script>

<template>
  <div class="search">
    <div class="sts">
      <h1 class="green">{{ msg }}</h1>
      <div class="inputb">
        <input v-model="searchString" placeholder="query" />
        <button @click="fetchData">fetch&nbsp;data</button>
        <button @click="clearResults">clear&nbsp;results</button>
      </div>
      <p>Total: {{ total }}</p>
    </div>
    <div class="graph">
      <svg ref="svg"></svg>
      <div ref="tooltip" class="tooltip"></div>
    </div>
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

.sts {
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%, 0);
  width: 60%;
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

.graph {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  border: 1px solid grey;
  border-radius: 5px;
  height: 20px;
  width: 100%;
  padding: 15px 10px 15px 10px;
  outline: 0;
  background-color: #f5f5f5;
  margin-right: 1rem;
}

.inputb {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

button:first-of-type {
  border: 1px solid #a10a00;
  margin-right: 1rem;
  border-radius: 5px;
  /* background-color: #ffcc66; */
}

button:last-of-type {
  border: 1px solid #a10a00;
  border-radius: 5px;
  /* background-color: #a10a00; */
}

label {
  display: block;
  margin: 0.5rem;
}

img {
  display: inline-block;
  max-width: 100%;
  transition: all 2s;
}

.tooltip {
  position: absolute;
  text-align: center;

  top: 20%;
  background-color: #a10a00;
  width: 50%;
  height: auto;
  padding: 1rem;
  opacity: 0;
  display: none;
}
</style>
