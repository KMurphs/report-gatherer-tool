@ECHO OFF 


REM Get Order Number from User
SET /p order=Enter Order Number: 
ECHO Order Number: %order%


REM Get Project Name from serial number file name
FOR %%y IN (*.serial_numbers.csv) DO SET project=%%y
SET project=tmp_project
ECHO Project Name: %project%


REM Gathering Serial Numbers
FOR /F %%i IN (%project%.serial_numbers.csv) DO CALL SET "sns=%%sns%%, "%%i""
CALL SET "sns=%sns:~2%"
ECHO Serial Numbers: %sns%



REM Create config.json file for later processing
(
	ECHO.{
	ECHO.	"project_name": "%project%",
	ECHO.	"order_number": "%order%",
	ECHO.	"serial_numbers": [%sns%],
	ECHO.	"places_to_look_for_reports": [	
	ECHO.		"c:\reports\folder_a",		
	ECHO.		"c:\reports\folder_b"		
	ECHO.	],								
	ECHO.	"tests_to_validate_reports": [	
	ECHO.		{ 
	ECHO.			"test_friendly_name": "test 1",
	ECHO.			"test_token_html_path": "some/path/to/destination/word/token/in/html/report/file", 
	ECHO.			"test_token_expected_value": "some_awesome_value" 
	ECHO.		}, 
	ECHO.		{ 
	ECHO.			"test_friendly_name": "test 1",
	ECHO.			"test_token_html_path": "some/path/to/destination/word/token/in/html/report/file", 
	ECHO.			"test_token_expected_value": "some_awesome_value" 
	ECHO.		}, 
	ECHO.		{ 
	ECHO.			"test_friendly_name": "test 1",
	ECHO.			"test_token_html_path": "some/path/to/destination/word/token/in/html/report/file", 
	ECHO.			"test_token_expected_value": "some_awesome_value" 
	ECHO.		}
	ECHO.	]								
	ECHO.}
)>config.json


REM Setting Environment variable with path to config.json for processing
REM SETX REPORT_GATHERER_CONFIG_FILE_PATH "C:\PersonalProjects\report-gatherer\config.json" REM Only for future cmd sessions
SET REPORT_GATHERER_CONFIG_FILE_PATH="%~dp0config.json"
ECHO Config File is at: %REPORT_GATHERER_CONFIG_FILE_PATH%

REM Or Pass it as argument
