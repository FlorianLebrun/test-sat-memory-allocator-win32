cd %~dp0server
start npm start
timeout /t 3
start "inspector" "http://localhost:42000"
