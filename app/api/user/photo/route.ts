import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export async function POST(request: Request) {
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

    // Get request data
    const data = await request.json();
    const { photo, contentType } = data;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(contentType)) {
      return NextResponse.json(
        { success: false, message: 'فرمت فایل پشتیبانی نمی‌شود' },
        { status: 400 }
      );
    }

    // Validate file size
    const base64Data = photo.split(',')[1];
    const fileSize = Buffer.from(base64Data, 'base64').length;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'حجم فایل نباید بیشتر از ۳ مگابایت باشد' },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const tokensCollection = db.collection('tokens');
    const photosCollection = db.collection('photos');

    // Find token and get associated user
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Delete old photo first
    await photosCollection.deleteOne({ userId: new ObjectId(tokenDoc.userId) });

    // Insert new photo
    await photosCollection.insertOne({
      userId: new ObjectId(tokenDoc.userId),
      photo,
      contentType,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'عکس پروفایل با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Error in photo upload API:', error);
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
    const photosCollection = db.collection('photos');

    // Find token and get associated user
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Get user's photo
    const photo = await photosCollection.findOne({ userId: new ObjectId(tokenDoc.userId) });
    
    return NextResponse.json({
      success: true,
      photo: photo ? photo.photo : null,
      contentType: photo ? photo.contentType : null
    });

  } catch (error) {
    console.error('Error in get photo API:', error);
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