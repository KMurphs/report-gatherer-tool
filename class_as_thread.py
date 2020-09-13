import threading
import time

class mythread(threading.Thread):

  def __init__(self, i):
    threading.Thread.__init__(self, name = "my-wesome-thread")
    self.h = i


  def add_attibute(self, i):
    self.z = i


  def run(self):
    while True:
      time.sleep(.250)
      print("\n\n")
      print(threading.current_thread().name)
      print(threading.get_ident())
      print("Value send", self.h)
      self.h["name"] = "test3"
      print("Value send", self.h)
      try:
        print(self.z)
        if self.z == "stop":
          return
      except Exception as e:
        print("z does not exists yet" + str(e))
        pass



obj = {}
obj[1] = {"name": "test1"}
obj[2] = {"name": "test2"}
thread1 = mythread(obj[1])

thread1.start()
time.sleep(2)

thread1.add_attibute(3)
time.sleep(2)

thread1.add_attibute("stop")
time.sleep(1)

thread1.join()
print(obj)