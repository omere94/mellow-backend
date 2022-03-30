const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getBoard, getBoards, deleteBoard, updateBoard, addBoard, addActivity } = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getBoards)
router.post('/', addBoard)
router.delete('/:id', deleteBoard)
router.put('/', updateBoard)
router.get('/:id', getBoard)
router.post('/:id/activity', addActivity)

module.exports = router