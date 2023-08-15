StartupEvents.init(event => {

    let current = JsonIO.read('local/update_notifier.json') ?? {}

    current["is_notified_at_this_launch"] = false

    JsonIO.write('local/update_notifier.json', current)
})