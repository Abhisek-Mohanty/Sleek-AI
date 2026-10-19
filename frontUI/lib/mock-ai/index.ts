import { FunnelStage, SalesFunnel, Enquiry, SimulatedMessage } from "@/types";

export interface AIObjectiveInput {
  funnelName: string;
  productService: string;
  salesObjective: string;
  targetAudience: string;
  targetConversionGoal: number;
  expectedDuration: string;
  preferredChannels: string[];
  customInstructions?: string;
}

// Deterministic templates and generator
export const MOCK_FUNNEL_PRESETS: {
  title: string;
  description: string;
  input: AIObjectiveInput;
}[] = [
  {
    title: "MSME Commercial Loans",
    description: "Convert high-intent business loan inquiries into disbursed applicants via fast consultation.",
    input: {
      funnelName: "MSME Working Capital Fast-Track",
      productService: "Unsecured Business Term Loans ($50k - $500k)",
      salesObjective: "Qualify loan inquiries rapidly, evaluate GST/tax revenue, arrange credit officer consultations, and shepherd documentation through to final sanction.",
      targetAudience: "Small to Medium Enterprise owners, Manufacturers, Wholesale Traders",
      targetConversionGoal: 28,
      expectedDuration: "21 Days",
      preferredChannels: ["Call", "WhatsApp", "Email"],
      customInstructions: "Prioritize leads with >$200k declared revenue and immediate fund urgency.",
    },
  },
  {
    title: "B2B SaaS Enterprise Inbound",
    description: "Nurture incoming website demo requests into qualified pilot contracts and enterprise deals.",
    input: {
      funnelName: "Enterprise SaaS Demo-to-Close",
      productService: "Cloud Data Intelligence & Analytics Platform",
      salesObjective: "Respond in under 15 minutes, discover current data stack pain points, deliver tailored executive demo, and negotiate 14-day proof of concept.",
      targetAudience: "VP of Engineering, Chief Data Officers, Head of Product in 100+ employee tech firms",
      targetConversionGoal: 32,
      expectedDuration: "30 Days",
      preferredChannels: ["Email", "Meeting", "Call"],
      customInstructions: "Emphasize security compliance (SOC2) and 3x query speedup benchmarks.",
    },
  },
  {
    title: "High-Ticket Commercial Real Estate",
    description: "Filter prime property enquiries, schedule virtual/site walk-throughs, and close LOIs.",
    input: {
      funnelName: "Grade-A Commercial Space Acquisition",
      productService: "Prime Corporate Office Leasing & Commercial Suites",
      salesObjective: "Identify square footage requirement, verify move-in timeline and budget, conduct VIP property site tour, and submit lease proposal.",
      targetAudience: "Corporate Facilities Directors, Expanding Startups, Healthcare Hubs",
      targetConversionGoal: 22,
      expectedDuration: "45 Days",
      preferredChannels: ["Call", "Meeting", "WhatsApp"],
      customInstructions: "Verify space requirement (>3,000 sq ft) and target possession date within 6 months.",
    },
  },
];

