// heal_steps.js - verbatim transcription of GP-authored HEAL content.
// TRANSCRIPTION ONLY: no paraphrase, no invention. Every named entity, statistic,
// regulation, and AI term preserved exactly as authored.
//
// CLOCK EDIT: the instructed replacement of "where the technology clock ticks" ->
// "where AI lands hardest" did NOT match any text in the source. The source phrase
// as supplied already reads "where AI lands hardest" (chart note; readoutLabel).
// No wording was changed. Nothing else edited.
//
// FLAGGED AMBIGUITY - the ai.action / ai.tense enums do not cleanly fit every step;
// the verbatim wording is preserved in ai.detail regardless. Judgement calls:
//   01: tense "Emerging-to-real" spans emerging->deployed -> mapped tense:"mixed".
//   03: no accelerate/open/erode verb stated -> action:"" ; "Emerging on design,
//       deployed on control" -> tense:"mixed".
//   05: no accelerate/open/erode verb stated -> action:"" ; "deployed and advancing"
//       vs RL "research-stage" -> tense:"mixed".
//   06: no accelerate/open/erode verb stated -> action:"" ; "Deployed to emerging" -> tense:"mixed".
//   07: no accelerate/open/erode verb stated -> action:"" ; "Emerging" -> tense:"emerging".
//   08: no accelerate/open/erode verb stated -> action:"" ; "Deployed to emerging" -> tense:"mixed".
//       Source names the layer "Perception and feedback"; "feedback" is not one of the
//       four named layers (perception|design|control|orchestration), so layers:["perception"]
//       and the "feedback" term is retained verbatim in ai.detail.

