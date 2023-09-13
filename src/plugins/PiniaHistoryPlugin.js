import {reactive, ref} from "vue";

export function PiniaHistoryPlugin({pinia, app, store, options}) {
    if (!options.historyEnabled) return
    const history = reactive([])
    const future = reactive([])
    const doingHistory = ref(false)

    history.push((JSON.stringify(store.$state)))
    store.$subscribe((mutation, state) => {
        if (!doingHistory.value) {
            history.push(JSON.stringify(state))
            future.splice(0, future.length)
        }
    })

    store.$onAction(({ name, store, args, after, onError }) => {
        if (name === 'addItems') {
            after(() => {             // If your action return something, you can add a result to callback parameter
                console.log(args[0]);   // and use it on after or onError
            })
            onError((error) => {
                console.log("Hello error", error.message)
            })
        }
    })

    return {
        history,
        future,
        undo: () => {
            if (history.length === 1) return
            doingHistory.value = true
            future.push(history.pop())
            store.$state = JSON.parse(history.at(-1))
            doingHistory.value = false
        },
        redo: () => {
            const latesState = future.pop()

            if (!latesState) return

            doingHistory.value = true
            history.push(latesState)
            store.$state = JSON.parse(latesState)
            doingHistory.value = false

        }
    }
}
