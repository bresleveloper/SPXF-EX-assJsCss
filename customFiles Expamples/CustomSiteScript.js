

console.log('add BresleveloperScriptTag to end of body');
let BresleveloperScriptTag = document.createElement("script");
BresleveloperScriptTag.src = `/CustomFiles/Bresleveloper.js`;
BresleveloperScriptTag.type = "text/javascript";
BresleveloperScriptTag.onload = BresleveloperOnload;
document.body.appendChild(BresleveloperScriptTag);

function BresleveloperOnload() {
    console.log('Bresleveloper.js is here!');
    //your code
}