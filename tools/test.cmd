@echo off

:: Invoke PractRand on each of the 

:: %RANDOM% returns an integer in the range [0..32,767], making for a maximum
:: seed of 3,276,732,767 (smaller than a 32b uint).
set SEED=%RANDOM%%RANDOM%
::set SEED=0

echo.
echo SEED=%SEED%
echo.

call :Test uint32 %SEED%
call :Test uint53 %SEED%
exit /b 0

:Test
    set MODE=%1
    set SEED=%2
    cmd /C exit %SEED%
    set "HEX=%=ExitCode%"
    set SEEDASHEX=%HEX%

    echo *** %MODE% %SEED%:
    echo.
    :: node binout.js %RNG% %MODE% %SEED% | RNG_Test.exe stdin -seed %SEEDASHEX% -multithreaded -tlshow 4KB -tlshow 8KB -tlshow 16KB -tlshow 32KB -tlshow 64KB -tlshow 256KB -tlmax 512KB
    node binout.js %RNG% %MODE% %SEED% | RNG_Test.exe stdin -seed %SEEDASHEX% -multithreaded -tlmax 1GB
    echo.
    goto :EOF
