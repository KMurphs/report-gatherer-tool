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


logging.basicConfig(level=logging.DEBUG, format='(%(threadName)-9s) %(message)s',)



async def handle_connections(websocket, path):
    print("Serving Client at: ", path)
     
    if path == "/":
        global config, gatherer

        gatherer = GathererMaster(
            serial_numbers = config["serial_numbers"],
            regex_template = config["regex_template"], 
            regex_placeholder = config["regex_template_placeholder"],
            locations = config["directories_to_look_for_reports"], 
            on_found_func, 
            tests_object = config["tests_to_validate_reports"],
            on_tested_func, 
            target_directory = config["directory_to_copy_reports_to"],
            on_moved_func, 
            overview_file_path = config["overview_file_path"],
            folder_to_archive = config["folder_to_archive"],
            archive_path = config["archive_file_path"],
            get_overview_html_content_func,
            n_slaves = 3
        )
        
    elif path == "/save":
        msg = await websocket.recv()
        freeze_html_file(config["overview_file_path"], msg)

    elif path == "/ping":
        await websocket.send("[Server]: PONG")

    elif path == "/zip_and_stop":
        print("Archiving reports")
        gatherer.make_archive(config["folder_to_archive"], config["archive_file_path"])
        print("Stopping Server")
        gatherer.stop_gathering()
        stop.set_result(0)

    elif path == "/stop":
        print("Stopping Server")
        gatherer.stop_gathering()
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



logging.info("Starting server")
config = get_config_data()
gatherer = None

loop = asyncio.get_event_loop()

# The stop condition is set when receiving SIGTERM.
stop = loop.create_future()
# loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

# Run the server until the stop condition is met.
loop.run_until_complete(report_gatherer_server(stop))