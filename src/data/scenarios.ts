export interface StepOption {
  id: string;
  label: string;
  description: string;
  value: string | number;
  outcome: {
    note: string;
    [key: string]: unknown;
  };
}

export interface ScenarioStep {
  id: string;
  label: string;
  question: string;
  visualization: 'quality_chart' | 'pileup' | 'variant_table' | 'summary';
  context: string;
  options: StepOption[];
  optimalChoice: number;
  aiContext: string;
}

export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  description: string;
  tags: string[];
  time: string;
  difficulty: 'Required' | 'Intermediate' | 'Advanced';
  color: 'teal' | 'purple' | 'amber';
  context: string;
  sampleData: {
    coverage: number;
    gc: number;
    reads: number;
    mapping_rate: number;
  };
  snpPosition: number;
  steps: ScenarioStep[];
  wowMoment: string;
  classicalResult: Record<string, unknown>;
  aiResult: Record<string, unknown>;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'bacterial_wgs',
    emoji: '🦠',
    title: 'Mystery Bacterial Strain',
    description:
      'Hospital outbreak. Unknown organism. Treatment depends on your analysis pipeline.',
    tags: ['WGS', 'Antibiotic Resistance', 'Novel Pathogen'],
    time: '~12 min',
    difficulty: 'Intermediate',
    color: 'teal',
    context:
      'ICU outbreak in Sfax General Hospital. Patient: 58F, immunocompromised, septic shock. Blood culture positive for gram-negative rod. Species identification inconclusive. You have WGS data. Treatment team is waiting. Your analysis determines the antibiotic choice.',
    sampleData: { coverage: 45, gc: 52, reads: 6800000, mapping_rate: 0.69 },
    snpPosition: 32,
    steps: [
      {
        id: 'qc',
        label: 'Quality Control',
        question: 'Set your quality trimming threshold',
        visualization: 'quality_chart',
        context:
          'Raw reads show quality drop at 3-prime end. 45x coverage, GC content 52% (slightly elevated). Some reads show 3-prime quality drop. You must decide how strict your quality filter will be.',
        options: [
          {
            id: 'phred-20',
            label: 'Phred ≥ 20 (Lenient)',
            description: 'Keep more data, accept some noise',
            value: 20,
            outcome: {
              kept_pct: 91,
              false_vars: 7,
              note: 'Keeps 91% of reads but 7 likely false variants will contaminate downstream. Introducing chimeric reads that will generate false variant calls downstream.',
            },
          },
          {
            id: 'phred-30',
            label: 'Phred ≥ 30 (Strict)',
            description: 'High quality only, lose some reads',
            value: 30,
            outcome: {
              kept_pct: 73,
              false_vars: 1,
              note: 'Loses 27% of data but removes chimeric reads that create phantom variants. Eliminates chimeric artifacts. Net effect: cleaner assembly with 1 expected false positive.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Bacterial WGS sample, GC=52%, coverage=45x. User must choose QC threshold. The high GC content means standard trimming may be too aggressive at Q30.',
      },
      {
        id: 'assembly',
        label: 'Assembly',
        question: 'Choose your genome assembly strategy',
        visualization: 'pileup',
        context:
          'After QC: 4.96M reads. Mapping rate to reference database: 69%. This strain may be novel. One third of your reads map nowhere. This organism may be novel.',
        options: [
          {
            id: 'ref-map',
            label: 'Map to reference genome',
            description: 'Fast, standard approach',
            value: 'reference',
            outcome: {
              mapped: 69,
              unmapped_loss: 31,
              contigs: 0,
              novel_found: false,
              note: '31% of reads discarded. Major genomic regions missed. This IS a novel strain. Discards 31% of reads. Misses entire 14kb genomic island. This is where the resistance gene lives.',
            },
          },
          {
            id: 'denovo',
            label: 'De novo assembly',
            description: 'Slower, builds from scratch',
            value: 'denovo',
            outcome: {
              contigs: 23,
              n50: 180000,
              mapped: 100,
              novel_found: true,
              note: 'Assembly reveals 14kb genomic island absent from all reference databases. Assembly: 23 contigs, N50=180kb. Reveals complete genome including 14kb island absent from all databases.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Mapping rate 69% against known reference. User choosing between reference mapping and de novo assembly for potentially novel strain.',
      },
      {
        id: 'resistance',
        label: 'Resistance Genes',
        question: 'Select resistance gene detection method',
        visualization: 'variant_table',
        context:
          'Assembly complete. 23 contigs, N50=180kb. Now find resistance genes. You must identify resistance genes in this potentially novel organism.',
        options: [
          {
            id: 'blast',
            label: 'BLAST similarity search',
            description: 'Classic sequence alignment',
            value: 'blast',
            outcome: {
              genes_found: 4,
              missed: 2,
              note: 'Misses 2 resistance genes with <70% sequence identity — novel variants. BLAST finds 4 known resistance genes. Misses 2 novel variants with <70% identity threshold.',
            },
          },
          {
            id: 'ai-resistance',
            label: 'AI resistance prediction',
            description: 'ML-based structural pattern matching',
            value: 'ai',
            outcome: {
              genes_found: 6,
              missed: 0,
              note: 'AI identifies 2 additional novel resistance gene variants via learned structural motifs — OXA-type carbapenemase with 64% identity to known variants.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Novel bacterial strain, de novo assembled. User choosing resistance gene detection: BLAST vs ML-based profile prediction.',
      },
      {
        id: 'clinical',
        label: 'Clinical Decision',
        question: 'What is your antibiotic recommendation?',
        visualization: 'summary',
        context:
          'Resistance profile complete. 6 genes found including 2 novel OXA-type variants predicted by AI. Classic report would list 4 genes.',
        options: [
          {
            id: 'standard',
            label: 'Standard carbapenem treatment',
            description: 'Based on 4 known resistance genes',
            value: 'standard',
            outcome: {
              treatment: 'Meropenem',
              success_prob: 0.4,
              note: 'Misses carbapenem resistance gene. Patient will not respond to treatment. Meropenem initiated. AI-predicted carbapenemase not considered. Patient non-responsive. 48h later: escalation required.',
            },
          },
          {
            id: 'escalate',
            label: 'Flag carbapenem resistance — escalate',
            description: 'Based on AI-predicted novel gene',
            value: 'escalate',
            outcome: {
              treatment: 'Colistin + Tigecycline',
              success_prob: 0.78,
              note: 'Combination therapy initiated based on AI prediction. Patient stabilizes within 36h. Novel OXA-variant later confirmed by collaborating lab.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Novel bacterial strain fully characterized. User choosing clinical antibiotic recommendation based on 4 known vs 6 AI-predicted resistance genes.',
      },
    ],
    wowMoment:
      'The genomic island discovered in de novo assembly contains a novel OXA-900 carbapenemase — not in any database. Classical pipeline would have recommended meropenem. Patient would have deteriorated. AI-assisted analysis prevented treatment failure.',
    classicalResult: {
      variants: 12,
      resistance_genes: 4,
      clinical_confidence: 'LOW',
      novel: 0,
    },
    aiResult: {
      variants: 31,
      resistance_genes: 6,
      clinical_confidence: 'HIGH',
      novel_features: 1,
      novel: 1,
    },
  },
  {
    id: 'tumor_wgs',
    emoji: '🧬',
    title: 'Tumor Somatic Variants',
    description:
      'Lung cancer patient. Find the co-mutation that changes treatment from harmful to curative.',
    tags: ['Cancer WGS', 'DeepVariant', 'Subclonal'],
    time: '~14 min',
    difficulty: 'Advanced',
    color: 'purple',
    context:
      'Patient: 52M, lung adenocarcinoma, Stage IIIA. EGFR mutation suspected from tissue biopsy. WGS data available. If EGFR confirmed: targeted therapy (osimertinib). But tumor heterogeneity is high — multiple cell populations with different mutation profiles.',
    sampleData: { coverage: 30, gc: 48, reads: 9200000, mapping_rate: 0.97 },
    snpPosition: 28,
    steps: [
      {
        id: 'depth',
        label: 'Sequencing Depth',
        question: 'Choose sequencing depth strategy',
        visualization: 'quality_chart',
        context:
          'Standard WGS: 30x coverage. For tumor heterogeneity detection: 100x recommended. Budget and time are factors.',
        options: [
          {
            id: '30x',
            label: '30x coverage (standard)',
            description: 'Fast, cost-effective',
            value: 30,
            outcome: {
              depth: 30,
              low_vaf_detected: false,
              subclones: 0,
              note: 'Variants below 10% VAF invisible. Tumor has 3 subclonal populations at 3-7% VAF. At 30x, variants below 10% VAF undetectable. Tumor has 3 subclonal populations at 3-7% VAF — all invisible.',
            },
          },
          {
            id: '100x',
            label: '100x deep sequencing',
            description: 'Slower, expensive, reveals rare variants',
            value: 100,
            outcome: {
              depth: 100,
              low_vaf_detected: true,
              subclones: 3,
              note: 'Subclonal STK11 mutation at 4.2% VAF now detectable. This co-mutation predicts immunotherapy resistance. Changes treatment stratification.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Lung adenocarcinoma WGS, 30x standard coverage. User choosing sequencing depth for tumor heterogeneity detection.',
      },
      {
        id: 'caller',
        label: 'Variant Caller',
        question: 'Choose variant calling algorithm',
        visualization: 'pileup',
        context:
          '100x coverage achieved. 9.2M reads mapped at 97% rate. Now choose how to find mutations.',
        options: [
          {
            id: 'gatk',
            label: 'GATK HaplotypeCaller (classical)',
            description: 'Standard classical algorithm',
            value: 'gatk',
            outcome: {
              variants_found: 18,
              missed: 5,
              note: 'Misses 5 variants in low-complexity genomic regions due to heuristic filtering. 3 of those 5 are in known oncogenes.',
            },
          },
          {
            id: 'deepvariant',
            label: 'DeepVariant (deep learning)',
            description: 'Treats pileup as image — ML model',
            value: 'deepvariant',
            outcome: {
              variants_found: 23,
              missed: 0,
              note: 'DeepVariant finds all 23 variants. The 5 GATK missed include STK11 and KEAP1 — both affecting treatment response.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Tumor WGS at 100x coverage. User choosing between GATK HaplotypeCaller and DeepVariant for somatic variant calling.',
      },
      {
        id: 'filter',
        label: 'Germline Filter',
        question: 'How do you filter germline variants from somatic?',
        visualization: 'variant_table',
        context:
          '23 variants identified. Some may be inherited (germline) not cancer-specific (somatic). Must separate them.',
        options: [
          {
            id: 'hard-filter',
            label: 'Hard filter (MAF > 1%)',
            description: 'Remove anything common in population',
            value: 'hard',
            outcome: {
              filtered: 2,
              wrong_removes: 1,
              note: 'Incorrectly removes BRCA2 variant present at 0.8% population freq — but this instance IS somatic, and it IS a driver mutation.',
            },
          },
          {
            id: 'ai-somatic',
            label: 'AI somatic classifier',
            description: 'Learns from tumor-normal allelic imbalance patterns',
            value: 'ai',
            outcome: {
              filtered: 1,
              wrong_removes: 0,
              note: 'AI correctly retains the BRCA2 somatic variant by detecting allelic imbalance pattern specific to tumor cells.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Tumor WGS somatic filtering. User choosing between hard MAF filter and AI somatic classifier.',
      },
      {
        id: 'report',
        label: 'Clinical Report',
        question: 'What do you include in the oncology report?',
        visualization: 'summary',
        context:
          '23 somatic variants confirmed. EGFR exon 19 deletion: 34% VAF — clearly targetable. STK11 variant: 4.2% VAF in subclone.',
        options: [
          {
            id: 'egfr-only',
            label: 'Report EGFR only (targeted therapy)',
            description: 'Standard EGFR-driven protocol',
            value: 'egfr_only',
            outcome: {
              treatment: 'Osimertinib + Pembrolizumab',
              response: 'Progressive disease at 5 months',
              note: 'STK11 co-mutation predicts pembrolizumab resistance. Combination fails. Disease progresses at 5 months.',
            },
          },
          {
            id: 'full-profile',
            label: 'Full molecular profile including co-mutations',
            description: 'Report all findings including rare variants',
            value: 'full',
            outcome: {
              treatment: 'Osimertinib monotherapy',
              response: '78% response rate at 12 months',
              note: 'STK11 co-mutation identified. Immunotherapy excluded. Targeted monotherapy achieves 78% response.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Lung adenocarcinoma report. EGFR exon 19 deletion at 34% VAF confirmed. STK11 co-mutation at 4.2% VAF detected by DeepVariant.',
      },
    ],
    wowMoment:
      'The STK11 co-mutation at 4.2% VAF — invisible at 30x, missed by GATK, almost filtered as germline — was the key finding. It predicted immunotherapy resistance. Without AI-assisted deep sequencing, the oncologist would have added pembrolizumab. Instead: monotherapy, correct protocol, 78% 2-year survival vs 41%.',
    classicalResult: {
      variants: 18,
      actionable: 1,
      clinical_confidence: 'MEDIUM',
      subclonal: 0,
    },
    aiResult: {
      variants: 23,
      actionable: 3,
      clinical_confidence: 'HIGH',
      subclonal: 3,
    },
  },
  {
    id: 'metagenomics',
    emoji: '🧫',
    title: 'Contaminated Metagenome',
    description:
      "Gut microbiome study. Is your data clean? Is that noise a discovery? Your data quality determines your paper.",
    tags: ['Metagenomics', 'Contamination', 'Novel Phage'],
    time: '~10 min',
    difficulty: 'Intermediate',
    color: 'amber',
    context:
      'Research study: gut microbiome composition in patients with inflammatory bowel disease (IBD). 24 samples. Your sample looks clean by basic metrics. Sequencing depth: 12M reads. The paper\'s main conclusion depends on species diversity index. Peer reviewers will be strict.',
    sampleData: {
      coverage: 12,
      gc: 51,
      reads: 12000000,
      mapping_rate: 0.97,
    },
    snpPosition: 18,
    steps: [
      {
        id: 'contamination',
        label: 'Contamination Check',
        question: 'The sample looks clean. Do you run host depletion?',
        visualization: 'quality_chart',
        context:
          'Basic quality metrics look good. QC score: 92%. But GC content distribution has a suspicious second peak around 40% — human genome signature.',
        options: [
          {
            id: 'skip',
            label: 'Skip — proceed to analysis',
            description: 'Save time, data looks fine',
            value: 'skip',
            outcome: {
              human_pct: 23,
              contamination: true,
              note: '23% of reads are human. All downstream diversity metrics are wrong. Shannon diversity inflated by 34%. All conclusions in the paper will be wrong.',
            },
          },
          {
            id: 'filter',
            label: 'Run Kraken2 human read filter',
            description: 'Takes 20min but ensures clean data',
            value: 'filter',
            outcome: {
              human_pct: 0,
              contamination: false,
              note: '2.76M human reads removed. True microbial reads: 9.24M. Real microbiome profile now visible.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Metagenomics sample with suspicious GC bimodal distribution. User choosing whether to run Kraken2 host depletion.',
      },
      {
        id: 'unknown',
        label: 'Unknown Reads',
        question: '3% of reads do not match any known organism. What do you do?',
        visualization: 'pileup',
        context:
          'After host removal: 9.24M clean reads. Kraken2 classifies 97% to known gut bacteria. 277,200 reads: no match in any database.',
        options: [
          {
            id: 'discard',
            label: 'Discard as noise/contamination',
            description: 'Standard practice for unclassified reads',
            value: 'discard',
            outcome: {
              novel_phage: false,
              note: 'The 3% were a novel temperate phage. Discarded. The discovery that would have defined your paper: gone.',
            },
          },
          {
            id: 'investigate',
            label: 'Run AI anomaly analysis on unknown reads',
            description: 'Investigate the "noise"',
            value: 'investigate',
            outcome: {
              novel_phage: true,
              note: 'AI entropy analysis: pattern matches phage insertion signature. Novel bacteriophage confirmed. IBD-associated phage — publishable finding.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'Metagenomics sample. 3% unclassified reads after Kraken2. User deciding whether to discard or investigate unknown reads.',
      },
      {
        id: 'diversity',
        label: 'Diversity Calculation',
        question: 'Calculate microbiome diversity index',
        visualization: 'variant_table',
        context:
          'Taxonomy classification complete. 118 species identified (after decontamination). Now calculate the main metric: Shannon diversity index.',
        options: [
          {
            id: 'standard',
            label: 'Standard Shannon index (raw)',
            description: 'Classic alpha diversity',
            value: 'standard',
            outcome: {
              diversity: 3.8,
              inflated: true,
              note: 'Raw Shannon: 3.8. Inflated by residual contaminants. Real diversity: 2.5. Overstates IBD dysbiosis by 52%.',
            },
          },
          {
            id: 'ai-corrected',
            label: 'AI-corrected diversity (rarefaction + decontam)',
            description: 'Corrects for sequencing artifacts',
            value: 'ai',
            outcome: {
              diversity: 2.5,
              inflated: false,
              note: 'Corrected Shannon: 2.5. Accurate. The IBD microbiome is less diverse than previously reported — but the conclusion is solid.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'IBD metagenomics study. Shannon diversity calculation. User choosing between raw and AI-corrected diversity index.',
      },
      {
        id: 'publication',
        label: 'Publication Decision',
        question: 'What is your confidence level for paper submission?',
        visualization: 'summary',
        context:
          'Results: Shannon index 2.5, 118 species, 1 novel phage. AI confidence score: 94% (with decontamination + correction). Classical pipeline score: 61%.',
        options: [
          {
            id: 'submit',
            label: 'High confidence — submit as-is',
            description: 'Results look strong',
            value: 'submit',
            outcome: {
              confidence: 0.61,
              decision: 'Peer review rejection',
              retraction_risk: true,
              note: 'Reviewer 2 catches the residual human reads and inflated diversity. Major revision required. 6-month delay.',
            },
          },
          {
            id: 'validate',
            label: 'Add validation — confirm novel phage independently',
            description: 'Extra step before submission',
            value: 'validate',
            outcome: {
              confidence: 0.94,
              decision: 'Accepted in Nature Microbiology',
              retraction_risk: false,
              note: 'PCR validation of novel phage. qPCR confirms IBD-association across all 24 samples. Paper accepted. Novel phage named after your lab.',
            },
          },
        ],
        optimalChoice: 1,
        aiContext:
          'IBD metagenomics study ready for publication. AI confidence 94% with full pipeline vs 61% classical. User choosing submission strategy.',
      },
    ],
    wowMoment:
      'The 277,200 "noise" reads contained a genuine novel temperate phage associated with IBD — now described in the published paper as a new discovery. Classical bioinformatics discards this. AI anomaly detection finds it. The discovery that defines the paper was hiding in what everyone else throws away.',
    classicalResult: {
      diversity: 3.8,
      species: 142,
      confidence: '61%',
      novel: 0,
    },
    aiResult: { diversity: 2.5, species: 118, confidence: '94%', novel: 1 },
  },
];

export const MODULE_ONE = {
  id: 'module_1',
  emoji: '📖',
  title: 'From Biology to Data',
  description:
    'Brief intro to sequencing, coverage, and variants. Required first step.',
  tags: ['FASTQ', 'Coverage', 'Variants'],
  time: '~3 min',
  difficulty: 'Required' as const,
  color: 'teal' as const,
};
