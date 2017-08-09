//TODO: Update the data with data from Tierion CarChain C
user = 'cjmg2006@gmail.com'
key = 'DiMw7Lp4WmuAK0cxMKxRLwQUlnaZEhmNBJ6LancuWuo='

var socket = io.connect('/');

/************************************************************/
// Functions to interact with Tierion 
/************************************************************/



// register the grid component
Vue.component('demo-grid', {
  template: '#grid-template',
  props: {
    data: Array,
    columns: Array,
    filterKey: String
  },
  data: function () {
    var sortOrders = {}
    this.columns.forEach(function (key) {
      sortOrders[key] = 1
    })
    return {
      sortKey: '',
      sortOrders: sortOrders
    }
  },
  computed: {
    filteredData: function () {
      var sortKey = this.sortKey
      var filterKey = this.filterKey && this.filterKey.toLowerCase()
      var order = this.sortOrders[sortKey] || 1
      var data = this.data
      if (filterKey) {
        data = data.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1
          })
        })
      }
      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          a = a[sortKey]
          b = b[sortKey]
          return (a === b ? 0 : a > b ? 1 : -1) * order
        })
      }
      return data
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1
    }
  }
})

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Change image 
function changeImage(status) { 
  console.log("changing images");
  var image = document.getElementById("merkle"); 
  if(status == 0) {
      image.src = "images/00.jpeg"; 
  } else if (status == 1) {
      image.src = "images/01.jpeg"; 
  } else {
      var rand = getRandomInt(1,2); 
      if(rand == 1) { 
        image.src = "images/02a.jpeg"; 
      } else { 
        image.src = "images/02b.jpeg"; 
      }
      
  }
}


socket.on("newEvent", function(data, status) {
	gridData.unshift(data);
  // console.log(status);
  changeImage(status);
  

})

socket.on("allEvents", function(data) {
	gridData = data;

	// bootstrap the demo
	var demo = new Vue({
	  el: '#demo',
	  data: {
	    searchQuery: '',
	    gridColumns: ['airbagID', 'status', 'vin', 'location'],
	    gridData
	  }
	})
})



