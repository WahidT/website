/* S7 regulatory timeline - the AU/JP/NZ in-mandate register. 33 enforceable in force + 4 scheduled to 2030 + 9 frameworks.
   SOURCED 2026-07-20/21 to primary legislation (research agent), from:
     internal regulatory source pass,JP,NZ}_2026-07-20.md + Frameworks_and_Guidelines_2026-07-21.md.
    Names shortened for display; full titles + primary-source URLs in the source files.
   NOTE: BIOSECURE / FDA AI-device (6→331) / ICH Q13 / CMS waiver are US-global "why-now" evidence
   (internal canon/§3), NOT part of this register - kept separate to preserve the 14/11/8 arithmetic.
   yr places the row on the axis; yr<2020 = the standing base. Forecast rows (status "expected") are
   real phased/expected milestones flagged by the sourcing pass, shown dashed in 2027+. */
var REG_INSTRUMENTS = [
  // ---- standing base (pre-2020) ----
  {c:"JP",name:"JAS Act (agricultural standards)",body:"MAFF",date:"1950",yr:1950,type:"enforceable",status:"effective",src:"https://laws.e-gov.go.jp/law/325AC0000000175",src_title:"JAS Act (Japanese Agricultural Standards, 175/1950)"},
  {c:"JP",name:"PMD Act (pharma & devices)",body:"PMDA / MHLW",date:"1961",yr:1961,type:"enforceable",status:"effective"},
  {c:"NZ",name:"Medicines Act 1981",body:"Medsafe",date:"1981",yr:1981,type:"enforceable",status:"effective",src:"https://www.legislation.govt.nz/act/public/1981/118/en/latest/",src_title:"Medicines Act 1981"},
  {c:"AU",name:"Privacy Act 1988",body:"OAIC",date:"1989",yr:1989,type:"enforceable",status:"effective",src:"https://www.legislation.gov.au/C2004A03712/latest",src_title:"Privacy Act 1988 (amended 2024)"},
  {c:"AU",name:"Therapeutic Goods Act 1989",body:"TGA",date:"1991",yr:1991,type:"enforceable",status:"effective",src:"https://www.legislation.gov.au/C2004A03952/latest",src_title:"Therapeutic Goods Act 1989 (Cth)"},
  {c:"AU",name:"Food Standards ANZ Act 1991",body:"FSANZ",date:"1991",yr:1991,type:"enforceable",status:"effective"},
  {c:"AU",name:"Agvet Chemicals Code Act 1994",body:"APVMA",date:"1995",yr:1995,type:"enforceable",status:"effective"},
  {c:"NZ",name:"Hazardous Substances & New Organisms Act 1996",body:"EPA",date:"1996",yr:1996,type:"enforceable",status:"effective",src:"https://www.legislation.govt.nz/act/public/1996/30/en/latest/",src_title:"Hazardous Substances & New Organisms Act 1996"},
  {c:"NZ",name:"Animal Products Act 1999",body:"MPI",date:"1999",yr:1999,type:"enforceable",status:"effective",src:"https://www.legislation.govt.nz/act/public/1999/93/en/latest/",src_title:"Animal Products Act 1999"},
  {c:"AU",name:"Gene Technology Act 2000",body:"OGTR",date:"2001",yr:2001,type:"enforceable",status:"effective",src:"https://www.legislation.gov.au/C2004A00762/latest",src_title:"Gene Technology Act 2000"},
  {c:"NZ",name:"Agricultural Compounds & Vet Medicines Act 1997",body:"MPI",date:"2001",yr:2001,type:"enforceable",status:"effective",src:"https://www.legislation.govt.nz/act/public/1997/87/en/latest/",src_title:"Agricultural Compounds & Vet Medicines Act 1997"},
  {c:"NZ",name:"WAND scheme (Medical Devices Regs 2003)",body:"Medsafe",date:"2003",yr:2003,type:"enforceable",status:"effective",src:"https://www.medsafe.govt.nz/regulatory/wand.asp",src_title:"Medicines (Database of Medical Devices) Regs 2003 · WAND"},
  {c:"JP",name:"Cartagena Act (GMO / biodiversity)",body:"MAFF / METI / MEXT",date:"2004",yr:2004,type:"enforceable",status:"effective",src:"https://laws.e-gov.go.jp/law/415AC0000000097",src_title:"Cartagena Act (GMO / biodiversity, 97/2003)"},
  {c:"NZ",name:"NZ ETS (Climate Change Response Act, Pt 4)",body:"EPA",date:"2008",yr:2008,type:"enforceable",status:"effective",src:"https://www.legislation.govt.nz/act/public/2002/0040/latest/DLM1662481.html",src_title:"Climate Change Response Act 2002, Pt 4 · NZ ETS"},
  {c:"JP",name:"FIT / FIP renewable-electricity Act",body:"METI",date:"2012",yr:2012,type:"enforceable",status:"effective",src:"https://laws.e-gov.go.jp/law/423AC0000000108",src_title:"FIT / FIP Renewable Electricity Act (108/2011)"},
  {c:"JP",name:"Food Labelling Act",body:"Consumer Affairs Agency",date:"2015",yr:2015,type:"enforceable",status:"effective",src:"https://laws.e-gov.go.jp/law/425AC0000000070",src_title:"Food Labelling Act (70/2013)"},
  {c:"NZ",name:"Food Act 2014",body:"MPI",date:"2016",yr:2016,type:"enforceable",status:"effective",src:"https://www.legislation.govt.nz/act/public/2014/32/en/latest/",src_title:"Food Act 2014"},
  {c:"AU",name:"TG priority + provisional approval pathways",body:"TGA",date:"2018",yr:2018,type:"enforceable",status:"effective"},
  {c:"AU",name:"AI Ethics Principles",body:"DISR",date:"2019",yr:2019,type:"framework",status:"effective",src:"https://www.industry.gov.au/publications/australias-ai-ethics-principles",src_title:"Australia's AI Ethics Principles"},
  {c:"AU",name:"National Electricity Rules",body:"AEMC / AEMO",date:"standing",yr:2019,type:"enforceable",status:"effective",src:"https://www.aemc.gov.au/regulation/energy-rules/national-electricity-rules",src_title:"National Electricity Rules"},
  // ---- the net-new tick (2020+) ----
  {c:"JP",name:"PMD Act IDATEN + conditional early approval",body:"PMDA",date:"Sep 2020",yr:2020,type:"enforceable",status:"effective",src:"https://www.pmda.go.jp/review-services/drug-reviews/about-reviews/devices/0039.html",src_title:"PMD Act 2019 amendment · IDATEN / conditional early approval"},
  {c:"JP",name:"Food Sanitation Act, mandatory HACCP",body:"MHLW",date:"Jun 2020",yr:2020,type:"enforceable",status:"effective"},
  {c:"NZ",name:"Privacy Act 2020",body:"OPC",date:"Dec 2020",yr:2020,type:"enforceable",status:"effective",src:"https://www.legislation.govt.nz/act/public/2020/0031/latest/LMS23223.html",src_title:"Privacy Act 2020"},
  {c:"JP",name:"DASH for SaMD",body:"MHLW",date:"2020",yr:2020,type:"framework",status:"effective",src:"https://www.pmda.go.jp/english/review-services/reviews/0009.html",src_title:"DASH for SaMD / SaMD 2"},
  {c:"NZ",name:"Algorithm Charter for Aotearoa",body:"Stats NZ",date:"Jul 2020",yr:2020,type:"framework",status:"effective",src:"https://data.govt.nz/toolkit/data-ethics/government-algorithm-transparency-and-accountability/algorithm-charter",src_title:"Algorithm Charter for Aotearoa NZ"},
  {c:"AU",name:"FIRB national-security investment screening",body:"Treasury / FIRB",date:"2021",yr:2021,type:"enforceable",status:"effective"},
  {c:"AU",name:"Software-as-a-medical-device regulation",body:"TGA",date:"Feb 2021",yr:2021,type:"enforceable",status:"effective"},
  {c:"JP",name:"APPI 2020 amendment (personal information)",body:"PPC",date:"Apr 2022",yr:2022,type:"enforceable",status:"effective"},
  {c:"JP",name:"Economic Security Promotion Act (critical minerals)",body:"Cabinet Office / METI",date:"Aug 2022",yr:2022,type:"enforceable",status:"effective"},
  {c:"JP",name:"METI AI Governance Guidelines",body:"METI",date:"Jan 2022",yr:2022,type:"framework",status:"effective",src:"https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20220128_1.pdf",src_title:"METI AI Governance Guidelines v1.1"},
  {c:"JP",name:"GX Promotion Act",body:"METI",date:"Jun 2023",yr:2023,type:"enforceable",status:"effective"},
  {c:"AU",name:"Safeguard Mechanism (Crediting) Amendment Act 2023",body:"Clean Energy Regulator",date:"Jul 2023",yr:2023,type:"enforceable",status:"effective",src:"https://www.legislation.gov.au/C2023A00014",src_title:"Safeguard Mechanism (Crediting) Amendment Act 2023"},
  {c:"AU",name:"Food Standards Code 3.2.2A, food-safety tools",body:"FSANZ",date:"Dec 2023",yr:2023,type:"enforceable",status:"effective",src:"https://www.foodstandards.gov.au/business/food-safety/overview-food-safety-management-tools",src_title:"Food Standards Code 3.2.2A"},
  {c:"JP",name:"METI Critical Minerals Strategy",body:"METI",date:"Jan 2023",yr:2023,type:"framework",status:"effective",src:"https://www.meti.go.jp/policy/economy/economic_security/metal/torikumihoshin.pdf",src_title:"METI Critical Minerals Strategy"},
  {c:"JP",name:"PMDA AI/ML Medical Device Guidance",body:"PMDA",date:"2023",yr:2023,type:"framework",status:"effective",src:"https://www.pmda.go.jp/files/000266100.pdf",src_title:"PMDA AI/ML Medical Device Evaluation Guidance"},
  {c:"AU",name:"Critical Minerals Strategy 2023-2030",body:"DISR",date:"Jun 2023",yr:2023,type:"framework",status:"effective",src:"https://www.industry.gov.au/publications/critical-minerals-strategy-2023-2030",src_title:"Critical Minerals Strategy 2023-2030"},
  {c:"NZ",name:"Critical Minerals List & Strategy",body:"MBIE / NZP&M",date:"Sep 2024",yr:2024,type:"framework",status:"effective",src:"https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/minerals-and-petroleum/critical-minerals-list",src_title:"Critical Minerals List & Strategy"},
  {c:"AU",name:"Voluntary AI Safety Standard (no obligation)",body:"DISR / NAIC",date:"Sep 2024",yr:2024,type:"framework",status:"effective",src:"https://www.industry.gov.au/publications/voluntary-ai-safety-standard",src_title:"Voluntary AI Safety Standard"},
  {c:"AU",name:"Critical Minerals Production Tax Incentive (CMPTI)",body:"Treasury / ATO",date:"Feb 2025",yr:2025,type:"enforceable",status:"transitional"},
  {c:"AU",name:"AusUDID unique device identification",body:"TGA",date:"Mar 2025",yr:2025,type:"enforceable",status:"effective",src:"https://www.tga.gov.au/products/medical-devices/labelling-and-advertising/unique-device-identification-udi-hub",src_title:"AusUDID unique device identification"},
  {c:"JP",name:"AI Promotion Act",body:"Cabinet Office (AI Strategy HQ)",date:"Sep 2025",yr:2025,type:"enforceable",status:"effective"},
  {c:"AU",name:"Medical-device adverse-event reporting (ASDER)",body:"TGA",date:"Mar 2026",yr:2026,type:"enforceable",status:"effective",src:"https://www.tga.gov.au/resources/guidance/reporting-medical-device-adverse-events-healthcare-facilities",src_title:"Medical-device adverse-event reporting (ASDER)"},
  // ---- global instruments + recognition pathways re-pricing / multiplying reach across exit markets
  //      (internal canon/§3 net-new + line 62 reliance pathways; CONTEXT, NOT part of the AU/JP/NZ 33) ----
  {c:"AMER",name:"CMS hospital-at-home reimbursement waiver",body:"CMS",date:"2020",yr:2020,type:"enforceable",status:"effective",global:true},
  {c:"AMER",name:"IRA Section 45X (domestic-content)",body:"US Treasury / IRS",date:"2022",yr:2022,type:"enforceable",status:"effective",global:true},
  {c:"AMER",name:"FDA AI-device authorisations (6 → 331)",body:"FDA",date:"2015→2025",yr:2025,type:"enforceable",status:"effective",global:true},
  {c:"AMER",name:"BIOSECURE Act",body:"US Congress",date:"Dec 2025",yr:2025,type:"enforceable",status:"enacted",global:true},
  {c:"CA",name:"Access Consortium reliance (Health Canada)",body:"Access Consortium",date:"2020",yr:2020,type:"framework",status:"effective",global:true},
  {c:"UKI",name:"UK MHRA reliance (Access Consortium)",body:"MHRA",date:"2020",yr:2020,type:"framework",status:"effective",global:true},
  {c:"GCC",name:"GCC centralized registration procedure",body:"GCC-DR",date:"standing",yr:2019,type:"enforceable",status:"effective",global:true},
  {c:"EU",name:"EU AI Act (high-risk class)",body:"European Commission",date:"2024",yr:2024,type:"enforceable",status:"effective",global:true},
  {c:"EU",name:"EU Critical Raw Materials Act",body:"European Commission",date:"2024",yr:2024,type:"enforceable",status:"effective",global:true},
  {c:"GL",name:"ICH Q13 continuous manufacturing",body:"ICH",date:"2023",yr:2023,type:"enforceable",status:"effective",global:true},
  {c:"GL",name:"WHO Listed Authority tiers",body:"WHO",date:"2022",yr:2022,type:"framework",status:"effective",global:true},
  {c:"GL",name:"PIC/S GMP mutual reliance",body:"PIC/S",date:"standing",yr:2019,type:"framework",status:"effective",global:true},
  // ---- forecast (real phased / expected milestones) ----
  {c:"AU",name:"CMPTI 10% offset claimable",body:"ATO",date:"Jul 2027",yr:2027,type:"enforceable",status:"expected"},
  {c:"AU",name:"ASDER Stage 2 (medium-risk devices)",body:"TGA",date:"Apr 2028",yr:2028,type:"enforceable",status:"expected"},
  {c:"NZ",name:"Medical Products regime (TP Act replacement)",body:"Medsafe",date:"~2030",yr:2030,type:"enforceable",status:"expected"},
  {c:"AU",name:"AusUDID full labelling milestone",body:"TGA",date:"2030",yr:2030,type:"enforceable",status:"expected"}
];
/* IN FORCE, the one definition. In-market (not global), enforceable, and either effective or
   transitional. Written once here because the page's lead sentence and the figure guard each
   carried their own copy, and the guard's copy counted "status !== expected", which agrees today
   only because no other status exists; the next status added to this register would split them. */
var REG_IN_FORCE = function (r) { return !r.global && r.type === "enforceable" && (r.status === "effective" || r.status === "transitional"); };
if (typeof window !== "undefined") { window.REG_INSTRUMENTS = REG_INSTRUMENTS; window.REG_IN_FORCE = REG_IN_FORCE; }
