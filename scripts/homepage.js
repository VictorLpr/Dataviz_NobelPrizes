const displayNames = document.querySelector('.display-names')
const allLaureates = [];

async function loadNoblePrizes(url) {
    const res = await fetch(url);
    const data = await res.json();
    allLaureates.push(...data.laureates);
};

const displayLaureateNames = async () => {
    await loadNoblePrizes('https://api.nobelprize.org/2.1/laureates?offset=500&limit=504');
    allLaureates.some((laureate, index) => {
        if (laureate.knownName) {
            document.querySelector(`.ligne${(index % 5) + 1}`).innerHTML += `<p>${laureate.knownName.en}</p>`;
        }
        if (index == 100) {
            return true
        }

    });
};



displayLaureateNames();
