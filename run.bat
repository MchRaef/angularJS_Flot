@echo off
python --version 2>NUL
if errorlevel 1 goto errorNoPython

start "" http://localhost:8000/
echo Refresh web page after server is running


python -m http.server
if errorlevel 1 goto python2



:errorNoPython
echo.
echo Error^: Python not installed
cmd /k
goto:eof

:python2
python -m SimpleHTTPServer
if errorlevel 1 goto contactSupport

:contactSupport
echo.
echo Contact Support, Can't figure out the problem
cmd /k