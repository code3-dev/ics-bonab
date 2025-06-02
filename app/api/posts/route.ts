import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

// Valid post categories
const VALID_CATEGORIES = ['general', 'question', 'discussion', 'technical', 'announcement'] as const;
type PostCategory = typeof VALID_CATEGORIES[number];

// Validate post category
function isValidCategory(category: string): category is PostCategory {
  return VALID_CATEGORIES.includes(category as PostCategory);
}

// Helper function to count total replies including nested ones
const countTotalReplies = (replies: any[]): number => {
  let total = replies.length;
  for (const reply of replies) {
    if (reply.replies && Array.isArray(reply.replies)) {
      total += countTotalReplies(reply.replies);
    }
  }
  return total;
};

// GET posts with pagination
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;
    const skip = (page - 1) * limit;

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

    // Get posts with pagination
    const posts = await postsCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Count total posts for pagination
    const total = await postsCollection.countDocuments();

    // Calculate replyCount for each post
    const postsWithCounts = posts.map(post => ({
      ...post,
      replyCount: post.replies ? countTotalReplies(post.replies) : 0
    }));

    const hasMore = total > skip + limit;

    return NextResponse.json({
      success: true,
      posts: postsWithCounts,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت پست‌ها' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// POST new post
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

    const body = await request.json();
    const { title, content, category } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, message: 'همه فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    // Validate category
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { success: false, message: 'دسته‌بندی نامعتبر است' },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const tokensCollection = db.collection('tokens');
    const usersCollection = db.collection('users'); // Add users collection
    const postsCollection = db.collection('posts');

    // Verify token and get user info
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Fetch userName from users collection using userId
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(tokenDoc.userId) });
    if (!userDoc || !userDoc.name || !userDoc.lastName) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد یا نام کاربری تعریف نشده است' },
        { status: 404 }
      );
    }

    // Create post
    const post = {
      title,
      content,
      category,
      userId: tokenDoc.userId,
      userName: userDoc.name + " " + userDoc.lastName,
      createdAt: new Date().toISOString(),
      replies: []
    };

    const result = await postsCollection.insertOne(post);

    return NextResponse.json({
      success: true,
      post: { ...post, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error in posts API:', error);
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