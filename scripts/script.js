import { continentPos } from "./data.js";
const mapArea = document.getElementById("map");
const genderFilter = document.getElementById("gender-filter");
const categoryFilter = document.getElementById("category-filter");
const applyFilters = document.getElementById("apply-filters");
const startYear = document.getElementById("start-year")
const endYear = document.getElementById("end-year")

let allLaureates = [];
let filteredLaureates = [];
let which = 0;

//création de la carte
var map = L.map('map', {
    worldCopyJump: true,
}).setView([22, 34.2], 3);

map.setMinZoom(2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    continuousWorld: true,
    noWrap: false,
    Bound: L.latLngBounds([-90, -180], [90, 180]),
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// var Stadia_StamenWatercolor = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
// 	minZoom: 1,
// 	maxZoom: 16,
// 	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// 	ext: 'jpg'
// }).addTo(map);

let markerGroup = L.layerGroup().addTo(map);
let continentGroup = L.layerGroup().addTo(map);
let countryGroup = L.layerGroup().addTo(map);

for (let year = 1900; year <= 2025; year++) {
    startYear.innerHTML += `<option value="${year}">${year}</option>`;
    endYear.innerHTML += `<option value="${year}">${year}</option>`;

};

function updateEndYear() {
    let selectedYear = endYear.value;
    endYear.innerHTML = `<option value="">end year</option>`;
    for (let year = startYear.value ? startYear.value : 1901; year <= 2025; year++) {
        endYear.innerHTML += `<option value="${year}">${year}</option>`;

    };
    if (selectedYear >= startYear.value) endYear.value = selectedYear;
}

function updateStartYear() {
    let selectedYear = startYear.value;
    startYear.innerHTML = `<option value="">start year</option>`;
    let end = endYear.value ? endYear.value : 2025;
    for (let year = 1901; year <= end; year++) {
        startYear.innerHTML += `<option value="${year}">${year}</option>`;

    };
    startYear.value = selectedYear;
}
//chargement des prix nobels
async function loadNoblePrizes(url) {
    const res = await fetch(url);
    const data = await res.json();
    allLaureates.push(...data.laureates)
    //même chose que :
    //  data.laureates.forEach(laureate => {
    //     allLaureates.push(laureate)
    // })

}


function countCountryContinent(laureates) {
    let count = {
        continent: {},
        country: {}
    }
    laureates.forEach(laureate => {
        if (laureate.birth?.place?.continent) {
            let countryName = (laureate.birth.place.continent.en).split(" ").join("")
            if (count.continent[countryName] === undefined) {
                count.continent[countryName] = 1;
            } else {
                count.continent[countryName]++;
            }
        }
        if (laureate.birth?.place?.countryNow) {
            let continentName = (laureate.birth.place.countryNow.en).split(" ").join("")
            if (count.country[continentName] === undefined) {
                count.country[continentName] = {
                    number: 1,
                    latitude: laureate.birth.place.countryNow.latitude,
                    longitude: laureate.birth.place.countryNow.longitude
                }
            } else {
                count.country[continentName].number++;
            }
        }
    })
    return count

}

async function wikiImgUrl(article) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(article)}&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    const pages = Object.values(data.query.pages);
    let imageTitles = [];
    if (!pages[0].images) return "";
    imageTitles = pages[0].images.map((img) => img.title);
    article = article.split("_").join(" ");
    imageTitles = imageTitles.filter((img) => img.toLowerCase().includes(article.slice(0, 3).toLowerCase()));
    if (imageTitles.length == 0) return "";
    const imgResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(imageTitles[0])}&prop=imageinfo&iiprop=url&format=json&origin=*`);
    const imgData = await imgResponse.json();
    const imgPages = Object.values(imgData.query.pages);
    return imgPages[0].imageinfo[0].url;
}

function displayMarkers(laureates) {
    clearAllLayers();
    which = 1;
    let markers = {};
    laureates.forEach(laureate => {

        if ((laureate.birth?.place?.cityNow?.latitude)) {
            let pos = `${laureate.birth.place.cityNow.latitude},${laureate.birth.place.cityNow.longitude}`
            if (!(markers[pos])) {
                markers[pos] = []
            }
            markers[pos].push(laureate);

        } else if ((laureate.birth?.place?.countryNow)) {
            let pos = `${laureate.birth.place.countryNow.latitude},${laureate.birth.place.countryNow.longitude}`
            if (!(markers[pos])) {
                markers[pos] = [];
            }
            markers[pos].push(laureate);

        }

    });
    for (const [pos, laureates] of Object.entries(markers)) {
        let [lat, long] = (pos.split(","))
        lat = parseFloat(lat)
        long = parseFloat(long)
        let rad = 0.1;
        let totalLaureates = laureates.length

        laureates.forEach((laureate,index) => {
            let angle = (2 * Math.PI / totalLaureates) * index
            let x = rad * Math.cos(angle)
            let y = rad * Math.sin(angle)
            let category = laureate.nobelPrizes[0].category.en.toLowerCase();

            const emojiMap = {
                physics: "🔭",
                chemistry: "⚗️",
                physiologyormedicine: "🩺",
                literature: "📖",
                peace: "🕊️",
                economicsciences: "📊",
            };
            const emoji = emojiMap[category] || "🏆";

            let marker = L.marker([lat + x, long + y], {
                icon: L.divIcon({
                    className: 'emoji-marker',
                    html: `<span style="font-size: 24px;">${emoji}</span>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(markerGroup);
            
            if (marker) {
                marker.on("click", async () => {
                    let img = await wikiImgUrl(laureate.wikipedia.slug)
                    let content = img ? `<img src="${img}">` : "";
                    content += `<p><span>Name</span> : ${laureate.knownName?.en ? laureate.knownName.en : laureate.fileName}</p>`
                    content += `<p><span>Birth date</span> : ${laureate.birth?.date ? laureate.birth.date : "unknown"}</p>`
                    if (laureate.death) {
                        content += `<p> <span>Death date</span> : ${laureate.death.date}</p>`
                    };
                    content += `<p><span>Category</span> : ${laureate.nobelPrizes[0].category.en}</p>`
                    content += `<p><span>Award year</span> : ${laureate.nobelPrizes[0].awardYear}</p><p><span>motivation</span> : ${laureate.nobelPrizes[0].motivation.en}</p>`;
                    marker.bindPopup(content).openPopup();
        
        
                })
            }
        })
        
    }
    
}

