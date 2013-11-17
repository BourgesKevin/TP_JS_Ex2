TP_JS_Ex2
=========

Exercise 2


Prerequisites : 

async, colors, express, lodash, "monapi", mongoose, request, winston

To install these : npm install request express lodash async winston --save (or just download all my repo)

To install "monapi" : nothing to do, it's included into "node_modules" directory.

You also have to install mongodb from  : http://www.mongodb.org/

How does it works : 

You must open a terminal and launch mongod
Then, you have to open a terminal, and from the webspider directory launch :

node scraper.js URL KEYWORD
or
node scraper.js LOCAtION/FILE.txt

What does these commands do ?

node scraper.js URL KEYWORD : analyze the URL given and search for the KEYWORD. Each link which contains the keyword is stored into "mongodb://localhost/scrappedlinks"
node scraper.js LOCAtION/FILE.txt : get all the links stored in mongodb and write them in the FILE you've asked. The folder has to exists before you launch the command, but the file will be created.

Sorry, this launch a server, but I don't use it, because.... erh, I didn't find anything that I could understand. So, I've done what I could... sorry.

It's an exercise we had to do for school, so if anyone find this code : I've just started working with Javascript, I know I have a lot to learn, and : 

"I want to be the very best,
Like no one ever was.
To code them is my real test,
To develop them is my cause.

I will travel across the web,
Searching far and wide.
Teach Javascript to understand
The power that's inside."


I will end this file with a quote I found on Twitter (translated from the French) :

Retweeted pierreca (@pierreca):

javascript == pornstar of dev languages : supple, powerful, you can do anything you want with it, and it could finish dirty. #amdev

(original) :
javascript == la pornstar des langages de dev: souple, puissant, tu lui fait faire ce que tu veux, et ça peut finir bien crade. #amdev
