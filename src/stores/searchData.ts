import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSearchDataStore = defineStore('searchData', () => {
  const theStoredData = ref([])
  function $reset() {
    theStoredData.value = []
  }
  return { theStoredData, $reset }
})
