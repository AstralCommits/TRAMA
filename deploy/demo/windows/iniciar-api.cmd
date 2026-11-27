@echo off
rem Liga a API do TRAMA (demonstracao) e religa sozinha se ela fechar. Registro em logs\api.log
cd /d "C:\trama-demo"
call "C:\trama-demo\config\segredos.cmd"
set TZ=America/Recife
set PORT=18080
set SPRING_PROFILES_ACTIVE=dev
set DB_URL=jdbc:mysql://127.0.0.1:3308/confeccoes?useSSL=false^&allowPublicKeyRetrieval=true^&serverTimezone=America/Recife^&characterEncoding=UTF-8
set DB_USERNAME=trama
set TRAMA_CORS_ALLOWED_ORIGINS=https://%TRAMA_DOMINIO%
set MYSQL_ROOT_PASSWORD=
:loop
echo [%date% %time%] iniciando a API >> "C:\trama-demo\logs\api.log"
"C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot\bin\java.exe" -Xmx768m -XX:+ExitOnOutOfMemoryError -Duser.timezone=America/Recife -Dserver.address=127.0.0.1 -jar "C:\trama-demo\api\trama.jar" >> "C:\trama-demo\logs\api.log" 2>&1
echo [%date% %time%] a API fechou (codigo %errorlevel%), religando em 10s >> "C:\trama-demo\logs\api.log"
ping -n 11 127.0.0.1 >nul
goto loop
