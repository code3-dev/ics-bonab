import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

export async function POST(request: Request) {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const tokensCollection = db.collection('tokens');

    const { studentId, nationalId } = await request.json();

    // Find user
    const user = await usersCollection.findOne({ studentId, nationalId });

    if (!user) {
      await client.close();
      return NextResponse.json(
        { 
          success: false,
          message: 'اطلاعات وارد شده صحیح نمی‌باشد'
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token
    await tokensCollection.insertOne({
      token,
      userId: user._id,
      createdAt: new Date()
    });

    await client.close();

    return NextResponse.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'خطا در ورود به سیستم'
      },
      { status: 500 }
    );
  }
}