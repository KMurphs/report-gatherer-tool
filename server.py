#!/usr/bin/env python

# WS server that sends messages at random intervals

import asyncio
import datetime
import random
import websockets

async def serve_requests(websocket, path):
    print("Serving Client at: ", path)
    
    if path == "/":
        while True:
            now = datetime.datetime.utcnow().isoformat() + "Z"
            await websocket.send(now)
            await asyncio.sleep(random.random() * 3)

    elif path == "/save":
        msg = await websocket.recv()
        msg = msg.replace('disable-on-frozen','disable-on-frozen--active')
        msg = msg.replace('<script src="client.js"></script>', '<!-- <script src="client.js"></script> -->')
        with open("frozen_client.html", "w") as f:
            f.writelines(msg)

    else:
        print("Unsupported Path")

start_server = websockets.serve(serve_requests, "127.0.0.1", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()