<script lang="ts">
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
      query: 'https://api.collection.nfsa.gov.au/search?limit=25&query=',
      searchString: 'lobby'
    }
  },
  methods: {
    fetchData() {
      // use dynamic data to modify the API call
      // in this case we use a text box which sets searchString
      // and the currentPage to allow us to loop through the paginated results
      let queryString = this.query + this.searchString + '&page=' + this.currentPage
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
              if (this.currentPage * 25 < 500 && this.currentPage * 25 < this.$data.total) {
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
    newMethod() {
      console.log(this.$data.resultSet)
    },
    resetSearch() {
      this.$data.resultSet = []
    }
    // filterResults(arr: theArray) {
    //   function filter(element, index, array) {
    //     if (this.$data.resultSet['preview'] && this.$data.resultSet['preview'][0]) {
    //       return true
    //     }
    //   }
    //   this.$data.theResults.every(filter)
    // }
  }
}
</script>

<template>
  <div class="search">
    <h1 class="green">{{ msg }}</h1>

    <input v-model="searchString" placeholder="query" />
    <button @click="fetchData">fetch data</button>
    <button @click="newMethod">showresult</button>
    <button @click="resetSearch">reset</button>
    <!-- <button @click="filterResults">filter</button> -->

    <p>Total: {{ total }}</p>

    <ul role="list" class="list-v">
      <!-- create a variable called result, 
      loop through the API results and add a list item for each result.
      Use result to access properties like 'title' and 'name' -->
      <li v-for="(result, index) in resultSet" :key="result[index]">
        <p>{{ result['title'] }}</p>
        <p>{{ result['name'] }}</p>
        <!-- check if there's any items in the preview array.  If so, put the biggest image in the view -->
        <!-- v-bind is used to update the src attribute when the data comes in -->
        <img
          v-if="result['preview'] && result['preview'][0]"
          v-bind:src="imgURL + result['preview'][0]['filePath']"
          v-bind:alt="result['name']"
          v-bind:title="result['name']"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
