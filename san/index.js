'use strict';
const Alexa = require('alexa-sdk');
const request = require('request');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
//const APP_ID = undefined;

const WELCOME_MESSAGE = "Welcome to BlueCross Blueshield!";
const SKILL_NAME = 'Bluecross Blueshield of Illinios';
const HELP_MESSAGE = 'We are here to care. Just say what you need!';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';



const handlers = {
    'LaunchRequest': function () {
        this.emit('getHi');
    },
     'getHi':function(){

        // sending the welcome message + asking user identity details (Phone number) (member id) (email id) (ssn)
	    var message = WELCOME_MESSAGE;


	    if(!this.attributes.userIdentified)
	    {

	        console.log("User id: "+ this.event.context.System.user.userId);
	        console.log("Device id: "+ this.event.context.System.device.deviceId);

	        this.attributes.fromIntent = "getHi";
	        this.attributes.toIntent = "identifyUser";

	        this.emit(this.attributes.toIntent);

    	}

	    else if (this.attributes.userIdentified === 'yes' && this.attributes.fromIntent === "identifyUser" &&  this.attributes.toIntent === "getHi")
	    {
	        console.log("Final frontier");
          var say=getFact();
	        this.emit(':ask', say);
	    }
    },
    'identifyUser': function()
    {
        console.log("I am actually at the bgining of identifyUser");

         // make an http get call to obtain a patient object
         // an http get (to demo-api.vagmi.io/patients) is only necessary when identification is not confirmed for the current session
         if(!this.attributes.userIdentified){
             const url = 'http://demo-api.vagmi.io/patients/5abd277bf200095fcb9b1f54';

            this.attributes.fromIntent = "identifyUser";
	        this.attributes.toIntent = "processHttpGet";

            this.emit(this.attributes.toIntent, url);
         }



        // if identify user successful, trigger respective intent functions based on session attr
        if (this.attributes.userIdentified === "yes"  && (this.attributes.fromIntent  === "getHi" || this.attributes.fromIntent  === "processHttpGet") &&  this.attributes.toIntent === "identifyUser" )
        {
            console.log("I am at the bgining of identifyUser");


            this.attributes.fromIntent = "identifyUser";
	        this.attributes.toIntent = "getHi";

            console.log("I am at the end of identifyUser");
            this.emit(this.attributes.toIntent);
        }
    },
    'processHttpGet': function (url) {

        request.get(url, (error, response, body) => {
            // let json = JSON.parse(body);
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response); // Print the response status code if a response was received
            console.log('body:', body); // Print the body

            // attribute userIdentified should become yes when we obtain a object properly upon get
            this.attributes.userIdentified = "yes";
            //this.attributes.userName = "Alice";
            var names=JSON.parse(body);
            this.attributes.userName=names.name;
            console.log("patient name is "+this.attributes.userName);

            this.attributes.fromIntent = "processHttpGet";
	        this.attributes.toIntent = "identifyUser";

	        this.emit(this.attributes.toIntent);
        });
    },
    'getCoPay': function () {
        const speechOutput = "Your co pay is "+ this.attributes.userName;
        console.log("my co pay is"+ this.attributes.userName);

        //this.response.cardRenderer(SKILL_NAME, speechOutput);
        //this.response.speak(speechOutput);
        this.emit(':tell',speechOutput);
    },
    'findMyDoctor': function () {
        const speechOutput = "Oh my God, there are 1000 results, you wanna listen in alphabetical order...";

        this.response.cardRenderer(SKILL_NAME, speechOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'feverHelpLine': function () {
        const speechOutput = "You got fever, everbody gets fever, what's so special?";

        this.response.cardRenderer(SKILL_NAME, speechOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'autoSignForPay': function () {
        const speechOutput = "You are signed up, You are good to go...";

        this.response.cardRenderer(SKILL_NAME, speechOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
   // alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function getFact() {
    var myFacts = [
    'hurray.. thank you for enabling the skill. welcome to bcbs. ',
    'you enabled this blue cross blue shield skill. here is what you can find. ',
    'we are so happy that you enabled our skill. what services can we provide. ',
    'blue cross blue shield is now for use. only by authorized users and only for authorized purposes.',
    'as blue cross blue shield, we pride ourselves offering our customer responsive, competant and excellent services'
        ]
    var newFact = randomPhrase(myFacts);
    return newFact;
}

function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}
