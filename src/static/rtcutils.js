export async function createRTCPeerConnection(localVideo, remoteStream, configuration = undefined) {
    const peerConnection = new RTCPeerConnection(configuration);

    // Add media tracks to connection
    const localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    localVideo.srcObject = localStream;

    peerConnection.addEventListener("connectionstatechange", () => console.log(peerConnection.connectionState));
    peerConnection.addEventListener("track", async event => remoteStream.addTrack(event.track));

    return peerConnection;
}

export function negotiateLocalDescription (connection, offering) {
    return new Promise((resolve) => {
        console.log("waiting for ice candidate");
        connection.onicecandidate = event => {
            console.log("found ice candidate");
            if (!event.candidate) {
                delete connection.onicecandidate;
                console.log("finished ice candidate search");
                resolve(connection.localDescription);
            }
        };
        let promise = offering ? connection.createOffer() : connection.createAnswer();
        promise.then(sessionDescription => connection.setLocalDescription(sessionDescription));
    });
}
