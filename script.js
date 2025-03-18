const mapArea = document.getElementById("map")
let allLaureates = [];
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
var map = L.map('map').setView([0, 0], 1);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
let markerGroup = L.layerGroup().addTo(map)
let continentGroup = L.layerGroup().addTo(map)

//chargement des prix nobels
async function loadNoblePrizes(url) {
    const res = await fetch(url);
    const data = await res.json();
    allLaureates.push(...data.laureates)
    countCoutryContinent();
    displayContinent(allLaureates);
}

function displayMarkers(laureates) {
    continentGroup.clearLayers();
    laureates.forEach(laureate => {
        console.log(laureate)
        // console.log(laureate.birth.place.cityNow.latitude)

        if ((laureate.birth?.place?.cityNow?.latitude)) {
            var marker = L.marker([parseFloat(laureate.birth.place.cityNow.latitude) + parseFloat(laureate.id / 100000), parseFloat(laureate.birth.place.cityNow.longitude) + parseFloat(laureate.id / 100000)]).addTo(markerGroup);
            marker.bindPopup(`${laureate.knownName.en}`)
        } else if ((laureate.birth?.place?.countryNow)) {
            var marker = L.marker([laureate.birth.place.countryNow.latitude, laureate.birth.place.countryNow.longitude]).addTo(markerGroup);
            marker.bindPopup(`${laureate.knownName.en}`)
        }
    });

}

function countCoutryContinent () {
    allLaureates.forEach(laureate => {
        if(laureate.birth?.place?.continent) {
            if (count.continent[`${(laureate.birth?.place?.continent.en).split(" ").join("")}`] === undefined) {
                count.continent[`${(laureate.birth?.place?.continent.en).split(" ").join("")}`] = 1;
                console.log(count)
            } else {
                count.continent[`${(laureate.birth?.place?.continent.en).split(" ").join("")}`]++;
            }
        }
        if(laureate.birth?.place?.country) {
            if (count.country[`${laureate.birth?.place?.country.en}`] === undefined) {
                count.country[`${laureate.birth?.place?.country.en}`] = 1;
                console.log(count)
            } else {
                count.country[`${laureate.birth?.place?.country.en}`]++;
            }
        }
    })

}

function displayContinent(laureates) {
    markerGroup.clearLayers();
    for (const cont in count.continent) {
        console.log(cont)
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
loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=0&limit=500');


mapArea.addEventListener('wheel', () => {
    setTimeout(() => {
        console.log(map.getZoom())
       if (map.getZoom() > 4) {
        displayMarkers(allLaureates)
       } else {
        displayContinent(allLaureates)
       }
    }, 500)
})
// marker.on('click', () => {
//     alert("hello")
// })