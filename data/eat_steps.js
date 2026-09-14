// eat_steps.js - Eat vertical: seed-to-mouth dual-chain (plant + animal) data
// Transcribed verbatim from GP-authored source. TRANSCRIPTION, not authoring.
//
// AMBIGUITY FLAGS:
// - Step id "10" in the numbered steps is "Nutrient recovery"; the chart's
//   `shared` array labels position 10 as "10 MOUTH". The source chart note and
//   the recovery line both describe nutrient recovery closing the loop opened at
//   step 01. Chart `shared` and `recovery` are captured separately per schema, so
//   the numbered step 10 = Nutrient recovery is kept as authored; "10 MOUTH" is
//   retained only inside chart.shared as the source's terminal-position label.
// - AI `action` verbs are inferred from source AI text per the accelerates/opens/
//   erodes lexicon: 01 "opens" (opens a new cost structure); 04 "accelerates"
//   (accelerates a thin-margin process). Where the source gives no such verb, the
//   field is set to "" rather than fabricated.
// - AI `tense` (deployed/emerging/promised) is read from explicit source words
//   ("deployed", "emerging"). Where a step mixes both (e.g. 01 emerging + already
//   deployed), tense="mixed". Steps stating only "Deployed" -> "deployed".

var EAT_STEPS = {
  definition: "Eat is the food and agricultural system underwritten from seed to mouth, spanning both crop and livestock production interlinked into one cycle. The plant chain captures the solar flux in biomass; the animal chain converts a share of that biomass, plus pasture and forage, into higher-value protein, dairy, and eggs; and nutrients cycle back to the soil through residue and manure. It is a necessity because demand is daily, non-deferrable, and rising on fixed arable land and finite water, and shortfalls surface as price shocks and instability. Its binding constraints are fixed nitrogen on the plant side and feed-conversion efficiency on the animal side, both of which are energy costs in disguise.",

  chart: {
    base: "BIOLOGICAL-INPUT BASE (plant germplasm · animal genetics · root-zone nitrogen · soil & rumen microbiome)",
    plantChain: [
      "01 Genetics / inputs",
      "02 Land / water prep",
      "03 Establishment",
      "04 Production",
      "05 Protection",
      "06 Harvest"
    ],
    animalChain: [
      "A1 breeding",
      "A2 feed & health",
      "A3 husbandry / aquaculture",
      "A4 biosecurity",
      "A5 slaughter/milking"
    ],
    shared: [
      "07 processing",
      "08 storage",
      "09 distribution",
      "10 MOUTH"
    ],
    recovery: "NUTRIENT RECOVERY (crop residue + manure/effluent) back to the soil",
    note: "Feed flows plant to animal; manure flows animal to plant. The two chains converge at processing and diverge again only at the field. Field autonomy already pays in the middle of both. The frontier sits in the biological-input base."
  },

  interlink: "The plant and animal chains are not two industries; they are one loop. A large share of crop output leaves as feed, so the price of protein is downstream of the price of grain, which is downstream of the price of nitrogen, which is downstream of the price of gas. Manure closes the loop the other way, returning nitrogen and phosphorus to the soil and offsetting synthetic input. That is why Eat is underwritten as a single system from seed to mouth: break either chain and the other loses its feed or its fertility.",

  steps: [
    {
      id: "01",
      name: "Genetics / inputs",
      def: "Plant germplasm sets the yield ceiling; animal genetics sets feed conversion, fertility, and disease resistance. Inputs split into crop nutrients (nitrogen the binding cost, fixed via energy-intensive Haber-Bosch) and animal inputs (feed, which is mostly crop output, plus veterinary and mineral supplements).",
      ai: {
        layers: ["design"],
        action: "opens",
        tense: "mixed",
        detail: "On the plant side, DNA and protein language models (transformers), graph networks, and diffusion aim to fix nitrogen at the root (emerging, opens a new cost structure). On the animal side, genomic selection is already deployed and structural: statistical-genomic models rank breeding animals from DNA, and have transformed dairy-cattle and aquaculture breeding."
      },
      reg: "GMO and gene-edit approval (EU restrictive, US and Latin America permissive), Cartagena Protocol, plant variety rights (UPOV), animal-breeding and cloning rules, feed-ingredient registration."
    },
    {
      id: "02",
      name: "Land / water prep",
      def: "Cropland conditioning, pasture and rangeland management, and aquaculture water systems.",
      ai: {
        layers: ["perception"],
        action: "",
        tense: "deployed",
        detail: "Satellite and multispectral imagery (CNN) for cropland and pasture state, soil-microbiome graphs (GNN), moisture and water-quality time-series for ponds and tanks. Deployed."
      },
      reg: "Water abstraction rights, land-use and grazing rules, EU Nitrates Directive, aquaculture siting and effluent permits."
    },
    {
      id: "03",
      name: "Establishment",
      def: "Planting the crop; stocking the breeding herd, flock, or aquaculture pen.",
      ai: {
        layers: ["control"],
        action: "",
        tense: "deployed",
        detail: "Autonomous planters (RL, vision, spatial) on the plant side; individual-animal identification and stocking analytics (computer vision, RFID time-series) on the animal side. Deployed."
      },
/* Two clauses were cut on 2026-09-14, on two different tests, and the field now carries
   both. This renders on the page under "Regulation · the gate", so an entry has to be a
   gate, meaning a right-to-operate obligation a company must clear before that stage runs,
   AND it has to be permitted on an hmm surface.

   The traceability clause failed the second test: traceability is banned on every surface
   (GP 2026-07-26) with no positional qualifier. The emissions and effluent limits
   elsewhere in these files are a different class and stay, being operating standards and a
   price instrument, and the rule on them is that they never LEAD the regulation clock,
   which they do not.

   "Autonomous-machinery safety" failed the first. It names a subject rather than an
   obligation, which the two clauses beside it do not, and a commissioned scan of the
   estate and of primary sources found no enforceable in-force instrument in Australia or
   New Zealand gating an autonomous agricultural machine before it may be sold or operated:
   2026-09-14_field_autonomy_instrument_scan.md in the research library. The counted
   register agrees, holding eleven Eat instruments in force and none of them on a machine.
   The two left are obligations a grower meets or does not plant. */
      reg: "Seed-treatment restrictions (EU neonicotinoid ban), stocking-density welfare limits."
    },
    {
      id: "04",
      name: "Production",
      def: "The crop growing season, and livestock husbandry and aquaculture grow-out, where feed converts to body mass, milk, or eggs at a measurable conversion ratio.",
      ai: {
        layers: ["perception"],
        action: "accelerates",
        tense: "mixed",
        detail: "Crop canopy and NDVI health (CNN), growth digital twins (world models, emerging). Precision livestock farming is deployed: computer vision and sensor time-series track individual animal weight, gait, feeding, and early illness; aquaculture vision estimates biomass and detects sea lice, driving automated feeding. This accelerates a thin-margin process by lifting feed efficiency and catching disease early."
      },
      reg: "Nitrogen application limits and nitrous-oxide emissions (plant); animal welfare standards, methane and effluent rules, stocking density (animal)."
    },
    {
      id: "05",
      name: "Protection",
      def: "Defending the crop from weeds, pests, and disease; protecting the herd through veterinary care and biosecurity.",
      ai: {
        layers: ["perception", "design"],
        action: "mixed",
        tense: "mixed",
        detail: "See-and-spray identifies a weed at tractor speed and fires a single nozzle (CNN, deployed, cuts chemical use sharply). On the animal side, vision and time-series drive disease surveillance and outbreak early-warning; molecule design (diffusion, GNN) supports both agrochemicals and veterinary compounds (emerging)."
      },
      reg: "Pesticide registration and Codex maximum residue limits (plant); veterinary-drug approval, antibiotic and growth-promoter restrictions driven by antimicrobial resistance, zoonotic-disease control under WOAH (animal)."
    },
    {
      id: "06",
      name: "Harvest",
      def: "Crop harvest at peak maturity; slaughter, milking, egg collection, and aquaculture harvest.",
      ai: {
        layers: ["control"],
        action: "",
        tense: "deployed",
        detail: "Autonomous harvesters and robotic picking (RL, agents, ripeness vision) on the plant side; robotic milking and vision-guided processing lines on the animal side. Deployed."
      },
      reg: "Machinery and road safety, seasonal-labour law; humane-slaughter rules, meat and milk inspection, ante- and post-mortem checks."
    },
    {
      id: "07",
      name: "Processing",
      def: "Milling, pressing, and fermentation on the plant side; meat cutting, dairy processing, and rendering on the animal side. Both turn perishable output into stable, tradable food.",
      ai: {
        layers: ["perception", "control"],
        action: "",
        tense: "deployed",
        detail: "Foreign-body and defect inspection (CNN), process control (RL), fermentation and thermal surrogates, line scheduling (LLM agents). Deployed."
      },
      reg: "HACCP food safety, facility licensing, additives approval, labelling; Codex Alimentarius, US FSMA, EU food law, dedicated meat- and dairy-hygiene regimes."
    },
    {
      id: "08",
      name: "Storage",
      def: "Drying and controlled atmosphere for grain; cold chain for meat, dairy, and fish, where the perishability constraint is far tighter.",
      ai: {
        layers: ["perception", "control"],
        action: "",
        tense: "deployed",
        detail: "Spoilage and atmosphere models (time-series, state-space), quality grading (CNN), controlled-atmosphere and cold-chain control (RL). Deployed."
      },
      reg: "Cold-chain standards, aflatoxin and mycotoxin limits (plant), pathogen controls for animal products (Listeria, Salmonella), fumigation and phytosanitary rules."
    },
    {
      id: "09",
      name: "Distribution",
      def: "Moving perishable mass across distance, with the animal chain carrying a heavier cold-chain and shelf-life burden.",
      ai: {
        layers: ["control", "orchestration"],
        action: "",
        tense: "deployed",
        detail: "Route and logistics optimisation (agents, LLM), supply-network graphs (GNN), demand and spoilage forecasting (time-series). Deployed."
      },
      reg: "WTO SPS Agreement, IPPC phytosanitary certificates, veterinary health certificates, live-animal export rules, customs and cold-chain."
    },
    {
      id: "10",
      name: "Nutrient recovery",
      def: "Returning crop residue and animal manure and effluent to the soil, closing the mass balance opened at step 01. Manure is the physical link that makes the two chains one system.",
      ai: {
        layers: ["perception", "design"],
        action: "",
        tense: "emerging",
        detail: "Waste sorting (CNN), anaerobic-digestion and nutrient chemistry (GNN), manure and effluent process time-series. Emerging."
      },
      reg: "Manure and effluent handling, biosolids land-application, nutrient-runoff caps, methane capture from digesters."
    }
  ]
};

if (typeof window !== 'undefined') window.EAT_STEPS = EAT_STEPS;
