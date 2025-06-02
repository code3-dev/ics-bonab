import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

// POST new reply
export async function POST(request: Request, { params }: { params: { postId: string } }) {
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

    const { content, parentId } = await request.json();

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { success: false, message: 'محتوای پاسخ الزامی است' },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const tokensCollection = db.collection('tokens');
    const usersCollection = db.collection('users');
    const postsCollection = db.collection('posts');

    // Verify token and get user
    const tokenDoc = await tokensCollection.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const user = await usersCollection.findOne(
      { _id: new ObjectId(tokenDoc.userId) }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Create new reply
    const reply = {
      _id: new ObjectId(),
      content,
      userId: user._id.toString(),
      userName: `${user.name} ${user.lastName}`,
      createdAt: new Date().toISOString(),
      replies: []
    };

    // If this is a nested reply
    if (parentId) {
      const post = await postsCollection.findOne({ _id: new ObjectId(params.postId) });
      if (!post) {
        return NextResponse.json(
          { success: false, message: 'پست یافت نشد' },
          { status: 404 }
        );
      }

      // Function to add reply to nested structure
      const addReplyToNested = (replies: any[], parentId: string, newReply: any): boolean => {
        for (let i = 0; i < replies.length; i++) {
          if (replies[i]._id.toString() === parentId) {
            replies[i].replies.push(newReply);
            return true;
          }
          if (replies[i].replies && replies[i].replies.length > 0) {
            if (addReplyToNested(replies[i].replies, parentId, newReply)) {
              return true;
            }
          }
        }
        return false;
      };

      const found = addReplyToNested(post.replies, parentId, reply);
      if (!found) {
        return NextResponse.json(
          { success: false, message: 'پاسخ مورد نظر یافت نشد' },
          { status: 404 }
        );
      }

      await postsCollection.updateOne(
        { _id: new ObjectId(params.postId) },
        { $set: { replies: post.replies } }
      );
    } else {
      // Add reply directly to post
      await postsCollection.updateOne(
        { _id: new ObjectId(params.postId) },
        { $push: { replies: reply as any } }
      );      
    }

    return NextResponse.json({
      success: true,
      message: 'پاسخ با موفقیت ثبت شد'
    });
  } catch (error) {
    console.error('Error in creating reply:', error);
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