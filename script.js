const mapArea = document.getElementById("map")
let allLaureates = [];
let which = 0;
let count = {
    continent: {},
    country: {}
}
let continentPos = {
    Africa: {
        latitude:7.4,
        longitude:20
    },
    Asia : {
        latitude: 51.8,
        longitude: 82.7
    },
    Europe: {
        latitude: 48,
        longitude: 9
    },
    NorthAmerica: {
        latitude: 33.5,
        longitude: -98.8
    },
    SouthAmerica: {
        latitude: -13.9,
        longitude: -56.9
    },
    Oceania: {
        latitude: -26,
        longitude: 136.5
    }
}

//création de la carte
var map = L.map('map', {
    worldCopyJump: true,
}).setView([35.9,34.2], 2);

map.setMinZoom(2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    continuousWorld: true,
    noWrap: false,
    Bound: L.latLngBounds([-256,0],[0,256]),                                                                   
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let markerGroup = L.layerGroup().addTo(map);
let continentGroup = L.layerGroup().addTo(map);
let countryGroup = L.layerGroup().addTo(map);

//chargement des prix nobels
async function loadNoblePrizes(url) {
    const res = await fetch(url);
    const data = await res.json();
    allLaureates.push(...data.laureates)
    //même chose que :
    //  data.laureates.forEach(laureate => {
    //     allLaureates.push(laureate)
    // })
    countCountryContinent();

}


function countCountryContinent () {
    allLaureates.forEach(laureate => {
        if (laureate.birth?.place?.continent) {
            if (count.continent[`${(laureate.birth?.place?.continent.en).split(" ").join("")}`] === undefined) {
                count.continent[`${(laureate.birth?.place?.continent.en).split(" ").join("")}`] = 1;
            } else {
                count.continent[`${(laureate.birth?.place?.continent.en).split(" ").join("")}`]++;
            }
        }
        if (laureate.birth?.place?.countryNow) {
            if (count.country[`${(laureate.birth?.place?.countryNow.en).split(" ").join("")}`] === undefined) {
                count.country[`${(laureate.birth?.place?.countryNow.en).split(" ").join("")}`] = {
                    number: 1,
                    latitude: laureate.birth.place.countryNow.latitude,
                    longitude: laureate.birth.place.countryNow.longitude    
                }
            } else {
                count.country[`${(laureate.birth?.place?.countryNow.en).split(" ").join("")}`].number++;
            }
        }
    })

}

function displayMarkers(laureates) {
    continentGroup.clearLayers();
    countryGroup.clearLayers();
    which = 1;
    laureates.forEach(laureate => {
        if ((laureate.birth?.place?.cityNow?.latitude)) {
            var marker = L.marker([parseFloat(laureate.birth.place.cityNow.latitude) + parseFloat(laureate.id / 100000), parseFloat(laureate.birth.place.cityNow.longitude) + parseFloat(laureate.id / 100000)]).addTo(markerGroup);
            marker.bindPopup(`${laureate.knownName.en}`)
        } else if ((laureate.birth?.place?.countryNow)) {
            var marker = L.marker([laureate.birth.place.countryNow.latitude, laureate.birth.place.countryNow.longitude]).addTo(markerGroup);
            marker.bindPopup(`${laureate.knownName.en}`)
        }
    });

}

function displayContinent(laureates) {
    markerGroup.clearLayers();
    countryGroup.clearLayers();
    which = -1;
    for (const cont in count.continent) {
   
        // console.log(cont)
        var circle = L.circle([continentPos[`${cont}`].latitude, continentPos[`${cont}`].longitude], {
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.5,
            radius: 500000
        }).addTo(continentGroup);
        var marker = L.marker([continentPos[`${cont}`].latitude, continentPos[`${cont}`].longitude], {
            icon: L.divIcon({
                className: 'cicle-label',
                html: `${count.continent[cont]}`,
                iconSize: [50,50],
                iconAnchor: [10,10]
            })
        }).addTo(continentGroup)
       
    }
}


function displayCountry(laureates) {
    markerGroup.clearLayers();
    continentGroup.clearLayers();
    which = 0;
    for (const cont in count.country) {
        var circle = L.circle([count.country[`${cont}`].latitude,count.country[`${cont}`].longitude] , {
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.5,
            radius: 100000
        }).addTo(countryGroup);
        var marker = L.marker([count.country[`${cont}`].latitude,count.country[`${cont}`].longitude], {
            icon: L.divIcon({
                className: 'cicle-label',
                html: `${count.country[cont].number}`,
                iconSize: [50,50],
                iconAnchor: [5,10]
            })
        }).addTo(countryGroup)
       
    }
}


loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=0&limit=500');
loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=500&limit=504');
setTimeout(() => {
    displayContinent(allLaureates)
},800)

mapArea.addEventListener('wheel', () => {
    setTimeout(() => {
        console.log(map.getZoom())
        console.log(which)
       if (map.getZoom() > 4 && which <= 0)  {
        displayMarkers(allLaureates)
       } else if (map.getZoom() == 4 && which!=0) {
        displayCountry(allLaureates)
       
       } else if (map.getZoom() < 4 && which >= 0){
        displayContinent(allLaureates)
       }
    }, 500)
    console.log(count.country)
})
