# 🧬 OmicsMind

**AI-Powered Omics Simulation Platform** for learning bioinformatics through interactive, real-world clinical scenarios.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-OmicsMind-00d4aa?style=for-the-badge)](https://omicsmind-yv80o01.public.builtwithrocket.new/welcome)

---

## 🚀 Live Demo

**Try it now:** [https://omicsmind-yv80o01.public.builtwithrocket.new/welcome](https://omicsmind-yv80o01.public.builtwithrocket.new/welcome)

---

## 🎯 What is OmicsMind?

OmicsMind is an interactive educational platform that teaches bioinformatics and genomics analysis through hands-on decision-making scenarios. Instead of passive learning, you:

- Analyze **real genomic data** through interactive visualizations
- Make **clinical decisions** and see their consequences
- Get **AI-powered explanations** from Claude
- Compare **classical vs AI-assisted** analysis results
- Earn **certificates** upon completion

---

## 🎓 Scenarios

### Module 1: From Biology to Data
Learn the fundamentals: FASTQ format, coverage depth, variants, and the bioinformatics pipeline.

### Scenario 1: 🦠 Mystery Bacterial Strain
**Level:** Intermediate | **Case:** ICU infection outbreak

A patient in the ICU fails standard antibiotic treatment. Your mission: identify the resistance mechanism using WGS analysis.

- De novo assembly reveals novel resistance genes
- Discover a 14kb genomic island missed by reference mapping
- Correct treatment changes patient outcome

### Scenario 2: 🧬 Tumor Somatic Variants
**Level:** Advanced | **Case:** NSCLC cancer genomics

A non-small cell lung cancer patient needs a treatment plan. Deep sequencing reveals complex subclonal architecture.

- Detect variants at 4.2% VAF (below classical thresholds)
- Identify immunotherapy resistance mutations
- Predict 2-year survival with AI vs classical analysis

### Scenario 3: 🧫 Contaminated Metagenome
**Level:** Intermediate | **Case:** IBD research paper

A research team submits their gut microbiome analysis for publication. Something's wrong with the data.

- Detect 23% human contamination
- Find a novel phage hiding in "noise" reads
- AI discovers what would have caused paper rejection

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React + Tailwind CSS |
| Charts | Recharts (Chart.js wrapper) |
| PDF Generation | jsPDF |
| AI | Claude API (Anthropic) |
| Styling | Custom CSS animations |

---

## 📁 Project Structure

```
omicsmind/
├── src/
│   ├── app/
│   │   ├── welcome/         # Landing page
│   │   ├── simulator/       # Main simulation engine
│   │   └── certificate/    # Achievement certificates
│   ├── components/         # 21 React components
│   │   ├── WelcomeClient.tsx
│   │   ├── SimulatorClient.tsx
│   │   ├── IntroModule.tsx
│   │   ├── AIChatPanel.tsx
│   │   ├── DecisionPanel.tsx
│   │   ├── VisualizationPanel.tsx
│   │   ├── QualityChart.tsx
│   │   ├── ReadPileup.tsx
│   │   ├── VariantTable.tsx
│   │   ├── ComparisonScreen.tsx
│   │   ├── OutcomeScreen.tsx
│   │   └── CertificateClient.tsx
│   └── data/
│       └── scenarios.ts    # Scenario data & decision trees
├── public/
└── Configuration files
```

---

## ✨ Features

- 🌌 **Animated Landing Page** — Particle field, DNA helix animation, scenario cards
- 📊 **Interactive Visualizations** — FastQC quality charts, read pileups, variant tables
- 🧠 **AI Reasoning Engine** — Real-time predictions and explanations from Claude
- ⚖️ **Classical vs AI Comparison** — See exactly what AI adds to classical analysis
- 🏆 **Achievement Certificates** — Downloadable PDF/PNG certificates with jsPDF
- 📱 **Responsive Design** — Works on desktop and tablet
- 🌙 **Dark Scientific Aesthetic** — Navy/teal/gold color scheme

---

## 👤 Author

**Nour Houda** | GenoFlow Agency

- 🌐 Website: [genoflow.bio](https://genoflow.bio)
- 📧 Email: [noor@genoflow.bio](mailto:noor@genoflow.bio)
- 📱 Phone: +216 28 533 434

---

## 📜 License

© 2026 **GenoFlow Agency**. All rights reserved.

Built with ❤️ for the genomics community.

---

<p align="center">
  <a href="https://genoflow.bio">
    <img src="https://img.shields.io/badge/Powered%20by-GenoFlow%20Agency-00d4aa?style=for-the-badge" alt="GenoFlow Agency">
  </a>
</p>
