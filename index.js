'use strict';

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWaitingResponse(session, callback) {
    const sessionAttributes = session.attributes;
    const cardTitle = 'Waiting';
    const speechOutput = "OK, please let me know when you're ready";
    const repromptText = "I've still got Kathy's holiday card open. Let me know when we can get started.";
    const shouldEndSession = false;
    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = "Hi! is Kathy in the room?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = "Please let me know when Kathy's in the room";
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function readCard(sessionAttributes, callback) {
    const cardTitle = 'The Card';
    const repromptText = 'Would you like to hear the card again?';
    const shouldEndSession = false;
    const speechOutput = "Hi Kathy, here's a holiday message from Matt: Kathy, I am overjoyed to be consumed with your presence, your thoughtfulness, and your love. I love gazing into your eyes, listening to your every word, completing your sentences, and laughing at our quirky things. Will you take my hand in marriage?";
    if (sessionAttributes)
        sessionAttributes.proposalHeard = true;
    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleCardResponse(session, callback) {
    const cardTitle = 'The Response';
    const sessionAttributes = session.attributes;
    const repromptText = "Would you like me to read Matt's card again?";
    const shouldEndSession = false;
    const speechOutput = "So... what do you think?";
    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleUnknownRequest(intent, session, callback, isError) {
    var sessionAttributes = (session ? session.attributes : {});
    const cardTitle = 'Unknown Request';
    const repromptText = 'Try again?';
    const shouldEndSession = false;
    const speechOutput = ["Intent detected:", intent.name, '; Session has attributes:', (session && typeof session.attributes === 'object'), '; Error thrown:', isError === true].join(' ');
    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(session, callback) {
    const cardTitle = 'Session Ended',
        sessionAttributes = (session ? session.attributes : {})
        ;
    const speechOutput = sessionAttributes.happyEnding ? 'Compliments of the Season, and Congratulations!!' : 'Goodbye';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    console.log('Session data? -> %s', JSON.stringify(session));

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);
    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent
        , intentName = intentRequest.intent.name
        , SESSION_EXISTS = (typeof session === 'object')
        ;
    var attributes = (SESSION_EXISTS && session.hasOwnProperty('attributes') ? session.attributes : {});

    /*    
    if (/ReadCardIntent/.test(intentName)) {
        
    } else if (/AMAZON\.HelpIntent/.test(intentName)) {
        
    } else if (/AMAZON\.YesIntent/.test(intentName)) {
        
    } else if (/AMAZON\.NoIntent/.test(intentName)) {
        
    } else if (/AMAZON\.(StopIntent|CancelIntent)/.test(intentName)) {
        
    }
    */

    switch (intentName) {
        case 'ReadCardIntent':
            /*
            // set name, if provided 
            var firstName = intent.slots.FirstName.value;
            if (firstName && !/^he|she|they|we$/.test(firstName)) {
                attributes.firstName = firstName;
            }
            */
            return readCard(session, callback);

        case 'AMAZON.HelpIntent':
            return getWelcomeResponse(callback);

        case 'AMAZON.YesIntent':
            try {
                if (attributes.proposalHeard && session) {
                    attributes.happyEnding = true;
                    return handleSessionEndRequest(session, callback);
                } else {
                    return readCard(attributes, callback);
                    session.attributes.proposalHeard = true;
                }
            } catch (err) {
                //return handleUnknownRequest(intent, session, callback);
                return readCard(attributes, callback);
                session.attributes.proposalHeard = true;
            }
            break;

        case 'AMAZON.NoIntent':
            try {
                if (!session || !attributes.proposalHeard) {
                    return getWaitingResponse(session, callback);
                } else {
                    attributes.happyEnding = false;
                    return handleSessionEndRequest(session, callback);
                }
            } catch (err) {
                return handleUnknownRequest(intent, session, callback, true);
            }
            break;

        case 'AMAZON.StopIntent':
        case 'AMAZON.CancelIntent':
            return handleSessionEndRequest(session, callback);

        default:
            return handleUnknownRequest(intent, session, callback);
        //throw new Error('Invalid intent');
    }
    /*
    // Dispatch to your skill's intent handlers
    if (intentName === 'MyColorIsIntent') {
        setColorInSession(intent, session, callback);
    } else if (intentName === 'WhatsMyColorIntent') {
        getColorFromSession(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
    */
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
