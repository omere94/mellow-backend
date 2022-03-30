const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
   query,
   getById,
   remove,
   update,
   add,
   addActivity
}

async function query(filterBy) {
   try {
      const criteria = {}
      console.log('before get collection')
      const collection = await dbService.getCollection('boards')
      console.log('before after collection')

      const boards = await collection.find(criteria).toArray()
      return boards;
   } catch (err) {
      console.log('Beckend - ERROR: cannot get boards')
      throw err
   }
}

async function getById(boardId) {
   try {
      boardId = ObjectId(boardId)
      const collection = await dbService.getCollection('boards')
      console.log('collection', collection);
      const board = await collection.findOne({ "_id": boardId })
      console.log('board from getById', board);
      return board
   } catch (err) {
      console.log(`Beckend - ERROR: cannot get board ${boardId}`)
      throw err
   }
}

async function remove(boardId) {
   try {
      if (boardId === '60fe8d8a9dc7b4d56dc56006') return;
      const collection = await dbService.getCollection('boards')
      return await collection.deleteOne({ _id: ObjectId(boardId) })
   } catch (err) {
      console.log(`Beckend - ERROR: cannot remove board ${boardId}`)
      throw err
   }
}

async function update(board) {
   try {
      board._id = ObjectId(board._id)
      const collection = await dbService.getCollection('boards')
      await collection.updateOne({ _id: board._id }, { $set: { ...board } })
      return board
   } catch (err) {
      console.log(`Beckend - Beckend - ERROR: cannot update board ${board._id}`)
      throw err
   }
}

async function add(board) {
   try {
      const collection = await dbService.getCollection('boards')
      await collection.insertOne(board)
      return board
   } catch (err) {
      console.log(`Beckend - ERROR: cannot add board`)
      throw err
   }
}

async function addActivity(boardId, activity) {
   try {
      boardId = ObjectId(boardId)
      const collection = await dbService.getCollection('boards')
      await collection.updateOne({ _id: boardId }, { $push: { activities: activity } })
      // await collection.updateOne({ _id: boardId }, { $push: { activities: { $each: [ activity ], $position: 1 } } })
      return activity
   } catch (err) {
      console.log(`Beckend - ERROR: cannot add activity ${activity} to board ${boardId}`)
      throw err
   }
}


