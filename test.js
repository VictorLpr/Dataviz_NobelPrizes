async function test(url) {
  const res = await fetch(url);
  const data = await res.text();
  return data;
}

let message = await test("https://www.wikidata.org/wiki/Q127349");
// console.log(message)
let x = `<span><img src="`;
let i = message.indexOf(x) + x.length;
let img = "";
while (message[i] != `"`) {
  img += message[i];
  i++;
}
console.log(img);
