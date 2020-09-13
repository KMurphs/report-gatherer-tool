from queue import Queue

class BiQueueNamespace():
  def __init__(slf, master_to_slaves_q: Queue, slaves_to_master_q: Queue, is_master = False):
    slf.__master_to_slaves_q = master_to_slaves_q
    slf.__slaves_to_master_q = slaves_to_master_q
    slf.is_master = is_master
  def put(slf, msg):
    if slf.is_master: slf.__master_to_slaves_q.put(msg)
    else: slf.__slaves_to_master_q.put(msg)
  def put_to_slaves(slf, msg):
    if slf.is_master: slf.__master_to_slaves_q.put(msg)
  def notify_master(slf, msg):
    if not slf.is_master: slf.__slaves_to_master_q.put(msg)
 
  def get(slf, timeout):
    if slf.is_master: return slf.__slaves_to_master_q.get(timeout)
    else: return slf.__master_to_slaves_q.get(timeout)


class BiQueue():
  """A queue that offers message and reply using 2 different Queue constructs. 
    The first one is used to send messages from te master to the slaves, and the other one from all the slaves to the master
  """
  def __init__(slf):
    
    slf.__master_to_slaves_q = Queue()
    slf.__slaves_to_master_q = Queue()

    slf.master = BiQueueNamespace(slf.__master_to_slaves_q, slf.__slaves_to_master_q, True)
    slf.slave = BiQueueNamespace(slf.__slaves_to_master_q, slf.__master_to_slaves_q, False)

