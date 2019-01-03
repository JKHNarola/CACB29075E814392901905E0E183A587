const {
    dialog
} = require('electron').remote;
var fs = require('fs');

const dataurl = require('dataurl');
const mp3Duration = require('mp3-duration');
var mm = require('musicmetadata');
const moment = require('moment');
const convertSong = (filePath) => {
   const songPromise = new Promise((resolve, reject) => {
       fs.readFile(filePath, (err, data) => {
           if (err) {
               reject(err);
           }
           resolve(dataurl.convert({
               data,
               mimetype: 'audio/mp3'
           }));
       });
   });
   return songPromise;
};

const openFile = () => {
   const files = dialog.showOpenDialog({
       title: 'Open File',
       properties: ['openFile'],
       filters: [{
           name: 'Audio Files',
           extensions: ['mp3']
       },]
   });

   if (!files) {
       return;
   }

   const filePath = files[0];
   readAudioData(filePath).then(track => {
       document.getElementById("title").innerHTML = track.metadata.title + " (" + moment.utc(track.duration.asMilliseconds())
           .format("mm:ss") + ")";
       document.getElementById("otherdata").innerHTML = track.metadata.album + " | " + track.metadata.artist[0];

       var bytes = new Uint8Array(track.metadata.picture[0].data);
       var image = document.getElementById("pic");
       image.src = 'data:image/png;base64,' + encode(bytes);
       console.log(track);
   });
   // convertSong(filePath).then(x => playSound(x));
};

function encode(input) {
   var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
   var output = "";
   var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
   var i = 0;

   while (i < input.length) {
       chr1 = input[i++];
       chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
       chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

       enc1 = chr1 >> 2;
       enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
       enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
       enc4 = chr3 & 63;

       if (isNaN(chr2)) {
           enc3 = enc4 = 64;
       } else if (isNaN(chr3)) {
           enc4 = 64;
       }
       output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
           keyStr.charAt(enc3) + keyStr.charAt(enc4);
   }
   return output;
}

const readAudioData = (filePath) => {
   const readAudioDataPromise = new Promise((resolve, reject) => {
       var obj = {
           filePath: filePath,
           duration: null,
           metadata: null
       };
       readDuration(obj.filePath).then(duration => {
           obj.duration = duration;
       }).then(() => {
           readMetaData(obj).then((track) => {
               resolve(track);
           });
       });
   });

   return readAudioDataPromise;
};

const readDuration = (filePath) => {
   const readDurationPromise = new Promise((resolve, reject) => {
       mp3Duration(filePath, (err, duration) => {
           if (err)
               reject(err);
           else if (duration) {
               var d = moment.duration(duration, 'seconds');
               resolve(d);
           }
       });
   });

   return readDurationPromise;
}

const readMetaData = (track) => {
   const readMetaDataPromise = new Promise((resolve, reject) => {
       mm(fs.createReadStream(track.filePath), function (err, metadata) {
           if (err)
               reject(err);
           else {
               track.metadata = metadata;
               resolve(track);
           }
       });
   });

   return readMetaDataPromise;
}

const playSound = (url) => {
   var audio = document.getElementById("aud");
   if (typeof (audio) != 'undefined' && audio != null) {
       audio.pause();
       audio.currentTime = 0;
   } else {
       audio = document.createElement('audio');
       audio.style.display = "none";
       audio.id = "aud";
       document.body.appendChild(audio);
   }
   audio.src = url;
   audio.play();
}
