import os
import re

directories_to_look_for_reports = [	
  "c:\\reports\\folder_a",		
  "c:\\reports\\folder_b"		
]

directory_to_copy_reports_to = "C:\\PersonalProjects\\report-gatherer\\dist\\tmp_project"

serial_numbers = ["serial_number_1", "serial_number_2", "serial_number_3", "serial_number_4", "serial_number_5", "serial_number_6", "serial_number_7", "serial_number_8", "serial_number_9", "serial_number_10", "serial_number_N"]




if __name__ == "__main__":
  
  serial_numbers.sort()
  result = {}
  reg = "(report_file).*([xxserial_numberxx]).*(.html)$"

  for dir_location in directories_to_look_for_reports:
    print(f"Processing Location '{dir_location}'")
    files = [
      { "name": f, "last_modified": os.path.getmtime(os.path.join(dir_location, f))} 
      for f in os.listdir(dir_location) 
      if os.path.isfile(os.path.join(dir_location, f))
    ]
    # files.sort(key=lambda f: f[1])
    [print(f) for f in files]

    
    for sn in serial_numbers:

      if not sn in result.keys():
        result[sn] = []

      sn_reg = re.compile(reg.replace("[xxserial_numberxx]", sn))
      
      for f in files:
        if sn_reg.search(f["name"]):
          f["name"] = os.path.join(dir_location, f["name"])
          result[sn].append(f)
      result[sn].sort(key=lambda f: f["last_modified"])

  for key in result.keys():
    print(key)
    [print(f"\t{f}") for f in result[key]]
