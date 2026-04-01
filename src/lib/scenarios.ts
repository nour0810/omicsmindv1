// TODO: Copy your scenarios.ts data from Rocket editor here
// Scenario configuration and data

export interface Scenario {
  id: string
  title: string
  icon: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  isRequired?: boolean
  isLocked?: boolean
  steps: Step[]
}

export interface Step {
  id: number
  title: string
  description: string
  tools: Tool[]
  aiPrompt: string
  expectedOutcome: string
}

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'module-1',
    title: 'Module 1: From Biology to Data',
    icon: '📖',
    description: 'Brief intro to sequencing, coverage, and variants. Required first step.',
    duration: '3 min',
    difficulty: 'Beginner',
    tags: ['FASTQ', 'Coverage', 'Variants'],
    isRequired: true,
    steps: [],
  },
  {
    id: 'scenario-1',
    title: 'Mystery Bacterial Strain',
    icon: '🦠',
    description: 'Hospital outbreak. Unknown organism. Treatment depends on your analysis pipeline.',
    duration: '12 min',
    difficulty: 'Intermediate',
    tags: ['WGS', 'Antibiotic Resistance', 'Novel Pathogen'],
    steps: [],
  },
  {
    id: 'scenario-2',
    title: 'Tumor Somatic Variants',
    icon: '🧬',
    description: 'Lung cancer patient. Find the co-mutation that changes treatment from harmful to curative.',
    duration: '14 min',
    difficulty: 'Advanced',
    tags: ['Cancer WGS', 'DeepVariant', 'Subclonal'],
    steps: [],
  },
  {
    id: 'scenario-3',
    title: 'Contaminated Metagenome',
    icon: '🧫',
    description: 'Gut microbiome study. Is your data clean? Is that noise a discovery?',
    duration: '10 min',
    difficulty: 'Intermediate',
    tags: ['Metagenomics', 'Contamination', 'Novel Phage'],
    steps: [],
  },
]

export const TOOLS: Record<string, Tool> = {
  fastqc: {
    id: 'fastqc',
    name: 'FastQC',
    description: 'Quality control check for raw sequencing data',
    icon: '📊',
  },
  bwa: {
    id: 'bwa',
    name: 'BWA',
    description: 'Burrows-Wheeler Aligner for sequence alignment',
    icon: '🔗',
  },
  gatk: {
    id: 'gatk',
    name: 'GATK',
    description: 'Genome Analysis Toolkit for variant discovery',
    icon: '🧬',
  },
  deepvariant: {
    id: 'deepvariant',
    name: 'DeepVariant',
    description: 'Deep learning-based variant caller',
    icon: '🤖',
  },
  kraken2: {
    id: 'kraken2',
    name: 'Kraken2',
    description: 'Metagenomic sequence classifier',
    icon: '🦠',
  },
}

export const COMPLETION_STORAGE_KEY = 'omicsmind_completed_scenarios'

export const getCompletedScenarios = (): string[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(COMPLETION_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const markScenarioComplete = (scenarioId: string): void => {
  if (typeof window === 'undefined') return
  const completed = getCompletedScenarios()
  if (!completed.includes(scenarioId)) {
    completed.push(scenarioId)
    localStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(completed))
  }
}
