const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://localhost:3000'],
        }
    })
    gIo.on('connection', socket => {
        socket.userId = socket.id
        console.log('New socket', socket.id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
        })
        socket.on('watch board', boardId => {
            if (socket.currBoard === boardId) return;
            if (socket.currBoard) {
                socket.leave(socket.myTopic)
            }
            socket.join(boardId)
            socket.currBoard = boardId
        })
        socket.on('board update', board => {
            console.log('board update');
            socket.broadcast.to(socket.currBoard).emit('board updated', board)
        })
        socket.on('watch user', watchedUserId => {
            console.log('watch user', watchedUserId);
            if (socket.watchedUserId === watchedUserId) return;
            if (socket.watchedUserId) {
                socket.leave(socket.watchedUserId)
            }
            socket.join(watchedUserId)
            socket.watchedUserId = watchedUserId
        })
        socket.on('msg watched users', msg => {
            console.log('msg watched users');
            emitToWatchedUsers(msg)
        })
    })
}


async function emitToWatchedUsers(msg) {
    const sockets = await gIo.fetchSockets();
    socketsWithUsers = sockets.filter(socket => socket.watchedUserId)
    console.log('socketsWithUsers.length', socketsWithUsers.length);
    socketsWithUsers.forEach(socket => {
        console.log('Hey', socket.watchedUserId);
        gIo.to(socket.watchedUserId).emit('shop changed', msg)
    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = await _getUserSocket(userId)
    if (socket) socket.emit(type, data)
    else {
        console.log('User socket not found');
        _printSockets();
    }
}

// Send to all sockets BUT not the current socket 
async function broadcast({ type, data, room = null, userId }) {
    console.log('BROADCASTING', JSON.stringify(arguments));
    const excludedSocket = await _getUserSocket(userId)
    if (!excludedSocket) {
        // logger.debug('Shouldnt happen, socket not found')
        // _printSockets();
        return;
    }
    logger.debug('broadcast to all but user: ', userId)
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.userId == userId)
    return socket;
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets();
    return sockets;
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    connectSockets,
    emitTo,
    emitToUser,
    broadcast,
}
// const boardService = require('../api/board/board.service')
// const asyncLocalStorage = require('./als.service');
// const logger = require('./logger.service');

// var gIo = null
// var gSocketBySessionIdMap = {}

// function connectSockets(http, session) {
//     gIo = require('socket.io')(http, {
//         cors: {
//             origin: '*',
//         }
//     })
//     const sharedSession = require('express-socket.io-session');

//     gIo.use(sharedSession(session, {
//         autoSave: true
//     }));
//     gIo.on('connection', socket => {
//         gSocketBySessionIdMap[socket.handshake.sessionID] = socket
//         socket.on('disconnect', socket => {
//             console.log('Socket connected!');
//             if (socket.handshake) {
//                 gSocketBySessionIdMap[socket.handshake.sessionID] = null
//             }
//         })
//         socket.on('watch board', boardId => {
//             if (socket.currBoard === boardId) return;
//             if (socket.currBoard) {
//                 socket.leave(socket.myTopic)
//             }
//             socket.join(boardId)
//             socket.currBoard = boardId
//         })
//         socket.on('board update', board => {
//             socket.broadcast.to(socket.currBoard).emit('board updated', board)
//         })
//         socket.on('user-watch', userId => {
//             if (socket.userId === userId) return
//             if (socket.userId) {
//                 socket.leave(socket.userId)
//             }
//             socket.join(userId)
//         })
//     })
// }

// function emitToAll({ type, data, room = null }) {
//     if (room) gIo.to(room).emit(type, data)
//     else gIo.emit(type, data)
// }

// // TODO: Need to test emitToUser feature
// function emitToUser({ type, data, userId }) {
//     gIo.to(userId).emit(type, data)
// }


// // Send to all sockets BUT not the current socket
// function broadcast({ type, data, room = null }) {
//     const store = asyncLocalStorage.getStore()
//     const { sessionId } = store
//     if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
//     const excludedSocket = gSocketBySessionIdMap[sessionId]
//     if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
//     if (room) excludedSocket.broadcast.to(room).emit(type, data)
//     else excludedSocket.broadcast.emit(type, data)
// }

// module.exports = {
//     connectSockets,
//     emitToAll,
//     broadcast,
//     emitToUser
// }



