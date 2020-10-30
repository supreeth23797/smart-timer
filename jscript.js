var btnSetTime = document.getElementById("btnSetTime");
var btnStartStop = document.getElementById("btnStartStop");
var btnReset = document.getElementById("btnReset");
var lapsTable = document.getElementById("lapsTable");
var displayHr = document.getElementById("hour");
var displayMin = document.getElementById("min");
var displaySec = document.getElementById("sec");
var displayMs = document.getElementById("ms");
var hourSelector = document.getElementById("hourSelector");
var minuteSelector = document.getElementById("minuteSelector");
var secondSelector = document.getElementById("secondSelector");
var millisecondSelector = document.getElementById("millisecondSelector");
var btnSubmit = document.getElementById("submit");
var btnClose = document.getElementById("close");
var progress = document.getElementById("barProgress");

var givenHours = 0;
    givenMinutes = 0;
    givenSeconds = 0; 
    givenMilliseconds = 0;
var givenTimeInMillis = 0;
var privLapTimeInMillis = 0;
var timeInMillis = 0;
var timer;
var lapsArray = new Array();
var isTimerStopped = true;
var isLapsCorrected = true;
var oldTime;
var newTime;
var pausedDuration = 0;
const lapThreshold = 20*1000;                   // Lap threshold set to 20 seconds
const countDownNegativeLimit = -1*359999999;    // negative threshold convertToMillisec(99,59,59,999);

function populateOptions(){              
    for(var i=0;i<100;i++){
        hourSelector.options.add(new Option(i));
        minuteSelector.options.add(new Option(i));
        secondSelector.options.add(new Option(i));
        millisecondSelector.options.add(new Option(i));
    }
    for(var i=100;i<1000;i++){
        millisecondSelector.options.add(new Option(i));
    }
}
populateOptions();

class Timer{
    constructor(hours, minutes, seconds, milliseconds) {
      this.hours = hours;
      this.minutes = minutes;
      this.seconds = seconds;
      this.milliseconds = milliseconds;
    }
}

class LapsEntry{
    constructor(lapNum, privLapTime, lapFrom, lapTill, duration, durationInMillis) {
        this.lapNum = lapNum;
        this.privLapTime = privLapTime;
        this.lapFrom = lapFrom;
        this.lapTill = lapTill;
        this.duration = duration;
        this.durationInMillis = durationInMillis;
    }
}

function durationFormat(hr, min, sec, millisec){
    return (hr>0?hr+"hr: ":"")+(min>0?min+"min: ":"")+(sec>0?sec+"s: ":"")+(millisec>0?millisec+"ms":"0ms");
}

function displayTimer(hours, minutes, seconds, milliseconds){
    displayHr.innerHTML = (hours >= 0 && hours < 10 ? "0"+hours : hours);
    displayMin.innerHTML = (minutes >= 0 && minutes < 10 ? "0"+minutes : minutes);
    displaySec.innerHTML = (seconds >= 0 && seconds < 10 ? "0"+seconds : seconds);
    displayMs.innerHTML = (milliseconds >= 0 && milliseconds < 100 ? (milliseconds < 10 ? "00"+milliseconds : "0"+milliseconds) : milliseconds);
}

function updateProgressBar(maxTime){
    // x to 00:00:00.000, progress  ---->
    // 00:00:00.000 to countDownNegativeLimit, regress  <----

    var percent = ((maxTime - timeInMillis) / maxTime)*100;
    progress.style.width = percent+"%";
}

