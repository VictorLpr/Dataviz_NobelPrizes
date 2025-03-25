const displayNames = document.querySelector('.display-names')
const allLaureates = [];

async function loadNoblePrizes(url) {
    const res = await fetch(url);
    const data = await res.json();
    allLaureates.push(...data.laureates);
};

const displayLaureateNames = async () => {
    await loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=500&limit=504');
    allLaureates.forEach((laureate, index) => {
        console.log(index)
        if(laureate.knownName) {
        console.log(laureate.knownName.en);
        displayNames.innerHTML += `<p>${laureate.knownName.en}</p>`;
        }
        
    });
};

displayLaureateNames();