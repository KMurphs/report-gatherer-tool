import logging
import threading
from biqueue.queue import BiQueue
from gatherer.types import Report, ReportFile, ReportTester, 
                           TestDefinition, TestReportConfigData, TestResult,
                           FindReportConfigData, CopyReportConfigData
from operator import attrgetter

"""Hello"""
class GathererMaster():
  def __init__(self, serial_numbers: List[str], 
              regex_template: str, regex_placeholder: str, locations: List[str], on_found_func, 
              tests_object: str, on_tested_func, 
              target_directory: str, on_moved_func, 
              overview_file_path, folder_to_archive, archive_path, get_overview_html_content_func,
              n_slaves = 3):

    self.q = BiQueue()
    self.must_stop = False

    gatherer_db = {}
    for sn in serial_numbers:
      gatherer_db[sn] = Report(sn)

    # run slaves
    logging.info(f"Master Gatherer Started")
    logging.debug(f"Creating Gatherer Slaves")
    
    slaves = [ GathererSlave(name = f'Slave-{index}', q) for index in n_slaves ]
    for slave in slaves:
      slave.configure_find_report_algorithm(regex_template, regex_placeholder, locations, on_found_func)
      for test in tests_object:
        slave.add_test_configuration(test_name, test_html_selector, test_expected_value, on_tested_func)
      slave.configure_move_report_algorithm(target_directory, on_moved_func)
      slave.start()


    while not self.must_stop:
      notification = q.master.get(100)
      logging.debug(notification)

      are_all_reports_copied = True
      for sn in gatherer_db.keys():
        are_all_reports_copied = are_all_reports_copied and gatherer_db[sn].was_copied
      
      if are_all_reports_copied:
        finalize_reports_gathering(overview_file_path)
        break


    for slave in slaves:
      slave.join()

    return 0

  def finalize_reports_gathering(overview_file_path, folder_to_archive, archive_path, get_overview_html_content_func):
    html = get_overview_html_content_func()
    with open(overview_file_path, "w") as f:
      f.writelines(html)
    self.make_archive(report_folder_path, archive_path)


  def make_archive(source, destination):
    base_name = '.'.join(destination.split('.')[:-1])
    format = destination.split('.')[-1]
    root_dir = os.path.dirname(source)
    base_dir = os.path.basename(source.strip(os.sep))
    shutil.make_archive(base_name, format, root_dir, base_dir)

  def stop_gathering():
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



  def configure_find_report_algorithm(self, regex_template: str, regex_placeholder: str, locations: List[str], on_found_func)
    self.find_report_configuration = FindReportConfigData(regex_template, regex_placeholder, locations, on_found_func)
  def add_test_configuration(self, test_name: str, css_selector: str, expected_value: str, on_tested_func)
    self.test_report_config_data.append(TestReportConfigData(test_name, css_selector, expected_value, on_tested_func))
  def configure_move_report_algorithm(self, target_directory: str, on_moved_func)
    self.copy_report_config_data = CopyReportConfigData(target_directory, on_moved_func)


  def run(self)
    logging.debug("Slave has started")
    while True:
      time.sleep(0.01)
      msg = self.q.slave.get()
      
      if msg is None:
        return

      self.report: Report = msg
      logging.debug("Processing Serial Number: {self.report.id}")
       


      # Find file
      if self.report.file == None or self.report.file.path == None:

        regex_template = find_report_configuration.regex_template
        regex_placeholder = find_report_configuration.regex_placeholder
        self.regex = regex_template.replace(regex_placeholder, self.report.id)
        self.regex = re.compile(self.regex)

        sn_reports: List[ReportFile] = self.find_files_by_regex(
          self.regex,
          self.find_report_config_data.locations
        )

        if len(sn_reports) == 0:
          self.on_found_func(self.report.id)
          raise Exception("No found files for serial number {self.report.id}")
          return

        sn_latest_report = max(sn_reports, key=attrgetter('last_modified'))

        self.report.attach_report_file_fromObject(sn_latest_report)
        self.on_found_func(self.report.id)



      # Run tests
      if len(self.report.testers) == 0 or self.report.has_passed_tests == False:
        for config_item in self.test_report_config_data:
          self.report.add_test_fromDefinition(config_item.definition)

        has_passed = False
        try:
          has_passed = self.report.run_tests() 
        except Exception as e:
          self.on_tested_func(self.report.id)
          raise Exception(f"Unable to complete tests for serial number {self.report.id}\n {str(e)} ")
          return

        self.on_tested_func(self.report.id)



      # copy report
      if self.report.was_copied == False:
        self.copy_files([self.report.file.path], self.copy_report_config_data.target_directory)
        try:
          self.copy_files([self.report.file.path], self.copy_report_config_data.target_directory)
        except Exception as e:
          self.on_moved_func(self.report.id)
          raise Exception(f"Unable to move report file for serial number {self.report.id}\n {str(e)} ")
          return





  def find_files_by_regex(sn_regex, dir_locations) -> List[SNReportFile]:
    
    result = []
    
    for dir_location in dir_locations:

      logging.debug(f"Processing Location '{dir_location}'")

      files = []
      try: files = [ f for f in os.listdir(dir_location) if os.path.isfile(os.path.join(dir_location, f)) ]
      except Exception as e: 
        logging.error(f"There was an issue gathering files at location {dir_location}:\n{str(e)}")
        pass


      for f in files:
        if sn_regex.search(f):
          path = os.path.join(dir_location, f)
          try: result.append(SNReportFile(f, path, os.path.getmtime(path)))
          except Exception as e: 
            logging.error(f"There was an issue retrieving nodified time for file at location {path}:\n{str(e)}")
            pass

    result.sort(key=lambda f: f.last_modified, reverse=True)
    return result



  def copy_files(file_paths, target_directory):

    dest = os.path.join(target_directory, "tmp")

    if(os.path.isdir(dest)):
      shutil.rmtree(dest)

    try: os.mkdir(dest)
    except Exception as e: 
      logging.error(f"There was an issue creating directory '{dest}':\n{str(e)}")
      pass

    for f in file_paths:
      try: shutil.copy(f, dest)
      except Exception as e: 
        logging.error(f"There was an issue copying file '{f}' to location '{dest}':\n{str(e)}")
        pass