import logging
import threading
from biqueue.queue import BiQueue
from gatherer.types import Report, ReportFile, ReportTester, TestDefinition, TestReportConfigData, TestResult, FindReportConfigData, CopyReportConfigData
from operator import attrgetter
from typing import List
import time
import re
import os
import shutil
import json



class GathererMaster():
  """Hello"""
  def __init__(self, serial_numbers: List[str], 
              regex_template: str, regex_placeholder: str, locations: List[str], 
              tests_object: str, 
              target_directory: str, 
              overview_file_path, folder_to_archive, archive_path,
              n_slaves = 3):

    self.q = BiQueue()
    self.must_stop = False

    self.gatherer_db = {}
    for sn in serial_numbers:
      self.gatherer_db[sn] = Report(sn)
      self.q.master.put(self.gatherer_db[sn])
    for _ in range(n_slaves):
      self.q.master.put(None)



    # run slaves
    logging.info(f"Master Gatherer Started")
    logging.debug(f"Creating and Configuring Gatherer Slaves")
    
    self.slaves: List[GathererSlave] = [ GathererSlave(thread_name = f'Slave-{index}', q = self.q) for index in range(n_slaves) ]
    for slave in self.slaves:
      slave.configure_find_report_algorithm(regex_template, regex_placeholder, locations)
      for test in tests_object:
        slave.add_test_configuration(test["test_friendly_name"], test["test_token_html_path"], test["test_token_expected_value"])
      slave.configure_copy_report_algorithm(target_directory)
      
      



  async def run(self, callback): 
    logging.debug(f"Gathering operation are started")
    for slave in self.slaves:
      try:
        slave.start()
      except Exception as e:
        logging.error(f"{str(e)}")
        pass

    # for _ in range(30):
    are_all_reports_processed = False
    while not are_all_reports_processed:

      try:
        notification = self.q.master.get(block = True, timeout = 1)
        logging.debug(f"Notification: {str(notification)}")

        await callback(notification["id"], notification["event"], self.gatherer_db[notification["id"]])

      except Exception as e:

        are_all_reports_processed = True
        for sn in self.gatherer_db.keys():
          are_all_reports_processed = are_all_reports_processed and self.gatherer_db[sn].was_processed

        continue



      are_all_reports_copied = True
      for sn in self.gatherer_db.keys():
        are_all_reports_copied = are_all_reports_copied and self.gatherer_db[sn].was_copied
      
      if are_all_reports_copied:
        self.finalize_reports_gathering(overview_file_path)
        break


    for slave in self.slaves:
      slave.join()

    return 0

  def finalize_reports_gathering(self, overview_file_path, folder_to_archive, archive_path, get_overview_html_content_func):
    html = get_overview_html_content_func()
    with open(overview_file_path, "w") as f:
      f.writelines(html)
    self.make_archive(report_folder_path, archive_path)


  def make_archive(self, source, destination):
    base_name = '.'.join(destination.split('.')[:-1])
    format = destination.split('.')[-1]
    root_dir = os.path.dirname(source)
    base_dir = os.path.basename(source.strip(os.sep))
    shutil.make_archive(base_name, format, root_dir, base_dir)

  def stop_gathering(self):
    self.must_stop = True




























