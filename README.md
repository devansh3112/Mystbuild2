# Mystery Publishers - Manuscript Flow

A comprehensive platform for managing manuscript editing workflows for Mystery Publishers.

## About the Project

The Manuscript Flow platform facilitates the entire publishing process, connecting writers, editors, and administrators in a streamlined workflow to enhance manuscript quality and publishing efficiency.

## Key Features

- **Role-Based Access**: Separate interfaces for writers, editors, and administrators
- **Manuscript Management**: Upload, track, and manage manuscript editing progress
- **Communication Tools**: Integrated messaging between writers and editors
- **Editorial Workflow**: Assignment management and live editing features
- **Marketplace**: Connect writers with editors and publishers
- **Payment Processing**: Manage transactions between platform users

## Technologies Used

This project is built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router
- React Query

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd manuscript-flow-canvas

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Development

The application follows a component-based architecture with:

- Role-specific dashboards
- Shared UI components
- Context-based state management
- Responsive design for all devices

## Project Structure

- `/src/components`: Reusable UI components
- `/src/pages`: Main application views
- `/src/contexts`: State management
- `/src/lib`: Utility functions
- `/src/hooks`: Custom React hooks

## Deployment

### Build for Production

Build the project for production:

```sh
npm run build
```

The build output will be in the `dist` directory, ready to be deployed to any static hosting service.

### Deploying to Vercel

The project is configured for easy deployment to Vercel. To deploy:

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Log in to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Vite" as the framework preset
   - Keep the default build settings (they will match our configuration)
   - Click "Deploy"

3. **Environment Variables**:
   - If your application requires environment variables, add them in the Vercel project settings.

4. **Custom Domain**:
   - Once deployed, you can add a custom domain in the project settings.

### Continuous Deployment

Vercel automatically redeploys your application every time you push changes to your repository.

## Contact

For any inquiries, please contact Mystery Publishers.

## Supabase Backend Setup

This project uses Supabase for authentication and data storage.

### Setup Instructions

1. **Configure Environment Variables**
   
   Create a `.env` file in the project root with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Initialize the Database**
   
   Run the setup script to create the tables and load sample data:
   ```
   npm run setup-db
   ```
   
   This script will:
   - Create all required tables
   - Configure row level security policies
   - Load sample data for testing

3. **Feature Flag Control**
   
   The application is configured to use a "shadow implementation" approach, where real data can be toggled via feature flags.
   
   To enable real data:
   - In `src/pages/AdminDashboard.tsx`, set `USE_SUPABASE_DATA = true`
   
   This allows for gradual integration of the backend without disrupting the existing UI.
