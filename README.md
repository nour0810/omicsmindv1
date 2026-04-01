# OmicsMind

AI-Powered Omics Simulation Platform for learning bioinformatics through interactive scenarios.

## 🚀 Features

- **Interactive Scenarios**: Learn WGS analysis through real-world clinical cases
- **AI-Powered Reasoning**: Claude AI guides your analysis decisions
- **Visual Analytics**: Quality charts, read pileups, and variant tables
- **Certificates**: Earn certificates upon completion

## 📁 Project Structure

```
omicsmind/
├── src/
│   ├── app/
│   │   ├── welcome/       # Welcome/Landing page
│   │   ├── simulator/     # Main simulation engine
│   │   └── certificate/   # Achievement certificates
│   ├── components/        # React components
│   └── lib/              # Utilities and data
├── public/               # Static assets
└── Configuration files
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React + Tailwind CSS
- **Charts**: Chart.js
- **PDF Generation**: jsPDF
- **AI**: Claude API integration

## 🚴 Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📝 Environment Variables

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

## 🎓 Scenarios

1. **Module 1**: From Biology to Data (Beginner)
2. **Scenario 1**: Mystery Bacterial Strain (Intermediate)
3. **Scenario 2**: Tumor Somatic Variants (Advanced)
4. **Scenario 3**: Contaminated Metagenome (Intermediate)

## 📜 License

© 2026 GenoFlow Agency. All rights reserved.