export async function simulateAIFunnelGeneration(
  input: AIObjectiveInput,
  onProgress?: (step: string, percent: number) => void
): Promise<SalesFunnel> {
  const steps = [
    { text: "Analyzing sales objective and target audience...", pct: 20 },
    { text: "Synthesizing industry-specific sales pipeline structure...", pct: 45 },
    { text: "Constructing stage entry/exit criteria & micro-actions...", pct: 70 },
    { text: "Calibrating conversion velocity benchmarks and messaging templates...", pct: 90 },
    { text: "Finalizing AI-optimized sales funnel...", pct: 100 },
  ];

  for (const step of steps) {
    if (onProgress) {
      onProgress(step.text, step.pct);
    }
    // Simulate real AI latency with smooth step delays
    await new Promise((r) => setTimeout(r, 450));
  }

  // Derive stages intelligently based on input
  const isFinance = input.productService.toLowerCase().includes("loan") || input.salesObjective.toLowerCase().includes("credit");
  const isRealEstate = input.productService.toLowerCase().includes("estate") || input.productService.toLowerCase().includes("space");

  let stages: FunnelStage[] = [];

  if (isFinance) {
    stages = [
      {
        id: "stg_1_new",
        name: "New Loan Lead",
        order: 1,
        purpose: "Log and verify applicant identity and contact channels within 15 minutes.",
        requiredActions: [
          "Send instant confirmation WhatsApp & welcome SMS",
          "Verify company registration and tax number",
          "Assign dedicated lending advisor",
        ],
        assignedRole: "Inbound BDR",
        communicationChannel: "WhatsApp",
        expectedDurationDays: 1,
        entryCriteria: "Inbound enquiry form submitted with valid mobile and business name",
        completionCriteria: "Applicant verified, credit advisor assigned",
        successMetric: "Response time < 30 minutes",
        color: "bg-sky-50 text-sky-700 border-sky-200",
      },
      {
        id: "stg_2_discovery",
        name: "Financial Discovery",
        order: 2,
        purpose: "Gauge monthly turnover, required loan ticket size, and existing debt.",
        requiredActions: [
          "Conduct 10-minute diagnostic phone call",
          "Record declared turnover and loan tenure requested",
          "Send digital document checklist link",
        ],
        assignedRole: "Lending Specialist",
        communicationChannel: "Call",
        expectedDurationDays: 3,
        entryCriteria: "Lead acknowledged initial contact",
        completionCriteria: "Turnover recorded, customer willing to share 6-month bank statement",
        successMetric: "Qualification rate > 65%",
        color: "bg-amber-50 text-amber-700 border-amber-200",
      },
      {
        id: "stg_3_documents",
        name: "Document Verification",
        order: 3,
        purpose: "Collect and validate 6-month bank statements and tax filings.",
        requiredActions: [
          "Receive and parse bank statements",
          "Run credit bureau pre-check (Soft Pull)",
          "Verify cash-flow health with underwriting rules",
        ],
        assignedRole: "Credit Analyst",
        communicationChannel: "Email",
        expectedDurationDays: 4,
        entryCriteria: "Customer agreed to terms and uploaded preliminary docs",
        completionCriteria: "All 3 mandatory docs verified without discrepancies",
        successMetric: "Doc verification turnaround < 48 hrs",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
      {
        id: "stg_4_sanction",
        name: "Sanction & Offer",
        order: 4,
        purpose: "Present in-principle approval sanction letter with interest rate options.",
        requiredActions: [
          "Draft personalized loan offer term sheet",
          "Schedule closing call with business principal",
          "Address collateral and prepayment questions",
        ],
        assignedRole: "Senior Loan Manager",
        communicationChannel: "Meeting",
        expectedDurationDays: 5,
        entryCriteria: "Underwriting sanction approved",
        completionCriteria: "Sanction letter signed or countersigned by borrower",
        successMetric: "Offer acceptance rate > 45%",
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      {
        id: "stg_5_disbursement",
        name: "Disbursal & Won",
        order: 5,
        purpose: "Execute digital loan agreement, mandate e-NACH, and disburse capital.",
        requiredActions: [
          "Collect e-signature on legal facility agreement",
          "Set up automatic repayment mandate",
          "Initiate wire transfer & send congrats onboarding pack",
        ],
        assignedRole: "Operations Lead",
        communicationChannel: "WhatsApp",
        expectedDurationDays: 2,
        entryCriteria: "Signed offer letter in hand",
        completionCriteria: "Funds wired to company account successfully",
        successMetric: "100% compliant disbursement",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
    ];
  } else if (isRealEstate) {
    stages = [
      {
        id: "stg_1_new",
        name: "Lead Ingestion",
        order: 1,
        purpose: "Acknowledge inquiry and capture property location & area preferences.",
        requiredActions: ["Send digital property brochure", "Verify target area & move-in quarter"],
        assignedRole: "Relationship Manager",
        communicationChannel: "WhatsApp",
        expectedDurationDays: 2,
        entryCriteria: "Website or portal listing request",
        completionCriteria: "Brochure viewed, client confirmed interest",
        successMetric: "Lead contact rate > 80%",
        color: "bg-sky-50 text-sky-700 border-sky-200",
      },
      {
        id: "stg_2_tour",
        name: "Site Inspection Scheduled",
        order: 2,
        purpose: "Host an in-person or guided 3D virtual walkthrough of prime spaces.",
        requiredActions: ["Coordinate calendar with asset manager", "Conduct VIP property inspection", "Provide floor plans and zoning compliance"],
        assignedRole: "Property Consultant",
        communicationChannel: "Meeting",
        expectedDurationDays: 5,
        entryCriteria: "Client shortlists at least 1 floor plate",
        completionCriteria: "Inspection attended and satisfaction score gathered",
        successMetric: "Show-up rate > 75%",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
      {
        id: "stg_3_loi",
        name: "LOI & Commercials",
        order: 3,
        purpose: "Negotiate lease rental, fit-out periods, and parking allocations.",
        requiredActions: ["Submit formal Letter of Intent (LOI)", "Resolve lease clause queries", "Collect security deposit agreement"],
        assignedRole: "Commercial Director",
        communicationChannel: "Meeting",
        expectedDurationDays: 10,
        entryCriteria: "Site inspection approved by tenant committee",
        completionCriteria: "Signed LOI with earnest token received",
        successMetric: "LOI close rate > 40%",
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      {
        id: "stg_4_closed",
        name: "Lease Executed",
        order: 4,
        purpose: "Register lease deed and hand over keys for fit-out commencement.",
        requiredActions: ["Legal registration of indenture", "Handover site keys to project manager", "Send tenant welcome guide"],
        assignedRole: "Operations Lead",
        communicationChannel: "Call",
        expectedDurationDays: 7,
        entryCriteria: "Executed agreement & deposit cleared",
        completionCriteria: "Keys handed over",
        successMetric: "Zero post-handover snags",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
    ];
  } else {
    // Default High-Performing Enterprise SaaS / B2B Funnel
    stages = [
      {
        id: "stg_1_new",
        name: "1. Intake & Enrichment",
        order: 1,
        purpose: "Enrich prospect data, confirm business email, and log source attribution.",
        requiredActions: [
          "Auto-enrich company size and tech stack profile",
          "Send personalized intro email from territory manager",
          "Schedule discovery call within 24 hours",
        ],
        assignedRole: "Sales Dev Rep (SDR)",
        communicationChannel: "Email",
        expectedDurationDays: 2,
        entryCriteria: "Inbound form or demo request submitted",
        completionCriteria: "Prospect responded or scheduled discovery on calendar",
        successMetric: "Response rate > 40%",
        color: "bg-sky-50 text-sky-700 border-sky-200",
      },
      {
        id: "stg_2_discovery",
        name: "2. Needs Discovery",
        order: 2,
        purpose: "Diagnose core business bottlenecks, budget authorization, and decision timeline.",
        requiredActions: [
          "Complete BANT/MEDDIC qualification checklist",
          "Map internal stakeholders (Champion, Economic Buyer, Security)",
          "Formulate customized value proposition",
        ],
        assignedRole: "Account Executive (AE)",
        communicationChannel: "Call",
        expectedDurationDays: 4,
        entryCriteria: "Discovery call booked",
        completionCriteria: "Budget confirmed, primary pain point identified",
        successMetric: "Qualification rate > 60%",
        color: "bg-amber-50 text-amber-700 border-amber-200",
      },
      {
        id: "stg_3_solution",
        name: "3. Solution Architecture Demo",
        order: 3,
        purpose: "Demonstrate concrete solution ROI tailored to the prospect's exact workflow.",
        requiredActions: [
          "Deliver live interactive product demonstration",
          "Walk through integration with their current tech stack",
          "Share customer case study with verifiable metrics",
        ],
        assignedRole: "Solutions Architect",
        communicationChannel: "Meeting",
        expectedDurationDays: 5,
        entryCriteria: "Lead qualified from discovery",
        completionCriteria: "Key decision makers attended demo and confirmed technical fit",
        successMetric: "Demo satisfaction > 90%",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
      {
        id: "stg_4_proposal",
        name: "4. Proposal & Commercials",
        order: 4,
        purpose: "Deliver tailored commercial proposal, pricing tier, and pilot scope.",
        requiredActions: [
          "Generate custom pricing quotation with multi-tier ROI model",
          "Send legal master service agreement (MSA) & SLA draft",
          "Conduct pricing alignment follow-up call",
        ],
        assignedRole: "Account Executive (AE)",
        communicationChannel: "Email",
        expectedDurationDays: 7,
        entryCriteria: "Technical validation approved",
        completionCriteria: "Commercial terms approved by buyer champion",
        successMetric: "Proposal conversion > 35%",
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      {
        id: "stg_5_closing",
        name: "5. Closed & Onboarding",
        order: 5,
        purpose: "Countersign contracts, receive payment confirmation, and transition to Customer Success.",
        requiredActions: [
          "Procure e-signatures on MSA & Order Form",
          "Process initial payment / invoice generation",
          "Schedule kickoff meeting with Customer Success Manager",
        ],
        assignedRole: "Sales Director",
        communicationChannel: "Meeting",
        expectedDurationDays: 3,
        entryCriteria: "Proposal agreed upon",
        completionCriteria: "Contract fully executed and first payment verified",
        successMetric: "100% on-time onboarding kickoff",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
    ];
  }

  const generatedFunnel: SalesFunnel = {
    id: `fnl_${Date.now()}`,
    name: input.funnelName || "AI Generated Sales Funnel",
    objective: input.salesObjective,
    productService: input.productService,
    targetAudience: input.targetAudience,
    targetConversionGoal: input.targetConversionGoal || 25,
    expectedDuration: input.expectedDuration || "30 Days",
    preferredChannels: input.preferredChannels || ["Email", "Call"],
    customInstructions: input.customInstructions,
    stages,
    status: "draft",
    enquiriesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return generatedFunnel;
}

export function generateSuggestedMessage(
  enquiry: Enquiry,
  stage: FunnelStage,
  channel: "email" | "sms" | "whatsapp" | "call_script" = "email"
): SimulatedMessage {
  const firstName = enquiry.fullName.split(" ")[0];
  const company = enquiry.company || "your team";

  let subject = "";
  let content = "";

  if (channel === "email") {
    if (stage.order === 1) {
      subject = `Connecting regarding your enquiry with sleek.AI — ${enquiry.fullName}`;
      content = `Hi ${firstName},

Thank you for reaching out regarding our solutions for ${company}.

I would love to understand your current priority goals this quarter and ensure we provide the exact technical specs and pricing relevant to your team.

Do you have 10 minutes this Wednesday or Thursday for a brief introductory call? Alternatively, you can pick a time that works best directly on my calendar: https://cal.sleek.ai/advisor

Best regards,
${enquiry.assignedRepName}
Senior Sales Advisor | sleek.AI`;
    } else if (stage.order === 2) {
      subject = `Follow-up: Action plan & discovery insights for ${company}`;
      content = `Hi ${firstName},

Great speaking earlier. Based on what we discussed, our solution can help ${company} streamline operations, improve response speed by up to 40%, and eliminate pipeline leakage.

As promised, I have attached a tailored breakdown. Looking forward to reviewing this on our upcoming walkthrough session.

Warmly,
${enquiry.assignedRepName}`;
    } else if (stage.order >= 3 && stage.order < 5) {
      subject = `Commercial Proposal & Implementation Roadmap — ${company}`;
      content = `Hi ${firstName},

Following our recent solution demo, I am pleased to share the tailored commercial proposal for ${company}.

Key highlights included:
• Dedicated onboarding specialist & automated pipeline migration
• Tier-1 priority SLA and security compliance package
• Custom training for up to 25 team members

Please review the document at your convenience. I am available today if you or your finance team have any questions.

Best regards,
${enquiry.assignedRepName}`;
    } else {
      subject = `Welcome to sleek.AI! Next steps for onboarding`;
      content = `Dear ${firstName},

Congratulations! We are thrilled to partner with ${company}.

Your agreement has been countersigned and our Customer Success team has been notified. Your dedicated onboarding lead will reach out shortly to schedule your technical kickoff.

Welcome aboard!
${enquiry.assignedRepName}`;
    }
  } else if (channel === "whatsapp" || channel === "sms") {
    if (stage.order === 1) {
      content = `Hi ${firstName}, this is ${enquiry.assignedRepName} from sleek.AI. Thank you for your inquiry! I’ve put together some tailored information for ${company}. Would you be free for a quick 5-min chat today or tomorrow?`;
    } else if (stage.order === 2) {
      content = `Hi ${firstName}, just sent over the discovery summary to your email (${enquiry.email}). Let me know if you’d like any adjustments before our demo! - ${enquiry.assignedRepName}`;
    } else {
      content = `Hi ${firstName}, your proposal for ${company} is ready for review. Please check your inbox or reply here if you'd like to jump on a quick call to finalize details. - ${enquiry.assignedRepName}`;
    }
  } else {
    // call_script
    content = `[CALL SCRIPT FOR: ${enquiry.fullName} (${company})]
1. Opening: "Hello ${firstName}, this is ${enquiry.assignedRepName} from sleek.AI. I'm following up on your recent request regarding our sales pipeline platform."
2. Hook: "I noticed you're based in ${enquiry.city}. Many leaders in your sector mention pipeline bottlenecks and lead drop-offs as their primary friction."
3. Open Question: "What is the biggest operational hurdle you are looking to solve in your sales workflow this quarter?"
4. Transition: "That's exactly what our AI funnel model optimizes. Let's schedule a 20-minute tailored walkthrough with your technical lead."`;
  }

  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    channel,
    subject: channel === "email" ? subject : undefined,
    content,
    aiGenerated: true,
    status: "draft",
  };
}

export function generateLeadRecommendation(enquiry: Enquiry): {
  action: string;
  reason: string;
  urgency: "urgent" | "moderate" | "routine";
} {
  if (enquiry.daysInStage >= 5 && enquiry.status !== "Converted" && enquiry.status !== "Lost") {
    return {
      action: "Initiate multi-channel re-engagement (WhatsApp + Call)",
      reason: `Lead has been idle in "${enquiry.currentStageName}" for ${enquiry.daysInStage} days, exceeding the 3-day target velocity.`,
      urgency: "urgent",
    };
  }

  if (enquiry.leadScore >= 80) {
    return {
      action: "Fast-track executive demo & commercial offer",
      reason: `High lead score (${enquiry.leadScore}/100) and enterprise profile indicate high conversion propensity.`,
      urgency: "urgent",
    };
  }

  if (enquiry.status === "New") {
    return {
      action: "Complete first contact outreach within 30 minutes",
      reason: "Speed-to-lead under 1 hour yields 7x higher qualification rates.",
      urgency: "urgent",
    };
  }

  return {
    action: `Execute next action checklist for stage: ${enquiry.currentStageName}`,
    reason: "Consistent step completion maintains healthy pipeline momentum.",
    urgency: "routine",
  };
}

export function generateDashboardInsights(enquiries: Enquiry[]): {
  id: string;
  type: "warning" | "opportunity" | "action";
  title: string;
  description: string;
  metric?: string;
  actionText: string;
  filterStage?: string;
}[] {
  const stalledCount = enquiries.filter(
    (e) => e.daysInStage >= 4 && e.status !== "Converted" && e.status !== "Lost"
  ).length;

  const hotCount = enquiries.filter(
    (e) => e.leadScore >= 75 && e.status !== "Converted" && e.status !== "Lost"
  ).length;

  const newCount = enquiries.filter((e) => e.status === "New").length;

  return [
    {
      id: "ins_1",
      type: "opportunity",
      title: `${hotCount} High-Intent Enquiries Ready for Closing`,
      description: "Leads with scores over 75 are showing strong velocity. Recommend pushing for decision meetings.",
      metric: `${hotCount} Leads`,
      actionText: "View Priority Leads",
    },
    {
      id: "ins_2",
      type: "warning",
      title: `${stalledCount} Enquiries Experiencing Stage Friction`,
      description: "Several leads have exceeded typical stage duration. AI suggests sending automated re-engagement nudges.",
      metric: `${stalledCount} Stalled`,
      actionText: "Review Stalled Leads",
    },
    {
      id: "ins_3",
      type: "action",
      title: `${newCount} Unassigned / Pending New Enquiries`,
      description: "Enquiries received in the last 24h needing immediate qualification and funnel enrollment.",
      metric: `${newCount} Pending`,
      actionText: "Assign to Funnel",
    },
  ];
}
