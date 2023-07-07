const webrtc = require("wrtc")
const express = require("express")
const cors = require("cors")
const app = express()
const SimplePeer = require("simple-peer")

app.use(express.json())
app.use(cors())
app.use(express.static("./hls"))

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
//     return res.send({
//         sdp: null
//     })
// })

const Mux = require('@mux/mux-node')
const { Video } = new Mux("c07b0529-c733-4604-8304-761f67c9886a", "fRn/vfX/XsQ9izi2KqCGyWai0KXdzLdkgQAaa4yIYvt1iQ1jDUnYBT33bkaVwgxYrYm0tsv9qFb");

app.get("/", async (req, res) => {
    console.log("send req", Date.now())
    const asset = await Video.Assets.create({
        // input: "https://muxed.s3.amazonaws.com/leds.mp4",
        input: "https://access2successonline.com/leds.mp4",
        playback_policy: "public"
    });
    console.log("receive res", Date.now())
    console.log(asset)
    return res.send({})
})

app.post("/webhook", async (req, res) => {
    const resp = req.body
    if(resp['type'] === "video.asset.created"){
        console.log("asset created", Date.now())
        // console.log(resp)
    }
    return res.send(req.body)
})


app.listen(4566, () => {
    console.log("Server connected")
})
