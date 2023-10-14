module.exports = {
    pidOfLogCatCommand: 'adb -s deviceId shell pidof logcat',
    killPidOfLogCatCommand: 'adb -s deviceId shell kill processId',
    getDevicesCommand: 'adb devices',
    logCatCommand: 'adb -s deviceId shell logcat',
}