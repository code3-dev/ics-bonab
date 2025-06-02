import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

export async function GET(request: Request) {
  let client;
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

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const tokensCollection = db.collection('tokens');
    const usersCollection = db.collection('users');

    // Find token and get associated user
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Check if token is expired (optional: add expiration check if needed)
    // const isExpired = tokenDoc.expiresAt && new Date() > new Date(tokenDoc.expiresAt);
    // if (isExpired) {
    //   await tokensCollection.deleteOne({ token });
    //   return NextResponse.json(
    //     { success: false, message: 'توکن منقضی شده است' },
    //     { status: 401 }
    //   );
    // }

    // Get user data
    const user = await usersCollection.findOne(
      { _id: new ObjectId(tokenDoc.userId) },
      { projection: { password: 0 } } // Exclude sensitive data
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        id: user._id.toString() // Convert ObjectId to string
      }
    });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}