<script lang="ts">
// Use a Pinia store to hold the API results through the whole app
// Access the data by importing the store
import { useSearchDataStore } from '@/stores/searchData'
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
  mounted() {
    // If there's already results, show them
    if (store) {
      this.resultSet = store.theStoredData
    } else {
      this.resultSet = []
    }
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
      selectedCategories: []
    }
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

@media (min-width: 1024px) {
  .search h1,
  .search h3 {
    text-align: left;
  }
}
</style>
