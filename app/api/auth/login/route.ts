import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { compare } from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const user = await db.collection('users').findOne({ email });
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  const isValid = await compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }
  
  // You could set up a session or token here if needed.
  return NextResponse.json({ message: 'Logged in' });
}
