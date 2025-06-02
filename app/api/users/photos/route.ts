import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request format' },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const photosCollection = db.collection('photos');

    // Convert string IDs to ObjectId
    const objectIds = userIds.map(id => {
      try {
        return new ObjectId(id);
      } catch (e) {
        console.warn('Invalid ObjectId:', id);
        return id;
      }
    });

    // Fetch photos for the provided user IDs
    const photos = await photosCollection.find({
      userId: { $in: objectIds }
    }).toArray();

    // console.log('Found photos:', photos.length, 'for userIds:', userIds);

    await client.close();

    return NextResponse.json({
      success: true,
      photos: photos
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error fetching user photos:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت تصاویر کاربران' },
      { status: 500 }
    );
  }
} 