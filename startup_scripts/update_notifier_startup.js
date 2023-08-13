StartupEvents.init(event => {

    let current = JsonIO.read('kubejs/update_notifier.json')
    if (current == null) {
        current = {}
    }

    current["is_notified_at_this_launch"] = false
    JsonIO.write('kubejs/update_notifier.json', current)
})