var map = L.map('map').setView([0, 0], 1);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

async function loadNoblePrizes(url) {
    const res = await fetch(url);
    const data = await res.json();
    data.laureates.forEach(laureate => {
        console.log(laureate)
        // console.log(laureate.birth.place.cityNow.latitude)
        
        if ((laureate.birth?.place?.cityNow?.latitude)) {
            var marker = L.marker([laureate.birth.place.cityNow.latitude, laureate.birth.place.cityNow.longitude]).addTo(map);
            marker.bindPopup(`${laureate.knownName.en}`)
        } else if ((laureate.birth?.place?.countryNow)) {
            var marker = L.marker([laureate.birth.place.countryNow.latitude, laureate.birth.place.countryNow.longitude]).addTo(map);
            marker.bindPopup(`${laureate.knownName.en}`)
        }
    });
    
}
loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=0&limit=1000')

// marker.on('click', () => {
//     alert("hello")
// })