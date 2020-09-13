(
	ECHO.{
	ECHO.	"project_name": "%project%",
	ECHO.	"order_number": "%order%",
	ECHO.	"serial_numbers": [%sns%],
	ECHO.	"server_host": "%server_host%",
	ECHO.	"server_port": %server_port%,
	ECHO.	"directories_to_look_for_reports": [%copy_from%],						
	ECHO.	"directory_to_copy_reports_to": "%copy_to%",
	ECHO.	"archive_file_path": "%zip_file%",
	ECHO.	"overview_file_path": "%overview_file%",
	ECHO.	"regex_template": "(report_file).*(!xxserial_numberxx!).*(.html)$",
	ECHO.	"regex_template_placeholder": "!xxserial_numberxx!",
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