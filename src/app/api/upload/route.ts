import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import clientPromise from '../../../lib/mongodb';
import { PDFProcessor } from '../../../lib/pdfProcessor';

export async function POST(request: NextRequest) {
  try {
    // Check if request is too large
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 413 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadDir = join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
      return NextResponse.json(
        { error: 'Server error: Could not create upload directory' },
        { status: 500 }
      );
    }

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, file.name);
    
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { error: 'Server error: Could not save file' },
        { status: 500 }
      );
    }

    // Connect to MongoDB
    let mongoClient;
    try {
      mongoClient = await clientPromise;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return NextResponse.json(
        { error: 'Server error: Database connection failed' },
        { status: 500 }
      );
    }

    // Process the PDF
    let searchResults = [];
    try {
      const processor = new PDFProcessor(mongoClient);
      searchResults = await processor.processFile(filePath);
    } catch (error) {
      console.error('Error processing PDF:', error);
      return NextResponse.json(
        { error: 'Error processing PDF file. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'File uploaded and processed successfully',
      fileName: file.name,
      results: searchResults
    });
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
        { status: 500 }
    );
  }
}
