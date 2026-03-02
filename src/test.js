import emoji from 'unicode-emoji-json' with {type: 'json'};

let i = 0;
for (const key of Object.keys(emoji)) i++;

console.log(i)
