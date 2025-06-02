import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';
const collectionName = process.env.MONGODB_COLLECTION || 'users';

export async function POST(request: Request) {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'lastName', 'studentId', 'nationalId', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
        return NextResponse.json(
          { success: false, message: `فیلد ${field} الزامی است` },
          { status: 400 }
        );
      }
      // Trim all string fields
      data[field] = data[field].trim();
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, message: 'فرمت ایمیل صحیح نیست' },
        { status: 400 }
      );
    }

    // Validate phone number (Iranian format)
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json(
        { success: false, message: 'فرمت شماره موبایل صحیح نیست' },
        { status: 400 }
      );
    }

    // Validate national ID (10 digits)
    if (!/^\d{10}$/.test(data.nationalId)) {
      return NextResponse.json(
        { success: false, message: 'کد ملی باید 10 رقم باشد' },
        { status: 400 }
      );
    }

    // Check for existing user with same credentials one by one
    const existingStudentId = await collection.findOne({ studentId: data.studentId });
    if (existingStudentId) {
      return NextResponse.json(
        { success: false, message: 'این شماره دانشجویی قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    const existingEmail = await collection.findOne({ email: data.email });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'این ایمیل قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    const existingPhone = await collection.findOne({ phone: data.phone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: 'این شماره موبایل قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    const existingNationalId = await collection.findOne({ nationalId: data.nationalId });
    if (existingNationalId) {
      return NextResponse.json(
        { success: false, message: 'این کد ملی قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    const result = await collection.insertOne(data);

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Save token
    const tokensCollection = db.collection('tokens');
    await tokensCollection.insertOne({
      token,
      userId: result.insertedId,
      createdAt: new Date()
    });

    await client.close();

    return NextResponse.json(
      { 
        success: true,
        message: 'ثبت‌نام موفقیت‌آمیز بود',
        token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت اطلاعات' },
      { status: 500 }
    );
  }
}