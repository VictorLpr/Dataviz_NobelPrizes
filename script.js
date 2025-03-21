const mapArea = document.getElementById("map");
const genderFilter = document.getElementById("gender-filter");
const categoryFilter = document.getElementById("category-filter");
const applyFilters = document.getElementById("apply-filters");
const startYear = document.getElementById("start-year")
const endYear = document.getElementById("end-year")

let allLaureates = [];
let filteredLaureates = [];
let filteredBycountry = [];
let which = 0;
let count = {};
let continentPos = {
    Africa: {
        latitude: 7.4,
        longitude: 20
    },
    Asia: {
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
};


//création de la carte
var map = L.map('map', {
    worldCopyJump: true,
}).setView([35.9, 34.2], 2);

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
    for (let year = startYear.value; year <= 2025; year++) {
        endYear.innerHTML += `<option value="${year}">${year}</option>`;

    };
    if (selectedYear >= startYear.value) endYear.value = selectedYear;
}

function updateStartYear() {
    let selectedYear = startYear.value;
    startYear.innerHTML = `<option value="">start year</option>`;
    for (let year = 1901; year <= endYear.value; year++) {
        startYear.innerHTML += `<option value="${year}">${year}</option>`;

    };
    if (selectedYear <= endYear.value) startYear.value = selectedYear;
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
    count = {
        continent: {},
        country: {}
    }
    laureates.forEach(laureate => {
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

async function wikiImgUrl(article) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(article)}&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    const pages = Object.values(data.query.pages);
    let imageTitles = [];
    console.log(pages)
    if (!pages[0].images) return "";
    imageTitles = pages[0].images.map((img) => img.title);
    article = article.split("_").join(" ");
    imageTitles = imageTitles.filter((img) => img.toLowerCase().includes(article.slice(0,4).toLowerCase()));
    if (imageTitles.length == 0) return "";
    const imgResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(imageTitles[0])}&prop=imageinfo&iiprop=url&format=json&origin=*`);
    const imgData = await imgResponse.json();
    const imgPages = Object.values(imgData.query.pages);
    return imgPages[0].imageinfo[0].url;
}

function displayMarkers(laureates) {
    clearAllLayers();
    which = 1;

    laureates.forEach(laureate => {
        
        if ((laureate.birth?.place?.cityNow?.latitude)) {
            var marker = L.marker([parseFloat(laureate.birth.place.cityNow.latitude) + parseFloat(laureate.id / 100000), parseFloat(laureate.birth.place.cityNow.longitude) + parseFloat(laureate.id / 100000)]).addTo(markerGroup);
            
        } else if ((laureate.birth?.place?.countryNow)) {
            var marker = L.marker([laureate.birth.place.countryNow.latitude, laureate.birth.place.countryNow.longitude]).addTo(markerGroup);
            
        }
        if (marker) {            
            marker.on("click",async () => {
                let content = `<span>name</span> : ${laureate.knownName?.en ? laureate.knownName.en : laureate.fileName}<br><span>birth date</span> : ${laureate.birth?.date ? laureate.birth.date : "unknown"}`
                if (laureate.death) {
                    content += `<br> <span>death date</span> : ${laureate.death.date}`
                };
                content += `<br><span>category</span> : ${laureate.nobelPrizes[0].category.en} <br> <span>award year</span> : ${laureate.nobelPrizes[0].awardYear}<br><span>motivation</span> : ${laureate.nobelPrizes[0].motivation.en}`;
                let img = await wikiImgUrl(laureate.wikipedia.slug)
                content += `<br><img src="${img}" style="width:100px;">`
                marker.bindPopup(content).openPopup();


            })
        }
    });

}

function displayContinent() {
    clearAllLayers();

    which = -1;
    for (const cont in count.continent) {
        var circle = L.circle([continentPos[`${cont}`].latitude, continentPos[`${cont}`].longitude], {
            color: '#588157',
            fillColor: '#588157',
            fillOpacity: 0.5,
            radius: 500000
        }).addTo(continentGroup);
        var marker = L.marker([continentPos[`${cont}`].latitude, continentPos[`${cont}`].longitude], {
            icon: L.divIcon({
                className: 'circle-label',
                html: `<span style='color:#344E41'>${count.continent[cont]}</span>`,
                iconSize: [50, 50],
                iconAnchor: [count.continent[cont]>100 ? 10 : 7, 10]
            })
        }).addTo(continentGroup)
        marker.on("click", () => {
            map.setView([continentPos[`${cont}`].latitude, continentPos[`${cont}`].longitude], 4);
            displayCountry();
        })
    }
}


function displayCountry() {
    clearAllLayers();
    which = 0;
    for (const cont in count.country) {
        var circle = L.circle([cont == "UnitedKingdom" ? 51.6 : count.country[`${cont}`].latitude,cont == "UnitedKingdom" ? -0.79 : count.country[`${cont}`].longitude], {
            color: '#588157',
            fillColor: '#588157',
            fillOpacity: 0.8,
            radius: 100000
        }).addTo(countryGroup);
        var marker = L.marker([cont == "UnitedKingdom" ? 51.6 : count.country[`${cont}`].latitude,cont == "UnitedKingdom" ? -0.79 : count.country[`${cont}`].longitude], {
            icon: L.divIcon({
                className: 'cicle-label',
                html: `<span style='color:white'>${count.country[cont].number}</span`,
                iconSize: [50, 50],
                iconAnchor: [count.country[cont].number > 100 ? 10 : count.country[cont].number > 10 ? 7 : 4, 10]
            })
        }).addTo(countryGroup)
        marker.on("click", () => {
            map.setView([count.country[`${cont}`].latitude, count.country[`${cont}`].longitude], 5);
            filterByCountry(cont);
            displayMarkers(filteredBycountry);
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
    countCountryContinent(filteredLaureates);
    which = 2;
    whichDisplay(filteredLaureates)
}

function filterByCountry(country) {
    filteredBycountry = [];
    for (let i = 0; i < filteredLaureates.length; i++) {
        if (filteredLaureates[i].birth?.place?.countryNow.en.split(" ").join("") == country) {
            filteredBycountry.push(filteredLaureates[i]);
        }
    }
}

function whichDisplay(laureate) {
    if (map.getZoom() > 4 && which != 1) {
        displayMarkers(laureate)
    } else if (map.getZoom() == 4 && which != 0) {
        displayCountry()

    } else if (map.getZoom() < 4 && which != -1) {
        displayContinent()
    }
}

loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=0&limit=500');
loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=500&limit=504');
setTimeout(() => {
    filteredLaureates = allLaureates;
    countCountryContinent(allLaureates);
    displayContinent(filteredLaureates)
}, 800)

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