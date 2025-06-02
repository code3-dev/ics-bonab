import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

export async function PUT(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];

    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const tokensCollection = db.collection('tokens');
    const usersCollection = db.collection('users');

    // Find token and get associated user
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      await client.close();
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    // Remove _id from updateData to prevent modifying immutable field
    delete updateData._id;

    // Check if email or studentId already exists for other users
    const existingUser = await usersCollection.findOne({
      $and: [
        { _id: { $ne: new ObjectId(tokenDoc.userId) } },
        { $or: [
          { email: updateData.email },
          { studentId: updateData.studentId },
          { nationalId: updateData.nationalId },
          { phone: updateData.phone }
        ]}
      ]
    });

    if (existingUser) {
      await client.close();
      return NextResponse.json(
        { success: false, message: 'این اطلاعات قبلاً برای کاربر دیگری ثبت شده است' },
        { status: 400 }
      );
    }

    // Update user data
    await usersCollection.updateOne(
      { _id: new ObjectId(tokenDoc.userId) },
      { $set: updateData }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      message: 'اطلاعات با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Error in user update API:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}