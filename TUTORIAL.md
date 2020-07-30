# Transforming GraphQL data using Javascript Array methods
While developing a LeanIX custom report, the developer frequently needs to operate on the [data queried from his workspace](https://dev.leanix.net/docs/custom-report-querying-data) for different reasons such as transforming it into a proper format to render a table, filtering it according a certain criteria or simply compute a statistic. For this purpose, JavaScript provides a set of powerful [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#) methods ([map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) and [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)) that allow to implement such data transformations  in a very eloquent way. Moreover, and due to Javascript [functional programming](https://en.wikipedia.org/wiki/Functional_programming) features, those methods can be chained in sequence, thus allowing the creation of very powerful data processing blocks.

In this step-by-step tutorial, we'll create a [LeanIX](https://www.leanix.net/en/) custom report that demonstrates how to transform GraphQL data into a format suitable to render a table, filter it according a certain criteria, and compute an statistic. More specifically, we’ll fetch a list of workspace Applications, and display their names and completeness ratio as a table, filter it according a minimum completion threshold, and compute the average completeness ratio for all of them, as in the picture below:

<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/GPSOuv0.png">
</div>

The complete source-code for this project can be found [here](https://github.com/pauloramires/leanix-custom-report-tutorial-05).

## Pre-requisites

*  [NodeJS LTS](https://nodejs.org/en/) installed in your computer.

## Getting started

Install the [leanix-reporting-cli](https://github.com/leanix/leanix-reporting-cli) globally via npm:

```bash
npm install -g @leanix/reporting-cli
```

Initialize a new project:

```bash
mkdir leanix-custom-report-tutorial-05
cd leanix-custom-report-tutorial-05
lxr init
npm install
```
Configure your environment by editing the *lxr.json* file, if required:
```json
{
  "host": "app.leanix.net",
  "apitoken": "your-api-token-here"
}
```

After this procedure, you should end up with the following project structure:

<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/OzxTwZv.png">
</div>

## Adjust the report boilerplate source code

We need to make some modifications in our project's boilerplate code. We start by adding the following dependencies:
```bash
npm install --dev @babel/plugin-transform-runtime postcss-loader tailwindcss
npm install alpinejs
```

 **Note:** During the course of this tutorial, we'll be using the [Alpine JS](https://github.com/alpinejs/alpine) and [Tailwind CSS](https://tailwindcss.com/) libraries.

After installing the dependencies, we modify the *webpack.config.js* file and include the *@babel/plugin-transform-runtime* and the *postcss-loader*, as indicated by the red arrows in the picture below:

<div  style="display:flex; justify-content:center;">
  <img  src="https://i.imgur.com/Vn0ZeWK.png">
</div>

 We then clean up our project source code by deleting the unnecessary files:
-  *src/report.js*
-  *src/fact-sheet-mapper.js*
-  *src/assets/bar.css*
-  *src/assets/main.css*

Next we create a *postcss.config.js* file in the **root** folder of our project, with the following content:
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')
  ]
}
```



Additionally we create an *tailwind.css* file in the assets folder with the following content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Your project folder should look now like this:
<div  style="display:flex; justify-content:center">
<img  src="https://i.imgur.com/DX45SsB.png">
</div>

## Setup the project's source-code skeleton

Now that we have all the project boilerplate code in place, it's time to setup our project's source code skeleton. Start by editing the *src/index.js* file and replace its content with the content below, including the [Alpine JS](https://github.com/alpinejs/alpine), [Tailwind CSS](https://tailwindcss.com/) and the [leanix-reporting](https://leanix.github.io/leanix-reporting/) dependencies, as well as the state variables and methods that we'll be using in our report:

```javascript
// src/index.js
import 'alpinejs'
import '@leanix/reporting'
import './assets/tailwind.css'

const  state = {
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
    // to be implemented...
  },
  mapResponseToRows () {
    // to be implemented
  },
  computeTableColumns () {
    // to be implemented
  }
}

window.initializeContext = () => {
  return {
    ...state,
    ...methods
  }
}
```



And finally edit the template of our *index.html* file as follows:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="application-name" content="leanix-custom-report-tutorial-05">
    <meta name="description" content="Transforming GraphQL data using Javascript Array methods">
    <meta name="author" content="LeanIX GmbH">
    <title>Tutorial 05: transforming GraphQL data using Javascript Array methods</title>
    <style>
      [x-cloak] { display: none; }
    </style>
  </head>
  <body
    x-data="initializeContext()"
    x-init="async () => {
      await initializeReport()
      fetchGraphQLData()
    }">
    <div x-cloak class="mx-auto h-screen">
      <div class="h-full flex flex-col pt-4">
        <div class="flex overflow-hidden h-full -pl-16">
          <div class="w-1/3 flex flex-col border mr-4 rounded bg-red-100">
            <div class="text-center py-2 text-xl uppercase font-semibold border-b bg-red-600 text-white rounded-t">
              GraphQL Query Response
            </div>
            <pre class="px-4 text-sm overflow-auto" x-text="JSON.stringify(response, null, 2)"></pre>
          </div>
          <div class="w-1/3 flex flex-col border mr-4 rounded bg-green-100">
            <div class="text-center py-2 text-xl uppercase font-semibold border-b bg-green-600 text-white rounded-t">
              Transformed Data
            </div>
            <pre class="px-4 text-sm overflow-auto" x-text="JSON.stringify(rows, null, 2)"></pre>
          </div>
        <div class="w-1/3 flex flex-col border mr-4 rounded bg-yellow-100">
          <div class="text-center py-2 text-xl uppercase font-semibold border-b bg-yellow-600 text-white rounded-t">
            Table View
          </div>
          <div class="overflow-auto px-4">
            <table class="table-fixed w-full text-sm text-center">
              <thead>
                <tr>
                  <template x-for="column in columns" :key="column.key">
                    <th class="px-4 py-1 text-base uppercase bg-white border" x-text="column.label"></th>
                    </template>
                  </tr>
              </thead>
              <tbody>
                <template x-for="(row, idx) in rows" :key="idx">
                  <tr class="bg-white">
                    <template x-for="column in columns" :key="column.key">
                      <td class="border px-4 py-2" x-text="row[column.key]"></td>
                    </template>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center h-48">
        <div class="bg-blue-600 text-white px-4 py-2 flex flex-col items-center rounded shadow">
          <div class="text-3xl uppercase font-bold">Average completion</div>
            <div class="text-6xl leading-none" x-text="avgCompletion"></div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
```
As you may have noticed, we have declared two [Alpine JS](https://github.com/alpinejs/alpine#learn) directives in the <code>body</code> tag of our HTML code, the [x-data](https://github.com/alpinejs/alpine#x-data) and the [x-init](https://github.com/alpinejs/alpine#x-init). The  [x-data](https://github.com/alpinejs/alpine#x-data) directive calls the global method *initializeContext*, declared in the *index.js* file, and sets the scope for our report. More specifically, the [x-data](https://github.com/alpinejs/alpine#x-data) directive makes available to our AlpineJS instance all the variables and methods that are declared in the *state* and *methods* attributes of our *index.js* file. On the other hand, the [x-init](https://github.com/alpinejs/alpine#x-init) directive triggers the *initializeReport* and *fetchGraphQLData* methods sequentially once the report is initialized.

Another detail which you may have noticed as well is the inclusion of an [x-cloak](https://github.com/alpinejs/alpine#x-cloak) directive on the first <code>div</code> child of the <code>body</code> tag of our html code. This directive is automatically removed by [Alpine JS](https://github.com/alpinejs/alpine) once the report is loaded, thus used as a technique for hiding the report elements until the report is fully loaded.

You may start the development server now by running the following command:
```bash
npm start
```
**Note!**

When you run *npm start*, a local webserver is hosted on *localhost:8080* that allows connections via HTTPS. But since just a development SSL certificate is created the browser might show a warning that the connection is not secure. You could either allow connections to this host anyways, or create your own self-signed certificate: https://www.tonyerwin.com/2014/09/generating-self-signed-ssl-certificates.html#MacKeyChainAccess.

If you decide to add a security exception to your localhost, make sure you open a second browser tab and point it to https://localhost:8080. Once the security exception is added to your browser, reload the original url of your development server and open the development console. Your should see a screen similar to the one below:
<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/OfIkQiN.png">
</div>

As you may have observed, our report is designed with a 3 column-layout that renders, from left to right, the raw data that is fetched from the workspace through a graphQL query, the transformed data, and the table view. Additionally, and below the three columns, you'll notice an extra blue box that will show the average completion ratio for our dataset.

## Querying the workspace data
The first step in our report is to fetch a list of applications in our workspace. As a side note, we are assuming that you are familiar with the [leanix-reporting](https://leanix.github.io/leanix-reporting/) API and know how to query your workspace data from a custom report. In case you need further information on this topic, we recommend that you have a brief look at this nice [tutorial](https://dev.leanix.net/docs/custom-report-querying-data) on the data querying topic.
Adjust the method *fetchGraphQLData* of your *index.js* file according the example below:
```javascript
// index.js
(...)
const  methods = {
  (...)
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
    // to be implemented, does nothing for now...
  }
}
(...)
```
Bear in mind that the *fetchGraphQLData* method is triggered once the report is loaded and initialized by the *x-init* directive defined earlier in the *body* tag of our *index.html* file. Notice also that we store the results of the graphQL query in the *response* state variable, defined also earlier, and that this variable is shown in our report's leftmost column.
<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/4AJhEzo.png">
</div>

If you take a closer look at the structure of the response received, you'll notice that it consists of a Javascript object containing a single attribute named *"allFactSheets"*. Looking further into it, we can see that it contains a single array sub-field named *"edges"* composed by multiple, single-attribute, *"node"* objects.

At a first sight, we can immediately recognize that this response data structure does not map directly into an array of rows suitable to be displayed as a table. Therefore some data transformation is in order and, for that, we'll implement it in our *mapResponseToRows* method.

## Mapping the graphQL query response into rows
In our table we are interested in showing, for each application, the *name* and *completion* ratio as percentage.
Therefore we need to map our *"response"* object into an array of objects - the *table rows*, each representing an application, and composed by the two aforementioned attributes - *name* and *completion*. For that, we take our state variable *"response"* that contains the results of the graphQL query made earlier, and destructure it by extracting the array *"allFactSheets.edges"*. Furthermore, we'll apply the [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) operator to this *"allFactSheets.edges"* array in order to extract the *"node"* object from each *"edge"*.  We store the result of this operation in the *"rows"* state variable, defined earlier, so that it can be shown in our report's center green column.

```javascript
// index.js
(...)
const  methods = {
  (...)
  mapResponseToRows () {
    if (this.response === null) return
    // destructure the this.response state variable, extracting the allFactSheets.edges array
    this.rows = this.response.allFactSheets.edges // <- this is an Array
      // and map each edge into its node attribute
      .map(edge => edge.node) // <- this is the Array map operator applied to it
  }
}
(...)
```
For additional intuition on the results of this operation, take a closer comparison look between the contents of the red and green columns of your report.
<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/sj96fwE.png">
</div>

As we can see from the picture above, we notice that each *"node"* of our transformed array contains, in fact, the *"name"* and "completion" attributes. However the *"completion"* attribute is still an object and not a percentage representation of its value. So, in order to make it right, we need to slightly change our mapping operation according the example below:
```javascript
// index.js
(...)
const  methods = {
  (...)
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
  }
}
(...)
```
If you take a look at the green column you'll realize that each array items contains now the application's *"name"*, *"completion"* percentage and the *"completionValue"* attributes. Altough we need only the *"name"* and *"completion"* attributes for our table, we'll use the *"completionValue"* attribute later for computing a statistic.
<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/cjZu7JP.png">
</div>

Now that we have our table rows properly mapped, there is still one pending task before they can be rendered as a table. If you take a look into your *src/index.html* template, defined earlier, and locate the ```<table>``` tag on it, you'll notice that it is using the state variable *"columns"* for mapping labels to columns - in the header, and rows to columns - in the body.
```html
<!-- src/index.html -->
<html>
  ...
      <table class="table-fixed w-full text-sm text-center">
        <thead>
          <tr>
            <template x-for="column in columns" :key="column.key">
              <th class="px-4 py-1 text-base uppercase bg-white border" x-text="column.label"></th>
            </template>
          </tr>
        </thead>
	<tbody>
	  <template x-for="(row, idx) in rows" :key="idx">
	    <tr class="bg-white">
	      <template x-for="column in columns" :key="column.key">
	        <td class="border px-4 py-2" x-text="row[column.key]"></td>
	      </template>
	    </tr>
	  </template>
	</tbody>
      </table>
  ...
</html>
```
The *"columns"* state variable was defined earlier as an empty array, and now we'll use it to store our table's column keys and labels. We'll use the [leanix-reporting](https://leanix.github.io/leanix-reporting/) [lx.translateField](https://leanix.github.io/leanix-reporting/classes/lxr.lxcustomreportlib.html#translatefield) method for mapping the application's attribute keys (*name* and *completion*) into a proper translated label to be shown in our table's header. For that, implement the *computeTableColumns* method as indicated below, not forgetting to call if at the end of the *mapResponseToRows* method.
```javascript
// index.js
const  state = {
  (...)
  // array to store the table's columns key and label
  columns: [],
  (...)
}
const  methods = {
  (...)
  mapResponseToRows () {
    if (this.response === null) return
    this.rows = this.response.allFactSheets.edges
      .map(edge => {
        let { name, completion } = edge.node
        const  completionValue = completion.completion
        completion = (completion.completion * 100).toFixed(1) + '%'
        return { name, completion, completionValue }
      })
    this.computeTableColumns() // <-- call the computeTableColumns method here!
  },
  computeTableColumns () {
    const  columnKeys = ['name', 'completion']
    this.columns = columnKeys
      .map(key  => ({ key, label:  lx.translateField('Application', key) }))
  }
}
(...)
```
You should be seeing now, in the third column of your report, the rendered table!
<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/BICSI3L.png">
</div>

Now that we have finished our data mapping exercise, we'll proceed  to explore the filtering feature of Javascript arrays.

## Filtering data
In this simple exercise, we'll demonstrate how to use the [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) method of Javascript [Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) for creating a version of our dataset according a certain filtering criteria.
Just as a side note, the LeanIX GraphQL API already provides a set of very powerful filtering features, which you should use whenever possible in your query. However, there are some scenarios in which the filtering criteria can only be defined after the data is queried and analyzed, either derived from a computed statistic or some other  complex factor. In those cases a client-side filtering implementation is required, and the [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) method will fit perfectly to those cases.
In our example, let's assume a simple scenario where we want to show in our table only the applications that have a completion ratio below 10%. This filter can be quickly implemented with a single line of code using the [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) method chained after the mapping operation of our *mapResponseToRows* method defined earlier.

```javascript
// index.js
(...)
const  methods = {
  (...)
  mapResponseToRows () {
    if (this.response === null) return
    this.rows = this.response.allFactSheets.edges
      .map(edge => {
        let { name, completion } = edge.node
        const  completionValue = completion.completion
        completion = (completion.completion * 100).toFixed(1) + '%'
        return { name, completion, completionValue }
      })
      .filter(row => row.completionValue < 0.1) // <- our filtering method

    this.computeTableColumns()
  }
}
(...)
```
If you have a look at the green and yellow columns, you'll notice that only those applications with a completion ratio below 10% are being shown.
<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/thXYNBY.png">
</div>

Now that we have covered the filtering exercise, we'll proceed to the last part of our tutorial in which we'll compute a statistic of our dataset using the [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) method of Javascript [Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## Compute average completion ratio
Having covered the [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) and [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) operators of Javascript [Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), we look now into the [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) operator. Reduce is a very powerful method that can be used to transform an array into either a single object with multiple attributes, a single number or another array.
We'll use this operator for computing the sum of the completion values of all our applications, which we'll after divide by the total number of applications in order to compute the average completion ratio of all our applications. Traditionally, this also can be done by traversing our *rows* array with a *for loop*, however the [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) operator provides us with a more compact and elegant way of doing it.
In your report, change the *mapResponseToRows* method according the example below. Take note that the computed average completion ratio of our dataset is stored in the *avgCompletion* state variable that is shown in the blue box in our report.

```javascript
// index.js
(...)
const  methods = {
  (...)
  mapResponseToRows () {
    if (this.response === null) return
    this.rows = this.response.allFactSheets.edges
      .map(edge => {
        let { name, completion } = edge.node
        const  completionValue = completion.completion
        completion = (completion.completion * 100).toFixed(1) + '%'
        return { name, completion, completionValue }
      })
    this.computeTableColumns()

    // We'll compute the sum of the completion ratio of all our applications
    const  completionSum = this.rows
      .reduce((accumulator, row) =>  accumulator + row.completionValue, 0)
    // and divide it by the number of applications and store it in percentage notation, rounded to 1 decimal places.
    this.avgCompletion = ((completionSum / this.rows.length) * 100).toFixed(1) + '%'
  }
}
(...)
```
Looking into our report we can confirm that the average completion ratio is indeed being shown in the blue box of our report.
<div  style="display:flex; justify-content:center">
  <img  src="https://i.imgur.com/lRsfqbm.png">
</div>

## Next steps
The [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) and [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) Javascript [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/) operators are very powerful tools that every serious Javascript developer should master and guard closely in their toolbox. They provide a very compact way of writing data processing blocks that allow to shape datasets into a specific structure, filter them according a certain criteria, and compute statistics. During this tutorial we have briefly illustrated their application to an implementation of a LeanIX custom report. However, we do strongly recommend that if you are not already familiar and at ease with those particular methods, or if you are new to Javascript programming, to read further about them as they will be certainly be of great help in your future custom-report implementations.

Good work and congratulations for completing this tutorial!