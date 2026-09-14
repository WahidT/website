// TRANSCRIPTION of GP-authored POWER content. Verbatim; no paraphrase/invention.
// AMBIGUITY FLAGS:
//   - ai.action: steps 03, 04, 07, 08, 10 use NO accelerates/opens/erodes verb in the
//     source, so action is left "" for those (not fabricated). Steps with an explicit
//     verb: 01 accelerates, 02 accelerates ("accelerating"), 05 accelerates
//     ("Accelerates operations"), 06 opens ("opens rather than accelerates"),
//     09 accelerates ("accelerating").
//   - ai.tense "mixed" used where the source names both deployed and emerging
//     (03, 04, 05, 06, 08). Single-tense: 01/02 deployed, 07 emerging, 09 deployed, 10 emerging.

var POWER_STEPS = {
  definition: "Power is the energy system underwritten end to end: the physical chain that converts a raw natural resource into dispatchable work delivered to where the economy uses it, then recovers the durable material. It is a necessity because nothing in the economy runs without it, demand is price-inelastic and structurally rising, and failure is counted in blackouts and shuttered industry. Its binding constraints are storage and the critical minerals that feed every device.",
  chainNote: "The chain is the necessity. The materials layer beneath stages 02–06, closed by recovery at 10, is where the return concentrates.",
  returnLayer: "critical-minerals layer",
  steps: [
    {
      id: "01",
      name: "Resource discovery",
      def: "Locating a concentrated energy or mineral gradient: ore body, hydrocarbon reservoir, or renewable flux.",
      ai: {
        layers: ["perception"],
        action: "accelerates",
        tense: "deployed",
        detail: "Self-supervised pretraining on unlabelled seismic and hyperspectral data, read by CNNs and vision transformers, with graph networks for geological structure. Deployed, and it accelerates: fewer dry holes, faster to a bankable reserve."
      },
      reg: "Exploration permit, mineral title, environmental impact assessment, indigenous consent; UNCLOS for offshore."
    },
    {
      id: "02",
      name: "Extraction",
      def: "Removing raw feedstock. Unit economics set by ore grade and energy per tonne moved.",
      ai: {
        layers: ["control"],
        action: "accelerates",
        tense: "deployed",
        detail: "Autonomous haulage and drilling (reinforcement learning), vision-based ore sorting (CNN), predictive maintenance on equipment telemetry (time-series, state-space). Deployed, accelerating."
      },
      reg: "Extraction licence; critical-mineral export controls (China on gallium, germanium, graphite, rare-earth separation tech); EU Critical Raw Materials Act, US IRA sourcing rules; tailings and mine safety."
    },
    {
      id: "03",
      name: "Refining / conversion",
      def: "Upgrading raw feed to functional material or fuel. A separation problem, energy-intensive, globally concentrated. The true chokepoint in critical minerals.",
      ai: {
        layers: ["design", "control"],
        action: "",
        tense: "mixed",
        detail: "Simulation surrogates for process chemistry, graph networks and diffusion for catalysts, reinforcement learning for process optimisation. Emerging on the design side, deployed on process control."
      },
      reg: "Processing permit, industrial emissions, effluent standards."
    },
    {
      id: "04",
      name: "Component manufacture",
      def: "Refined material becomes cells, turbines, transformers, conductors. Cost set by yield and learning-curve scaling.",
      ai: {
        layers: ["perception", "design"],
        action: "",
        tense: "mixed",
        detail: "Visual defect inspection (CNN, deployed); generative design of cell and device topology (diffusion, GNN, emerging); FEA/CFD surrogates."
      },
      reg: "IEC product standards, certification; anti-dumping tariffs, local-content rules, forced-labour import bans."
    },
    {
      id: "05",
      name: "Generation",
      def: "Primary energy conversion into electricity or heat. Return set by capacity factor and cost of capital over a multi-decade asset.",
      ai: {
        layers: ["perception", "control"],
        action: "accelerates",
        tense: "mixed",
        detail: "Output forecasting for wind and solar (time-series, state-space, deployed); plant digital twins and dispatch optimisation (world models, RL, emerging in production). Accelerates operations."
      },
      reg: "Generation licence, grid code, nuclear licensing (IAEA safeguards), power-purchase agreements, carbon pricing."
    },
    {
      id: "06",
      name: "Storage",
      def: "Decoupling generation time from use time. The system's missing piece: no medium is cheap, dense, and long-duration at once, so generation over-builds and curtails.",
      ai: {
        layers: ["design", "control"],
        action: "opens",
        tense: "mixed",
        detail: "Generative discovery of battery and electrolyte materials (diffusion, GNN, emerging, high-prize); state-of-charge and health estimation (time-series, state-space, deployed); arbitrage dispatch (RL). This is where AI opens rather than accelerates."
      },
      reg: "Battery safety certification, UN38.3 transport rules, EU Battery Regulation and digital passport, recycled-content mandates."
    },
    {
      id: "07",
      name: "Transmission",
      def: "High-voltage transport over distance. Voltage is stepped up because resistive loss scales with the square of current. Regulated monopoly; the interconnection queue gates all upstream generation.",
      ai: {
        layers: ["control"],
        action: "",
        tense: "emerging",
        detail: "The grid is a graph, so graph networks for power flow and state-space models for stability are the natural fit; production grids still run classical optimisation, GNN control in pilots (emerging)."
      },
      reg: "Regulated monopoly, interconnection queue, reliability standards (NERC in North America, ENTSO-E network codes in Europe), cross-border interconnection treaties."
    },
    {
      id: "08",
      name: "Distribution",
      def: "Stepping voltage down to the meter. The stressed edge of the network as electrification lifts peak load.",
      ai: {
        layers: ["perception", "control"],
        action: "",
        tense: "mixed",
        detail: "Asset-inspection imagery (CNN, deployed); distributed-energy forecasting and voltage control (GNN, RL, emerging); DER orchestration (agents)."
      },
      reg: "Distribution-operator rate-setting, metering standards, DER interconnection rules, consumption-data privacy."
    },
    {
      id: "09",
      name: "End use",
      def: "The electron does work: industry, transport, heat, compute. Demand inelastic and rising.",
      ai: {
        layers: ["control", "orchestration"],
        action: "accelerates",
        tense: "deployed",
        detail: "Demand-response and load optimisation (RL, MPC for the control loop; LLM agents for orchestration only); consumption forecasting (time-series). Deployed and accelerating."
      },
      reg: "Efficiency standards, building codes, appliance labelling, demand-response market rules, data-centre energy caps."
    },
    {
      id: "10",
      name: "Recovery",
      def: "Reclaiming metals and battery material from decommissioned assets, closing the loop to stage 02. As primary grades fall, recovered material becomes competitive secondary supply.",
      ai: {
        layers: ["perception", "control"],
        action: "",
        tense: "emerging",
        detail: "Robotic sorting (CNN vision) and disassembly (RL); recovery-chemistry design (GNN). Emerging."
      },
      reg: "Waste classification, extended producer responsibility, Basel Convention on transboundary hazardous waste, recycled-content mandates."
    }
  ]
};

if (typeof window !== 'undefined') window.POWER_STEPS = POWER_STEPS;
