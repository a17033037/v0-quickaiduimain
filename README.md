# QuickAid - Real-Time Emergency Hospital Bed Finder

QuickAid is a life-saving application that connects patients to available hospital beds in real-time during medical emergencies.

## Features

- **Real-Time Bed Availability**: Live tracking of general, emergency, and ICU beds across hospitals
- **Interactive Maps**: Leaflet + OpenStreetMap integration showing nearby hospitals
- **Emergency Classification**: Specialized routing for cardiac, trauma, stroke, respiratory, and pediatric emergencies
- **Live Dashboard**: Real-time monitoring of active emergencies and hospital capacity
- **Geolocation Support**: Automatic detection of user location for faster response
- **Real-time Updates**: Supabase subscriptions for instant data synchronization

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Maps**: Leaflet + OpenStreetMap
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (already configured)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run the database seed script:
   - Navigate to the project in v0
   - The SQL script will automatically populate the database with hospital data

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### `hospitals` table
- `id`: UUID (primary key)
- `name`: Text (hospital name)
- `location`: Text (lat,lng coordinates)
- `coordinates`: JSONB (parsed coordinates)
- `general_beds_available`: Integer
- `emergency_beds_available`: Integer
- `icu_beds_available`: Integer
- `distance_km`: Numeric
- `last_updated`: Timestamp

### `emergencies` table
- `id`: UUID (primary key)
- `created_at`: Timestamp
- `type`: Text (cardiac, accident, stroke, etc.)
- `location`: Text
- `status`: Text (searching, en_route, admitted, completed)
- `selected_hospital_id`: UUID (foreign key)
- `timeline`: JSONB (array of events)

## Usage

1. **Report Emergency**: Click "Report Emergency" and select emergency type
2. **Get Location**: Use geolocation or enter manually
3. **Find Hospitals**: System shows available hospitals with bed counts
4. **View on Map**: Interactive map displays hospitals and distances
5. **Select Hospital**: Choose hospital and confirm
6. **Track Progress**: Monitor status on dashboard

## Deployment

This project is ready to deploy on Vercel:

1. Push to GitHub
2. Import to Vercel
3. Environment variables are automatically configured via Supabase integration
4. Deploy!

## License

MIT
