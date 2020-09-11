import os
import re
import shutil
from bs4 import BeautifulSoup
from typing import List
import datetime
import functools
from operator import attrgetter
import logging


serial_numbers = ["serial_number_1", "serial_number_2", "serial_number_3", "serial_number_4", "serial_number_5", "serial_number_6", "serial_number_7", "serial_number_8", "serial_number_9", "serial_number_10", "serial_number_N"]


regex_template = "(report_file).*(!xxserial_numberxx!).*(.html)$"
# regex_template = "(report_file).*([xxserial_numberxx]).*(.html)$"
regex_template_placeholder = "!xxserial_numberxx!"



directories_to_look_for_reports = [	
  "c:\\reports\\folder_a",		
  "c:\\reports\\folder_b"		
]
directory_to_copy_reports_to = "C:\\PersonalProjects\\report-gatherer\\dist\\tmp_project"




tests_to_validate_reports = [	
  { 
    "test_friendly_name": "test 1",
    "test_token_css_selector": "button:nth-child(2)", 
    "test_token_expected_value": "stop server" 
  },
  { 
    "test_friendly_name": "test 2",
    "test_token_css_selector": "span>span>span>span", 
    "test_token_expected_value": "Awesome" 
  },
  { 
    "test_friendly_name": "test 3",
    "test_token_css_selector": "span>span>span>span>span", 
    "test_token_expected_value": "Awesome" 
  }
]

class SNReportFile:
  def __init__(self, file_name: str, file_path: str, file_last_modified: float):
    assert file_name != "" and file_name != None, "Attempting Construction of 'SNReportFile' Object with no Name"
    assert file_path != "" and file_path != None, "Attempting Construction of 'SNReportFile' Object with no Path"
    assert file_last_modified != 0 and file_last_modified != None, "Attempting Construction of 'SNReportFile' Object with no last_modified field"
    self.name = file_name
    self.last_modified = file_last_modified
    self.path = file_path
  @classmethod
  def fromObject(self, obj):
    return SNReportTest(
      obj["name"] if "name" in obj.keys() else "",
      obj["path"] if "path" in obj.keys() else "",
      obj["last_modified"] if "last_modified" in obj.keys() else 0,
    )
  def __str__(self):
    return f"Report '{self.name}' (Last Modified: {(datetime.datetime.utcfromtimestamp(int(self.last_modified))).strftime('%m/%d/%Y, %H:%M:%S')})"
class SNReportTest:
  def __init__(self, test_name: str, test_expected_value: str, test_actual_value: str, test_has_passed: bool):
    assert test_name != "" and test_name != None, "Attempting Construction of 'SNReportTest' Object with no Name"
    assert test_expected_value != "" and test_expected_value != None, "Attempting Construction of 'SNReportTest' Object with no Expected Value"
    assert test_actual_value != "" and test_actual_value != None, "Attempting Construction of 'SNReportTest' Object with no Actual Test Value"
    assert test_has_passed != "" and test_has_passed != None, "Attempting Construction of 'SNReportTest' Object with no Pass Fail Status"
    self.name = test_name
    self.expected_value = test_expected_value
    self.actual_value = test_actual_value
    self.has_passed = test_has_passed
  @classmethod
  def fromObject(self, obj):
    return SNReportTest(
      obj["name"] if "name" in obj.keys() else "",
      obj["expected_value"] if "expected_value" in obj.keys() else "",
      obj["actual_value"] if "actual_value" in obj.keys() else "",
      obj["has_passed"] if "has_passed" in obj.keys() else "",
    )
  def __str__(self):
    return f"Test '{self.name}': {'PASS' if self.has_passed else 'FAIL'} - Expected '{self.expected_value}' but got '{self.actual_value}'"
class SNTestedReport:
  def __init__(self, report_file: SNReportFile, report_tests: List[SNReportTest]):
    assert report_file.name != "" and report_file.name != None, "Attempting Construction of 'SNTestedReport' Object with invalid 'SNReportFile'"
    for test in report_tests:
      assert test.name != "" and test.name != None, "Attempting Construction of 'SNTestedReport' Object with invalid 'SNReportTest' item"
    self.file = report_file
    self.tests = report_tests
  def __str__(self):
    return f"Report '{self.file.name}' Test Results: {' '.join(['[PASS]' if test.has_passed else '[FAIL]' for test in self.tests])}"
  def get_pass_fail(self) -> bool:
    return functools.reduce(lambda a, b: a and b, [test.has_passed for test in self.tests])






def find_files_by_regex(sn_regex, dir_locations) -> List[SNReportFile]:
  
  result = []
  
  for dir_location in dir_locations:

    print(f"Processing Location '{dir_location}'")

    files = []
    try: files = [ f for f in os.listdir(dir_location) if os.path.isfile(os.path.join(dir_location, f)) ]
    except Exception: 
      logging.warn(f"There was an issue gathering files at location {dir_location}")
      pass


    for f in files:
      if sn_regex.search(f):
        path = os.path.join(dir_location, f)
        try: result.append(SNReportFile(f, path, os.path.getmtime(path)))
        except Exception: 
          logging.warn(f"There was an issue retrieving nodified time for file at location {path}")
          pass

  result.sort(key=lambda f: f.last_modified, reverse=True)
  return result




def copy_files(file_paths, target_directory):

  dest = os.path.join(target_directory, "tmp")

  if(os.path.isdir(dest)):
    shutil.rmtree(dest)

  try: os.mkdir(dest)
  except Exception: 
    logging.warn(f"There was an issue copying file '{f}' to location '{dest}'")
    pass

  for f in file_paths:
    try: shutil.copy(f, dest)
    except Exception: 
      logging.warn(f"There was an issue copying file '{f}' to location '{dest}'")
      pass



def test_html_file_content(report_path: str, tests_object) -> List[SNReportTest]:

  tests_results = []


  try: 

    with open(report.path, "r") as f:
      html = f.read()  
      soup = BeautifulSoup(html, 'html5lib')


    for test in tests_object:
      html_elements = soup.select(test["test_token_css_selector"])

      if(len(html_elements) == 0):
        res = "not found"
      else:
        res = html_elements[0].text

      tests_results.append(SNReportTest.fromObject({
        "name": test["test_friendly_name"],
        "has_passed": res == test["test_token_expected_value"], 
        "actual_value": res,
        "expected_value": test["test_token_expected_value"]
      }))


  except Exception: 
    logging.warn(f"There was an issue testing html content of file '{f}'")
    pass

  return tests_results







if __name__ == "__main__":
  sn = "serial_number_1"


  sn_regex =regex_template.replace(regex_template_placeholder, sn)
  sn_regex = re.compile(sn_regex)
  sn_reports = find_files_by_regex(sn_regex, directories_to_look_for_reports)

  sn_tested_reports = []
  for report in sn_reports:
    test_results = test_html_file_content(report.path, tests_to_validate_reports)
    sn_tested_reports.append(SNTestedReport(report, test_results))
  [print(f) for f in sn_tested_reports]

  print("\n\n")
  sn_latest_report = max(sn_reports, key=attrgetter('last_modified'))
  latest_report_test_result = test_html_file_content(sn_latest_report.path, tests_to_validate_reports)
  sn_tested_latest_report = SNTestedReport(sn_latest_report, latest_report_test_result)
  print(sn_tested_latest_report)

  copy_files([sn_tested_latest_report.file.path], directory_to_copy_reports_to)
  

