const notes = [
  { id: 1, text: "Revise HTML", done: true },
  { id: 2, text: "Practise CSS", done: false },
  { id: 3, text: "Learn JS", done: false },
];
 
// forEach: do something with every item
notes.forEach((note) => console.log(note.text));
 
// filter: build a NEW array with only matching items
const unfinished = notes.filter((note) => note.done === false);
console.log(unfinished.length); // 2
 
// find: get the FIRST matching item (or undefined)
const found = notes.find((note) => note.id === 3);
console.log(found.text); // "Learn JS"
 
// map: build a NEW array by transforming every item
const texts = notes.map((note) => note.text.toUpperCase());
console.log(texts); // ["REVISE HTML", "PRACTISE CSS", "LEARN JS"]