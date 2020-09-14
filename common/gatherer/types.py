import logging
from bs4 import BeautifulSoup
from typing import List

# A report file has a name, path, and last modified
class ReportFile():
  def __init__(self, report_file_name: str, report_file_path: str = "", report_file_last_modified: float = 0):

    if report_file_name == "" or report_file_name == None:
      raise Exception("ReportFile instances must be initialized with a name")

    self.name = report_file_name
    self.path = report_file_path
    self.last_modified = report_file_last_modified

  def __str__(self):
    timestamp = "None" if self.last_modified == 0 else (datetime.datetime.utcfromtimestamp(int(self.last_modified))).strftime('%m/%d/%Y, %H:%M:%S')
    return f"Report '{self.name}' (Last Modified: {timestamp})"

  def __dict__(self):
    return vars(self)

  def toDict(self):
    print("============")
    print(vars(self))
    obj = {}
    obj["name"] = self.name
    obj["path"] = self.path
    obj["last_modified"] = self.last_modified
    return obj



# A test definition has a name, html selector, and expected value
class TestDefinition():
  def __init__(self, test_name: str, test_html_selector: str, test_expected_value: str):

    if test_name == "" or test_name == None:
      raise Exception("TestDefinition instances must be initialized with a name")
    if test_html_selector == "" or test_html_selector == None:
      raise Exception("TestDefinition instances must be initialized with a css selector string to find the token containing the expected value")
    if test_expected_value == "" or test_expected_value == None:
      raise Exception("TestDefinition instances must be initialized with a an expected value")


    self.name = test_name
    self.css_selector = test_html_selector
    self.expected_value = test_expected_value

  def __str__(self):
    timestamp = "None" if self.last_modified == 0 else (datetime.datetime.utcfromtimestamp(int(self.last_modified))).strftime('%m/%d/%Y, %H:%M:%S')
    return f"Test '{self.name}' - Expected Value: '{self.expected_value}' (CSS selector: {self.css_selector})"

  def __dict__(self):
    return vars(self)
  def toDict(self):
    obj = {}
    obj["name"] = self.name
    obj["css_selector"] = self.css_selector
    obj["expected_value"] = self.expected_value
    return obj


# A test result has a test name, test expected value, and test actual value, and test pass status
class TestResult():
  def __init__(self, test_name: str, test_expected_value: str, test_actual_value: str):

    if test_name == "" or test_name == None:
      raise Exception("TestResult instances must be initialized with a name")
    if test_actual_value == "" or test_actual_value == None:
      raise Exception("TestResult instances must be initialized with an actual vlaue for test performed")
    if test_expected_value == "" or test_expected_value == None:
      raise Exception("TestResult instances must be initialized with a an expected value")


    self.name = test_name
    self.actual_value = test_actual_value
    self.expected_value = test_expected_value
    self.is_pass = (self.actual_value == self.expected_value) and self.actual_value != "" and self.actual_value != None

  def __str__(self):
    return f"Test '{self.name}': {'PASS' if self.is_pass else 'FAIL'} - Expected '{self.expected_value}', Got '{self.actual_value}'"

  def __dict__(self):
    return vars(self)
  def toDict(self):
    obj = {}
    obj["name"] = self.name
    obj["actual_value"] = self.actual_value
    obj["expected_value"] = self.expected_value
    obj["is_pass"] = self.is_pass
    return obj


# A report tester has a name, css-selector for token to be tested, andexpected value for that token
class ReportTester():
  def __init__(self, test_name: str, test_html_selector: str, test_expected_value: str):

    self.definition = TestDefinition(test_name, test_html_selector, test_expected_value)
    self.result = None

  @classmethod
  def fromDefinition(self, definition: TestDefinition):
    return ReportTester(definition.name, definition.css_selector, definition.expected_value)

  def test(self, report_file_path: str = ""):

    if report_file_path == "" or report_file_path == None:
      raise Exception("ReportTester instances require a valid path to execute the test")

    try: 

      with open(report_file_path, "r") as f:
        html = f.read()  
        soup = BeautifulSoup(html, 'html5lib')   

      html_elements = soup.select(self.definition.css_selector)

      if(len(html_elements) == 0):
        res = "<Not Found>"
      else:
        res = html_elements[0].text

      self.result = TestResult(self.definition.name, self.definition.expected_value, res)
  
    except Exception as e: 
      logging.error(f"There was an issue testing html content of file '{report_file_path}':\n{str(e)}")
      pass

  def __str__(self):
    timestamp = "None" if self.last_modified == 0 else (datetime.datetime.utcfromtimestamp(int(self.last_modified))).strftime('%m/%d/%Y, %H:%M:%S')
    return f"Report '{self.name}' (Last Modified: {timestamp})"


  def __dict__(self):
    return vars(self)
  def toDict(self):
    obj = vars(self)
    obj = {}
    obj["definition"] = self.definition.toDict()
    obj["result"] = self.result.toDict()
    return obj



