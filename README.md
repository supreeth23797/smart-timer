Features of smart timer
* The countdown timer allows to set the countdown duration and allows counting down (by millisec). 
* Input ranges from 00:00:00.000 to 99:59:59.999
* Count down timer ranges from 99:59:59.999 to -99:-59:-59.-999
* The count down supports start/stop and maintaining laps.
* On pressing "space" key, it starts a new lap and displays the current lap info (lap number, start time, end time, duration) dynamically. When the current lap exceeds 20 seconds   it is highlighted in red in the table. 
* If "space" key was pressed wrongly pressing "backspace" will merge the current lap with the previous one.
* When the countdown reaches 00:00:00.000, it continues counting down (negative) until the "Stop" is pressed or -99:-59:-59.-999 is reached. When -99:-59:-59.-999 is reached,
  timer resets.
* This countdown timer is "smart" as it allows user to close the tab, reopen and would continue its previous state. 
  E.g.1 While the countdown has started, refreshing the page would just continue the count down.
  E.g.2 While the countdown has started, closing the page and reloading after x time, timer subtracts x time and continues.
  Refer unit test cases for more info.

To launch smart-timer download and open index.html file in a browser.

![IMG-20201030-WA0036](https://user-images.githubusercontent.com/37664479/115150062-68d74e00-a084-11eb-9bd8-c3626bc597a1.jpg)
![IMG-20201030-WA0037](https://user-images.githubusercontent.com/37664479/115150076-78569700-a084-11eb-8443-e34ef3cfb468.jpg)
![IMG-20201030-WA0035](https://user-images.githubusercontent.com/37664479/115150178-e26f3c00-a084-11eb-9622-1776bbf53e2d.jpg)