function displayContinent(count) {
    clearAllLayers();

    which = -1;
    for (const cont in count.continent) {
        let latLong = [continentPos[`${cont}`].latitude, continentPos[`${cont}`].longitude]
        var circle = L.circle(latLong, {
            color: '#588157',
            fillColor: '#588157',
            fillOpacity: 0.8,
            radius: 500000
        }).addTo(continentGroup);
        var marker = L.marker(latLong, {
            icon: L.divIcon({
                className: 'circle-label',
                html: `<span class="circle">${count.continent[cont]}</span>`,
                iconSize: [50, 50],
                iconAnchor: [count.continent[cont] > 100 ? 10 : 7, 10]
            })
        }).addTo(continentGroup)
        marker.on("click", () => {
            map.setView(latLong, 4);
            displayCountry(countCountryContinent(filteredLaureates));
        })
    }
}


function displayCountry(count) {
    clearAllLayers();
    which = 0;
    for (const cont in count.country) {
        let latLong = [cont == "UnitedKingdom" ? 51.6 : count.country[`${cont}`].latitude, cont == "UnitedKingdom" ? -0.79 : count.country[`${cont}`].longitude]
        var circle = L.circle(latLong, {
            color: '#588157',
            fillColor: '#588157',
            fillOpacity: 0.8,
            radius: 100000
        }).addTo(countryGroup);
        var marker = L.marker(latLong, {
            icon: L.divIcon({
                className: 'circle-label',
                html: `<span class='circle'>${count.country[cont].number}</span>`,
                iconSize: [50, 50],
                iconAnchor: [count.country[cont].number > 100 ? 10 : count.country[cont].number >= 10 ? 7 : 4, 10]
            })
        }).addTo(countryGroup)
        marker.on("click", () => {
            map.setView(latLong, 5);
            displayMarkers(filterByCountry(cont));
        })

    }
}

function clearAllLayers() {
    markerGroup.clearLayers();
    continentGroup.clearLayers();
    countryGroup.clearLayers();
}

function filterLaureates() {
    filteredLaureates = allLaureates.filter((laureate) => {
        let genderMatch = genderFilter.value ? laureate.gender === genderFilter.value : true;
        let categoryMatch = categoryFilter.value ? laureate.nobelPrizes[0].category.en === categoryFilter.value : true;
        let startYearFilter = startYear.value ? startYear.value <= laureate.nobelPrizes[0].awardYear : true;
        let endYearFilter = endYear.value ? endYear.value >= laureate.nobelPrizes[0].awardYear : true;

        return genderMatch && categoryMatch && startYearFilter && endYearFilter;
    })
    which = 2;
    whichDisplay(filteredLaureates)
}

function filterByCountry(country) {
    let filteredBycountry = [];
    for (let i = 0; i < filteredLaureates.length; i++) {
        if (filteredLaureates[i].birth?.place?.countryNow.en.split(" ").join("") == country) {
            filteredBycountry.push(filteredLaureates[i]);
        }
    }
    return filteredBycountry
}

function whichDisplay(laureate) {
    if (map.getZoom() > 4 && which != 1) {
        displayMarkers(laureate)
    } else if (map.getZoom() == 4 && which != 0) {
        displayCountry(countCountryContinent(laureate))

    } else if (map.getZoom() < 4 && which != -1) {
        displayContinent(countCountryContinent(laureate))
    }
}

async function firstLoad() {
    await loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=0&limit=500');
    await loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=500&limit=504');
    filteredLaureates = allLaureates;
    whichDisplay(allLaureates);
}

firstLoad();

mapArea.addEventListener('wheel', () => {
    setTimeout(() => {
        whichDisplay(filteredLaureates);
    }, 500)
})

applyFilters.addEventListener("click", () => {
    filterLaureates();
});

startYear.addEventListener("change", () => {
    updateEndYear();
})

endYear.addEventListener("change", () => {
    updateStartYear();
})