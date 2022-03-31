const boardService = require('./board.service')
const socketService = require('../../services/socket.service')
// const asyncLocalStorage = require('../../services/als.service')
const logger = require('../../services/logger.service')

async function getBoard(req, res) {
   try {
      const board = await boardService.getById(req.params.id)
      res.send(board)
   } catch (err) {
      logger.error('Failed to get board', err)
      res.status(500).send({ err: 'Failed to get board' })
   }
}

async function getBoards(req, res) {
   try {
      // const filterBy = {
      //    name: req.query?.name || '',
      //    price: req.query?.price || 0,
      //    type: req.query?.type || 'ALL',
      // }

      const boards = await boardService.query()
      res.json(boards)
   } catch (err) {
      logger.error('Failed to get boards', err)
      res.status(500).send({ err: 'Failed to get boards' })
   }
}

async function deleteBoard(req, res) {
   try {
      await boardService.remove(req.params.id)
      res.send({ msg: 'Deleted successfully' })
   } catch (err) {
      logger.error('Failed to delete board', err)
      res.status(500).send({ err: 'Failed to delete board' })
   }
}

async function updateBoard(req, res) {
   try {
      const board = req.body
      const savedBoard = await boardService.update(board)
      res.send(savedBoard)
      // socketService.broadcast({ type: 'board-updated', data: review, to: savedBoard._id })
   } catch (err) {
      logger.error('Failed to update board', err)
      res.status(500).send({ err: 'Failed to update board' })
   }
}

async function addBoard(req, res) {
   try {
      const board = req.body
      const savedBoard = await boardService.add(board)
      res.send(savedBoard)
      // socketService.broadcast({ type: 'board-add', data: review, to: savedBoard._id })
   } catch (err) {
      logger.error('Failed to add board', err)
      res.status(500).send({ err: 'Failed to add board' })
   }
}

async function addActivity(req, res) {
   try {
      const { boardId } = req.body
      const { activity } = req.body
      // Option to use als store:
      // const store = asyncLocalStorage.getStore()
      // activity.user = { 
      //    _id: store.userId,
      //    username: store.userUsername,
      //    fullname: store.userFullname,
      //    imgUrl: store.userImgUrl
      // }
      activity.byMember = {
         _id: req.session.user._id,
         username: req.session.user.username,
         fullname: req.session.user.fullname,
         imgUrl: req.session.user.imgUrl
      }
      const newActivity = await boardService.addActivity(boardId, activity)
      res.send(newActivity)
   } catch (err) {
      logger.error('Failed to add activity to board', err)
      res.status(500).send({ err: 'Failed to add activity to board' })
   }
}

module.exports = {
   getBoard,
   getBoards,
   deleteBoard,
   updateBoard,
   addBoard,
   addActivity
}