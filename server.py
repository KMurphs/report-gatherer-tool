#!/usr/bin/env python

# WS server that sends messages at random intervals

import asyncio
import datetime
import random
import websockets
import sys
import os
import json

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

def get_config_data():
    config_file = os.environ['REPORT_GATHERER_CONFIG_FILE_PATH']
    if len(sys.argv) > 1:
        config_file = sys.argv[1]
    print("Configuration File Being Processed is at: ", config_file)

    with open(config_file, 'r') as f:
        config = json.load(f)
    print("Configuration Data Being Processed is: ", config)


get_config_data()
start_server = websockets.serve(serve_requests, "127.0.0.1", 5678)


asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()