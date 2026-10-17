/* Add this script to your GitHub Pages site and call GlobalAtmosphere.join(room). */
window.GlobalAtmosphere = (() => {
  // REPLACE with the public HTTPS URL of your deployed Node.js server.
  const SERVER_URL = 'https://stun.l.google.com:19302';
  const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
  let ws, stream, myId, room;
  const connections = new Map();
  const send = data => { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)); };
  const signal = (to, payload) => send({ type: 'signal', to, signal: payload });
  async function connection(id, initiator) {
    if (connections.has(id)) return connections.get(id);
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    connections.set(id, pc);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.onicecandidate = e => { if (e.candidate) signal(id, { type: 'candidate', candidate: e.candidate }); };
    pc.ontrack = e => {
      let audio = document.getElementById('voice-' + id);
      if (!audio) { audio = document.createElement('audio'); audio.id = 'voice-' + id; audio.autoplay = true; audio.playsInline = true; document.body.append(audio); }
      audio.srcObject = e.streams[0];
    };
    if (initiator) {
      await pc.setLocalDescription(await pc.createOffer());
      signal(id, { type: 'offer', sdp: pc.localDescription });
    }
    return pc;
  }
  async function onSignal(from, signalData) {
    const pc = await connection(from, false);
    if (signalData.type === 'offer') {
      await pc.setRemoteDescription(signalData.sdp);
      await pc.setLocalDescription(await pc.createAnswer());
      signal(from, { type: 'answer', sdp: pc.localDescription });
    } else if (signalData.type === 'answer') {
      await pc.setRemoteDescription(signalData.sdp);
    } else if (signalData.type === 'candidate' && signalData.candidate) {
      try { await pc.addIceCandidate(signalData.candidate); } catch (err) { console.warn('ICE candidate:', err); }
    }
  }
  function remove(id) { connections.get(id)?.close(); connections.delete(id); document.getElementById('voice-' + id)?.remove(); }
  async function join(channel) {
    if (!['normalcy-to-normalcy', 'deplomacy-to-normalcy'].includes(channel)) throw new Error('Unknown channel');
    leave();
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    room = channel;
    const url = SERVER_URL.replace(/^http/, 'ws').replace(/\/$/, '') + '/ws';
    ws = new WebSocket(url);
    ws.onopen = () => send({ type: 'join', room });
    ws.onmessage = async event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'joined') { myId = msg.id; for (const id of msg.peers) await connection(id, true); }
        if (msg.type === 'signal') await onSignal(msg.from, msg.signal);
        if (msg.type === 'peer-left') remove(msg.id);
        if (msg.type === 'error') console.error(msg.message);
      } catch (err) { console.error('Voice signaling error:', err); }
    };
    ws.onerror = () => console.error('Cannot connect to voice server');
  }
  function leave() { if (ws) { send({ type: 'leave' }); ws.close(); ws = null; } for (const id of connections.keys()) remove(id); stream?.getTracks().forEach(t => t.stop()); stream = null; myId = null; room = null; }
  function mute(value) { stream?.getAudioTracks().forEach(track => { track.enabled = !value; }); }
  return { join, leave, mute };
})();
