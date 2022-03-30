const boardService = require('../api/board/board.service')
const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http);

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        socket.on('disconnect', socket => {
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('currBoard', boardId => {
            if (socket.currBoard === boardId) return;
            if (socket.currBoard) {
                socket.leave(socket.myTopic)
            }
            socket.join(boardId)
            socket.currBoard = boardId
        })
        socket.on('board update', board => {
            socket.broadcast.to(socket.currBoard).emit('board updated', board)
        })
        socket.on('user-watch', userId => {
            if (socket.userId === userId) return
            if (socket.userId) {
                socket.leave(socket.userId)
            }
            socket.join(userId)
        })
    })
}

function emitToAll({ type, data, room = null }) {
    if (room) gIo.to(room).emit(type, data)
    else gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}

module.exports = {
    connectSockets,
    emitToAll,
    broadcast,
    emitToUser
}



