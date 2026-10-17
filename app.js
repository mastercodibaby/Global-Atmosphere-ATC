'use strict';
const SIGNALING_URL = "wss://localhost:3000;
ws = new WebSocket(SIGNALING_URL);
const $=id=>document.getElementById(id);
const titles={normalcy:'Normalcy to Normalcy',deplomacy:'Deplomacy to Normalcy'};
const buttons=[...document.querySelectorAll('[data-room]')];
const peers=new Map();
let ws=null,stream=null,room=null,selfId=null,muted=false;
// STUN is for peer discovery. For reliable cross-network connectivity, configure a TURN server.
function status(s){$('status').textContent=s;}
function count(){ $('participantCount').textContent=`${peers.size+1} participant${peers.size===0?'':'s'} including you`; }
function send(obj){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj));}
function cleanupPeer(id){const p=peers.get(id);if(!p)return;p.pc.close();p.audio.remove();peers.delete(id);count();}
function makePeer(id){if(peers.has(id))return peers.get(id);const pc=new RTCPeerConnection({iceServers});const audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audio.dataset.peer=id;$('audioContainer').appendChild(audio);const p={pc,audio};peers.set(id,p);stream.getTracks().forEach(t=>pc.addTrack(t,stream));pc.ontrack=e=>{audio.srcObject=e.streams[0];audio.play().catch(()=>status('Tap the page to allow audio playback'));};pc.onicecandidate=e=>{if(e.candidate)send({type:'signal',to:id,kind:'candidate',data:e.candidate});};pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')status('A peer connection failed. A TURN server may be needed.');};count();return p;}
async function offer(id){const p=makePeer(id);await p.pc.setLocalDescription(await p.pc.createOffer());send({type:'signal',to:id,kind:'offer',data:p.pc.localDescription});}
async function handleSignal(m){let p=peers.get(m.from);if(!p)p=makePeer(m.from);if(m.kind==='offer'){await p.pc.setRemoteDescription(m.data);await p.pc.setLocalDescription(await p.pc.createAnswer());send({type:'signal',to:m.from,kind:'answer',data:p.pc.localDescription});}else if(m.kind==='answer'){await p.pc.setRemoteDescription(m.data);}else if(m.kind==='candidate'){try{await p.pc.addIceCandidate(m.data);}catch(e){console.warn('ICE candidate failed',e);}}}
async function join(selected){if(room)return;buttons.forEach(b=>b.disabled=true);room=selected;status('Requesting microphone access…');try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Microphone requires HTTPS or localhost');stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}`);ws.onopen=()=>{send({type:'join',room});status('Connecting to channel…');};ws.onmessage=async ev=>{try{const m=JSON.parse(ev.data);if(m.type==='joined'){$('session').hidden=false;$('channelTitle').textContent=titles[room];selfId=m.id;count();status('Connected — microphone live');for(const id of m.peers)await offer(id);}else if(m.type==='peer-left')cleanupPeer(m.id);else if(m.type==='signal')await handleSignal(m);else if(m.type==='error'){status(m.message);leave(false);}}catch(e){console.error(e);status('Voice connection error: '+e.message);}};ws.onclose=()=>{if(room){leave(false);status('Disconnected from server');}};ws.onerror=()=>status('Unable to reach the voice server');}catch(e){status(e.message);leave(false);}}
function leave(update=true){const old=ws;ws=null;if(old){if(old.readyState===WebSocket.OPEN)old.send(JSON.stringify({type:'leave'}));old.onclose=null;old.close();}for(const id of [...peers.keys()])cleanupPeer(id);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}room=null;selfId=null;muted=false;$('mute').textContent='Mute microphone';$('session').hidden=true;buttons.forEach(b=>b.disabled=false);if(update)status('Left channel');}
buttons.forEach(b=>b.addEventListener('click',()=>join(b.dataset.room)));
$('leave').addEventListener('click',()=>leave());
$('mute').addEventListener('click',()=>{if(!stream)return;muted=!muted;stream.getAudioTracks().forEach(t=>t.enabled=!muted);$('mute').textContent=muted?'Unmute microphone':'Mute microphone';status(muted?'Microphone muted':'Microphone live');});
window.addEventListener('beforeunload',()=>leave(false));
