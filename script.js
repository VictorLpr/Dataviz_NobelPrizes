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
    center: [0,0],
    zoom: 2,
    worldCopyJump: true,
    maxBounds : [[-90,180],[90,180]],
    maxBoundsViscosity: 0.0

}).setView([35.9,34.2], 2);
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
                console.log(count.continent)
            }
        }
        if (laureate.birth?.place?.country) {
            if (count.country[`${laureate.birth?.place?.country.en}`] === undefined) {
                count.country[`${laureate.birth?.place?.country.en}`] = 1;
            } else {
                count.country[`${laureate.birth?.place?.country.en}`]++;
            }
        }
    })
    
}

function displayMarkers(laureates) {
    continentGroup.clearLayers();
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
    which = -1;
    for (const cont in count.continent) {
        console.log(count.continent[cont])
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
loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=500&limit=504');
setTimeout(() => {
    displayContinent(allLaureates)
},800)

mapArea.addEventListener('wheel', () => {
    setTimeout(() => {
        console.log(which)
       if (map.getZoom() > 4 && which <= 0)  {
        displayMarkers(allLaureates)
       } else if (map.getZoom() < 5 && which >= 0){
        displayContinent(allLaureates)
       }
    }, 500)
})
