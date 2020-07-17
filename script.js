window.onload = () => {
  getCountriesData();
  getWorldCoronaData();
  gethistoricaldata();
};
var map;
let mapCircles = [];
let coronaGlobalData;
var casesTypeColors = {
  cases: "#1d2c4d",
  active: "#9d80fe",
  recovered: "#7dd71d",
  deaths: "#fb4443",
};
let worldwideselection = {
  name: "Worldwide",
  value: "WWW",
  selected: true,
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 39.8283,
      lng: -98.5795,
    },
    zoom: 3,
  });
}
const setMapCenter = (lat, long, zoom) => {
  map.setZoom(zoom);
  map.panTo({
    lat: lat,
    lng: long,
  });
};
const initdropdown = (searchlist) => {
  $(".ui.dropdown").dropdown({
    values: searchlist,
    onChange: function (value, text) {
      if (value != worldwideselection.value) {
        getCountryData(value);
      } else {
        getWorldCoronaData();
      }
    },
  });
};
const changedataselection = (elem, casesType) => {
  clearmap();
  showdataonmap(coronaGlobalData, casesType);
  setactivetab(elem);
};
const setactivetab = (elem) => {
  const activelem = document.querySelector(".card.active");
  activelem.classList.remove("active");
  elem.classList.toggle("active");
};

const setsearchlist = (data) => {
  let searchlist = [];
  searchlist.push(worldwideselection);
  data.forEach((countryData) => {
    searchlist.push({
      name: countryData.country,
      value: countryData.countryInfo.iso3,
    });
  });
  initdropdown(searchlist);
};
const clearmap = () => {
  for (let Circle of mapCircles) {
    Circle.setMap(null);
  }
};
const getCountriesData = () => {
  fetch("https://corona.lmao.ninja/v2/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      coronaGlobalData = data;
      setsearchlist(data);
      showdataonmap(data);
      showdataontable(data);
    });
};
const getCountryData = (countryIso) => {
  const url = "https://disease.sh/v3/covid-19/countries/" + countryIso;
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      setMapCenter(data.countryInfo.lat, data.countryInfo.long, 3);
      getsatsdata(data);
    });
};
const getWorldCoronaData = () => {
  fetch("https://disease.sh/v2/all")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      buildPieChart(data);
      getsatsdata(data);
      setMapCenter(mapCenter.lat, mapCenter.lng, 2);
    });
};
const gethistoricaldata = () => {
  fetch("https://disease.sh/v2/historical/all?lastdays=120")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let chartData = buildchartdata(data);
      buildchart(chartData);
    });
};
const getsatsdata = (data) => {
  let addedcases = numeral(data.todayCases).format("+0,0");
  let addedrecovered = numeral(data.todayRecovered).format("+0,0");
  let addeddeaths = numeral(data.todayDeaths).format("+0,0");
  let totalcases = numeral(data.cases).format("0.0a");
  let totalrecovered = numeral(data.recovered).format("0.0a");
  let totaldeaths = numeral(data.deaths).format("0.0a");
  document.querySelector(".total-number").innerHTML = addedcases;
  document.querySelector(".recovered-number").innerHTML = addedrecovered;
  document.querySelector(".deaths-number").innerHTML = addeddeaths;
  document.querySelector(".cases-total").innerHTML = `${totalcases} Total`;
  document.querySelector(
    ".recovered-total"
  ).innerHTML = `${totalrecovered} Total`;
  document.querySelector(".deaths-total").innerHTML = `${totaldeaths} Total`;
};
const openInfoWindow = () => {
  infoWindow.open(map);
};

const buildchartdata = (data) => {
  let chartData = [];
  for (let date in data.cases) {
    let newdatapoint = {
      x: date,
      y: data.cases[date],
    };
    chartData.push(newdatapoint);
  }

  return chartData;
};

const buildchart = (chartData) => {
  var timeFormat = "M/DD/YY";
  var ctx = document.getElementById("myChart").getContext("2d");
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      datasets: [
        {
          label: "Total Cases",
          backgroundColor: "#fe5575",
          borderColor: "#fe5575",
          data: chartData,
        },
      ],
    },

    // Configuration options go here
    options: {
      maintainAspectRatio: false,
      tooltips: {
        mode: "index",
        intersect: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              format: timeFormat,
              tooltipFormat: "ll",
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return numeral(value).format("0a");
              },
            },
          },
        ],
      },
    },
  });
};
const buildPieChart = (data) => {
  var ctx = document.getElementById("myPieChart").getContext("2d");
  var myPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      datasets: [
        {
          data: [data.active, data.recovered, data.deaths],
          backgroundColor: ["#9d80fe", "#7dd71d", "#fe5575"],
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ["Active", "Recovered", "Deaths"],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};
const showdataonmap = (data, casesType = "cases") => {
  data.map((country) => {
    let countrycenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    var countryCircle = new google.maps.Circle({
      strokeColor: casesTypeColors[casesType],
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: casesTypeColors[casesType],
      fillOpacity: 0.35,
      map: map,
      center: countrycenter,
      radius: country[casesType],
    });
    mapCircles.push(countryCircle);

    var html = `
          <div class="info-container">
            <div class="info-flag" style="background-image: url(${country.countryInfo.flag}")></div>
            <div class ="info-name">${country.country}</div>
            <div class="info-confirmed">Total: ${country.cases}</div>
            <div class="info-recovered">Recovered: ${country.recovered}</div>
            <div class="info-deaths">Deaths: ${country.deaths}</div>
          </div>
        `;

    var infoWindow = new google.maps.InfoWindow({
      content: html,
      position: countryCircle.center,
    });
    google.maps.event.addListener(countryCircle, "mouseover", function () {
      infoWindow.open(map);
    });
    google.maps.event.addListener(countryCircle, "mouseout", function () {
      infoWindow.close(map);
    });
  });
};

const showdataontable = (data) => {
  var html = "";
  data.forEach((country) => {
    html += `
            <tr>
                    <td><img src ="${country.countryInfo.flag}") style = "width:20px"> ${country.country}</td>
                    <td>${country.cases}</td>
                    <td>${country.recovered}</td>
                    <td>${country.deaths}</td>
            </tr>
        `;
  });
  document.getElementById("table-data").innerHTML = html;
};
