#!/usr/bin/env node
const path = require('path');
const sharp = require('sharp');
const axios = require("axios");
const ocrad = require('async-ocrad');
var fs = require('fs');

const image = path.resolve('./i1.jpg');

async function captcha() {
  await sharp(image)
    .negate()
    .toFile('./i2.jpg')
  var text = await ocrad('./i2.jpg');
  text = text.replace(/g/g,'9');
  text = text.replace(/a/g,'B');
  text = text.replace(/l/g,'I');
  console.log(text);
  text=text.toUpperCase();
  return text;
}


var options = {
  responseType: 'stream',    
  headers: {
    cookie: 'ASP.NET_SessionId=h5ew5svjt3zmgwl10c2fxzlb',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.56 Safari/537.36',
  }
};

const url = `https://www.covidwar.karnataka.gov.in/service1/home/ShowCaptchaImage`;
const u2 ='https://www.covidwar.karnataka.gov.in/service1/Home/GetUserDetails?pUserId=2952500749630&CaptchaText=';
const u3= 'https://www.covidwar.karnataka.gov.in/service1/Home/GetNegativeDetails?pUserId=2952500749630';

async function main(s:String):Promise<boolean> {
options.responseType = 'stream';
const response = await axios.get(url, options);
 await response.data.pipe(fs.createWriteStream(image));
 await new Promise((resolve) => setTimeout(resolve, 1000));
//  console.log(`Recognizing ${image}`);
 const text = await captcha();
 delete options.responseType ;
 const response2 = await axios.get(`${u2+text}`, options);
 const r2 = response2.data;
 console.log(`R2 ${ r2}`);
 if (r2=='Invalid'){return false; }
  const response3 = await  axios.get(u3, options);
  const r3 = response3.data;
  console.log(`R3 ${r3}`);
  if ((r2=='{"Table":[],"Table1":[]}') && (r3=='{"Table":[]}') ){ console.log('nothing'); return true;}
  console.log(`${r3}`);
  console.log(`${ r2}`);
  await notifySlack('red-alerts', `${r2 + r3 }`);
  return true;
 
};

main('');
// notifySlack('test', '${r2 + r3 }');
 


export async function notifySlack (channel: string, message: string){
  const url = 'https://hooks.slack.com/services/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'
  const body = {'text' :  message, "mrkdwn": true,  'channel': '#'+channel, 'username':'HyPerk' }    

  const res = await axios.post(url,body);

  return true
}
