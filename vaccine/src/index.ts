#!/usr/bin/env node
import { setTimeout } from "timers";
import { WAConnection } from '@adiwajshing/baileys'
import { MessageType, MessageOptions, Mimetype } from '@adiwajshing/baileys'

const path = require('path');
// const sharp = require('sharp');
const axios = require("axios");
const ocrad = require('async-ocrad');
var fs = require('fs');
var WAconn: WAConnection;
axios.defaults.timeout = 30000;

var options = {
  timeout: 30000,
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.56 Safari/537.36',
  }
};
interface PollParameters {
  district: string; pinfilter?: string; slackURL?: string, slackChannel?: string, wapp?: string,
}


async function pollCOWIN({ district, pinfilter, slackURL, slackChannel, wapp }: PollParameters): Promise<boolean> {

  var d = new Date();
  var datestring = ("0" + d.getDate()).slice(-2) + "-0" + (d.getMonth() + 1) + "-" + d.getFullYear();

  const url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=' + district + '&date=' + datestring;
  https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=276&date=10-05-2021
  console.log(url);
  var response;
  try {
    response = await axios.get(url, options);
  } catch (error) {
    console.log(JSON.stringify(error))
    return false;
  }
  // console.log(JSON.stringify(response.data  ))

  const centers = response.data.centers;
  // console.log(`${datestring}`);
  var message = "";
  if (centers == null) { console.log('No centers for ' + district); console.log(JSON.stringify(response.data)); return false; }

  for (const center of centers) {

    // console.log(`${center.name} ${center.center_id}`);

    for (const session of center.sessions) {
      // console.log(`${session.date} ${session.session_id}`);
      // console.log(`${session.min_age_limit}`);

      // for (const slot of session) {
      if (session.min_age_limit < 45) {
        // console.log(`*********************`);
        // console.log(`${center.name}`);
        // console.log(`${session.date}`);
        // console.log(`${session.available_capacity}`);
        if (session.available_capacity > 4) {
          var vaccine = (session.vaccine == "") ? "vaccine" : session.vaccine;

          if (pinfilter == null || pinfilter == '' || `${center.pincode}`.startsWith(pinfilter)) {
            message = message + `\n${session.available_capacity} ${vaccine} available at ${center.name} ${center.address} ${center.block_name} ${center.district_name}  ${center.state_name} ${center.pincode} on ${session.date}\n`
          }

          /*
                    if (/APOLLO|MANIPAL|HOSPITAL/.test(`${center.name}`.toUpperCase())) {
                      if (/COVAXIN/.test(`${vaccine}`.toUpperCase())) {
                        message = message + `${session.available_capacity} ${vaccine} available at ${center.name} ${center.pincode} on ${session.date}\n`
                      } else {
                        messageRED = messageRED + `${session.available_capacity} ${vaccine} available at ${center.name} ${center.pincode} on ${session.date}\n`
                      }
                    } else {
                      message = message + `${session.available_capacity} ${vaccine} available at ${center.name} ${center.address}  ${center.state_name} ${center.pincode} on ${session.date}\n`
                    }
          */
          //   notifySlack('red-alerts', `${session.available_capacity} ${vaccine} available at ${center.name} ${center.pincode} on ${session.date}`);
          // else
          //   notifySlack('alerts', `${session.available_capacity} ${vaccine} available at ${center.name} on ${session.date}`);
        }


        // }
      }
    }

  }

  if (message.length > 0) {
    console.error(`\n\n--------------------\n\n ${message}\n------------------\n\n\n`)
    if (wapp != null) notifyWapp(wapp, message);
    if (slackChannel != null && slackChannel.length > 0) notifySlack(slackChannel, message, slackURL);
  }
  return true;

};

async function main() {
  loop();
}



async function loop() {
  // await main('294');
  // await delay(3); await main, 200, '313'); //gwalior
  // while (!await pollCOWIN('363', '411', 'https://hooks.slack.com/services/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')) await delay(3); //pune
  // await delay(3); await pollCOWIN('294'); //blr
  // await pollCOWIN('363', '411', 'https://hooks.slack.com/services/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'); //pune
  await pollCOWIN({ district: '322', wapp: '917829037733-1620531936@g.us', slackChannel: 'vaccine' }); //ratlam
  // await delay(3); await pollCOWIN({ district: '318', wapp: '917829037733-1620531936@g.us', slackChannel: 'vaccine' }); //ujjain
  await delay(3); await pollCOWIN({ district: '314', wapp: '917829037733-1620205437@g.us' }); //indore

  await delay(3); await pollCOWIN({ district: '313', slackChannel: 'vaccine' });  //gwlior
  await delay(3); await pollCOWIN({ district: '109', slackChannel: 'vaccine' });  //raipur
  // await delay(3); await pollCOWIN('697', '24800', '919870700334@s.whatsapp.net'); //ddn
  // await delay(3); await pollCOWIN('622'); //agra
  await delay(3); await pollCOWIN({ district: '294', slackChannel: 'vaccine' }); //blr
  await delay(3); await pollCOWIN({ district: '506', slackChannel: 'vaccine' }); //jaipur II

  // await delay(3); await pollCOWIN('206', '123001'); //mahindargarh
  // await notifyWapp('917829037733@s.whatsapp.net', ` ${new Date()}`);
}

export async function notifySlack(channel: string, message: string, url = 'https://hooks.slack.com/services/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') {
  // const url = 'https://hooks.slack.com/services/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'
  const body = { 'text': message, "mrkdwn": true, 'channel': '#' + channel, 'username': channel }
  const res = await axios.post(url, body);

  return true
}



export async function notify(message: string, url?: string, slackChannel: string = 'vaccine') {

  if (url == null || url.startsWith('http')) {
    notifySlack(slackChannel, message, url);
  } else {
    notifyWapp(url, message);
    notifySlack(slackChannel, message);
  }


  return true
}



async function connectToWhatsApp() {
  const conn = new WAConnection()
  fs.existsSync('./auth_info.json') && conn.loadAuthInfo('./auth_info.json')

  conn.on('contacts-received', () => {
    console.log('you have ' + Object.keys(conn.contacts).length + ' contacts')
    console.log(JSON.stringify(conn.contacts));
  })

  await conn.connect()
  const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
  fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file

  return conn

}

export async function notifyWapp(channel: string, message: string) {
  if (WAconn == null) WAconn = await connectToWhatsApp();
  const sentMsg = await WAconn.sendMessage(channel, message, MessageType.text)
}
async function delay(sec: number) {
  return new Promise(resolve => setTimeout(resolve, 1000 * sec));
}

main();