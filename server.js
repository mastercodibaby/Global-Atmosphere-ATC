'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');
const root = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);
const MAX_ROOM = Number(process.env.MAX_ROOM || 8);
const rooms = new Map([['normalcy', new Map()], ['deplomacy', new Map()]]);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
  const pathname = new URL(req.url,'http://localhost').pathname;
  const name = pathname === '/' ? '/index.html' : pathname;
  const target = path.resolve(root, '.' + name);
  if (!target.startsWith(root + path.sep)) {res.writeHead(403);res.end('Forbidden');return;}
  fs.readFile(target,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; connect-src 'self' ws: wss:; style-src 'self'; script-src 'self'; img-src 'self' data:; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'});res.end(data);
  });
});
const wss = new WebSocketServer({server, maxPayload: 65536});
function send(ws, obj){if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify(obj));}
function broadcast(room, obj, except){for(const [id,ws] of rooms.get(room)) if(id!==except) send(ws,obj);}
function leave(ws){if(!ws.room)return; const room=ws.room,id=ws.id;rooms.get(room).delete(id);ws.room=null;broadcast(room,{type:'peer-left',id});}
wss.on('connection',ws=>{
  ws.id=crypto.randomUUID();ws.room=null;ws.rate=[];
  ws.on('message',raw=>{
    const now=Date.now();ws.rate=ws.rate.filter(t=>now-t<10000);if(ws.rate.length>=100){ws.close(1008,'Rate limit');return;}ws.rate.push(now);
    let msg;try{msg=JSON.parse(raw.toString());}catch{return;}
    if(msg.type==='join'){
      if(ws.room)return;
      const room=msg.room;
      if(!rooms.has(room)){send(ws,{type:'error',message:'Unknown channel'});return;}
      const members=rooms.get(room);
      if(members.size>=MAX_ROOM){send(ws,{type:'error',message:'Channel is full'});return;}
      ws.room=room;members.set(ws.id,ws);
      send(ws,{type:'joined',id:ws.id,room,peers:[...members.keys()].filter(id=>id!==ws.id)});
      broadcast(room,{type:'peer-joined',id:ws.id},ws.id);
      return;
    }
    if(msg.type==='leave'){leave(ws);return;}
    if(msg.type==='signal' && ws.room && typeof msg.to==='string' && ['offer','answer','candidate'].includes(msg.kind)){
      const other=rooms.get(ws.room).get(msg.to);
      if(other && JSON.stringify(msg.data).length<32000) send(other,{type:'signal',from:ws.id,kind:msg.kind,data:msg.data});
    }
  });
  ws.on('close',()=>leave(ws));ws.on('error',()=>leave(ws));
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Global Atmosphere listening on ${PORT}`));
