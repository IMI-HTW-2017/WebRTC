import {createRTCPeerConnection, negotiateLocalDescription} from "./rtcutils.js";

let peerConnection = null;
let signalingChannel = null;

let localVideo = null;
let remoteStream = null;

window.addEventListener("DOMContentLoaded", async () => {
    // Setup HTML video elements
    localVideo = document.querySelector("#local_video");
    const remoteVideo = document.querySelector("#remote_video");
    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;

    // Create RTC peer connection
    //const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
    peerConnection = await createRTCPeerConnection(localVideo, remoteStream);

    // Create websocket connection for signaling
    signalingChannel = new WebSocket("ws://localhost:3000", "webrtc-test");
    signalingChannel.addEventListener("close", () => console.log("Closed WebSocket Connection"));

    // Setup signaling event listener
    signalingChannel.addEventListener("message", async message => {
        const parsedMessage = JSON.parse(message.data);
        if (parsedMessage.offer) {
            // Set offer as remote description
            await peerConnection.setRemoteDescription(parsedMessage.offer);
            // Send answer
            const answer = await negotiateLocalDescription(peerConnection, false);
            signalingChannel.send(JSON.stringify({"answer": answer}));
        }
    });
});
