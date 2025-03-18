const mapArea = document.getElementById("map")
let allLaureates = [];

//création de la carte
var map = L.map('map').setView([0, 0], 1);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//chargement des prix nobels
async function loadNoblePrizes(url) {
    const res = await fetch(url);
    const data = await res.json();
    allLaureates.push(...data.laureates)
    displayContinent(allLaureates);
}

let markerGroup = L.layerGroup().addTo(map)
function displayMarkers(laureates) {
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
function displayContinent(laureates) {
    let asia = 0;
    let eu = 0;
    let africa = 0;
    let na = 0;
    let sa = 0;
    let oceania = 0;
    markerGroup.clearLayers();
    allLaureates.forEach(laureate => {
        if (laureate.birth?.place?.continent) {

            if (laureate.birth.place.continent = "North America") na++;
            if (laureate.birth.place.continent = "Oceania") oceania++;
            if (laureate.birth.place.continent = "Europe") eu++;
            if (laureate.birth.place.continent = "South America") sa++;
            if (laureate.birth.place.continent = "Asia") asia++;
            if (laureate.birth.place.continent = "Africa") africa++;
        }
    })
    console.log(eu)
    var circle = L.circle([48, 9], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.5,
        radius: 500000
    }).addTo(map);
    var marker = L.marker([48, 9], {
        icon: L.divIcon({
            className: 'cicle-label',
            html: `${eu}`,
            iconSize: [50,50],
            iconAnchor: [10,10]
        })
    }).addTo(map)
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