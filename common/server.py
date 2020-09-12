#!/usr/bin/env python

# WS server that sends messages at random intervals

import asyncio
import datetime
import random
import websockets
import sys
import os
import json
import threading
import time
from queue import Queue

import gatherer



def gather_report(q: Queue, notifier: Queue):
    print(threading.current_thread().name)
    print(threading.get_ident())
    threadName = threading.current_thread().name
    while True:
        time.sleep(0.01)
        sn = q.get()

        if sn is None:
            return

        print(f"({threadName}) Processing Serial Number {sn}")
        # process the serial number
        time.sleep(0.1)
        # notify that processing is complete
        print(f"({threadName}) Notify Processing Complete for Serial Number {sn}")
        notifier.put(sn)

def freeze_html_file(html_filename, html_content):
    html_content = html_content.replace('disable-on-frozen','disable-on-frozen--active')
    html_content = html_content.replace('<script src="html_utils/scripts/client.js"></script>', '<!-- <script src="client.js"></script> -->')
    with open(html_filename, "w") as f:
        f.writelines(html_content)



async def handle_connections(websocket, path):
    print("Serving Client at: ", path)

    if path == "/":
        global config

        notifications_q = Queue()
        data_q = Queue() 


        # run my consumers
        n_consumers = 3
        print(f"(Producer) Spinning Consummers")
        consumers = [threading.Thread(name=f'consumer-{index + 1}', target=gather_report, args=(data_q, notifications_q)) for index in range(n_consumers)]
        for c in consumers:
            c.start()


        # enqueue my sns
        sns = config["serial_numbers"]
        for sn in sns:
            data_q.put(sn)
            print(f"(Producer) Serial Number '{sn}': Scheduled")

        [data_q.put(None) for _ in range(n_consumers)] # One for each consumer

        # serve notifications
        while len(sns) > 0:
            notification = notifications_q.get()
            sns.remove(notification)
            msg = f"(Producer) Serial Number '{notification}': Complete - ({len(sns)} remaining)"
            print(msg)
            # await websocket.send("hello")
            await websocket.send(json.dumps({
                "command": "status",
                "data": msg
            }))
            

        # Wait for producers to finish
        for c in consumers:
            c.join()

        await websocket.send(json.dumps({
            "command": "get_html_file",
            "data": ""
        }))
        msg = await websocket.recv()
        print(msg)
        freeze_html_file(config["overview_file_path"], msg)

        # stop.set_result(0)
        
        


        
    elif path == "/save":
        msg = await websocket.recv()
        freeze_html_file(config["overview_file_path"], msg)




    elif path == "/ping":
        await websocket.send("[Server]: PONG")

    elif path == "/zip_and_stop":
        print("Archiving reports")
        gatherer.make_archive(str(config["archive_file_path"]).replace(".zip", ""), config["archive_file_path"])
        print("Stopping Server")
        stop.set_result(0)

    elif path == "/stop":
        print("Stopping Server")
        stop.set_result(0)

    else:
        print("Unsupported Path")

def get_config_data():
    # config_file = os.environ['REPORT_GATHERER_CONFIG_FILE_PATH']
    if len(sys.argv) > 1:
        config_file = sys.argv[1]
    print("Configuration File at: ", config_file)

    with open(config_file, 'r') as f:
        config = json.load(f)

    # print("Configuration Data Being Processed is: ", config)
    return config




async def report_gatherer_server(stop):
    global config
    
    async with websockets.serve(handle_connections, config["server_host"], config["server_port"]):
        await stop



print("Starting server")
config = get_config_data()

loop = asyncio.get_event_loop()

# The stop condition is set when receiving SIGTERM.
stop = loop.create_future()
# loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

# Run the server until the stop condition is met.
loop.run_until_complete(report_gatherer_server(stop))