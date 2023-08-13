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

ServerEvents.loaded(event => {
    if (!Utils.server.isDedicated()) {
        return
    }
    let version = $BCC.localPingData.version
    Utils.server.scheduleInTicks(120, e => {
        NetJS.getGists(gists_id, result => {
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