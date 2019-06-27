'use strict'

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path")

let reservedLoginCallback = null
let window = null
let proxy = null
let authenticating = false
let needRestart = false
let didFinishLoad = false

app.on('ready', () => {
    ipcMain.on('finished', (_, {id, password}) => {
        proxy.close()
        // This callback doesn't work in second time and doesn't trigger 'login' event, in Electron v5.0.5
        // But this work well in Electron v2.0.14
        reservedLoginCallback(id, password)
        reservedLoginCallback = null
    })
    app.on('login', (event, _, _, authInfo, callback) => {
        if (!authInfo.isProxy) {
            return
        }
        if (!authenticating) {
            event.preventDefault()
            reservedLoginCallback = callback
            proxy = new BrowserWindow({width: 400, height: 300,  webPreferences: {
                preload: path.resolve(path.join(__dirname, 'preload.js')),
            },})
            proxy.loadURL(`file://${__dirname}/index.html`)
            authenticating = true
            return
        }
    })
    window = new BrowserWindow({width: 700, height: 500})
    window.loadURL('https://www.google.com/')
    window.webContents.on('did-fail-load', (_, errorCode) => {
        if (errorCode !== -111) {
            return
        }
        if (didFinishLoad) {
            app.relaunch()
            app.quit()
            return
        }
        needRestart = true
    })
    window.webContents.on('did-finish-load', () => {
        didFinishLoad = true
        if (needRestart) {
            app.relaunch()
            app.quit()
        }
    })
})
