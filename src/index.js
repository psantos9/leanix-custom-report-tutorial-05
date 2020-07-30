import 'alpinejs'
import '@leanix/reporting'
import './assets/tailwind.css'

const state = {
  // variable to hold the graphql query response
  response: null,
  // array that will hold the transformed response, in form of rows
  rows: [],
  // array to store the table's columns key and label
  columns: [],
  // variable to hold the computed average completion ratio for all factsheets
  avgCompletion:  'n/a'
}


const methods = {
    async initializeReport () {
      await lx.init()
      await lx.ready({})
    },
    async fetchGraphQLData () {
      const query = `
      {
        allFactSheets(factSheetType: Application) {
          edges {
            node {
              name
              completion {
                completion
              }
            }
          }
        }
      }`
      lx.showSpinner()
      try {
        this.response = await lx.executeGraphQL(query)
        this.mapResponseToRows()
      } finally {
        lx.hideSpinner()
      }
    },
    mapResponseToRows () {
      if (this.response === null) return
      this.rows = this.response.allFactSheets.edges
        // .map(edge => edge.node) <- the previous mapping operation
        .map(edge => {
          let { name, completion } = edge.node
          const  completionValue = completion.completion // we'll store the percentage value for computing later the total average completion ratio of our entire dataset
          completion = (completion.completion * 100).toFixed(1) + '%' // the percentage representation, rounded with 1 decimal place
          return { name, completion, completionValue }
        })
      this.computeTableColumns()

      const  completionSum = this.rows
        .reduce((accumulator, row) =>  accumulator + row.completionValue, 0)
      this.avgCompletion = ((completionSum / this.rows.length) * 100).toFixed(1) + '%'
    },
    computeTableColumns () {
      const  columnKeys = ['name', 'completion']
      this.columns = columnKeys
        .map(key  => ({ key, label:  lx.translateField('Application', key) }))
    }
}

window.initializeContext = () => {
    return {
        ...state,
        ...methods
    }
}
