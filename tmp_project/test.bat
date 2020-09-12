@echo off
for /f "tokens=*" %G in ('dir /b /s /a:d "*"') do echo Found %G