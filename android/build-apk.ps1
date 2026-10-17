param()
$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
$taskJava=Join-Path $projectRoot '.build-tools/java/jdk-21.0.12.1+1'
Set-Location -LiteralPath $projectRoot
$taskSdk='.build-tools/sdk'
$taskBuild=Join-Path $taskSdk 'build-tools/35.0.0'
$taskPlatform=Join-Path $taskSdk 'platforms/android-35/android.jar'
$taskOut='.build-tools/apk'
$env:JAVA_HOME=$taskJava
function Run-Checked([string]$file,[string[]]$arguments){ & $file @arguments; if($LASTEXITCODE -ne 0){throw "Failed: $file ($LASTEXITCODE)"} }
New-Item -ItemType Directory -Force "$taskOut/classes","$taskOut/dex" | Out-Null
$manifestText=Get-Content (Join-Path $PSScriptRoot 'app/src/main/AndroidManifest.xml') -Raw -Encoding UTF8
$manifestText=$manifestText.Replace('<manifest xmlns:android=', '<manifest package="com.cike.moment" xmlns:android=')
[IO.File]::WriteAllText("$taskOut/AndroidManifest.xml",$manifestText,[Text.UTF8Encoding]::new($false))
Run-Checked "$taskBuild/aapt2.exe" @('compile','--dir','android/app/src/main/res','-o',"$taskOut/resources.zip")
Run-Checked "$taskBuild/aapt2.exe" @('link','-I',$taskPlatform,'--manifest',"$taskOut/AndroidManifest.xml",'--min-sdk-version','26','--target-sdk-version','35','--version-code','3','--version-name','0.1.2','-A','demo/dist','-o',"$taskOut/unsigned.apk","$taskOut/resources.zip")
$sources=Get-ChildItem 'android/app/src/main/java' -Recurse -Filter '*.java' | ForEach-Object { Resolve-Path -Relative -LiteralPath $_.FullName }
Run-Checked "$taskJava/bin/javac.exe" (@('--release','8','-encoding','UTF-8','-classpath',$taskPlatform,'-d',"$taskOut/classes")+$sources)
$classFiles=Get-ChildItem "$taskOut/classes" -Recurse -Filter '*.class' | ForEach-Object { Resolve-Path -Relative -LiteralPath $_.FullName }
Run-Checked "$taskBuild/d8.bat" (@('--min-api','26','--lib',$taskPlatform,'--output',"$taskOut/dex")+$classFiles)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::Open("$taskOut/unsigned.apk",[IO.Compression.ZipArchiveMode]::Update)
try { foreach($dex in Get-ChildItem "$taskOut/dex" -Filter '*.dex'){[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$dex.FullName,$dex.Name) | Out-Null} } finally {$zip.Dispose()}
Run-Checked "$taskBuild/zipalign.exe" @('-f','4',"$taskOut/unsigned.apk","$taskOut/aligned.apk")
$key=Join-Path $projectRoot '.build-tools/cike-debug.jks'
if(!(Test-Path -LiteralPath $key)){ Run-Checked "$taskJava/bin/keytool.exe" @('-genkeypair','-keystore',$key,'-storepass','android','-alias','androiddebugkey','-keypass','android','-dname','CN=Android Debug,O=Android,C=US','-keyalg','RSA','-keysize','2048','-validity','10000') }
$apk='outputs/cike-0.1.2-debug.apk'
Run-Checked "$taskBuild/apksigner.bat" @('sign','--ks',$key,'--ks-key-alias','androiddebugkey','--ks-pass','pass:android','--key-pass','pass:android','--out',$apk,"$taskOut/aligned.apk")
Run-Checked "$taskBuild/apksigner.bat" @('verify','--verbose',$apk)
Run-Checked "$taskBuild/aapt.exe" @('dump','badging',$apk)
Write-Output "APK: $apk"
