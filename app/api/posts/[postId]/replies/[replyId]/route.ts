import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ics';

// Recursive function to get all reply IDs that need to be deleted
const getAllReplyIds = (reply: any): string[] => {
  let ids = [reply._id.toString()];
  if (reply.replies && reply.replies.length > 0) {
    for (const childReply of reply.replies) {
      ids = [...ids, ...getAllReplyIds(childReply)];
    }
  }
  return ids;
};

// Helper function to find and remove a reply from the replies array
const removeReply = (replies: any[], replyId: string): boolean => {
  for (let i = 0; i < replies.length; i++) {
    if (replies[i]._id.toString() === replyId) {
      replies.splice(i, 1);
      return true;
    }
    if (replies[i].replies && replies[i].replies.length > 0) {
      if (removeReply(replies[i].replies, replyId)) {
        return true;
      }
    }
  }
  return false;
};

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string; replyId: string } }
) {
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

    // Get post
    const post = await postsCollection.findOne({ _id: new ObjectId(params.postId) });
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'پست یافت نشد' },
        { status: 404 }
      );
    }

    // Find the reply to delete
    let targetReply: any = null;
    const findReply = (replies: any[], replyId: string): any => {
      for (const reply of replies) {
        if (reply._id.toString() === replyId) {
          return reply;
        }
        if (reply.replies && reply.replies.length > 0) {
          const found = findReply(reply.replies, replyId);
          if (found) return found;
        }
      }
      return null;
    };

    targetReply = findReply(post.replies, params.replyId);

    if (!targetReply) {
      return NextResponse.json(
        { success: false, message: 'پاسخ یافت نشد' },
        { status: 404 }
      );
    }

    // Check if user owns the reply
    if (targetReply.userId !== tokenDoc.userId.toString()) {
      return NextResponse.json(
        { success: false, message: 'شما اجازه حذف این پاسخ را ندارید' },
        { status: 403 }
      );
    }

    // Remove the reply and all its children from the post
    removeReply(post.replies, params.replyId);

    // Update the post
    await postsCollection.updateOne(
      { _id: new ObjectId(params.postId) },
      { $set: { replies: post.replies } }
    );

    return NextResponse.json({
      success: true,
      message: 'پاسخ با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error in deleting reply:', error);
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