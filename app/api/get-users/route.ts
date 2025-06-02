import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';
const collectionName = process.env.MONGODB_COLLECTION || 'users';

export async function GET() {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch all users but only return necessary fields
    const users = await collection.find({}).project({
      name: 1,
      lastName: 1,
      email: 1
    }).toArray();

    // Fetch photos for all users
    const photosCollection = db.collection('photos');
    const photos = await photosCollection.find({}).toArray();

    // Map photos to users
    const usersWithPhotos = users.map(user => {
      const userPhoto = photos.find(photo => photo.userId.toString() === user._id.toString());
      return {
        ...user,
        profilePhoto: userPhoto ? userPhoto.photo : null
      };
    });

    await client.close();

    // Add cache control headers to prevent caching
    return new NextResponse(JSON.stringify({
      success: true,
      users: usersWithPhotos
    }), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اطلاعات کاربران' },
      { status: 500 }
    );
  }
}