var HEAL_STEPS = {
  definition: "Heal is the healthcare system underwritten from preventative care through to death: detecting biological disorder, intervening to reverse or slow it, and managing the arc to its end. It is a necessity because demand is universal, lifelong, and rising with age structure, rationed by capacity rather than want, and failure is counted in mortality. Its binding constraint is not thermodynamic but a regulatory and reimbursement throttle, and value migrates upstream to detection, where the cost of a returned life-year is lowest.",
  chartNote: "The chain of care is the necessity. The read-out at step 02 is where value concentrates and where AI lands hardest.",
  readoutLabel: "the read-out, where AI lands hardest",
  throughLine: "Read the three together and one lesson repeats. AI's gain concentrates wherever the binding constraint is perception, design or control, and in each system that is one specific layer: critical minerals in Power, biological inputs and field autonomy in Food, the diagnostic read-out in Health. That same layer is where regulation binds hardest, because export control, GMO and machinery law, and device approval all sit exactly there. AI wears down barriers everywhere it touches, so the layer it makes valuable is also the layer a competitor can copy fastest, and the regulated gate is what stops that copying from commoditising the winner. The necessity sets the chain, AI decides which layer of it compounds, and regulation decides who keeps the compounding.",
  steps: [
    {
      id: "01",
      name: "Biological discovery",
      def: "Identifying the molecular mechanism: target, pathway, biomarker. The design layer of the system.",
      ai: {
        layers: ["design"],
        action: "opens",
        tense: "mixed",
        detail: "Protein-structure prediction and de novo protein and molecule design, built on attention architectures, graph networks, and diffusion. Emerging-to-real; it opens previously undruggable targets."
      },
      reg: "Research ethics, laboratory biosafety, dual-use and gain-of-function oversight, patent and IP, data-sharing rules."
    },
    {
      id: "02",
      name: "Diagnostics",
      def: "Measuring disorder in a specific patient: imaging, pathology, molecular and biomarker assays. This decides where in the disease arc it is caught, and so its cost to treat.",
      ai: {
        layers: ["perception"],
        action: "mixed",
        tense: "deployed",
        detail: "Imaging and pathology are ideal for CNNs and vision transformers; self-supervised foundation models pretrain on vast unlabelled scans; federated learning trains across hospitals without moving patient data. Deployed and expanding. It accelerates the read, opens detection too early or subtle for the eye, and erodes the specialist's informational monopoly. Value migrates to whoever owns the read-out."
      },
      reg: "Software-as-a-medical-device approval (FDA 510(k), De Novo, PMA; EU IVDR for diagnostics), clinical validation, algorithmic-bias rules, patient-data privacy (HIPAA, GDPR). This is the hard gate, and because the clinical validation behind an approval is earned against a specific device and cannot be transferred, it is also the barrier."
    },
    {
      id: "03",
      name: "Product manufacture",
      def: "Producing the drug, biologic, or device to specification. Biologics are made in living systems, so process control governs cost and supply.",
      ai: {
        layers: ["design", "control"],
        action: "",
        tense: "mixed",
        detail: "Molecule and formulation design (GNN, diffusion), bioprocess surrogates and bioreactor control (RL, time-series), visual QC (CNN). Emerging on design, deployed on control."
      },
      reg: "Good Manufacturing Practice, batch release, biologics licensing, facility inspection; ICH standards, biologics cold-chain."
    },
    {
      id: "04",
      name: "Clinical infrastructure",
      def: "The delivery system: clinicians, records, scheduling, capacity. The binding resource is trained human time.",
      ai: {
        layers: ["orchestration"],
        action: "accelerates",
        tense: "deployed",
        detail: "Large language models for clinical documentation, coding, and scheduling, relaxing the administrative load that is the system's labour constraint; federated multi-site learning; capacity time-series. Deployed and accelerating."
      },
      reg: "EHR interoperability (HL7/FHIR), clinical governance, reimbursement and coding, medical liability, data privacy."
    },
    {
      id: "05",
      name: "Intervention",
      def: "Administering the therapy or performing the procedure: the moment the system acts on the body.",
      ai: {
        layers: ["control"],
        action: "",
        tense: "mixed",
        detail: "Closed-loop dosing (for example the artificial pancreas) runs today on classical control theory, model-predictive control and PID; reinforcement learning here is research-stage. Surgical vision and guidance (CNN) and robotic planning (agents) are deployed and advancing."
      },
      reg: "Drug-device combination approval, surgical-robot clearance, dosing-autonomy limits, device liability."
    },
    {
      id: "06",
      name: "Monitoring",
      def: "Continuous measurement after intervention: wearables, remote physiological signals.",
      ai: {
        layers: ["perception"],
        action: "",
        tense: "mixed",
        detail: "State-space and time-series models for continuous vitals, self-supervised foundation models on physiological signals, federated and on-device training for privacy, and world-model representations of video and signal (the natural home of JEPA). Deployed to emerging."
      },
      reg: "Continuous-monitoring device classification (wellness versus medical), remote-monitoring reimbursement, data privacy, telehealth rules."
    },
    {
      id: "07",
      name: "Rehabilitation",
      def: "Restoring function: prosthetics, exoskeletons, adaptive therapy.",
      ai: {
        layers: ["control", "perception"],
        action: "",
        tense: "emerging",
        detail: "Prosthetic and exoskeleton control (RL), gait and motion vision (CNN, spatial), EMG time-series, world-model motion representation (JEPA). Emerging."
      },
      reg: "Assistive-device approval, brain-computer and neural-interface oversight (neurorights emerging, e.g. Chile), reimbursement."
    },
    {
      id: "08",
      name: "Waste / recovery",
      def: "Handling biohazard, sharps, and pharmaceutical waste, and feeding real-world outcome data back to discovery and detection.",
      ai: {
        layers: ["perception"],
        action: "",
        tense: "mixed",
        detail: "Medical-waste sorting robotics (CNN); real-world evidence pipelines that turn each treated patient into signal that sharpens the next detection cycle. Deployed to emerging."
      },
      reg: "Biohazard and sharps handling, pharmaceutical disposal, incineration emissions, Basel Convention, antimicrobial effluent controls."
    }
  ]
};

if (typeof window !== 'undefined') window.HEAL_STEPS = HEAL_STEPS;
