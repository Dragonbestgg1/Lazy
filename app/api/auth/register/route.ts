import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const existingUser = await db.collection('users').findOne({ email });
  
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
  
  const hashedPassword = await hash(password, 10);
  await db.collection('users').insertOne({ email, password: hashedPassword });
  
  return NextResponse.json({ message: 'User created' });
}
