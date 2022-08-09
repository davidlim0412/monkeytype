const textbox = document.getElementById('textbox');
const count = document.getElementById('count');
const timerDisplay = document.getElementById('timer');
var typed = [];
var currentWord = [];
var wordlist;
let end = false;
let caretPos = 0;
let caretPosLine = 0;
var rows = [];
rows.push([]);

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

async function fetchLibrary() {
    const result = await fetch('monkeytype/1-1000.txt');
    const data = await result.text();
    const wordLibrary = await data.split('\n');
    let wordlistasync = [];
    for (let i = 0; i < 25; i++) {
        wordlistasync.push(wordLibrary[getRndInteger(0, wordLibrary.length-1)].trim().split(''));
    };

    wordlistasync.forEach((word) => {
        var singleDiv = document.createElement('div');
        word.forEach((letter) => {
            var singleLetter = document.createElement('letter');
            singleLetter.innerHTML = letter;
            singleDiv.appendChild(singleLetter);
        })
        textbox.appendChild(singleDiv);
    })
    return wordlistasync
}

async function doWork() {
    wordlist = await fetchLibrary();
    await document.addEventListener('keydown', logKey);
}

function logKey(e) {
    if (e.key === "Enter") {
        location.reload();
    }
    if (end) {
        return
    }
    var currentWordlistInd = typed.length //the index in the wordlist which points to the current word
    var currentLetterInd = currentWord.length //the index in the wordlist which points to the letter which is being typed in the current word
    const words = Array.from(textbox.children); //pointer to all words(divs) in the textbox
    const letters = Array.from(words[currentWordlistInd+1].children); //pointer to all the letters(letters) in the textbox
    if (e.key === "Backspace") {
        if (currentLetterInd) { // if there is currently something being typed
            currentWord.pop(); //remove the latest letter
            if (currentLetterInd > wordlist[currentWordlistInd].length) { //if the current letter is extra
                words[currentWordlistInd+1].removeChild(words[currentWordlistInd+1].lastChild); //remove it completely
            } else {
                letters[currentLetterInd-1].removeAttribute('class'); //remove the class
            }

        } else if (typed.length > 0){ //if there is currently nothing being typed
            currentWord = typed[typed.length - 1]; //the current word is now the previous one (1/2)
            typed.pop(); //(2/2)
            if (rows[rows.length-1].length > 0) {
                rows[rows.length-1].pop(); //remove one pointer from rows
            } else {
                rows.pop();
                rows[rows.length-1].pop(); //remove one pointer from rows
                console.log("YES");
            }
            }
    }
    if (e.key === " ") {
        if (currentLetterInd) { //if there is currently something being typed
            typed.push(currentWord); //the current word moves to the typedlist and becomes a new empty (1/2)
            currentWord = []; //(2/2)
            rows[rows.length-1].push(currentWordlistInd) //adds one pointer to rows
        }

    } else if (e.key.length === 1) {
        if (interval === null) {
            start();
        }
        
        currentWord.push(`${e.key}`);
        //writing out letters n stuff
        if (currentLetterInd >= wordlist[currentWordlistInd].length) {
            var singleLetter = document.createElement('letter');
            singleLetter.innerHTML = `${e.key}`;
            singleLetter.className = "extra"
            words[currentWordlistInd+1].appendChild(singleLetter);
        } else if (wordlist[currentWordlistInd][currentLetterInd] === currentWord[currentLetterInd]) {
            letters[currentLetterInd].className = "correct"
        } else {
            letters[currentLetterInd].className = "incorrect"
        }
    }
    
    count.innerHTML = `${typed.length}` +"/25"; //update score
    
    caretShift(textbox.offsetWidth);


    document.getElementById("caret").style.transform = ("translate("+`${caretPos}`+ "px, "+`${caretPosLine}` * 36.2 + "px");


    if ((typed.length === 24 && JSON.stringify(currentWord) === JSON.stringify(wordlist[24])) || (typed.length === 25)) {
        stop();
    }

}

doWork();

let seconds = 0;
let interval = null;

function timer () {
    seconds++;
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    if (mins) {
        if (secs < 10) {
            timerDisplay.innerHTML = `${mins}:0${secs}`;
        } else {
            timerDisplay.innerHTML = `${mins}:${secs}`;
        }
    } else {
        timerDisplay.innerHTML = `${secs}`;
    }
}

function start () {
    interval = setInterval(timer, 1000);
}

function stop () {
    clearInterval(interval);
    interval = null;
    textbox.style.backgroundColor = (getColorFromRoot('--gray'));
    textbox.style.border = "3px solid"+ (getColorFromRoot('--yellow'));
    textbox.style.borderRadius = "15px";
    var wpm = document.createElement('div');
    wpm.innerHTML = "WPM: " + `${(((document.getElementsByClassName("correct").length)/4)/(seconds/60)).toFixed(2)}`
    wpm.className = "wpm"
    document.getElementById("border").appendChild(wpm);
    document.getElementById("count").remove();
    document.getElementById("caret").remove();

    end = true;
}

function getColorFromRoot(name) { 
    return(getComputedStyle(document.querySelector(':root')).getPropertyValue(name));
}

function caretShift(textboxWidth) {
    if (typed.length === 25) return
    let totalW = 0
    let letterW = 14.41
    let betweenW = 15
    let goingtopush = false

    for (let i = 0; i < rows[rows.length-1].length; i++) {
        totalW += 
        Math.max(
            wordlist[rows[rows.length-1][i]].length, 
            typed[rows[rows.length-1][i]].length
            )
         * letterW + betweenW;
    }
    console.log("TOTALW" + totalW)
    console.log(rows.length)
    if (totalW) {
        if (currentWord.length >= wordlist[typed.length].length) {
            if ((totalW + currentWord.length * letterW + betweenW) > textboxWidth + 5) {
                    rows.push([])
                     totalW = 0
                }
        } else if ((totalW + wordlist[typed.length].length * letterW + betweenW) > textboxWidth+ 5){
            rows.push([])
                totalW = 0
        }
    } else if (rows.length > 1 && currentWord.length >= wordlist[typed.length].length) { //if the current letter is extra
        console.log("CHECK")

        for (let i = 0; i < rows[rows.length-2].length; i++) {
            totalW += 
            Math.max(
                wordlist[rows[rows.length-2][i]].length, 
                typed[rows[rows.length-2][i]].length
                )
             * letterW + betweenW;
        }

        if ((totalW + currentWord.length * letterW + betweenW) < textboxWidth + 5){
            console.log(totalW + wordlist.length * letterW + betweenW)
            console.log("THIS ABOVE")
            rows.pop()
        } else {
            totalW = 0
            console.log("FAILED CHECK")
        }
    }

    console.log("START")
    console.log(rows)
    console.log(typed)
    console.log(wordlist)
    console.log(currentWord)
    totalW += letterW * currentWord.length

    caretPos = totalW
    
    caretPosLine = rows.length - 1
}
