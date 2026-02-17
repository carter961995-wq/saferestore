export const blogPosts = [
  {
    slug: "forensic-hash-verification-basics",
    title: "Forensic Hash Verification Basics: MD5, SHA256, and Why They Matter",
    description:
      "A practical guide to forensic hash verification and post-acquisition checks for legal and investigative workflows.",
    date: "2026-02-17",
    category: "Forensic Workflow",
    excerpt:
      "Learn how MD5 and SHA256 are used to confirm evidence integrity after acquisition and export.",
    sections: [
      {
        heading: "Why hashes are used in forensic recovery",
        paragraphs: [
          "A hash is a digital fingerprint for a file or image. In forensic workflows, hashes help show whether evidence changed during processing.",
          "Hash records are created at acquisition and checked again during verification or transfer steps.",
        ],
      },
      {
        heading: "MD5 and SHA256 in practice",
        paragraphs: [
          "MD5 remains common in legacy workflows and cross-tool compatibility checks.",
          "SHA256 provides stronger collision resistance and is widely required in modern policies.",
          "Using both values can support interoperability and higher-assurance verification reporting.",
        ],
      },
      {
        heading: "Post-acquisition verification",
        paragraphs: [
          "After imaging, the completed evidence file is hashed again.",
          "The post-acquisition hash is compared to the hash recorded at capture. A match supports consistency of the stored image.",
        ],
      },
    ],
  },
  {
    slug: "chain-of-custody-checklist",
    title: "Chain of Custody Checklist for Small Forensic Teams",
    description:
      "A concise chain-of-custody checklist for investigators, legal teams, and incident response practitioners.",
    date: "2026-02-17",
    category: "Legal Readiness",
    excerpt:
      "Capture the minimum fields that make handoffs and evidence history easier to defend and review.",
    sections: [
      {
        heading: "Core fields to log",
        paragraphs: [
          "Each entry should include case ID, operator identity, timestamp, action performed, and device identifier.",
          "When possible, include acquisition format and hash values in the same record set.",
        ],
      },
      {
        heading: "Handoff events",
        paragraphs: [
          "Handoffs should log who transferred evidence, who received it, when it happened, and what files or media were involved.",
          "Any export or copy event should be recorded as a custody event with hash references.",
        ],
      },
      {
        heading: "Why this matters",
        paragraphs: [
          "Chain-of-custody quality often depends more on consistent operator procedure than tooling alone.",
          "Clear records reduce ambiguity during legal review, internal audit, and investigative handoff.",
        ],
      },
    ],
  },
  {
    slug: "recovery-vs-forensic-workflows",
    title: "Recovery vs Forensic Workflows: Choosing the Right Path",
    description:
      "How to choose between standard recovery and forensic workflows based on evidence sensitivity and reporting needs.",
    date: "2026-02-17",
    category: "Strategy",
    excerpt:
      "Understand when guided recovery is enough and when forensic-grade workflow controls are needed.",
    sections: [
      {
        heading: "Recovery workflow",
        paragraphs: [
          "Recovery workflows focus on restoring data quickly and safely for operational continuity.",
          "These paths usually prioritize speed, user guidance, and practical outcome tracking.",
        ],
      },
      {
        heading: "Forensic workflow",
        paragraphs: [
          "Forensic workflows prioritize integrity, reproducibility, and documentation for legal or investigative contexts.",
          "Typical controls include read-only acquisition strategy, E01 or RAW/DD imaging, hash verification, and custody logs.",
        ],
      },
      {
        heading: "Decision guide",
        paragraphs: [
          "If evidence handling or legal review is expected, forensic controls should be applied from intake onward.",
          "If the objective is standard restoration without evidentiary requirements, recovery workflows are often sufficient.",
        ],
      },
    ],
  },
];

export const blogPostMap = Object.fromEntries(blogPosts.map((post) => [post.slug, post]));
