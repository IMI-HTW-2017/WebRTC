import {createRTCPeerConnection, negotiateLocalDescription} from "./rtcutils.js";

let peerConnection = null;
let signalingChannel = null;

let localVideo = null;
let remoteStream = null;

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#connect").addEventListener("click", makeCall);
    localVideo = document.querySelector("#local_video");
    const remoteVideo = document.querySelector("#remote_video");
    remoteVideo.srcObject = remoteStream = new MediaStream();

    // Create websocket connection for signaling
    signalingChannel = new WebSocket("ws://localhost:3000/", "webrtc-test");
    signalingChannel.addEventListener("close", () => console.log("Closed WebSocket Connection"));
});

async function makeCall() {
    // Setup RTC peer connection
    //const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
    peerConnection = await createRTCPeerConnection(localVideo, remoteStream);

    // Setup signaling event listener
    signalingChannel.addEventListener("message", async message => {
        const parsedMessage = JSON.parse(message.data);
        if (parsedMessage.answer)
            // Set answer as remote description
            await peerConnection.setRemoteDescription(parsedMessage.answer);
    });

    // Send offer
    const offer = await negotiateLocalDescription(peerConnection, true);
    signalingChannel.send(JSON.stringify({"offer": offer}));
}