// initialize view
function init(){
    if(localStorage.length == 0){
        resetLapsArray();
        
    } else{
        var temp;
        oldTime = parseInt(localStorage.getItem("oldTime"));
        if(localStorage.getItem("isTimerStopped") == "false"){
            isTimerStopped = false;
            timeInMillis = parseInt(localStorage.getItem("timeInMillis")) - (new Date().getTime() - oldTime);
        } else{
            isTimerStopped = true;
            timeInMillis = parseInt(localStorage.getItem("timeInMillis"));
        }
        givenTimeInMillis = parseInt(localStorage.getItem("givenTimeInMillis"));
        privLapTimeInMillis = parseInt(localStorage.getItem("privLapTimeInMillis"));
        lapsArray = JSON.parse(localStorage.getItem("lapsArray"));
        if(lapsArray.length > 1){
            for(var i=1;i<lapsArray.length;i++){
                if(lapsArray[i].durationInMillis >= lapThreshold){
                    createLapsTableRow(lapsArray[i].lapNum, lapsArray[i].lapFrom, lapsArray[i].lapTill, 
                                        lapsArray[i].duration, true);
                } else{
                    createLapsTableRow(lapsArray[i].lapNum, lapsArray[i].lapFrom, lapsArray[i].lapTill, 
                                        lapsArray[i].duration, false);
                }
            }
        }
        temp = floorConvertToHrMinSecMs(givenTimeInMillis);
        givenHours = temp.hours;
        givenMinutes = temp.minutes;
        givenSeconds = temp.seconds;
        givenMilliseconds = temp.milliseconds;

        if((timeInMillis <= 0) && (timeInMillis > countDownNegativeLimit)){
            temp = ceilConvertToHrMinSecMs(timeInMillis);
            updateProgressBar(countDownNegativeLimit);
            displayTimer(temp.hours, temp.minutes, temp.seconds, temp.milliseconds);
                                                                                     
        } else if((timeInMillis > 0)){
            temp = floorConvertToHrMinSecMs(timeInMillis);
            updateProgressBar(givenTimeInMillis);
            displayTimer(temp.hours, temp.minutes, temp.seconds, temp.milliseconds);

        } else{
            displayTimer(givenHours, givenMinutes, givenSeconds, givenMilliseconds);                                   
            resetTimer();
            return;
        }
        if(!isTimerStopped){
            startTimer();
        } else{
            stopTimer();
        }
    }
}
init();

// for laps start and end time 
function timerDispFormat(hours, minutes, seconds, milliseconds){
    return (hours >= 0 && hours < 10 ? "0"+hours : hours)+":"+
                (minutes >= 0 && minutes < 10 ? "0"+minutes : minutes)+":"+
                (seconds >= 0 && seconds < 10 ? "0"+seconds : seconds)+"."+
                (milliseconds >= 0 && milliseconds < 100 ? (milliseconds < 10 ? "00"+milliseconds : "0"+milliseconds) : milliseconds);
}

function resetLapsArray(){
    lapsArray = [];
    privLapTimeInMillis = givenTimeInMillis;
    lapsArray.push(new LapsEntry(0,
                                givenTimeInMillis,
                                timerDispFormat(givenHours,givenMinutes,givenSeconds,givenMilliseconds),
                                timerDispFormat(givenHours,givenMinutes,givenSeconds,givenMilliseconds),
                                "0s",
                                0));
}

function resetLapsTable(){
    while(lapsTable.rows.length > 1){
        lapsTable.deleteRow(1);
    }
    lapsTable.style.display = "none";
}

function startTimer(){
    btnReset.disabled = false;
    btnStartStop.textContent = "Stop";
    btnStartStop.style.backgroundColor = '#d64f3d'; //red
    isTimerStopped = false;
    if(oldTime!=null){
        pausedDuration = new Date().getTime() - oldTime;
    } else{
        oldTime = new Date().getTime();
    }
    timer = setInterval(timerRun, 10);
}

function stopTimer(){
    btnReset.disabled = false;
    btnStartStop.textContent = "Start";
    btnStartStop.style.backgroundColor = '#22a543'; //green
    isTimerStopped = true;
    clearInterval(timer);
    oldTime = new Date().getTime();
}

function resetTimer(){
    btnReset.disabled = true;
    stopTimer();
    resetLapsArray();
    resetLapsTable();
    timeInMillis = privLapTimeInMillis = givenTimeInMillis;
    progress.style.width="0%";
    displayTimer(givenHours, givenMinutes, givenSeconds, givenMilliseconds);
}

