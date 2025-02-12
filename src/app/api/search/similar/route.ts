import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { OpenAIEmbeddings } from '@langchain/openai';

export const dynamic = 'force-dynamic';

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small'
});

// Test endpoint
export async function GET() {
  try {
    console.log('\n🔍 GET /api/search/similar called');
    
    // Test MongoDB connection
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment');
    }
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB connection test successful');
    
    const db = client.db('anki');
    const collection = db.collection('notes1');
    const count = await collection.countDocuments();
    console.log(`📊 Total documents in notes1 collection: ${count}`);
    
    const indexes = await collection.listIndexes().toArray();
    console.log('📊 Available indexes:', indexes.map(idx => idx.name));
    
    // Get a sample document to verify structure
    const sampleDoc = await collection.findOne({});
    console.log('📄 Sample document structure:', JSON.stringify(sampleDoc, null, 2));
    
    await client.close();
    
    return NextResponse.json({ 
      message: 'Search API is working',
      timestamp: new Date().toISOString(),
      env: {
        hasMongoUri: true,
        hasOpenAiKey: !!process.env.OPENAI_API_KEY,
      },
      mongodb: {
        documentCount: count,
        indexes: indexes.map(idx => idx.name),
        sampleDocument: sampleDoc
      }
    });
  } catch (error) {
    console.error('Search API GET error:', error);
    return NextResponse.json({ 
      error: 'Search API GET failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('\n🚀 POST /api/search/similar called at', new Date().toISOString());
  
  try {
    // Parse request body
    const body = await request.json().catch(e => {
      console.error('Failed to parse request body:', e);
      throw new Error('Invalid JSON in request body');
    });
    console.log('📝 Request body:', body);
    
    const { text } = body;
    if (!text) {
      console.error('❌ No text provided');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Verify environment variables
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment');
      return NextResponse.json(
        { error: 'MongoDB connection string not configured' },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Generate embedding
    console.log('🔄 Generating embedding...');
    const queryEmbedding = await embeddings.embedQuery(text);
    console.log('✅ Embedding generated, length:', queryEmbedding.length);

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB with URI:', process.env.MONGODB_URI.split('@')[1]); // Log URI without credentials
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Debug MongoDB connection
    const db = client.db('anki');
    const collection = db.collection('notes1');
    
    // Check if collection exists and has documents
    const count = await collection.countDocuments();
    console.log(`📊 Total documents in notes1 collection: ${count}`);

    // Check if vector index exists
    const indexes = await collection.listIndexes().toArray();
    console.log('📊 Available indexes:', indexes.map(idx => idx.name));

    // Perform vector search
    console.log('🔎 Performing vector search...');
    const pipeline = [
      {
        $search: {
          index: "vector_index_notes",
          vectorSearch: {
            queryVector: queryEmbedding,
            path: "small_vector",
            numCandidates: 100,
            limit: 10
          }
        }
      },
      {
        $project: {
          _id: 1,
          noteId: '$id',
          content: '$sfld',
          score: { $meta: 'searchScore' }
        }
      },
      {
        $match: {
          score: { $gte: 0.7 }
        }
      }
    ];
    
    console.log('📊 Aggregation pipeline:', JSON.stringify(pipeline, null, 2));
    
    const results = await collection
      .aggregate(pipeline)
      .toArray();

    console.log('📊 Raw results:', JSON.stringify(results, null, 2));
    console.log(`✅ Found ${results.length} matches`);

    await client.close();
    console.log('🔌 MongoDB connection closed');

    // Format and send response
    const response = {
      ankiNotes: results.map(doc => ({
        noteId: doc.noteId,
        similarity: doc.score,
        content: doc.content
      }))
    };
    
    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Search error:', error);
    // Log additional error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
