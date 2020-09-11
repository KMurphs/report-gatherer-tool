import os
import re
import shutil
from bs4 import BeautifulSoup


serial_numbers = ["serial_number_1", "serial_number_2", "serial_number_3", "serial_number_4", "serial_number_5", "serial_number_6", "serial_number_7", "serial_number_8", "serial_number_9", "serial_number_10", "serial_number_N"]


regex_template = "(report_file).*(\[!xxserial_numberxx!\]).*(.html)$"
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



def find_files_by_regex(sn_regex, dir_locations):
  
  result = []
  
  for dir_location in dir_locations:

    print(f"Processing Location '{dir_location}'")

    files = [
      { "name": f, "last_modified": os.path.getmtime(os.path.join(dir_location, f))} 
      for f in os.listdir(dir_location) 
      if os.path.isfile(os.path.join(dir_location, f))
    ]

    for f in files:
      if sn_reg.search(f["name"]):
        f["path"] = os.path.join(dir_location, f["name"])
        result.append(f)
    

  result.sort(key=lambda f: f["last_modified"])
  return result

def copy_files(file_paths, target_directory):



  dest = os.path.join(target_directory, "tmp")
  if(os.path.isdir(dest)):
    shutil.rmtree(dest)
  os.mkdir(dest)


  for f in file_paths:
    try: shutil.copy(f, dest)
    except Exception: raise



def test_serial_number_reports(serial_numbers_reports, tests_object):


  for f in serial_numbers_reports:

    f["tests"] = []

    with open(f["path"], "r") as r:
      html = r.read()  
    
    soup = BeautifulSoup(html, 'html5lib')

    for test in tests_object:

      

      elmts = soup.select(test["test_token_css_selector"])
      print(test)
      print(elmts)
      print(html)

      if(len(elmts) == 0):
        res = "not found"
      else:
        res = elmts[0].text

      f["tests"].append({
        "test_friendly_name": test["test_friendly_name"],
        "test_pass_fail_result": res == test["test_token_expected_value"], 
        "test_token_actual_value": res
      })
      
  return serial_numbers_reports







if __name__ == "__main__":
  sn = "serial_number_1"
  sn_reg = re.compile(regex_template.replace(regex_template_placeholder, sn))
  res = find_files_by_regex(sn_reg, directories_to_look_for_reports)
  

  test_serial_number_reports(res, tests_to_validate_reports)

  [print(f) for f in res]

  # copy_files([f["path"] for f in res], directory_to_copy_reports_to)
  