btnSubmit.addEventListener("click", function(){
    givenHours = parseInt(hourSelector.value);
    givenMinutes = parseInt(minuteSelector.value);
    givenSeconds = parseInt(secondSelector.value);
    givenMilliseconds = parseInt(millisecondSelector.value);

    givenTimeInMillis = privLapTimeInMillis = timeInMillis = convertToMillisec(givenHours, givenMinutes, 
                                                                                givenSeconds, givenMilliseconds);
    resetLapsArray();
    resetLapsTable();
    clearInterval(timer);
    displayTimer(givenHours, givenMinutes, givenSeconds, givenMilliseconds);
    startTimer();
});

btnStartStop.addEventListener("click", function(){
    if(isTimerStopped){
        startTimer();

    } else{
        stopTimer();
    }
});

btnReset.addEventListener("click",function(){
    resetTimer();    
});

function convertToMillisec(hrs,min,sec,millisec){
    return (((hrs*60*60+min*60+sec)*1000)+millisec);
}

// for time > 00:00:00.000
function floorConvertToHrMinSecMs(time){
    var timeInSec = Math.floor(time / 1000);
    return (new Timer(Math.floor(timeInSec / 3600),            // hours
                Math.floor((timeInSec / 60 ) % 60),            // minutes
                Math.floor(timeInSec % 60),                    // seconds
                Math.floor(time % 1000)));                     // milliseconds
}

// for time < 00:00:00.000
function ceilConvertToHrMinSecMs(time){
    var timeInSec = Math.ceil(time / 1000);
    return (new Timer(Math.ceil(timeInSec / 3600),             // hours
                Math.ceil((timeInSec / 60 ) % 60),             // minutes
                Math.ceil(timeInSec % 60),                     // seconds
                Math.ceil(time % 1000)));                      // milliseconds
}

function timerRun() {
    var newTimer;
    newTime = new Date().getTime();
    timeInMillis = timeInMillis - ((newTime-oldTime) - pausedDuration);
    pausedDuration = 0;
    oldTime = newTime;
    if((timeInMillis <= 0) && (timeInMillis > countDownNegativeLimit)){
        newTimer = ceilConvertToHrMinSecMs(timeInMillis);
        updateProgressBar(countDownNegativeLimit);

    } else if((timeInMillis > 0)){
        newTimer = floorConvertToHrMinSecMs(timeInMillis);
        updateProgressBar(givenTimeInMillis);

    } else{
        resetTimer();
        return;
    } 
    displayTimer(newTimer.hours, newTimer.minutes, newTimer.seconds, newTimer.milliseconds);   
}

function createLapsTableRow(lapNum, lapFromTime, lapTillTime, duration, changeColor){
    lapsTable.style.display = "table";
    var row = document.createElement('tr');
    for(var i=0; i<4; i++){
        var cell = document.createElement('td');
        if( i==0 ){
            cell.appendChild(document.createTextNode(lapNum));
        } else if( i==1 ){
            cell.appendChild(document.createTextNode(lapFromTime));
        } else if(i==2){
            cell.appendChild(document.createTextNode(lapTillTime));
        } else{
            cell.appendChild(document.createTextNode(duration));
        }
        if(changeColor){
            cell.style.color = '#ff5e49'; 
            cell.style.fontWeight = 600;           //red to indicate color change if lap duration exceeds threshold
        }
        row.appendChild(cell);
    }
    lapsTable.appendChild(row);
}

function updateOldLap(newLapTime){
    privLapTimeInMillis = newLapTime;
}

