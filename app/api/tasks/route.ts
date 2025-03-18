// app/api/tasks/route.ts

import { NextResponse } from 'next/server';
import getMongoClientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await getMongoClientPromise();
    // Use the "test" database
    const db = client.db("test");
    const tasks = await db.collection("tasks").find({}).toArray();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, requirements, deadline } = body;
    const client = await getMongoClientPromise();
    // Use the "test" database
    const db = client.db("test");
    const tasksCollection = db.collection("tasks");

    // Ensure that requirements is an array.
    const requirementsArray = Array.isArray(requirements)
      ? requirements
      : requirements.split(',').map((req: string) => req.trim());

    const result = await tasksCollection.insertOne({
      title,
      requirements: requirementsArray,
      deadline: new Date(deadline),
    });

    return NextResponse.json({ taskId: result.insertedId });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
