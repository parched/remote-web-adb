# remote-web-adb
Connects an ADB device using WebUSB to a remote server running ADB.

Needs Chrome 89+ or chrome://flags/#enable-experimental-web-platform-features enabed.

## Usage in gitpod
* `./gitpod-adb`
* On the new page, click "Connect" and choose your Android device connected by USB
* Run `adb connect localhost`
* Now you can run `adb shell` or any other `adb` command you like

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/parched/remote-web-adb)