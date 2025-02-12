import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoClient } from 'mongodb';
import { Document } from 'langchain/document';

interface SearchResult {
  id: number;
  similarity: number;
  content: string;
}

export interface ProcessResults {
  ankiResults: SearchResult[];
  axonResults: SearchResult[];
}

export class PDFProcessor {
  private mongoClient: MongoClient;
  private embeddings: OpenAIEmbeddings;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small'
    });
  }

  async processFile(filePath: string): Promise<ProcessResults> {
    try {
      // Load and split the PDF
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      
      // Process each page and collect all results
      const allAnkiResults: SearchResult[] = [];
      const allAxonResults: SearchResult[] = [];

      for (const doc of docs) {
        const { ankiResults, axonResults } = await this.processPage(doc);
        allAnkiResults.push(...ankiResults);
        allAxonResults.push(...axonResults);
      }
      
      // Remove duplicates and sort by similarity
      const uniqueAnkiResults = Array.from(
        new Map(allAnkiResults.map(item => [item.id, item])).values()
      ).sort((a, b) => b.similarity - a.similarity);

      const uniqueAxonResults = Array.from(
        new Map(allAxonResults.map(item => [item.id, item])).values()
      ).sort((a, b) => b.similarity - a.similarity);
      
      return {
        ankiResults: uniqueAnkiResults,
        axonResults: uniqueAxonResults
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }

  private async findSimilarAnkiNotes(embedding: number[]): Promise<SearchResult[]> {
    try {
      const db = this.mongoClient.db('anki');
      const collection = db.collection('notes1');

      const query = {
        $vectorSearch: {
          queryVector: embedding,
          path: "small_vector",
          numCandidates: 100,
          limit: 10,
          index: "vector_index_notes"
        }
      };

      const results = await collection.aggregate([
        { $vectorSearch: query.$vectorSearch },
        { $project: {
          id: 1,
          sfld: 1,
          score: { $meta: "vectorSearchScore" }
        }},
        { $limit: 10 }
      ]).toArray();

      console.log(`Found ${results.length} Anki results`);
      
      return results
        .filter(doc => doc.score >= 0.7)
        .map(doc => ({
          id: doc.id,
          similarity: doc.score,
          content: doc.sfld
        }));
    } catch (error) {
      console.error('Error finding similar Anki notes:', error);
      return [];
    }
  }

  private async findSimilarAxonQuestions(embedding: number[]): Promise<SearchResult[]> {
    try {
      const db = this.mongoClient.db('anki');
      const collection = db.collection('axon-q');

      const query = {
        $vectorSearch: {
          queryVector: embedding,
          path: "objectiveVector",
          numCandidates: 100,
          limit: 1,
          index: "axonq_index"
        }
      };

      const results = await collection.aggregate([
        { $vectorSearch: query.$vectorSearch },
        { $project: {
          questionId: 1,
          score: { $meta: "vectorSearchScore" }
        }},
        { $limit: 1 }
      ]).toArray();

      console.log(`Found ${results.length} Axon results`);
      
      return results
        .filter(doc => doc.score >= 0.7)
        .map(doc => ({
          id: doc.questionId,
          similarity: doc.score,
          content: `Question ${doc.questionId}`
        }));
    } catch (error) {
      console.error('Error finding similar Axon questions:', error);
      return [];
    }
  }

  private async processPage(doc: Document): Promise<ProcessResults> {
    try {
      // Extract page content and metadata
      const { pageContent, metadata } = doc;
      
      // Generate embedding for the main content
      const contentEmbedding = await this.embeddings.embedQuery(pageContent);

      // Find similar notes and questions using the embedding
      const [ankiResults, axonResults] = await Promise.all([
        this.findSimilarAnkiNotes(contentEmbedding),
        this.findSimilarAxonQuestions(contentEmbedding)
      ]);

      // Store in MongoDB for reference
      const db = this.mongoClient.db('anki');
      await db.collection('powerpoint').insertOne({
        content: pageContent,
        metadata: metadata,
        embedding: contentEmbedding,
        ankiResults: ankiResults,
        axonResults: axonResults,
        timestamp: new Date()
      });

      return { ankiResults, axonResults };
    } catch (error) {
      console.error('Error processing page:', error);
      return { ankiResults: [], axonResults: [] };
    }
  }
}
