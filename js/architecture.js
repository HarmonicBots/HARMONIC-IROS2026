/* HARMONIC IROS 2026 - Architecture Tab Switcher + Hotspots
   ==================================================================== */

/* ---- LLM Strategic Layer components ---- */
const llmComponents = {
  'generalization': {
    title: 'Generalization',
    description: 'LLMs exhibit broad generalization capabilities including zero-shot task handling, few-shot adaptation, cross-domain generalization, and in-context learning. These abilities allow the LLMAgent to handle novel situations without task-specific training, adapting to new domains through prompt engineering alone.'
  },
  'in-context-reasoning': {
    title: 'In-Context Reasoning',
    description: 'LLMs perform reasoning within their context window using chain-of-thought prompting and pattern matching. While this enables flexible problem-solving, the paper shows that in-context reasoning alone cannot replicate the structured metacognitive monitoring that OntoAgent achieves through explicit architectural mechanisms.'
  },
  'tool-use': {
    title: 'Tool Use',
    description: 'The LLMAgent can invoke external tools through action calling and knowledge retrieval (RAG). In the Knowledge-Enhanced condition, the LLM must actively invoke FETCHPLAN to access task narratives, mirroring OntoAgent\'s goal-triggered script retrieval.'
  },
  'llm-system2-layer': {
    title: 'System 2: Strategic Layer (LLM)',
    description: 'When an LLM replaces OntoAgent at the strategic layer, it operates through the LLMAgent module — a drop-in replacement that processes the same perception data frames and produces the same parameterized action commands, enabling controlled comparison between cognitive architecture and neural approaches.'
  },
  'llmagent-framework': {
    title: 'LLMAgent Framework',
    description: 'The LLMAgent module comprises a context manager, a system prompt builder, the LLM provider, and an action parser that translates model outputs into the standardized parameterized command format. Six LLMs were individually evaluated as drop-in replacements for OntoAgent.'
  },
  'context-manager': {
    title: 'Context Manager',
    description: 'Manages the conversation context and perception history fed to the LLM. Receives streamed perception data at 2 Hz from the tactical layer and organizes it into a structured context window for the LLM provider to process.'
  },
  'system-prompt-builder': {
    title: 'System Prompt Builder',
    description: 'Constructs the system prompt that frames the LLM\'s role as the strategic reasoning layer. In the Knowledge-Enhanced (KE) condition, the prompt builder includes access to task narratives specifying required preconditions, diagnostic strategy, and expected action sequences.'
  },
  'llm-provider': {
    title: 'LLM Provider',
    description: 'The core LLM inference endpoint. Six models spanning frontier and efficient tiers were evaluated: Claude Opus 4.6 &amp; Haiku 4.5 (Anthropic), GPT-5.2 &amp; GPT-5 Mini (OpenAI), and Gemini 3 Pro &amp; Gemini 3 Flash (Google). Each processes the assembled context and system prompt to generate action decisions.'
  },
  'action-parser': {
    title: 'Action Parser & Despatcher',
    description: 'Translates LLM text outputs into the standardized parameterized command format expected by the tactical layer.'
  }
};

/* ---- OntoAgent Strategic Layer components ---- */
const strategicComponents = {
  'long-horizon-planning': {
    title: 'Long-Horizon Planning',
    description: 'Involves high-level strategic planning for complex, long-term goals and multi-step tasks. Supports informed decision-making over extended time horizons by maintaining awareness of the environment and agent state. Breaks down large objectives into manageable sub-tasks and sequences that lower-level systems can execute. Adapts plans in response to unexpected events, ensuring resilience and flexibility.'
  },
  'metacognition': {
    title: 'Metacognition',
    description: 'Supports self-monitoring and regulation of cognitive processes, allowing the system to reflect on its own thinking and decisions. Involves awareness of capabilities, limitations, and internal state for improved decision-making and resource use. Extends to understanding other agents\' states, intentions, and roles, enabling effective collaboration in multi-agent systems.'
  },
  'explainability': {
    title: 'Explainability',
    description: 'Provides transparency into decision-making, enabling human understanding and trust. Supports inspection of logical steps with audit trails for debugging. Offers natural language explanations, allowing users to query and understand system behavior.'
  },
  'system2-layer': {
    title: 'System 2: Strategic (Cognitive) Layer',
    description: 'The strategic layer adapts the mature cognitive architecture OntoAgent for high-level reasoning, leveraging explicit, structured knowledge representations that can be inspected, verified, and incrementally expanded. This layer employs both utility-based and analogical reasoning, maintaining an ontological world model capable of supporting metacognition, episodic memory, and a situation model containing representations of current task context.'
  },
  'ontoagent-framework': {
    title: 'OntoAgent Framework',
    description: 'Built over a service-based ecosystem, OntoAgent includes processing modules for perception interpretation (separate module for each perception modality), attention management, goal and plan selection, and plan execution. Its knowledge substrate includes an ontological world model capable of supporting metacognition, knowledge support for interpretation of perception, an episodic memory of past events, and a situation model that contains representations of entities and events that are part of the current task context.'
  },
  'perception-interpretation': {
    title: 'Perception Interpretation',
    description: 'The strategic layer interprets preprocessed multimodal perception data within the context of its situation model and active goals, generating normalized ontologically grounded text (TMR) and vision (VMR) meaning representations that formally specify the semantics of perceptual input. The TMRs and VMRs are added to OntoAgent\'s situation model, which provides data and heuristics for downstream functioning.'
  },
  'attention-service-s2': {
    title: 'Attention Service (Strategic)',
    description: 'Focuses cognitive resources on relevant information for strategic decision-making. Manages information filtering and prioritization at the cognitive level.'
  },
  'strategic-reasoning': {
    title: 'Strategic Reasoning & Decision-Making',
    description: 'Generates high-level plans and makes decisions based on long-term goals and knowledge. Handles complex reasoning about goals, constraints, and trade-offs.'
  },
  'rendering-services': {
    title: 'Rendering Services',
    description: 'When plan execution reaches a step that corresponds to an atomic action, a command is issued for the tactical layer to execute it. The strategic layer generates normalized ontologically grounded text (TMR) and vision (VMR) meaning representations that formally specify the semantics of perceptual input.'
  }
};

