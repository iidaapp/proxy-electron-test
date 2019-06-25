'use strict'

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path")

let reservedLoginCallback = null
let window = null
let proxy = null

app.on('ready', () => {
    ipcMain.on('finished', (event, {id, password}) => {
        proxy.close()
        // This callback doesn't work in second time and doesn't trigger 'login' event, in Electron v3.0.10
        // But this work well in Electron v2.0.14
        reservedLoginCallback(id, password)
        reservedLoginCallback = null
    })
    app.on('login', (event, webContents, request, authInfo, callback) => {
        if (authInfo.isProxy) {
            event.preventDefault()
            reservedLoginCallback = callback
            proxy = new BrowserWindow({width: 400, height: 300,  webPreferences: {
                preload: path.resolve(path.join(__dirname, 'preload.js')),
            },})
            proxy.loadURL(`file://${__dirname}/index.html`)
        }
    })
    window = new BrowserWindow({width: 700, height: 500})
    window.loadURL('https://www.google.com/')
})
