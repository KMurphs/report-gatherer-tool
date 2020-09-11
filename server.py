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





async def handle_connections(websocket, path):
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

    elif path == "/monitor":
        my_sns = await websocket.recv()
        print(my_sns)

        notifications_q = Queue()
        data_q = Queue() 


        # run my consumers
        n_consumers = 3
        print(f"(Producer) Spinning Consummers")
        consumers = [threading.Thread(name=f'consumer-{index + 1}', target=gather_report, args=(data_q, notifications_q)) for index in range(n_consumers)]
        for c in consumers:
            c.start()


        # enqueue my sns
        sns = [1,2,3,4,5,6,7,8,9,10]
        for sn in sns:
            data_q.put(sn)
            print(f"(Producer) Serial Number '{sn}': Scheduled")

        [data_q.put(None) for _ in range(n_consumers)] # One for each consumer

        # serve notifications
        while len(sns) > 0:
            notification = notifications_q.get()
            sns.remove(notification)
            print(f"(Producer) Serial Number '{notification}': Complete - ({len(sns)} remaining)")
            

        # Wait for producers to finish
        for c in consumers:
            c.join()
        

    elif path == "/stop":
        print("Stopping Server")
        stop.set_result(0)

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


# get_config_data()
# start_server = websockets.serve(handle_connections, "127.0.0.1", 5678)

# stop_server = asyncio.get_event_loop().create_future()

# asyncio.get_event_loop().run_until_complete(start_server)
# asyncio.get_event_loop().run_forever()






async def report_gatherer_server(stop):
    async with websockets.serve(handle_connections, "127.0.0.1", 5678):
        await stop



loop = asyncio.get_event_loop()

# The stop condition is set when receiving SIGTERM.
stop = loop.create_future()
# loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

# Run the server until the stop condition is met.
loop.run_until_complete(report_gatherer_server(stop))