import os
import re
import shutil

directories_to_look_for_reports = [	
  "c:\\reports\\folder_a",		
  "c:\\reports\\folder_b"		
]

directory_to_copy_reports_to = "C:\\PersonalProjects\\report-gatherer\\dist\\tmp_project"

serial_numbers = ["serial_number_1", "serial_number_2", "serial_number_3", "serial_number_4", "serial_number_5", "serial_number_6", "serial_number_7", "serial_number_8", "serial_number_9", "serial_number_10", "serial_number_N"]

regex_template = "(report_file).*(\[!xxserial_numberxx!\]).*(.html)$"
# regex_template = "(report_file).*([xxserial_numberxx]).*(.html)$"
regex_template_placeholder = "!xxserial_numberxx!"


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

if __name__ == "__main__":
  sn = "serial_number_1"
  sn_reg = re.compile(regex_template.replace(regex_template_placeholder, sn))
  res = find_files_by_regex(sn_reg, directories_to_look_for_reports)
  [print(f) for f in res]

  copy_files([f["path"] for f in res], directory_to_copy_reports_to)
  

