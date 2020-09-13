@ECHO OFF 

REM Setting General Variables
SET directories_to_look_for_reports[0]="c:\\reports\\folder_a"
SET directories_to_look_for_reports[1]="c:\\reports\\folder_b"

REM Setting Advanced Variables
SET server_host=127.0.0.1
SET server_port=5678
SET regex_template=(report_file).*(!xxserial_numberxx!).*(.html)$
SET regex_serial_number_placeholder=!xxserial_numberxx!








REM Get Order Number from User
ECHO.
SET /p order=[Enter Order Number]: 
REM ECHO Order Number: %order%
ECHO.
ECHO.
ECHO.
ECHO.



REM Get Project Name from serial number file name
FOR %%y IN (*.serial_numbers.csv) DO SET project=%%y
SET project=tmp_project
ECHO [Project Name]: %project%
ECHO.
ECHO 	Note that Project Name is taken from the name of the serial number file in the current folder
ECHO 	Serial Number File must have the form '[Project_Name].serial_numbers.csv'
ECHO.
ECHO.
ECHO.
ECHO.




REM Gathering and Printing Serial Numbers
SET sns=
FOR /F %%i IN (%project%.serial_numbers.csv) DO CALL SET "sns=%%sns%%, "%%i""
CALL SET "sns=%sns:~2%"
ECHO [Serial Numbers]: 
ECHO.
SET /a "c=1"
FOR /F %%i IN (%project%.serial_numbers.csv) DO (
	CALL ECHO 	%%c%%	%%i
	SET /a "c+=1"
)
ECHO.
ECHO 	Also note that Serial Numbers are taken from file '%project%.serial_numbers.csv' 
ECHO 	There must be 1 serial number per line
ECHO.
ECHO.
ECHO.
ECHO.





REM Gathering and Printing Directories where to look for reports
SET /a "x=0"
:SymLoop 

If DEFINED directories_to_look_for_reports[%x%] ( 
	REM CALL ECHO %%directories_to_look_for_reports[%x%]%% 
	SET /a "x+=1"
	GOTO :SymLoop 
)
SET /a "x-=1"

SET copy_from=
FOR /l %%n IN (0,1,%x%) DO (CALL SET "copy_from=%%copy_from%%, %%directories_to_look_for_reports[%%n]%%" )
CALL SET "copy_from=%copy_from:~2%"
SET copy_from=%copy_from:\=\\%
SET copy_from=%copy_from:\\\\=\\%


ECHO [Source Folder Where to look for reports]: 
ECHO.
SET /a "c=1"
FOR /l %%n IN (0,1,%x%) DO ( 
	CALL ECHO 	%%c%%  %%directories_to_look_for_reports[%%n]%%
	SET /a "c+=1"
)
SET /a "c-=1"
ECHO.
ECHO 	Note that there are %c% places where to Look for reports
ECHO.
ECHO.
ECHO.
ECHO.



REM Getting current time stamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
SET "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
SET "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
SET "fullstamp=[%YYYY%-%MM%-%DD%][%HH%-%Min%-%Sec%]"
REM ECHO %fullstamp%




REM Creating Folder To Copy Reports to
ECHO [Destination Folders for Zip File]: 
ECHO.

SET copy_to=%~dp0
CALL MKDIR %%copy_to:%project%=dist%%
CALL MKDIR %%copy_to:%project%=dist\%project%%%
CALL MKDIR %%copy_to:%project%=dist\%project%\archives%%

CALL SET tmp=%%copy_to:%project%=dist\%project%%%
CALL MOVE /Y %tmp%\*.zip %tmp%\archives >nul 2>&1
FOR /f "tokens=*" %%G in ('dir "%tmp%" /b') do (
	if %tmp%%%G NEQ %tmp%archives (
		REM ECHO Deleting %tmp%%%G
		(rmdir %tmp%%%G /S /Q | erase %tmp%%%G /F) >nul 2>&1
	)
)

CALL MKDIR %%copy_to:%project%=dist\%project%\OrderNo_[%order%]_%fullstamp%[%project%]%%
CALL MKDIR %%copy_to:%project%=dist\%project%\OrderNo_[%order%]_%fullstamp%[%project%]\reports%%
CALL SET copy_to=%%copy_to:%project%\=dist\%project%\OrderNo_[%order%]_%fullstamp%[%project%]\reports%% 

