const remoteAudio = document.createElement("audio");

remoteAudio.autoplay = true;
remoteAudio.playsInline = true;
remoteAudio.controls = true;

document.body.appendChild(remoteAudio);

// Attach incoming WebRTC audio
peerConnection.ontrack = (event) => {
  remoteAudio.srcObject =
    event.streams[0] ??
    new MediaStream([event.track]);

  remoteAudio.play().catch(() => {
    console.log("Tap Play to enable audio.");
  });
};

// Request microphone access
async function enableMicrophone() {
  const stream =
    await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

  stream.getAudioTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
}