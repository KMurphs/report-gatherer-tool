#!/usr/bin/env python

from queue import Queue
from threading import Thread 
import time
  
# A thread that produces data 
def producer(out_q): 
    running = 100
    while running: 
        # Produce some data 
        # ... 
        time.sleep(0.1)
        out_q.put(running)
        running = running - 1 
          
# A thread that consumes data 
def consumer(in_q: Queue): 
    while True: 
        # Get some data 
        data = in_q.get() 
        # Process the data
        print(f"Consumer processed: '{data}'") 
        # ... 
        # Indicate completion 
        in_q.task_done() 
          
# Create the shared queue and launch both threads 
q = Queue() 
t1 = Thread(target = consumer, args =(q, )) 
t2 = Thread(target = producer, args =(q, )) 
t1.start() 
t2.start() 
  
time.sleep(1)
# Wait for all produced items to be consumed 
q.join() 


print('Done')