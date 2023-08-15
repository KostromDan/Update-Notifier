const $ConfirmScreen = Java.loadClass('net.minecraft.client.gui.screens.ConfirmScreen')


let pastebin_id = null // defined in server part of the script
let modpack_name = null // defined in server part of the script

function parse_client_data(data) {
    pastebin_id = data["pastebin_id"]
    modpack_name = data["modpack_name"]
}


NetworkEvents.fromServer('update_notifier_check', event => {
    parse_client_data(event.data)
    check_updates()
})

NetworkEvents.fromServer('update_notifier_update_client_data', event => {
    parse_client_data(event.data)
})

function check_updates() {
    let $BCC = Java.loadClass('dev.wuffs.bcc.BCC')
    let version = $BCC.localPingData.version


    let current = JsonIO.read('local/update_notifier.json') ?? {}

    if (!("enabled" in current)) {
        current["enabled"] = true
    }
    if (!("skipped_versions" in current)) {
        current["skipped_versions"] = []
    }
    if (!("is_notified_at_this_launch" in current)) {
        current["is_notified_at_this_launch"] = false
    }
    JsonIO.write('local/update_notifier.json', current)


    if (current["is_notified_at_this_launch"]) {
        return
    }

    NetJS.getPasteBin(pastebin_id, result => {
        if (result.success) {
            let json_result = result.parseRawToJson()
            let latest_version = json_result['version']

            current = JsonIO.read('local/update_notifier.json')

            if (version < latest_version) {
                console.log(`${modpack_name}-logging: Update of the modpack found! ${latest_version} is out. Currently running ${version}`)
                if (current["enabled"] && !current['skipped_versions'].contains(latest_version)) {
                    Client.player.tell(Component.join(' ', [

                        Component.white(`\nUpdate of`),
                        Component.gold(`${modpack_name} modpack`)
                            .click({
                                "action": "open_url",
                                "value": json_result["curseforge_link"]
                            })
                            .hover(Component.join(' ', [
                                Component.gold(`${modpack_name} modpack`),
                                Component.yellow(`page on Curseforge`)
                            ])),
                        Component.white("found!"),
                        Component.white("\nYou playing on outdated"),
                        Component.red(version),
                        Component.white("version, the lastest is"),
                        Component.green(latest_version),


                        Component.white('\nUpdate the modpack using the curseforge app or'),
                        Component.gold("[website]")
                            .click({
                                "action": "open_url",
                                "value": `${json_result["curseforge_link"]}/files`
                            })
                            .hover(Component.join(' ', [
                                Component.gold(`${modpack_name} modpack`),
                                Component.yellow(`downloads page on Curseforge`)
                            ])),


                        Component.white('\nYou can'),
                        Component.lightPurple("[skip this update]")
                            .click({
                                "action": "run_command",
                                "value": `/update_notifier skip ${latest_version}`
                            })
                            .hover(
                                Component.join(' ', [
                                    Component.yellow(`Skip only this update.\nYou will no longer be notified of`),
                                    Component.green(`${latest_version}`),
                                    Component.yellow(`update, but will be notified of the following.`)
                                ])),

                        Component.white('or'),

                        Component.darkPurple("[disable update notifier]\n")
                            .click({
                                "action": "run_command",
                                "value": `/update_notifier disable`
                            })
                            .hover(Component.join(' ', [
                                Component.yellow(`Disable update notifier at all.\nYou will never get notified about`),
                                Component.gold(`${modpack_name} modpack`),
                                Component.yellow(`updates.`),
                            ])),
                    ]))
                }
                current["is_notified_at_this_launch"] = true
                JsonIO.write('local/update_notifier.json', current)
            } else {
                console.log(`${modpack_name}-logging: No updates found. Modpack version is actual!`)
            }
        } else {
            console.log(`${modpack_name}-logging: Exeption caught while checking modpack updates:\n${result.exception}`)
        }
    })
}

NetworkEvents.fromServer('update_notifier_skip', event => {
    let current = JsonIO.read('local/update_notifier.json')
    if (current == null) {
        return
    }
    let version = event.data["version"]
    if (!current["skipped_versions"].contains(version)) {
        current["skipped_versions"].push(version)
        Client.player.tell(Component.join(' ', [
            Component.white(`\nVersion`),
            Component.green(version),
            Component.white("will be skipped and you will be notified only then the next version is out!"),
            Component.red("[cancel]\n")
                .click({
                    "action": "run_command",
                    "value": `/update_notifier clean_skip_list`
                })
                .hover(Component.join(' ', [
                    Component.yellow(`Clicked by mistake?\nYou can cancel this action!`),
                ])),
        ]))
    } else {
        Client.player.tell(Component.join(' ', [
            Component.white(`\nVersion`),
            Component.green(version),
            Component.white("is already skipped!\n"),
        ]))
    }
    JsonIO.write('local/update_notifier.json', current)
})

function switcher(b) {
    let current = JsonIO.read('local/update_notifier.json') ?? {}

    current["enabled"] = b
    JsonIO.write('local/update_notifier.json', current)
}

NetworkEvents.fromServer('update_notifier_disable', event => {
    let screen = Client.currentScreen

    Client.setScreen(new $ConfirmScreen((confirm) => {
            if (confirm) {
                switcher(false)
                Client.player.tell(Component.join('', [
                    Component.white(`\nUpdate notifier is `),
                    Component.red('disabled'),
                    Component.white("! You will no longer get notified about updates. "),
                    Component.white("You can always re-enable it by "),
                    Component.green('/update_notifier enable\n').click({
                        "action": "suggest_command",
                        "value": `/update_notifier enable`
                    }),
                ]))
            }
            Client.setScreen(screen)

        },
        Component.red(`This action is highly not recommended!`),
        Component.join(' ', [
            Component.red(`Updates may contain important fixes of:`),
            Component.darkRed(`bugs, crashes`),
            Component.red(`that seriously affect the gameplay.`),
            Component.white(`\n\nAre you shure what you really want to do whis?`),
        ]),
        Component.darkRed(`Disable`),
        Component.darkGreen(`Stay enabled`),
    ))


})

NetworkEvents.fromServer('update_notifier_enable', event => {
    switcher(true)
    Client.player.tell(Component.join(' ', [
        Component.white(`\nUpdate notifier is`),
        Component.green('enabled'),
        Component.white("!\n"),
    ]))
})

NetworkEvents.fromServer('update_notifier_clean_skip_list', event => {
    let current = JsonIO.read('local/update_notifier.json') ?? {}

    current["skipped_versions"] = []
    JsonIO.write('local/update_notifier.json', current)

    Client.player.tell(Component.join(' ', [
        Component.white(`\nSkipped versions list`),
        Component.green('cleaned'),
        Component.white("successfully!\n"),
    ]))
})