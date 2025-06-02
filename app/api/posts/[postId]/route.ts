import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

// GET single post
export async function GET(request: Request, { params }: { params: { postId: string } }) {
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
    const postsCollection = db.collection('posts');

    // Verify token
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Get post by ID
    const post = await postsCollection.findOne({ _id: new ObjectId(params.postId) });
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'پست یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
      currentUserId: tokenDoc.userId.toString()
    });
  } catch (error) {
    console.error('Error in getting post:', error);
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

// DELETE post
export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
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
    const postsCollection = db.collection('posts');

    // Verify token and get user ID
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Get post and verify ownership
    const post = await postsCollection.findOne({ _id: new ObjectId(params.postId) });
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'پست یافت نشد' },
        { status: 404 }
      );
    }

    // Debug logging
    // console.log('Token user ID:', tokenDoc.userId.toString());
    // console.log('Post user ID:', post.userId);
    // console.log('Post full data:', post);

    // Handle both string and ObjectId cases
    const tokenUserId = tokenDoc.userId.toString();
    let postUserId = post.userId;
    
    // Convert postUserId to string if it's an ObjectId
    if (typeof postUserId === 'object' && postUserId !== null) {
      postUserId = postUserId.toString();
    }

    if (tokenUserId !== postUserId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'شما اجازه حذف این پست را ندارید',
          debug: { tokenUserId, postUserId }
        },
        { status: 403 }
      );
    }

    // Delete the post
    const result = await postsCollection.deleteOne({ _id: new ObjectId(params.postId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'خطا در حذف پست' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'پست با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error in deleting post:', error);
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