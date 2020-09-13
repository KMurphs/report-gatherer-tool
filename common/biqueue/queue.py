from queue import Queue
from typing import Optional

class BiQueueNamespace():
  def __init__(self, master_to_slaves_q: Queue, slaves_to_master_q: Queue, is_master = False):
    self.__master_to_slaves_q = master_to_slaves_q
    self.__slaves_to_master_q = slaves_to_master_q
    self.is_master = is_master
  def put(self, msg):
    if self.is_master: self.__master_to_slaves_q.put(msg)
    else: self.__slaves_to_master_q.put(msg)
  def put_to_slaves(self, msg):
    if self.is_master: self.__master_to_slaves_q.put(msg)
  def notify_master(self, msg):
    if not self.is_master: self.__slaves_to_master_q.put(msg)
 
  def get(self, block: Optional[bool] = True, timeout: Optional[float] = 0.1):
    if self.is_master: return self.__slaves_to_master_q.get(block, timeout)
    else: return self.__master_to_slaves_q.get(block, timeout)



class BiQueue():
  """A queue that offers message and reply using 2 different Queue constructs. 
    The first one is used to send messages from te master to the slaves, and the other one from all the slaves to the master
  """
  def __init__(self):

    self.__master_to_slaves_q = Queue()
    self.__slaves_to_master_q = Queue()

    self.master = BiQueueNamespace(self.__master_to_slaves_q, self.__slaves_to_master_q, True)
    self.slave = BiQueueNamespace(self.__master_to_slaves_q, self.__slaves_to_master_q, False)

  def lengths(self):
    return {
      "master_to_slave": self.__master_to_slaves_q.qsize(),
      "slaves_to_master": self.__slaves_to_master_q.qsize()
    }