# A test result has a test name, test expected value, and test actual value, and test pass status
class Report():
  def __init__(self, serial_number: str):

    if serial_number == "" or serial_number == None:
      raise Exception("Report instances need an id (aka the serial number being tested)")

    self.id = serial_number
    self.file = None
    self.testers: List[ReportTester] = []
    self.was_copied = False
    self.copy_file_path = ""
    self.has_passed_tests = False
    self.was_processed = False

  def attach_report_file(self, report_file_name: str, report_file_path: str = "", report_file_last_modified: float = 0):
    self.file = ReportFile(report_file_name, report_file_path, report_file_last_modified)
  def attach_report_file_fromObject(self, report_file: ReportFile):
    self.file = ReportFile(report_file.name, report_file.path, report_file.last_modified)
  def add_test(self, test_name: str, test_html_selector: str, test_expected_value: str):
    self.testers.append(ReportTester(test_name, test_html_selector, test_expected_value))
  def add_test_fromDefinition(self, definition: TestDefinition):
    self.testers.append(ReportTester(definition.name, definition.css_selector, definition.expected_value))

  def run_tests(self) -> bool:
    [ tester.test(self.file.path) for tester in self.testers ]
    
    is_pass = True
    for tester in self.testers:
      is_pass = is_pass and tester.result.is_pass

    if(is_pass and len(self.testers) > 0): self.has_passed_tests = True

    return self.has_passed_tests

  def __str__(self):
    return f"Report Object for '{self.id}'"

  def __dict__(self):
    return vars(self)
  def toDict(self):
    obj = vars(self)
    obj = {}
    obj["id"] = self.id 
    obj["was_copied"] = self.was_copied 
    obj["copy_file_path"] = self.copy_file_path 
    obj["has_passed_tests"] = self.has_passed_tests 
    obj["was_processed"] = self.was_processed 
    obj["file"] = self.file.toDict()
    obj["testers"] = [ tester.toDict() for tester in self.testers ]
    return obj















class FindReportConfigData():
  def __init__(self, regex_template: str, regex_placeholder: str, locations: List[str]):

    if regex_template == "" or regex_template == None:
      raise Exception("FindReport Algorithm needs a valid file name regex to match filename of reports")
    if regex_placeholder == "" or regex_placeholder == None:
      raise Exception("FindReport Algorithm needs a valid file name regex to match filename of reports")
    if len(locations) == 0:
      raise Exception("FindReport Algorithm needs a valid set of locations where reports can be searched")

    self.regex_template = regex_template
    self.regex_placeholder = regex_placeholder
    self.locations = locations
  def __dict__(self):
    return vars(self)
  def toDict(self):
    return vars(self)



class TestReportConfigData():
  def __init__(self, test_name: str, test_html_selector: str, test_expected_value: str):

    if test_name == "" or test_name == None:
      raise Exception("TestReport Algorithm must be initialized with a name")
    if test_html_selector == "" or test_html_selector == None:
      raise Exception("TestReport Algorithm must be initialized with a css selector string to find the token containing the expected value")
    if test_expected_value == "" or test_expected_value == None:
      raise Exception("TestReport Algorithm must be initialized with a an expected value")

    self.definition = TestDefinition(test_name, test_html_selector, test_expected_value)
  def __dict__(self):
    return vars(self)
  def toDict(self):
    obj = vars(self)
    obj["definition"] = self.definition.toDict()
    return obj



class CopyReportConfigData():
  def __init__(self, target_directory: str):

    if target_directory == "" or target_directory == None:
      raise Exception("MoveReport Algorithm must be initialized with a location to copy files to")

    self.target_directory = target_directory
  def __dict__(self):
    return vars(self)
  def toDict(self):
    return vars(self)