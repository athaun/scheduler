import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import pages from './modules/pages.mjs'
import Item from './modules/models/Item.mjs'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

const app = express();

await mongoose.connect('mongodb://localhost:27017/scheduler')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use("/pages", pages)

app.get('/', async (req, res) => {
    let data = {}

    data.persistent = await Item.find({ persistent: true })
    data.daily = await Item.find({ persistent: false })

    res.render("home", data)
})

// Create a new item
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body)
        newItem.dateAdded = new Date()

        if (!newItem.persistent) {
            let item = await Item.find({title: newItem.affiliation})
            newItem.color = item[0].color
        }

        console.log(newItem)
        await newItem.save()

        res.status(201).json({ message: 'Item created successfully' })
    } catch (error) {
        console.error('Error creating item:', error)
        res.status(500).json({ message: 'An error occurred while creating the item' })
    }
});

// Update an existing item
app.put('/api/items/:id', async (req, res) => {
    try {
        const itemId = req.params.id
        const updatedData = req.body

        // Find the item by ID and update it
        const updatedItem = await Item.findByIdAndUpdate(itemId, updatedData, { new: true })

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' })
        }

        res.json(updatedItem)
    } catch (error) {
        console.error('Error updating item:', error)
        res.status(500).json({ message: 'An error occurred while updating the item' })
    }
});

// Delete an existing item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const itemId = req.params.id

        // Find the item by ID and delete it
        const deletedItem = await Item.findByIdAndDelete(itemId)

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' })
        }

        res.json({ message: 'Item deleted successfully' })
    } catch (error) {
        console.error('Error deleting item:', error)
        res.status(500).json({ message: 'An error occurred while deleting the item' })
    }
})

app.delete('/api/delete-all-tasks', async (req, res) => {
    try {
        // Find and delete all non-persistent tasks
        await Item.deleteMany({ persistent: false })

        res.status(200).json({ message: 'Non-persistent tasks deleted successfully' })
    } catch (error) {
        console.error('Error deleting non-persistent tasks:', error)
        res.status(500).json({ message: 'An error occurred while deleting non-persistent tasks' })
    }
})



app.all("*", (req, res) => {
    res.render("error", { error: `<h1>404</h1><br><p>The page you are looking for doesn't exist.</p>` })
})

app.listen(8090, () => {
    console.log("Listening")
})

export default app