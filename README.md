# Axon PDF Analysis

A web application that analyzes medical lecture PDFs to find relevant Anki cards and Axon questions. Built with Next.js, TypeScript, and MongoDB.

## Features

- PDF upload and processing
- Integration with MongoDB for data storage
- OpenAI embeddings for semantic search
- Responsive design with Tailwind CSS
- Background image from CloudFront CDN
- Anki cards and Axon questions recommendations

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x
- pnpm 9.x
- MongoDB instance
- OpenAI API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/paulnlwc/Axon-PDF-Analysis.git
cd Axon-PDF-Analysis
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── search/            # Search endpoints
│   │   └── upload/            # File upload endpoint
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   └── ui/                    # UI components
│       ├── AnkiResultsPanel.tsx
│       ├── AxonResultsPanel.tsx
│       └── UploadBox.tsx
└── lib/                       # Utility functions
    ├── mongodb.ts             # MongoDB client
    └── pdfProcessor.ts        # PDF processing logic
```

## Key Components

### PDF Processing

The application uses LangChain for PDF processing and text extraction. The `PDFProcessor` class in `src/lib/pdfProcessor.ts` handles:
- PDF text extraction
- Document chunking
- Embedding generation
- Similarity search

### Database Integration

MongoDB is used for storing and retrieving data. The connection is managed in `src/lib/mongodb.ts` with support for:
- Development mode with HMR
- Production optimization
- Type-safe queries

### API Routes

- `/api/upload`: Handles PDF file uploads
- `/api/search/similar`: Performs similarity search using OpenAI embeddings

## Deployment

### Heroku Deployment

1. Create a new Heroku app
2. Connect to your GitHub repository
3. Set the following environment variables in Heroku:
   - `MONGODB_URI`
   - `OPENAI_API_KEY`
4. Deploy the main branch

The application uses the following buildpacks:
- heroku/nodejs

### Production Considerations

- Uses `next start -p $PORT` for Heroku compatibility
- Configured for Node.js 18.x runtime
- Optimized for production builds

## Development

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Create production build
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint

### Adding New Features

1. Create new components in `src/components/ui`
2. Add API routes in `src/app/api`
3. Update types as needed
4. Follow the existing pattern for MongoDB integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For questions or comments, contact paul@axonlearning.ai

## License

This project is proprietary and confidential. All rights reserved.
