/* HARMONIC - Architecture Interactive Diagram
   ============================================ */

const componentInfo = {
  'long-horizon-planning': {
    title: 'Long-Horizon Planning',
    description: 'Involves high-level strategic planning for complex, long-term goals and multi-step tasks. Supports informed decision-making over extended time horizons by maintaining awareness of the environment and agent state. Breaks down large objectives into manageable sub-tasks and sequences that lower-level systems can execute. Adapts plans in response to unexpected events, ensuring resilience and flexibility.',
    color: '#1e3a8a'
  },
  'metacognition': {
    title: 'Metacognition',
    description: 'Supports self-monitoring and regulation of cognitive processes, allowing the system to reflect on its own thinking and decisions. Involves awareness of capabilities, limitations, and internal state for improved decision-making and resource use. Extends to understanding other agents\' states, intentions, and roles, enabling effective collaboration in multi-agent systems.',
    color: '#1e3a8a'
  },
  'explainability': {
    title: 'Explainability',
    description: 'Provides transparency into decision-making, enabling human understanding and trust. Supports inspection of logical steps with audit trails for debugging. Offers natural language explanations, allowing users to query and understand system behavior.',
    color: '#1e3a8a'
  },
  'system2-layer': {
    title: 'System 2: Strategic (Cognitive) Layer',
    description: 'The strategic layer adapts the mature cognitive architecture OntoAgent for high-level reasoning, leveraging explicit, structured knowledge representations that can be inspected, verified, and incrementally expanded. This layer employs both utility-based and analogical reasoning, maintaining an ontological world model capable of supporting metacognition, episodic memory, and a situation model containing representations of current task context.',
    color: '#000000'
  },
  'ontoagent-framework': {
    title: 'OntoAgent Framework',
    description: 'Built over a service-based ecosystem, OntoAgent includes processing modules for perception interpretation (separate module for each perception modality), attention management, goal and plan selection, and plan execution. Its knowledge substrate includes an ontological world model capable of supporting metacognition, knowledge support for interpretation of perception, an episodic memory of past events, and a situation model that contains representations of entities and events that are part of the current task context.',
    color: '#1e40af'
  },
  'perception-interpretation': {
    title: 'Perception Interpretation',
    description: 'The strategic layer interprets preprocessed multimodal perception data within the context of its situation model and active goals, generating normalized ontologically grounded text (TMR) and vision (VMR) meaning representations that formally specify the semantics of perceptual input. The TMRs and VMRs are added to OntoAgent\'s situation model, which provides data and heuristics for downstream functioning.',
    color: '#1e40af'
  },
  'attention-service-s2': {
    title: 'Attention Service (Strategic)',
    description: 'Focuses cognitive resources on relevant information for strategic decision-making. Manages information filtering and prioritization at the cognitive level.',
    color: '#1e40af'
  },
  'strategic-reasoning': {
    title: 'Strategic Reasoning & Decision-Making',
    description: 'Generates high-level plans and makes decisions based on long-term goals and knowledge. Handles complex reasoning about goals, constraints, and trade-offs.',
    color: '#1e40af'
  },
  'rendering-services': {
    title: 'Rendering Services',
    description: 'When plan execution reaches a step that corresponds to an atomic action, a command is issued for the tactical layer to execute it. The strategic layer generates normalized ontologically grounded text (TMR) and vision (VMR) meaning representations that formally specify the semantics of perceptual input.',
    color: '#1e40af'
  },
  'perception-apis': {
    title: 'Perception Data Communication APIs',
    description: 'The tactical layer provides the strategic layer with preprocessed multimodal (speech, vision, etc.) perception data and relays robot state information, employing a suite of perception models within the perception services.',
    color: '#000000'
  },
  'action-apis': {
    title: 'Action Data Communication APIs',
    description: 'The strategic and tactical layers are connected through a bidirectional interface that enables efficient inter-layer communication and data transfer. High-level action commands sent by the OntoAgent through the Interface APIs are unpacked and used to update corresponding variables in the blackboard.',
    color: '#000000'
  },
  'system1-layer': {
    title: 'System 1: Tactical (Control) Layer',
    description: 'The tactical layer handles robotic control and execution, grounding cognitive capabilities in physical embodiment. It manages robot action planning, reflexive attention, and execution of motor actions in response to high-level commands from the strategic layer.',
    color: '#000000',
    video: {
      src: 'assets/video/tactical-animation.mp4',
      caption: 'Data-flow and control schematic illustrating the interactions between the behavior trees (BTs) in the tactical layer and the OntoAgent component in the strategic layer.'
    }
  },
  'perception-services': {
    title: 'Perception Services (Tactical)',
    description: 'Handles raw sensory input and provides real-time environmental awareness. Processes sensor data for immediate action and safety monitoring. Across the two systems, we use three different robots: a UGV and a Drone in simulation environments, and a tabletop serial manipulator.',
    color: '#065f46'
  },
  'attention-service-s1': {
    title: 'Attention Service (Tactical)',
    description: 'Directs sensory focus and processing for immediate task relevance. Manages real-time attention allocation for reactive behaviors. The tactical planners use a blackboard to keep track of condition and state variables, allowing for efficient querying and updating of the system\'s state during operation.',
    color: '#065f46'
  },
  'tactical-reasoning': {
    title: 'Tactical Reasoning & Decision-Making',
    description: 'In the action translation pipeline of the tactical layer, specialized robotic planners, controllers, algorithms, and action sequence models are employed as part of the Reasoning and Decision Making modules and Effector Services to translate abstract action commands from OntoAgent into precise, executable robot control operations.',
    color: '#065f46'
  },
  'behavior-trees': {
    title: 'Behavior Trees',
    description: 'Implemented with Behavior Trees (BTs), the tactical layer both executes coordinated task sequences and reacts dynamically to the environment. The hierarchical BT structure supports real-time collision avoidance and adaptive behavior through task prioritization that can override or adjust plans as needed.',
    color: '#065f46',
    image: {
      src: 'assets/images/behavior-trees.png',
      caption: 'Robots and Behavior Trees structure showing UGV, drone, 6-DoF robot, and BT design templates.'
    }
  },
  'effector-services': {
    title: 'Effector Services',
    description: 'Translates tactical commands into physical actions for motors and actuators. Handles low-level control and safety constraints for physical execution. The integration infrastructure is developed in ROS2 for both robots and simulators, with simulation environments created in Unity.',
    color: '#065f46'
  },
  'perception-inputs': {
    title: 'Perception Inputs',
    description: 'Various sensory data streams feeding into the system. Provides the raw information needed for environmental understanding and decision-making.',
    color: '#000000'
  },
  'action-outputs': {
    title: 'Action Outputs',
    description: 'Physical and communicative outputs generated by the system. Represents the system\'s ability to interact with and affect the environment.',
    color: '#000000'
  },
  'perception-mapping': {
    title: 'Perception and Interpretation',
    description: 'Low-level processing for environmental sensing and map creation. Handles SLAM, object detection, and spatial understanding.',
    color: '#166534'
  },
  'reactive-planning': {
    title: 'Reactive Planning (Safety and Needs)',
    description: 'Immediate, instinctual responses to ensure safety and fulfill basic needs. Provides emergency responses and basic survival behaviors.',
    color: '#166534'
  },
  'short-horizon-plans': {
    title: 'Short Horizon Plans',
    description: 'Tactical plans for immediate future actions, often derived from strategic goals. Bridges the gap between high-level planning and immediate execution.',
    color: '#166534'
  },
  'actuation-policies': {
    title: 'Actuation and Motor Control Policies',
    description: 'Specific rules and algorithms for controlling physical outputs. Implements safety constraints and control policies for physical actions.',
    color: '#166534'
  }
};

