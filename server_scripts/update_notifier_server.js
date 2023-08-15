let update_checking_delay = 20 * 60 // in seconds

let pastebin_id = 'wTjASWSG'
let modpack_name = 'M-Tech'
let client_data = {
    pastebin_id: pastebin_id,
    modpack_name: modpack_name
}


function check_updates() {
    let server = Utils.server
    let players = server.players
    players.forEach(player => {
        check_updates_for(player)
    })
}

function check_updates_for(player) {
    player.sendData('update_notifier_check', client_data)
}

PlayerEvents.loggedIn(event => {
    let player = event.player
    player.sendData('update_notifier_update_client_data', client_data)
    Utils.server.scheduleInTicks(120, e => {
        check_updates_for(player)
    })
})


ServerEvents.loaded(event => {
    Utils.server.scheduleInTicks(update_checking_delay * 20, e => {
        check_updates()
        e.reschedule()
    })


    if (!Utils.server.isDedicated()) {
        return
    }
    let $BCC = Java.loadClass('dev.wuffs.bcc.BCC')
    let version = $BCC.localPingData.version
    Utils.server.scheduleInTicks(120, e => {
        NetJS.getPasteBin(pastebin_id, result => {
            if (result.success) {
                let json_result = result.parseRawToJson()
                let latest_version = json_result['version']

                if (version < latest_version) {
                    console.log(`${modpack_name}-logging: Update of the modpack found! ${latest_version} is out. Currently running ${version}`)
                    return
                }
                console.log("Modpack version is actual!")
            } else {
                console.log(result.exception)
            }
        })
    })
})


ServerEvents.commandRegistry(event => {
    const {commands: Commands, arguments: Arguments} = event;
    event.register(
        Commands.literal("update_notifier")
            .then(Commands.literal("skip").then(Commands.argument('version', Arguments.STRING.create(event)).executes(ctx => {
                    let player = ctx.source.player
                    player.sendData('update_notifier_skip', {version: Arguments.STRING.getResult(ctx, "version")})
                    return 1
                })
            ))
            .then(Commands.literal("disable").executes(ctx => {
                    let player = ctx.source.player
                    player.sendData('update_notifier_disable', {})
                    return 1
                })
            )
            .then(Commands.literal("enable").executes(ctx => {
                    let player = ctx.source.player
                    player.sendData('update_notifier_enable', {})
                    return 1
                })
            ).then(Commands.literal("clean_skip_list").executes(ctx => {
                let player = ctx.source.player
                player.sendData('update_notifier_clean_skip_list', {})
                return 1
            })
        )
    )
})