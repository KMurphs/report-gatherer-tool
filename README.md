# Report Gatherer Utility

A tool used to gather and zip html reports

## Setup

The Setup is extremely simple: The **```setup.bat```** file will generate all the files necessary to setup the Laptop/PC. 
The Setup file is typically located under **```utils```**. Copy it where the utility must be deployed and run it

### Requirements
1. Python 3
    * To check, open a command line window and type ``'python --version'``. The response from the machine should be similar to ``'Python 3.8.1'``
    * If this is not the case contact a IT Technician to install Python on the machine or alternatively refer to [these easy to follow instructions](https://www.ics.uci.edu/~pattis/common/handouts/pythoneclipsejava/python.html)
2. Internet Connection
    * Only when **```setup.bat```** is run for the first time to install all the packages needed for the utility


## Usage

The top level directory list projects that are configured and available. 
1.  Naviguate to one of the projects (e.g. 'tmp_project')
2.  Update the serial number file (e.g. 'tmp_project.serial_numbers.csv') with the serial number whose reports must be gathered
    * ***Note that there must be 1 serial number per line***

3.  Double Click on the **```run_report_gatherer.bat```** file to launch the utility



# References

1. https://websockets.readthedocs.io/en/stable/intro.html
1. https://www.geeksforgeeks.org/python-communicating-between-threads-set-1/
1. https://stackoverflow.com/questions/48825332/python-3-websockets-how-to-properly-close-socket
1. https://www.bogotobogo.com/python/Multithread/python_multithreading_Event_Objects_between_Threads.php