HARMONIC.ready(() => {
  initArchitecture();
});

function initArchitecture() {
  const hotspots = HARMONIC.$$('.hotspot');
  const infoPanel = HARMONIC.$('#info-panel-content');
  if (!hotspots.length || !infoPanel) return;

  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', function() {
      hotspots.forEach(h => h.classList.remove('active'));
      this.classList.add('active');
      const component = this.dataset.component;
      const info = componentInfo[component];
      if (info) {
        let content = `<div class="info-panel-content"><h3 style="color:${info.color};">${info.title}</h3><p>${info.description}</p>`;
        if (info.video) {
          content += `<video controls autoplay muted loop playsinline onclick="openVideoModal('${info.video.src}','${info.video.caption}')"><source src="${info.video.src}" type="video/mp4"></video><p class="info-panel-caption">${info.video.caption}<br><em>Click to enlarge</em></p>`;
        }
        if (info.image) {
          content += `<img src="${info.image.src}" alt="${info.image.caption}" onclick="openImageModal('${info.image.src}','${info.image.caption}')"><p class="info-panel-caption">${info.image.caption}<br><em>Click to enlarge</em></p>`;
        }
        content += '</div>';
        infoPanel.innerHTML = content;
      }
    });
  });
}

window.initArchitecture = initArchitecture;
window.componentInfo = componentInfo;
