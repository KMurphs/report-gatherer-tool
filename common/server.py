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
from gatherer.agents import GathererMaster
import logging
import json 


logging.basicConfig(level=logging.DEBUG, format='[%(asctime)s][%(threadName)-9s][%(levelname)s]: %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')




async def handle_connections(websocket, path):
    async def notify_client(id, event, data):
        msg =  json.dumps({
            "command": "status",
            "msg": {
                "id": id,
                "event": event,
                "data": data.toDict()
            }
        })
        print(msg)
        await websocket.send(msg)

    async def get_overview_html_content_func(): 
        await websocket.send({
            "command": "get_html_file",
            "msg": ""
        })
        return await websocket.recv()

    global config, gatherer
    logging.info(f"Serving Client at: '{path}'")
     
    if path == "/":
        
        sns = [sn for sn in config["serial_numbers"] if sn.replace(" ", "") != ""]

        for sn in config["serial_numbers"]:
            notify_client(sn, "onProcessing", {})
        
        gatherer = GathererMaster(
            serial_numbers = config["serial_numbers"],
            regex_template = config["regex_template"], 
            regex_placeholder = config["regex_template_placeholder"],
            locations = config["directories_to_look_for_reports"], 
            tests_object = config["tests_to_validate_reports"],
            target_directory = config["directory_to_copy_reports_to"],
            overview_file_path = config["overview_file_path"],
            folder_to_archive = config["folder_to_archive"],
            archive_path = config["archive_file_path"],
            n_slaves = 3
        )
        await gatherer.run(notify_client)
        print("============================================================")
        
    elif path == "/save":
        msg = await websocket.recv()
        freeze_html_file(config["overview_file_path"], msg)

    elif path == "/ping":
        await websocket.send("[Server]: PONG")

    elif path == "/zip_and_stop":
        logging.debug(f"Archiving reports")
        gatherer.make_archive(config["folder_to_archive"], config["archive_file_path"])
        logging.debug(f"Stopping Server")
        gatherer.stop_gathering()
        stop.set_result(0)

    elif path == "/stop":
        logging.debug(f"Stopping Server")
        gatherer.stop_gathering()
        stop.set_result(0)

    else:
        logging.warning("Unsupported Path")







def get_config_data():
    # config_file = os.environ['REPORT_GATHERER_CONFIG_FILE_PATH']
    if len(sys.argv) > 1:
        config_file = sys.argv[1]
    logging.info(f"Configuration File at: '{config_file}'")

    with open(config_file, 'r') as f:
        config = json.load(f)

    # logging.info(f"Configuration Data Being Processed is: ", config)
    return config




async def report_gatherer_server(stop):
    global config
    
    async with websockets.serve(handle_connections, config["server_host"], config["server_port"]):
        await stop



logging.info(f"Starting server")
config = get_config_data()
gatherer = None

loop = asyncio.get_event_loop()

# The stop condition is set when receiving SIGTERM.
stop = loop.create_future()
# loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

# Run the server until the stop condition is met.
loop.run_until_complete(report_gatherer_server(stop))