// app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import mammoth from 'mammoth';
import { MongoClient, ObjectId } from 'mongodb';

let model: use.UniversalSentenceEncoder | null = null;
let cachedClient: MongoClient | null = null;

// Connect to MongoDB using the URI from environment variables
async function connectToDatabase(): Promise<MongoClient> {
    if (cachedClient) {
        return cachedClient;
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI environment variable is not set");
    }
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client;
}

// Load and cache the Universal Sentence Encoder model
async function loadModel(): Promise<use.UniversalSentenceEncoder> {
    if (!model) {
        model = await use.load();
    }
    return model;
}

// Compute cosine similarity between two tensors
function cosineSimilarity(embeddingA: tf.Tensor, embeddingB: tf.Tensor): number {
    const dotProduct = embeddingA.dot(embeddingB).dataSync()[0];
    const normA = embeddingA.norm().dataSync()[0];
    const normB = embeddingB.norm().dataSync()[0];
    return dotProduct / (normA * normB);
}

// Retrieve the ideal answer from MongoDB based on a given taskId.
// Assumes your tasks collection uses ObjectId for _id.
async function getIdealAnswer(taskId: string): Promise<string> {
    const client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB;
    if (!dbName) {
        throw new Error("MONGODB_DB environment variable is not set");
    }
    const db = client.db(dbName);
    const tasksCollection = db.collection('tasks');
    // Convert taskId string to ObjectId
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
    if (task && task.idealAnswer) {
        return task.idealAnswer as string;
    }
    return "";
}

export async function POST(request: Request): Promise<Response> {
    try {
        // Get form data from the request
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Get the taskId from form data (this identifies the requirement/task)
        const taskId = formData.get('taskId') as string | null;
        if (!taskId) {
            return NextResponse.json({ error: 'No taskId provided' }, { status: 400 });
        }

        // Retrieve the ideal answer from MongoDB for the given taskId
        const idealAnswer = await getIdealAnswer(taskId);
        if (!idealAnswer) {
            return NextResponse.json({ error: 'Ideal answer not found for the task' }, { status: 404 });
        }

        // Convert the uploaded DOCX file to an ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Extract raw text from the DOCX using Mammoth.js
        const { value: studentText } = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
        if (!studentText) {
            return NextResponse.json({ error: 'Could not extract text from the file' }, { status: 400 });
        }

        // Load the Universal Sentence Encoder model
        const useModel = await loadModel();

        // Generate embeddings for both the ideal answer and the student's text
        const embeddings = await useModel.embed([idealAnswer, studentText]);
        // Cast embeddings as a generic tensor so that .slice() is available
        const embeddingsTensor = embeddings as unknown as tf.Tensor;
        const embeddingSize: number = embeddingsTensor.shape[1]!;

        // Slice the first row for the ideal answer and the second row for the student's answer
        const idealEmbedding = embeddingsTensor.slice([0, 0], [1, embeddingSize]);
        const studentEmbedding = embeddingsTensor.slice([1, 0], [1, embeddingSize]);

        // Compute cosine similarity between the two embeddings
        const similarity = cosineSimilarity(idealEmbedding.flatten(), studentEmbedding.flatten());

        // Define scoring thresholds (adjust these based on your evaluation criteria)
        let score = 0;
        if (similarity > 0.85) {
            score = 2;
        } else if (similarity > 0.65) {
            score = 1;
        } else {
            score = 0;
        }

        return NextResponse.json({ score, similarity });
    } catch (error) {
        console.error('Error evaluating submission:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