const tacticalComponents = {
  'translation-layer': {
    title: 'Translation Layer',
    description: 'Mediates all inter-layer communication, encoding data frames for the strategic layer and decoding high-level commands into execution flags, control parameters, and skill configurations on the blackboard. Any reasoning system that processes timed data frames and produces parameterized action commands can serve as the strategic layer while the tactical infrastructure remains invariant.'
  },
  'perception-interfaces': {
    title: 'Perception Interfaces',
    description: 'The tactical layer provides the strategic layer with preprocessed multimodal perception data (speech, vision, etc.) and relays robot state information through standardized data frames streamed at 2 Hz.'
  },
  'action-interfaces': {
    title: 'Action Interfaces',
    description: 'High-level action commands sent by the strategic layer are unpacked and used to update corresponding variables in the blackboard. The interface translates parameterized commands into execution flags and skill configurations.'
  },
  'perception-services': {
    title: 'Perception Services',
    description: 'Handles raw sensory input and provides real-time environmental awareness. Processes sensor data from exteroceptive and interoceptive sensors for immediate action and safety monitoring.'
  },
  'attention-service': {
    title: 'Attention Service',
    description: 'Directs sensory focus and processing for immediate task relevance. Manages real-time attention allocation for reactive behaviors. The tactical planners use a shared blackboard to track condition and state variables.'
  },
  'tactical-reasoning': {
    title: 'Tactical Reasoning & Decision-Making',
    description: 'Specialized robotic planners, controllers, algorithms, and action sequence models translate abstract action commands from the strategic layer into precise, executable robot control operations.'
  },
  'effector-services': {
    title: 'Effector Services',
    description: 'Translates tactical commands into physical actions for motors and actuators. Handles low-level control and safety constraints for physical execution. The integration infrastructure is developed in ROS 2 for both robots and simulators.'
  },
  'behavior-trees': {
    title: 'Behavior Trees',
    description: 'The tactical layer is implemented with Behavior Trees (BTs) that both execute coordinated task sequences and react dynamically to the environment. The hierarchical BT structure supports real-time collision avoidance and adaptive behavior through task prioritization.',
    image: {
      src: 'assets/images/architecture/Robots-BTs.png',
      caption: 'Robots and Behavior Trees structure'
    }
  },
  'perception-mapping': {
    title: 'Perception & Mapping',
    description: 'Low-level processing for environmental sensing and map creation. Handles SLAM, object detection, and spatial understanding for navigation and object localization.'
  },
  'reactive-planning': {
    title: 'Reactive Planning (Safety & Needs)',
    description: 'Immediate, instinctual responses to ensure safety and fulfill basic operational needs. Provides emergency responses and safety-critical reactive behaviors that can override strategic commands.'
  },
  'short-horizon-plans': {
    title: 'Short / Medium Horizon Plans',
    description: 'Tactical plans for immediate future actions, derived from strategic goals. Bridges the gap between high-level planning and immediate motor execution.'
  },
  'actuation-policies': {
    title: 'Actuation & Motor Control Policies',
    description: 'Specific rules and algorithms for controlling physical outputs. Implements safety constraints and control policies for motors, actuators, and audio output.'
  }
};

/* Merged lookup */
const allComponents = Object.assign({}, llmComponents, strategicComponents, tacticalComponents);

HARMONIC.ready(() => {
  initArchitectureTabs();
  initArchHotspots();
});

function initArchitectureTabs() {
  const btns = HARMONIC.$$('.arch-tab-btn');
  const ontoPanel = HARMONIC.$('#arch-strategic-ontoagent');
  const llmPanel  = HARMONIC.$('#arch-strategic-llm');
  if (!btns.length || !ontoPanel || !llmPanel) return;

  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      btns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const mode = this.dataset.arch;
      if (mode === 'ontoagent') {
        ontoPanel.removeAttribute('data-hidden');
        llmPanel.setAttribute('data-hidden', '');
      } else {
        ontoPanel.setAttribute('data-hidden', '');
        llmPanel.removeAttribute('data-hidden');
      }
    });
  });
}

function initArchHotspots() {
  const hotspots = HARMONIC.$$('.arch-diagram-stack .hotspot');
  const infoPanel = HARMONIC.$('#arch-info-panel');
  if (!hotspots.length || !infoPanel) return;

  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', function() {
      hotspots.forEach(h => h.classList.remove('active'));
      this.classList.add('active');

      const key = this.dataset.component;
      const info = allComponents[key];
      if (!info) return;

      let html = `<h4>${info.title}</h4><p>${info.description}</p>`;
      if (info.image) {
        html += `<img src="${info.image.src}" alt="${info.image.caption}" style="width:100%; border-radius:6px; margin-top:0.5rem; cursor:pointer;" onclick="openImageModal('${info.image.src}','${info.image.caption}')" />`;
        html += `<p style="text-align:center; font-size:0.75rem; color:#888; font-style:italic; margin-top:0.25rem;">${info.image.caption}</p>`;
      }
      infoPanel.innerHTML = html;
    });
  });
}

window.initArchitectureTabs = initArchitectureTabs;
window.initArchHotspots = initArchHotspots;
