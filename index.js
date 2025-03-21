require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const Question = require('./models/question');

const app  = express();

app.use(express.json());

const db = process.env.MONGO_URI;

mongoose.connect(db).then((res)=> console.log('Connected to DB'))
    .catch((error) => console.log(error))


app.post("/users", async (req, res) => {
    try {
        const { id, message, completion,dialog } = req.body;
        const user = new User({ id, message, completion,dialog });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ id: userId });

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: req.body },
            { new: true }
        );

        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const helpArray = ['programming','networks','circuit','os']
app.get("/questions", async (req, res) => {
    try {
        const questions = await Question.find({}).lean()

        if (questions.length > 0) {
            const filteredQuestions = helpArray.reduce((result, category) => {
                result[category] = questions
                    .filter(question => question.hasOwnProperty(category))
                    .reduce((acc, question) => {
                        const { _id, ...rest } = question;
                        acc.push(...Object.values(rest[category]));
                        return acc;
                    }, []);
                return result;
            }, {});

            res.status(200).json(filteredQuestions);
        } else {
            res.status(404).json({ error: 'No questions found' });
        }
    } catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});