const webrtc = require("wrtc")
const express = require("express")
const cors = require("cors")
const fs = require("fs")
const app = express()
const mediasoup = require('mediasoup');
const { createCanvas, loadImage } = require('canvas');
const { createWriteStream } = require('fs');
// const webrtcAdapter = require("webrtc-adapter");

// const SimplePeer = require("simple-peer")

// Function to create a MediaStream from a local video file
async function createMediaStreamFromVideoFile(filePath) {
    // Create a mediasoup worker
    const worker = await mediasoup.createWorker({});
    const router = await worker.createRouter();
   
    // Create a WebRTC transport for video
    const videoTransport = await router.createWebRtcTransport();
   
    // Read the local video file
    const videoFile = fs.readFileSync(filePath);
   
    // Create a video producer from the local video file
    const videoProducer = await videoTransport.produce({
      kind: 'video',
      rtpParameters: {
        // Provide appropriate RTP parameters for the video track
        // Adjust these based on your use case and network configuration
      },
      paused: true, // Start the producer in a paused state
    });
   
    // Start the video producer
    await videoProducer.resume();
   
    // Create a WebRTC transport for receiving video
    const videoTransportOptions = await router.createWebRtcTransport();
   
    // Create a video consumer to receive the video stream
    const videoConsumer = await videoTransportOptions.consume({
      producerId: videoProducer.id,
      rtpCapabilities: mediasoup.getSupportedRtpCapabilities(),
      paused: false, // Start consuming the video stream
    });
   
    // Create a MediaStream and add the video consumer track
    const mediaStream = new MediaStream();
    mediaStream.addTrack(videoConsumer.track);
   
    // Return the created MediaStream
    return mediaStream;
  }

  function createMediaStreamFromLocalVideoFile(filePath) {
    return new Promise((resolve, reject) => {
      const canvas = createCanvas();
      const ctx = canvas.getContext('2d');
   
      loadImage(filePath).then((image) => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
   
        const outputStream = createWriteStream('output.webm');
        const stream = canvas.captureStream();
        const webmStream = streamToWebm(stream, { output: outputStream });
   
        webmStream.on('finish', () => {
          const mediaStream = new MediaStream();
          const videoTrack = mediaStream.addTrack(stream.getVideoTracks()[0]);
          resolve(mediaStream);
        });
   
        webmStream.on('error', (error) => {
          reject(error);
        });
      });
    });
  }
   

app.use(express.json())
app.use(cors())
app.use(express.static("./hls"))

const rc = new webrtc.RTCPeerConnection()

rc.onicecandidate = (e) => {
    console.log("New Ice Candidate")
}

rc.ondatachannel = (e) => {
    rc.dc = e.channel
    rc.dc.onmessage = (e) => console.log("Message: ", e.data)
    rc.dc.onopen = e => console.log("Connection opened")
}

// const p = new SimplePeer({ initiator: false, wrtc : webrtc })
// let offer_sdp = null, answer_sdp = null

// p.on("error", (err) => console.log("error", err));
// p.on("signal", (data) => {
//     console.log("Got My Signal: ", data)
//     offer_sdp = data
// });
// p.on("connect", () => {
//     console.log("CONNECT");
// });
// p.on("data", (data) => {
//     console.log("data: " + data);
// });

// async function work(offer) {
//     await rc.setRemoteDescription(offer)
//     console.log("Offer SET")
//     const o = await rc.createAnswer()
//     await rc.setLocalDescription(o)
//     console.log("Answer Created")
//     return rc.localDescription
// }

// app.post("/", async (req, res) => {
//     p.signal(req.body.sdp)
//     // const peerLocalDescription = await work(req.body.sdp)

//     // setTimeout(() => {

//     // }, 2000)
//     return res.send({
//         sdp: null
//     })
// })

app.post("/", async (req, res) => {
    const offer = req.body.sdp
    await rc.setRemoteDescription(offer)
    console.log("Offer SET")

    const a = await rc.createAnswer()

    await rc.setLocalDescription(a)

    console.log("Answer created")
    
    // const peerLocalDescription = await work(req.body.sdp)

    // setTimeout(() => {

    // }, 2000)
    return res.send({
        sdp: a
    })
})

app.get("/stream", async(req,res) => {
    // const videoData = fs.readFileSync("./1.mp4")

    // const stream = await createMediaStreamFromFile("./1.mp4")
    // console.log(stream)
    const stream = new webrtc.MediaStream();
    const track = new webrtc.MediaStreamTrack({
        kind: 'video',
        id: 'video',
        readyState: 'live',
        width: 640,
        height: 480,
        frameRate: 30,
        track: fs.createReadStream('./1.mp4'),
      })
    // const videoTrack = new webrtc.MediaStreamTrack();

    // const videoTrack = new mediasoup.MediaStreamTrack({
    //     kind: 'video',
    //     id: 'video',
    //     readyState: 'live',
    //     width: 640,
    //     height: 480,
    //     frameRate: 30,
    //     track: fs.createReadStream('./1.mp4'),
    //   });
    
    // stream.addTrack();
    console.log(videoTrack)

    rc.addStream(stream);
    
    return res.send({})
})

app.listen(4566, () => {
    console.log("Server connected")
})