document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        if(!isTimerStopped){
            var privLap, newLap, lapFrom, lapTill, lapDurationInMillis, lapDurationInHrMinSecMs, duration;

            if(privLapTimeInMillis <= 0){
                privLap = ceilConvertToHrMinSecMs(privLapTimeInMillis);
            } else{
                privLap = floorConvertToHrMinSecMs(privLapTimeInMillis);
            }

            if(timeInMillis <= 0){
                newLap = ceilConvertToHrMinSecMs(timeInMillis);
            } else{
                newLap = floorConvertToHrMinSecMs(timeInMillis);
            }
            lapFrom = timerDispFormat(privLap.hours, privLap.minutes, privLap.seconds, privLap.milliseconds);
            lapTill = timerDispFormat(newLap.hours, newLap.minutes, newLap.seconds, newLap.milliseconds);
            lapDurationInMillis = Math.abs(privLapTimeInMillis - timeInMillis);
            lapDurationInHrMinSecMs = floorConvertToHrMinSecMs(lapDurationInMillis);
            duration = durationFormat(lapDurationInHrMinSecMs.hours,
                                            lapDurationInHrMinSecMs.minutes,
                                            lapDurationInHrMinSecMs.seconds,
                                            lapDurationInHrMinSecMs.milliseconds);
            if(lapDurationInMillis >= lapThreshold){
                createLapsTableRow(lapsArray.length, lapFrom, lapTill, duration, true);
            } else{
                createLapsTableRow(lapsArray.length, lapFrom, lapTill, duration, false);
            }
            lapsArray.push(new LapsEntry(lapsArray.length, timeInMillis, lapFrom, lapTill,
                duration, lapDurationInMillis));
            updateOldLap(timeInMillis);
            isLapsCorrected = false;
        }
        return false;

    } else if(e.keyCode==8){
        if(!isTimerStopped && !isLapsCorrected && lapsArray.length>1){
            isLapsCorrected = true;

            if(lapsArray.length <= 2){
                resetLapsArray();
                resetLapsTable();
                return;
            }
            var lastLap, lastButOneLap, updatedLapFrom, updatedLapTill, updatedDurationInMillis,
                updatedDurationInHrMinSecMs, updatedDuration;

            // pop last two entries and insert updated one
            lastLap = lapsArray.pop();                              // ultimate Lap
            lastButOneLap = lapsArray.pop();                        // penultimate Lap

            updateOldLap(lastLap.privLapTime);
            updatedLapFrom = lastButOneLap.lapFrom;
            updatedLapTill = lastLap.lapTill;
            updatedDurationInMillis = lastLap.durationInMillis + lastButOneLap.durationInMillis;
            updatedDurationInHrMinSecMs = floorConvertToHrMinSecMs(updatedDurationInMillis);
            updatedDuration = durationFormat(updatedDurationInHrMinSecMs.hours,
                                                    updatedDurationInHrMinSecMs.minutes, 
                                                    updatedDurationInHrMinSecMs.seconds,
                                                    updatedDurationInHrMinSecMs.milliseconds);

            // delete last 2 rows and add updated row
            for (var i=0; i<2; i++){
                lapsTable.deleteRow(lapsTable.rows.length-1);
            }
            if(updatedDurationInMillis >= lapThreshold){
                createLapsTableRow(lapsArray.length, updatedLapFrom, updatedLapTill, updatedDuration, true);
            } else{
                createLapsTableRow(lapsArray.length, updatedLapFrom, updatedLapTill, updatedDuration, false);
            }
            lapsArray.push(new LapsEntry(lapsArray.length, privLapTimeInMillis, updatedLapFrom, updatedLapTill, 
                updatedDuration, updatedDurationInMillis) );
        }
    }
}

// disable default functions for spacebar and backspace
document.body.onkeydown = function(e){
    if(e.keyCode == 32 || e.keyCode==8){
        return false;  
    }
}

window.addEventListener("beforeunload", function (e) {
    console.log(givenTimeInMillis+" "+timeInMillis);
    if((givenTimeInMillis!=0) || ((givenTimeInMillis==0) && (timeInMillis!=0))){
        console.log("store");
        localStorage.setItem("givenTimeInMillis", givenTimeInMillis);
        localStorage.setItem("timeInMillis", timeInMillis);
        localStorage.setItem("privLapTimeInMillis", privLapTimeInMillis);
        localStorage.setItem("oldTime",new Date().getTime());
        localStorage.setItem("isTimerStopped", isTimerStopped);
        localStorage.setItem("lapsArray", JSON.stringify(lapsArray));

    } else{
        console.log("clear");
        localStorage.clear();
    }
});
