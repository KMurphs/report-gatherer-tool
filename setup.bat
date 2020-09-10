@ECHO OFF
SET project=tmp_project

MKDIR utils

MKDIR dist
MKDIR dist\%project%


MKDIR %project%
REM Create serial number files
ECHO serial_number_1 					> %project%\%project%.serial_numbers.csv
FOR /L %%c IN (2, 1, 10) Do (
	ECHO serial_number_%%c 				>> %project%\%project%.serial_numbers.csv
)
ECHO ... 								>> %project%\%project%.serial_numbers.csv
ECHO serial_number_N 					>> %project%\%project%.serial_numbers.csv
REM Create bat file
(
	ECHO.@ECHO OFF &SETLOCAL
	ECHO.
	ECHO.
	ECHO.REM Get Order Number from User
	ECHO.SET /p order^=Enter Order Number: 
	ECHO.ECHO Order Number: %%order%%
	ECHO.
	ECHO.
	ECHO.REM Get Project Name from serial number file name
	ECHO.FOR %%%%y IN ^(*.serial_numbers.csv^) DO SET project^=%%%%y
	ECHO.SET project=%project:.serial_numbers.csv=%
	ECHO.ECHO Project Name: %%project%%
	ECHO.
	ECHO.
	ECHO.REM Gathering Serial Numbers
	ECHO.FOR /F %%%%i IN ^(%%project%%.serial_numbers.csv^) DO CALL SET "sns=%%%%sns%%%%, "%%%%i""
	ECHO.CALL SET "sns=%%sns:~2%%"
	ECHO.ECHO Serial Numbers: %%sns%%
	ECHO.
	ECHO.
	ECHO.
	ECHO.REM Create config.json file for later processing
	ECHO.^(
	ECHO.	ECHO.{
	ECHO.	ECHO.	"project_name": "%%project%%",
	ECHO.	ECHO.	"order_number": "%%order%%",
	ECHO.	ECHO.	"serial_numbers": [%%sns%%],
	ECHO.	ECHO.	"places_to_look_for_reports": [	
	ECHO.	ECHO.		"c:\reports\folder_a",		
	ECHO.	ECHO.		"c:\reports\folder_b"		
	ECHO.	ECHO.	],								
	ECHO.	ECHO.	"tests_to_validate_reports": [	
	ECHO.	ECHO.		{ 
	ECHO.	ECHO.			"test_friendly_name": "test 1",
	ECHO.	ECHO.			"test_token_html_path": "some/path/to/destination/word/token/in/html/report/file", 
	ECHO.	ECHO.			"test_token_expected_value": "some_awesome_value" 
	ECHO.	ECHO.		}, 
	ECHO.	ECHO.		{ 
	ECHO.	ECHO.			"test_friendly_name": "test 1",
	ECHO.	ECHO.			"test_token_html_path": "some/path/to/destination/word/token/in/html/report/file", 
	ECHO.	ECHO.			"test_token_expected_value": "some_awesome_value" 
	ECHO.	ECHO.		}, 
	ECHO.	ECHO.		{ 
	ECHO.	ECHO.			"test_friendly_name": "test 1",
	ECHO.	ECHO.			"test_token_html_path": "some/path/to/destination/word/token/in/html/report/file", 
	ECHO.	ECHO.			"test_token_expected_value": "some_awesome_value" 
	ECHO.	ECHO.		}
	ECHO.	ECHO.	]								
	ECHO.	ECHO.}
	ECHO.^)^>config.json
	ECHO.
	ECHO.
	ECHO.REM Setting Environment variable with path to config.json for processing
	ECHO.REM SETX REPORT_GATHERER_CONFIG_FILE_PATH "%~dp0config.json" REM Only for future cmd sessions
	ECHO.SET REPORT_GATHERER_CONFIG_FILE_PATH="%%~dp0config.json"
	ECHO.ECHO Config File is at: %%REPORT_GATHERER_CONFIG_FILE_PATH%%
	ECHO.
	ECHO.REM Or Pass it as argument
)>%project%\run_report_gatherer.bat

copy setup.bat utils\setup.bat
erase setup.bat