SET copy_to=%copy_to:~0,-1%
SET copy_to=%copy_to:\=\\%
SET overview_file=%copy_to:reports=overview.html%
SET zip_file=%copy_to:\\reports=.zip%
CALL SET to_archive=%zip_file:.zip=%
ECHO.
ECHO 	Zip file will be at:
ECHO		"%zip_file%"
ECHO.
ECHO 	Overview file will be at: 
ECHO		"%overview_file%"
ECHO.
ECHO 	Folder to Archive will be at: 
ECHO		"%to_archive%"






REM Create config.json file for later processing
(
	ECHO.{
	ECHO.	"project_name": "%project%",
	ECHO.	"order_number": "%order%",
	ECHO.	"serial_numbers": [%sns%],
	ECHO.	"server_host": "%server_host%",
	ECHO.	"server_port": %server_port%,
	ECHO.	"directories_to_look_for_reports": [%copy_from%],						
	ECHO.	"directory_to_copy_reports_to": "%copy_to%",
	ECHO.	"folder_to_archive": "%to_archive%",
	ECHO.	"archive_file_path": "%zip_file%",
	ECHO.	"overview_file_path": "%overview_file%",
	ECHO.	"regex_template": "%regex_template%",
	ECHO.	"regex_template_placeholder": "%regex_serial_number_placeholder%",
	ECHO.	"tests_to_validate_reports": [	
	ECHO.		{ 
	ECHO.			"test_friendly_name": "test 1",
	ECHO.			"test_token_html_path": "button:nth-child(2)", 
	ECHO.			"test_token_expected_value": "stop server" 
	ECHO.		}, 
	ECHO.		{ 
	ECHO.			"test_friendly_name": "test 2",
	ECHO.			"test_token_html_path": "span>span>span>span", 
	ECHO.			"test_token_expected_value": "Awesome" 
	ECHO.		}, 
	ECHO.		{ 
	ECHO.			"test_friendly_name": "test 3",
	ECHO.			"test_token_html_path": "span>span>span>span>span", 
	ECHO.			"test_token_expected_value": "Awesome" 
	ECHO.		}
	ECHO.	]								
	ECHO.}
)>config.json
COPY config.json config.backup.json /y >nul

REM Get Config file path
SET config_file_path=%~dp0config.json
SET config_file_path=%config_file_path:\=\\%
SET config_file_path=%config_file_path:\\\\=\\%


ECHO.
ECHO.
ECHO.
ECHO.

REM CREATE html client file
(
	ECHO.^<!DOCTYPE html^>
	ECHO.^<html^>
	ECHO.    ^<head^>
	ECHO.        ^<title^>[%order%] Serial Number Status^</title^>
	ECHO.        ^<link rel="stylesheet" href="assets/styles/style.css"^>
	ECHO.        ^<link rel="stylesheet" href="assets/styles/bootstrap.min.css"^>
	ECHO.    ^</head^>
	ECHO.    ^<body^>
 	ECHO.        ^<div id="app-root"^>^</div^>
 	ECHO.        ^<script src="assets/scripts/jquery.js"^>^</script^>
 	ECHO.        ^<script src="assets/scripts/bootstrap.min.js"^>^</script^>
 	ECHO.        ^<script src="assets/scripts/dom.js"^>^</script^>
 	ECHO.        ^<script src="assets/scripts/websocket-client.js"^>^</script^>
 	ECHO.    ^</body^>
 	ECHO.^</html^>
)>..\common\client\client2.html


REM Start HTML Client for websocket server
SET html_client=%~dp0
CALL SET html_client=%%html_client:%project%=common\client\client.html%%
SET html_client=%html_client:\=/%
START "" "file:///%html_client%"

REM Start websocket server
CD ..\common
CALL venv/scripts/activate
python server.py "%config_file_path%"



ECHO.
ECHO.
ECHO.
ECHO.


REM Open reports folder
SET tmp=%zip_file:.zip=%
SET tmp=%tmp:\\=\%
CALL explorer "%tmp%"
TIMEOUT /t 2 /nobreak > NUL


REM Start overview.html
ROBOCOPY "client\assets" "%tmp%\assets" /E /NFL /NDL /NJH /NJS /nc /ns /np 

SET tmp=%zip_file:.zip=%
SET tmp=%tmp:\\=\%
SET tmp=%tmp%\overview.html
SET tmp=%tmp:\=/%
START "" "file:///%tmp%"



CD ..\%project%