class GathererSlave(threading.Thread):
  def __init__(self, 
      thread_name: str, 
      q: BiQueue
    ):

    threading.Thread.__init__(self, name = thread_name)
    self.q = q
    

    self.find_report_config_data: FindReportConfigData
    self.test_report_config_data: List[TestReportConfigData] = []
    self.copy_report_config_data: CopyReportConfigData

    self.regex = None



  def configure_find_report_algorithm(self, regex_template: str, regex_placeholder: str, locations: List[str]):
    self.find_report_config_data = FindReportConfigData(regex_template, regex_placeholder, locations)
  def add_test_configuration(self, test_name: str, css_selector: str, expected_value: str):
    self.test_report_config_data.append(TestReportConfigData(test_name, css_selector, expected_value))
  def configure_copy_report_algorithm(self, target_directory: str):
    self.copy_report_config_data = CopyReportConfigData(target_directory)


  def run(self):
    logging.debug(f"Slave has started")
    while True:
      time.sleep(0.100)
      msg = self.q.slave.get(timeout=1)
      # logging.debug(f"{msg}")

      
      if msg is None:
        logging.debug(f"Slave is Terminating")
        return

      self.report: Report = msg
      self.report.was_processed = False
      logging.debug(f"Processing Serial Number: {self.report.id}")
       

      
      # Find file
      if self.report.file == None or self.report.file.path == None:

        regex_template = self.find_report_config_data.regex_template
        regex_placeholder = self.find_report_config_data.regex_placeholder
        self.regex = regex_template.replace(regex_placeholder, self.report.id)
        self.regex = re.compile(self.regex)
        
        sn_reports: List[ReportFile] = self.find_files_by_regex(
          self.regex,
          self.find_report_config_data.locations
        )


        if len(sn_reports) == 0:
          
          self.q.slave.put({
            "id": self.report.id,
            "event": "on_found"
          })
          logging.error(f"No found files for serial number {self.report.id}")
          self.report.was_processed = True
          continue

        sn_latest_report = max(sn_reports, key=attrgetter('last_modified'))

        self.report.attach_report_file_fromObject(sn_latest_report)
        self.q.slave.put({
          "id": self.report.id,
          "event": "on_found"
        })



      # Run tests
      has_passed = False
      if len(self.report.testers) == 0 or self.report.has_passed_tests == False:
        for config_item in self.test_report_config_data:
          self.report.add_test_fromDefinition(config_item.definition)
        
        try:
          has_passed = self.report.run_tests() 
        except Exception as e:
          self.q.slave.put({
            "id": self.report.id,
            "event": "on_tested"
          })
          logging.error(f"Unable to complete tests for serial number {self.report.id}\n {str(e)} ")
          self.report.was_processed = True
          continue

        self.q.slave.put({
          "id": self.report.id,
          "event": "on_tested"
        })
        if has_passed == False:
          self.report.was_processed = True
          continue


      # copy report
      if self.report.was_copied == False:
        self.copy_files([self.report.file.path], self.copy_report_config_data.target_directory)
        try:
          self.report.was_copied = self.copy_files([self.report.file.path], self.copy_report_config_data.target_directory)
          self.report.copy_file_path = os.path.join(self.copy_report_config_data.target_directory, self.report.file.name)
          self.q.slave.put({
            "id": self.report.id,
            "event": "on_copied"
          })
        except Exception as e:
          self.q.slave.put({
            "id": self.report.id,
            "event": "on_copied"
          })
          logging.error(f"Unable to copy report file for serial number {self.report.id}\n {str(e)} ")
          self.report.was_processed = True
          continue

      self.report.was_processed = True





  def find_files_by_regex(self, sn_regex, dir_locations) -> List[ReportFile]:
    
    result: List[ReportFile] = []
    
    for dir_location in dir_locations:

      logging.debug(f"Processing Location '{dir_location}'")

      files = []
      try: files = [ f for f in os.listdir(dir_location) if os.path.isfile(os.path.join(dir_location, f)) ]
      except Exception as e: 
        logging.error(f"There was an issue gathering files at location '{dir_location}':\n{str(e)}")
        pass


      for f in files:
        if sn_regex.search(f):
          path = os.path.join(dir_location, f)
          try: result.append(ReportFile(f, path, int(os.path.getmtime(path) * 1000)))
          except Exception as e: 
            logging.error(f"There was an issue retrieving nodified time for file at location '{path}':\n{str(e)}")
            pass

    result.sort(key=lambda f: f.last_modified, reverse=True)
    return result



  def copy_files(self, file_paths, target_directory) -> bool:

    dest = os.path.join(target_directory, "tmp")
    dest = target_directory

    # if(os.path.isdir(dest)):
    #   shutil.rmtree(dest)

    try: os.mkdir(dest)
    except Exception as e: 
      # logging.error(f"There was an issue creating directory '{dest}':\n{str(e)}")
      pass

    for f in file_paths:
      try: 
        shutil.copy(f, dest)
        return True
      except Exception as e: 
        logging.error(f"There was an issue copying file '{f}' to location '{dest}':\n{str(e)}")
        return False
        pass