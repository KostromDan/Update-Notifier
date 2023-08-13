# Update Notifier

A simple KubeJS script that notifies users of modpacks about modpack updates. Made by KostromDan, packaged for KJSPKG.

## Demo:
https://youtu.be/_BTQyyUhRvs

![image](https://github.com/KostromDan/Update-Notifier/assets/90044015/0d5930e2-2189-4dee-a3fc-583d22e3bac3)


## Installation guide:

1. Install NetJS [https://www.curseforge.com/minecraft/mc-mods/netjs-kubejs-addon]
2. Clone [https://gist.github.com/KostromDan/52b72e5ff28b23f7a3b957a88281185b]
3. Replace gists_id and modpack name with yours.
```js
let gists_id = '52b72e5ff28b23f7a3b957a88281185b'
let modpack_name = 'M-Tech'
```

4. Install and config properly Better Compatibility Checker[https://www.curseforge.com/minecraft/mc-mods/better-compatibility-checker]
By default script will parse version from it.
If you don't want to use it:
comment/add this lines of code:
```js
//const $BCC = Java.loadClass('dev.wuffs.bcc.BCC')

ItemEvents.clientLeftClicked(event => {
    //let version = $BCC.localPingData.version
    let version = "modpack version"
```
