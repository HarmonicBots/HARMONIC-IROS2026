/* HARMONIC IROS 2026 — Interactive Charts (Plotly.js)
   Pixel-matched to the Python/matplotlib paper figures.
   ==================================================== */

const MODELS  = ['Opus 4.6','Gem.3 Pro','GPT5.2','Haiku 4.5','Gem.3 Fl.','GPT5 Mini'];
const N = MODELS.length;
const ROW_H = 1.35, HALF = ROW_H/2, BAR_W = 0.27, OFFSET_GAP = 0.24;
function mY(i){ return (N-1-i)*ROW_H; }   // top model = highest y

/* Colours — exact hex from the Python script */
const C_BASE = '#6B3FA0';   // KI (Knowledge-Impoverished) purple
const C_KE   = '#4A5E6A';   // KE grey
const C_DN   = '#27ae60';   // hallucination ↓
const C_UP   = '#e74c3c';   // hallucination ↑
const C_NEUT = '#999999';

/* Per-model data read from CSV-generated figure */
const D = {
  prem:{ IK:[100,100,100,100,100,100], KE:[20,100,60,0,100,100] },
  feat:{ IK:[100,100,100,100,100,100], KE:[0,100,60,0,80,100] },
  loc: { IK:[100,100,100,100,100,100], KE:[20,100,60,0,100,100] },
  /* Study 2 — hypothesis counts (from fig_study24_combined) */
  logH:  { IK:[3.8,1.0,2.2,3.8,1.8,2.4], KE:[4.0,1.5,1.0,3.4,1.6,2.0] },
  domH:  { IK:[1.0,0,0,0.3,0,0],          KE:[0,2.6,4.6,5.2,2.6,7.0] },
  /* Study 2 — retrieval-reasoning gap (KE only, %) */
  fQ:[100,80,60,100,100,0], fF:[80,0,20,80,20,0],
  dQ:[100,80,100,100,80,60], dF:[0,80,100,100,60,60],
  /* Study 3 */
  srch:{ IK:[60,60,40,100,80,100], KE:[100,80,80,100,100,100] },
  wp:  { IK:[40,40,60,0,0,0],      KE:[0,0,0,0,0,0] },
  na:  { IK:[0,0,0,0,20,0],        KE:[0,20,20,0,0,0] },
  casc:{ lbl:['Behavioral Loop','Hallucinated Success','Stall / Frozen','Backtrack → Circling'],
         cnt:[7,4,3,1], col:['#3a7fc1','#4caf6e','#e07b39','#b44db8'] }
};
const REF={log:1.0,dom:2.0};

const CFG = { responsive:true, displayModeBar:false };
const FONT = { family:"'Geist','Helvetica Neue',Arial,sans-serif" };

/* Font size constants (bumped up) */
const FS = {
  base: 12,       // general font
  tick: 12,        // axis tick labels
  title: 13,       // axis titles
  barLbl: 11,      // bar-end percentage labels
  dumbLbl: 11,     // dumbbell percentage labels
  changeLbl: 11,   // ↓/↑ change annotations
  legend: 13,      // HTML legend bar
  lgPlotly: 10     // Plotly legend entries
};

/* Helpers shared across panels */
const yBot = mY(N-1)-HALF, yTop = mY(0)+HALF;
const divY = mY(2)-HALF+0.01;   // tier divider
const topY = mY(0)+HALF-0.01;   // top border

function rowShapes(ax){
  const sh=[];
  for(let i=0;i<N;i++){
    const my=mY(i), top=my+HALF-0.01, bot=my-HALF+0.01;
    sh.push({type:'rect',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:my,y1:top,
      fillcolor:'#eeeeee',line:{width:0},layer:'below'});
    sh.push({type:'rect',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:bot,y1:my,
      fillcolor:'#ffffff',line:{width:0},layer:'below'});
    if(i<N-1){
      const isDv=Math.abs(bot-divY)<0.15;
      sh.push({type:'line',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:bot,y1:bot,
        line:{color:'#111',width:isDv?1.0:0.7,dash:isDv?'solid':'dot'},layer:'above'});
    }
  }
  sh.push({type:'line',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:topY,y1:topY,
    line:{color:'#111',width:1.0},layer:'above'});
  return sh;
}

/* Bold axis title helper */
function boldTitle(text){ return {text:'<b>'+text+'</b>',font:{size:FS.title,family:FONT.family},standoff:8}; }

/* ============================================================
   SCROLL-TRIGGERED ANIMATION
   Uses IntersectionObserver to detect when charts scroll into
   view, then animates bar/scatter data from zero to real values.
   ============================================================ */
const ANIM_DUR = 900;
const ANIM_EASE = 'cubic-in-out';
const animatedSet = new Set();

function observeChart(containerId, animateFn){
  const el = document.getElementById(containerId);
  if(!el) return;
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !animatedSet.has(containerId)){
        animatedSet.add(containerId);
        animateFn();
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.15});
  obs.observe(el);
}

/* Zero-out helper: creates array of zeros matching length */
function zeros(n){ return new Array(n).fill(0); }


/* ============================================================
   FIGURE 4 — Premature Action Rate + Hallucination Dumbbell
   ============================================================ */
function renderFigure4(){
  const el=document.getElementById('chart-fig4');
  if(!el) return;

  /* Legend bar */
  el.innerHTML=`
  <div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:8px 0 4px;font:500 ${FS.legend}px/1 ${FONT.family};color:#444;flex-wrap:wrap;">
    <span style="display:inline-flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:22px;height:12px;background:repeating-linear-gradient(135deg,${C_BASE},${C_BASE} 2px,rgba(255,255,255,.45) 2px,rgba(255,255,255,.45) 4px);border-radius:2px;opacity:.85;"></span>KI</span>
    <span style="display:inline-flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:22px;height:12px;background:repeating-linear-gradient(0deg,${C_KE},${C_KE} 1.5px,rgba(255,255,255,.4) 1.5px,rgba(255,255,255,.4) 3.5px);border-radius:2px;opacity:.85;"></span>KE</span>
    <span style="display:inline-flex;align-items:center;gap:5px;">
      <span style="color:${C_BASE};font-size:14px;">◆</span> Features</span>
    <span style="display:inline-flex;align-items:center;gap:5px;">
      <span style="color:${C_BASE};font-size:14px;">■</span> Location</span>
    <span style="display:inline-flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:24px;height:0;border-top:2.5px solid ${C_DN};"></span>Hallucinations&nbsp;↓</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1.7fr;gap:0;position:relative;">
    <div id="fig4a"></div>
    <div id="fig4b"></div>
    <div id="fig4mid" style="position:absolute;left:37.04%;top:0;bottom:0;width:1px;background:#aaa;z-index:5;pointer-events:none;"></div>
  </div>`;

  /* ---------- Panel (a) — Premature Action Rate ---------- */
  const tr_a=[], sh_a=rowShapes(''), an_a=[];

  for(let i=0;i<N;i++){
    const my=mY(i);
    const bIK=D.prem.IK[i]/100, bKE=D.prem.KE[i]/100;

    /* IK bar — purple, diagonal hatch */
    tr_a.push({ type:'bar', orientation:'h',
      y:[my+BAR_W/2+0.01], x:[0], width:BAR_W,
      marker:{ color:C_BASE, opacity:0.80,
        pattern:{shape:'/',size:10,solidity:0.55,fgcolor:'rgba(255,255,255,0.55)',bgcolor:C_BASE}},
      showlegend:false,
      hovertemplate:MODELS[i]+' KI: '+(bIK*100)+'%<extra></extra>'
    });
    /* KE bar — grey, dot hatch */
    tr_a.push({ type:'bar', orientation:'h',
      y:[my-BAR_W/2-0.01], x:[0], width:BAR_W,
      marker:{ color:C_KE, opacity:0.80,
        pattern:{shape:'.',size:5,solidity:0.35,fgcolor:'rgba(255,255,255,0.45)',bgcolor:C_KE}},
      showlegend:false,
      hovertemplate:MODELS[i]+' KE: '+(bKE*100)+'%<extra></extra>'
    });
    /* Labels at bar end (hidden initially, shown after animation) */
    an_a.push({x:bIK+0.025,y:my+BAR_W/2+0.01,text:(bIK*100).toFixed(0)+'%',
      showarrow:false,font:{size:FS.barLbl,color:C_BASE,family:FONT.family},xanchor:'left',yanchor:'middle',opacity:0});
    an_a.push({x:bKE+0.025,y:my-BAR_W/2-0.01,text:(bKE*100).toFixed(0)+'%',
      showarrow:false,font:{size:FS.barLbl,color:C_KE,family:FONT.family},xanchor:'left',yanchor:'middle',opacity:0});
  }

  const layout4a = {
    font:{...FONT,size:FS.base},
    paper_bgcolor:'#fff', plot_bgcolor:'rgba(0,0,0,0)',
    margin:{l:90,r:40,t:8,b:52},
    xaxis:{range:[0,1.28],tickvals:[0,.5,1],ticktext:['0%','50%','100%'],
      title:boldTitle('Premature Action Rate'),
      gridcolor:'rgba(0,0,0,0.08)',gridwidth:0.4,zeroline:false,
      showline:true,linecolor:'#333',linewidth:0.6,mirror:false,
      ticklen:3,tickcolor:'#333',tickfont:{size:FS.tick}},
    yaxis:{tickvals:MODELS.map((_,i)=>mY(i)),ticktext:MODELS,
      range:[yBot,yTop],tickfont:{size:FS.tick,family:FONT.family,weight:'bold'},
      zeroline:false,showgrid:false,showline:false,ticklen:0,tickangle:-90},
    barmode:'overlay',bargap:0,showlegend:false,
    shapes:sh_a, annotations:an_a, height:480
  };

  Plotly.newPlot('fig4a',tr_a,layout4a,CFG);


  /* ---------- Panel (b) — Hallucination Dumbbell ---------- */
  const tr_b=[], sh_b=rowShapes('2'), an_b=[];

  for(let i=0;i<N;i++){
    const my=mY(i);
    const fields=[
      {ik:D.feat.IK[i],ke:D.feat.KE[i],sym:'diamond',above:true, tag:'Feat'},
      {ik:D.loc.IK[i], ke:D.loc.KE[i], sym:'square', above:false,tag:'Loc'}
    ];

    fields.forEach(f=>{
      const y = my + (f.above ? OFFSET_GAP : -OFFSET_GAP);
      const vIK=f.ik/100, vKE=f.ke/100;
      const diff=vKE-vIK;
      const lc = diff<-0.005 ? C_DN : (diff>0.005 ? C_UP : C_NEUT);

      /* connecting line (start collapsed at IK position) */
      tr_b.push({type:'scatter',mode:'lines',x:[vIK,vIK],y:[y,y],
        line:{color:lc,width:2.5},opacity:0.75,showlegend:false,hoverinfo:'skip',
        xaxis:'x2',yaxis:'y2'});

      /* arrow head (via annotation, hidden initially) */
      if(Math.abs(diff)>0.005){
        const pad=0.025*Math.sign(diff);
        an_b.push({ax:vIK+pad, ay:y, x:vKE-pad, y:y,
          xref:'x2',yref:'y2',axref:'x2',ayref:'y2',
          showarrow:true, arrowhead:2, arrowsize:1.1, arrowwidth:2, arrowcolor:lc,
          text:'', opacity:0});
      }

      /* IK dot (purple) — starts at 0 */
      tr_b.push({type:'scatter',mode:'markers',x:[0],y:[y],
        marker:{symbol:f.sym,size:10,color:C_BASE,line:{width:0.5,color:C_BASE}},
        showlegend:false,xaxis:'x2',yaxis:'y2',
        hovertemplate:MODELS[i]+' '+f.tag+' KI: '+(vIK*100)+'%<extra></extra>'});

      /* KE dot (grey) — starts at 0 */
      tr_b.push({type:'scatter',mode:'markers',x:[0],y:[y],
        marker:{symbol:f.sym,size:10,color:C_KE,line:{width:0.5,color:C_KE}},
        showlegend:false,xaxis:'x2',yaxis:'y2',
        hovertemplate:MODELS[i]+' '+f.tag+' KE: '+(vKE*100)+'%<extra></extra>'});

      /* percentage labels near dots (hidden initially) */
      const ldy= f.above ? 0.165 : -0.165;
      const anch= f.above ? 'bottom' : 'top';
      an_b.push({x:vIK,y:y+ldy, xref:'x2',yref:'y2',
        text:(vIK*100).toFixed(0)+'%',showarrow:false,
        font:{size:FS.dumbLbl,color:C_BASE,family:FONT.family},xanchor:'center',yanchor:anch,opacity:0});
      an_b.push({x:vKE,y:y+ldy, xref:'x2',yref:'y2',
        text:(vKE*100).toFixed(0)+'%',showarrow:false,
        font:{size:FS.dumbLbl,color:C_KE,family:FONT.family},xanchor:'center',yanchor:anch,opacity:0});

      /* change annotation (↓ or ↑ + magnitude, hidden initially) */
      if(Math.abs(diff)>0.005){
        const sym2= diff<0 ? '↓':'↑';
        const cdy= f.above ? 0.09 : -0.09;
        const canch= f.above ? 'bottom':'top';
        an_b.push({x:(vIK+vKE)/2, y:y+cdy, xref:'x2',yref:'y2',
          text:'<b>'+sym2+(Math.abs(diff)*100).toFixed(0)+'%</b>',
          showarrow:false,
          font:{size:FS.changeLbl,color:lc,family:FONT.family},xanchor:'center',yanchor:canch,opacity:0});
      }
    });
  }

  const layout4b = {
    font:{...FONT,size:FS.base},
    paper_bgcolor:'#fff', plot_bgcolor:'rgba(0,0,0,0)',
    margin:{l:6,r:26,t:8,b:52},
    xaxis2:{range:[-0.05,1.06],anchor:'y2',
      tickvals:[0,.25,.5,.75,1],ticktext:['0%','25%','50%','75%','100%'],
      title:boldTitle('Hallucination Rate (Avg.)'),
      gridcolor:'rgba(0,0,0,0.08)',gridwidth:0.4,zeroline:false,
      showline:true,linecolor:'#333',linewidth:0.6,mirror:false,
      ticklen:3,tickcolor:'#333',tickfont:{size:FS.tick}},
    yaxis2:{range:[yBot,yTop],anchor:'x2',showticklabels:false,
      zeroline:false,showgrid:false,showline:false,ticklen:0},
    showlegend:false,
    shapes:sh_b, annotations:an_b, height:480, hovermode:'closest'
  };

  Plotly.newPlot('fig4b',tr_b,layout4b,CFG);

  /* --- Scroll animation for Figure 4 --- */
  observeChart('chart-fig4',()=>{
    /* Panel (a): animate bars from 0 to real values */
    const update_a = {};
    for(let i=0;i<N;i++){
      update_a[2*i]  = {x:[[D.prem.IK[i]/100]]};
      update_a[2*i+1]= {x:[[D.prem.KE[i]/100]]};
    }
    const indices_a = Array.from({length:2*N},(_,i)=>i);
    const xVals_a = indices_a.map(ti=> ti%2===0 ? [D.prem.IK[Math.floor(ti/2)]/100] : [D.prem.KE[Math.floor(ti/2)]/100]);
    Plotly.animate('fig4a',{
      data: indices_a.map(ti=>({x: xVals_a[ti]})),
      traces: indices_a,
      layout: {annotations: an_a.map(a=>({...a, opacity:1}))}
    },{transition:{duration:ANIM_DUR,easing:ANIM_EASE},frame:{duration:ANIM_DUR,redraw:true}});

    /* Panel (b): animate dots to real positions and show labels */
    const realX_b = [];
    for(let i=0;i<N;i++){
      const fields=[
        {ik:D.feat.IK[i],ke:D.feat.KE[i]},
        {ik:D.loc.IK[i], ke:D.loc.KE[i]}
      ];
      fields.forEach(f=>{
        realX_b.push([f.ik/100, f.ke/100]);  // line
        realX_b.push([f.ik/100]);              // IK dot
        realX_b.push([f.ke/100]);              // KE dot
      });
    }
    const indices_b = Array.from({length:realX_b.length},(_,i)=>i);
    Plotly.animate('fig4b',{
      data: indices_b.map(ti=>({x: realX_b[ti]})),
      traces: indices_b,
      layout: {annotations: an_b.map(a=>({...a, opacity: (a.opacity===0 ? 1 : a.opacity)}))}
    },{transition:{duration:ANIM_DUR,easing:ANIM_EASE},frame:{duration:ANIM_DUR,redraw:true}});
  });
}


/* ============================================================
   FIGURE 5 — Hypothesis Composition + Retrieval-Reasoning Gap
   Matches the Python / matplotlib fig_study24_combined script.
   ============================================================ */
function renderFigure5(){
  const el=document.getElementById('chart-fig5');
  if(!el) return;

  /* ---- HTML legend (two rows, matching the Python figure) ---- */
  const C_RED='#e74c3c';
  el.innerHTML=`
  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0 4px;font:500 ${FS.legend}px/1.3 ${FONT.family};color:#444;flex-wrap:wrap;">
    <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="display:inline-block;width:20px;height:11px;background:repeating-linear-gradient(135deg,${C_BASE},${C_BASE} 2px,rgba(255,255,255,.45) 2px,rgba(255,255,255,.45) 4px);border-radius:2px;opacity:.55;"></span>Log-Derived (KI)</span>
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="display:inline-block;width:20px;height:11px;background:${C_BASE};border-radius:2px;opacity:.92;"></span>Log-Derived (KE)</span>
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="display:inline-block;width:20px;height:11px;background:repeating-linear-gradient(135deg,${C_KE},${C_KE} 2px,rgba(255,255,255,.45) 2px,rgba(255,255,255,.45) 4px);border-radius:2px;opacity:.55;"></span>Domain-Grounded (KI)</span>
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="display:inline-block;width:20px;height:11px;background:${C_KE};border-radius:2px;opacity:.92;"></span>Domain-Grounded (KE)</span>
    </div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="color:${C_BASE};font-size:13px;">◇</span> Fetch — Queried</span>
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="color:${C_BASE};font-size:13px;">◆</span> Fetch — Followed</span>
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="color:${C_KE};font-size:13px;">□</span> Diagnose — Queried</span>
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="color:${C_KE};font-size:13px;">■</span> Diagnose — Followed</span>
      <span style="display:inline-flex;align-items:center;gap:4px;">
        <span style="display:inline-block;width:18px;height:10px;background:${C_RED};opacity:.35;border-radius:2px;"></span>Gap</span>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;position:relative;">
    <div id="fig5a"></div>
    <div id="fig5b"></div>
    <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:#aaa;z-index:5;pointer-events:none;"></div>
  </div>`;

  /* ---- Shared geometry (7 rows: Ref.OA + 6 models) ---- */
  const all=['Ref. OA',...MODELS];
  const nA=all.length;
  const ROW5=1.55, HALF5=ROW5/2, OFF5=0.27, BW5=0.30;
  const yV=all.map((_,i)=>(nA-1-i)*ROW5);
  const divRef=yV[0]-HALF5+0.01, divMid=yV[3]-HALF5+0.01;
  const top5=yV[0]+HALF5-0.01, bot5=yV[nA-1]-HALF5;

  function rowShapes5(ax){
    const sh=[];
    for(let i=0;i<nA;i++){
      const my=yV[i], top=my+HALF5-0.01, bot=my-HALF5+0.01;
      sh.push({type:'rect',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:my,y1:top,
        fillcolor:'#eeeeee',line:{width:0},layer:'below'});
      sh.push({type:'rect',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:bot,y1:my,
        fillcolor:'#ffffff',line:{width:0},layer:'below'});
      if(i<nA-1){
        const isStrong=Math.abs(bot-divRef)<0.02||Math.abs(bot-divMid)<0.02;
        sh.push({type:'line',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:bot,y1:bot,
          line:{color:'#111',width:isStrong?0.9:0.7,dash:isStrong?'solid':'dot'},layer:'above'});
      }
    }
    sh.push({type:'line',xref:'paper',yref:'y'+ax,x0:0,x1:1,y0:top5,y1:top5,
      line:{color:'#111',width:0.9},layer:'above'});
    return sh;
  }

  /* ========== Panel (a) — Diverging Hypothesis Bar Chart ========== */
  const tr5a=[], sh5a=rowShapes5(''), an5a=[];

  /* Ref. OA row (index 0): single bar, no KI/KE split */
  const refY=yV[0]-(BW5/2+0.01);
  tr5a.push({type:'bar',orientation:'h',y:[refY],x:[0],width:BW5,
    marker:{color:C_BASE,opacity:0.92},showlegend:false,
    hovertemplate:'Ref. OA Log: 1.0<extra></extra>'});
  tr5a.push({type:'bar',orientation:'h',y:[refY],x:[0],width:BW5,
    marker:{color:C_KE,opacity:0.92},showlegend:false,
    hovertemplate:'Ref. OA Domain: 2.0<extra></extra>'});
  an5a.push({x:-1.15,y:refY,text:'<b>1.0</b>',showarrow:false,
    font:{size:FS.barLbl,color:C_BASE,family:FONT.family},xanchor:'right',yanchor:'middle',opacity:0});
  an5a.push({x:2.15,y:refY,text:'<b>2.0</b>',showarrow:false,
    font:{size:FS.barLbl,color:C_KE,family:FONT.family},xanchor:'left',yanchor:'middle',opacity:0});

  /* Per-model bars (indices 1–6) */
  for(let i=0;i<N;i++){
    const mi=i+1; // index into all/yV (0=Ref.OA)
    const my=yV[mi];
    const lKI=D.logH.IK[i], lKE=D.logH.KE[i];
    const dKI=D.domH.IK[i], dKE=D.domH.KE[i];

    /* KI row (top, hatched, alpha=0.55) */
    const yKI=my+BW5/2+0.01;
    tr5a.push({type:'bar',orientation:'h',y:[yKI],x:[0],width:BW5,
      marker:{color:C_BASE,opacity:0.55,
        pattern:{shape:'/',size:8,solidity:0.35,fgcolor:'rgba(255,255,255,0.5)',bgcolor:C_BASE}},
      showlegend:false,hovertemplate:MODELS[i]+' KI Log: '+lKI.toFixed(1)+'<extra></extra>'});
    tr5a.push({type:'bar',orientation:'h',y:[yKI],x:[0],width:BW5,
      marker:{color:C_KE,opacity:0.55,
        pattern:{shape:'/',size:8,solidity:0.35,fgcolor:'rgba(255,255,255,0.5)',bgcolor:C_KE}},
      showlegend:false,hovertemplate:MODELS[i]+' KI Domain: '+dKI.toFixed(1)+'<extra></extra>'});

    /* KE row (bottom, solid, alpha=0.92) */
    const yKE=my-(BW5/2+0.01);
    tr5a.push({type:'bar',orientation:'h',y:[yKE],x:[0],width:BW5,
      marker:{color:C_BASE,opacity:0.92},showlegend:false,
      hovertemplate:MODELS[i]+' KE Log: '+lKE.toFixed(1)+'<extra></extra>'});
    tr5a.push({type:'bar',orientation:'h',y:[yKE],x:[0],width:BW5,
      marker:{color:C_KE,opacity:0.92},showlegend:false,
      hovertemplate:MODELS[i]+' KE Domain: '+dKE.toFixed(1)+'<extra></extra>'});

    /* Labels at bar ends (hidden initially, shown on animate) */
    if(lKI>0.2) an5a.push({x:-lKI-0.15,y:yKI,text:'<b>'+lKI.toFixed(1)+'</b>',showarrow:false,
      font:{size:FS.barLbl,color:C_BASE,family:FONT.family},xanchor:'right',yanchor:'middle',opacity:0});
    if(dKI>0.2) an5a.push({x:dKI+0.15,y:yKI,text:'<b>'+dKI.toFixed(1)+'</b>',showarrow:false,
      font:{size:FS.barLbl,color:C_KE,family:FONT.family},xanchor:'left',yanchor:'middle',opacity:0});
    if(lKE>0.2) an5a.push({x:-lKE-0.15,y:yKE,text:'<b>'+lKE.toFixed(1)+'</b>',showarrow:false,
      font:{size:FS.barLbl,color:C_BASE,family:FONT.family},xanchor:'right',yanchor:'middle',opacity:0});
    if(dKE>0.2) an5a.push({x:dKE+0.15,y:yKE,text:'<b>'+dKE.toFixed(1)+'</b>',showarrow:false,
      font:{size:FS.barLbl,color:C_KE,family:FONT.family},xanchor:'left',yanchor:'middle',opacity:0});
  }

  /* "← Log-Derived" / "Domain-Grounded →" labels at bottom */
  an5a.push({x:-4,y:bot5+0.10,text:'<i>← Log-Derived</i>',showarrow:false,
    font:{size:FS.barLbl,color:C_BASE,family:FONT.family},xanchor:'center',yanchor:'bottom'});
  an5a.push({x:4.4,y:bot5+0.10,text:'<i>Domain-Grounded →</i>',showarrow:false,
    font:{size:FS.barLbl,color:C_KE,family:FONT.family},xanchor:'center',yanchor:'bottom'});

  const maxV=8;
  Plotly.newPlot('fig5a',tr5a,{
    font:{...FONT,size:FS.base},paper_bgcolor:'#fff',plot_bgcolor:'rgba(0,0,0,0)',
    margin:{l:90,r:30,t:8,b:52},
    xaxis:{range:[-maxV,maxV],tickvals:[-8,-6,-4,-2,0,2,4,6,8],
      ticktext:['8','6','4','2','0','2','4','6','8'],
      title:boldTitle('Mean Hypothesis Count'),
      gridcolor:'rgba(0,0,0,0.08)',gridwidth:0.4,
      zeroline:true,zerolinecolor:'#555',zerolinewidth:0.9,
      showline:true,linecolor:'#333',linewidth:0.6,ticklen:3,tickfont:{size:FS.tick}},
    yaxis:{tickvals:yV,ticktext:all,range:[bot5,top5],
      tickfont:{size:FS.tick,family:FONT.family,weight:'bold'},tickangle:-90,
      showgrid:false,showline:false,ticklen:0},
    barmode:'overlay',showlegend:false,
    shapes:sh5a,annotations:an5a,height:580
  },CFG);


  /* ========== Panel (b) — Retrieval-Reasoning Gap (KE Only) ========== */
  const tr5b=[], sh5b=rowShapes5('2'), an5b=[];
  const procedures=[
    {q:D.fQ,f:D.fF,sym:'diamond',symQ:'diamond-open',color:C_BASE,label:'Fetch',above:true},
    {q:D.dQ,f:D.dF,sym:'square',symQ:'square-open',color:C_KE,label:'Diagnose',above:false}
  ];

  /* Ref. OA row — both at 100% */
  procedures.forEach(p=>{
    const y=yV[0]+(p.above?OFF5:-OFF5);
    /* Followed marker (filled) */
    tr5b.push({type:'scatter',mode:'markers',x:[0],y:[y],
      marker:{symbol:p.sym,size:10,color:p.color,line:{width:0.4,color:p.color}},
      showlegend:false,xaxis:'x2',yaxis:'y2',
      hovertemplate:'Ref. OA '+p.label+': 100%<extra></extra>'});
    const dy=p.above?0.16:-0.16, va=p.above?'bottom':'top';
    an5b.push({x:1.0,y:y+dy,xref:'x2',yref:'y2',text:'100%',showarrow:false,
      font:{size:FS.dumbLbl,color:p.color,family:FONT.family},xanchor:'center',yanchor:va,opacity:0});
  });

  /* Per-model gap chart */
  for(let i=0;i<N;i++){
    const mi=i+1;
    const my=yV[mi];

    procedures.forEach(p=>{
      const q=p.q[i]/100, f=p.f[i]/100;
      const y=my+(p.above?OFF5:-OFF5);
      const dy=p.above?0.16:-0.16, va=p.above?'bottom':'top';

      if(q<=0){
        /* "never queried" */
        an5b.push({x:0.5,y:y,xref:'x2',yref:'y2',text:'<i>never queried</i>',showarrow:false,
          font:{size:FS.dumbLbl,color:'#555',family:FONT.family},xanchor:'center',yanchor:'middle',opacity:0});
        return;
      }

      const gap=q-f;

      /* Red gap fill (as rectangle shape) */
      if(gap>0.01){
        sh5b.push({type:'rect',xref:'x2',yref:'y2',x0:f,x1:q,
          y0:y-0.13,y1:y+0.13,
          fillcolor:C_RED,opacity:0.35,line:{width:0},layer:'below'});
        /* Gap label */
        an5b.push({x:(q+f)/2,y:y,xref:'x2',yref:'y2',
          text:'<b>–'+(gap*100).toFixed(0)+'%</b>',showarrow:false,
          font:{size:FS.dumbLbl,color:'#000',family:FONT.family},xanchor:'center',yanchor:'middle',opacity:0});
      }

      /* Queried marker (outline — starts at 0) */
      tr5b.push({type:'scatter',mode:'markers',x:[0],y:[y],
        marker:{symbol:p.symQ,size:10,color:p.color,
          line:{width:1.2,color:p.color}},
        showlegend:false,xaxis:'x2',yaxis:'y2',
        hovertemplate:MODELS[i]+' '+p.label+' Queried: '+(q*100)+'%<extra></extra>'});

      /* Followed marker (filled — starts at 0) */
      tr5b.push({type:'scatter',mode:'markers',x:[0],y:[y],
        marker:{symbol:p.sym,size:8,color:p.color,
          line:{width:0.4,color:p.color}},
        showlegend:false,xaxis:'x2',yaxis:'y2',
        hovertemplate:MODELS[i]+' '+p.label+' Followed: '+(f*100)+'%<extra></extra>'});

      /* Percentage labels */
      an5b.push({x:q,y:y+dy,xref:'x2',yref:'y2',text:(q*100).toFixed(0)+'%',showarrow:false,
        font:{size:FS.dumbLbl,color:p.color,family:FONT.family},xanchor:'center',yanchor:va,opacity:0});
      if(f<q-0.04){
        an5b.push({x:f,y:y+dy,xref:'x2',yref:'y2',text:(f*100).toFixed(0)+'%',showarrow:false,
          font:{size:FS.dumbLbl,color:p.color,family:FONT.family},xanchor:'center',yanchor:va,opacity:0});
      }
    });
  }

  Plotly.newPlot('fig5b',tr5b,{
    font:{...FONT,size:FS.base},paper_bgcolor:'#fff',plot_bgcolor:'rgba(0,0,0,0)',
    margin:{l:6,r:26,t:8,b:52},
    xaxis2:{range:[-0.05,1.05],anchor:'y2',
      tickvals:[0,0.5,1],ticktext:['0%','50%','100%'],
      title:boldTitle('Rate  (KE Only)'),
      gridcolor:'rgba(0,0,0,0.08)',gridwidth:0.4,zeroline:false,
      showline:true,linecolor:'#333',linewidth:0.6,ticklen:3,tickfont:{size:FS.tick}},
    yaxis2:{range:[bot5,top5],anchor:'x2',showticklabels:false,
      zeroline:false,showgrid:false,showline:false,ticklen:0},
    showlegend:false,
    shapes:sh5b,annotations:an5b,height:580,hovermode:'closest'
  },CFG);

  /* ---- Scroll animation for Figure 5 ---- */
  observeChart('chart-fig5',()=>{
    /* Panel (a): animate bars from 0 to real values */
    /* Trace order: [ref_log, ref_dom, m0_ki_log, m0_ki_dom, m0_ke_log, m0_ke_dom, m1_ki_log, ...] */
    const realA=[];
    realA.push([-REF.log]); realA.push([REF.dom]); // Ref. OA
    for(let i=0;i<N;i++){
      realA.push([-D.logH.IK[i]]); realA.push([D.domH.IK[i]]);  // KI
      realA.push([-D.logH.KE[i]]); realA.push([D.domH.KE[i]]);  // KE
    }
    const idxA=Array.from({length:realA.length},(_,i)=>i);
    Plotly.animate('fig5a',{
      data:idxA.map(t=>({x:realA[t]})),traces:idxA,
      layout:{annotations:an5a.map(a=>({...a,opacity:1}))}
    },{transition:{duration:ANIM_DUR,easing:ANIM_EASE},frame:{duration:ANIM_DUR,redraw:true}});

    /* Panel (b): animate markers from 0 to real positions */
    const realB=[];
    /* Ref. OA: 2 filled markers */
    realB.push([1.0]); realB.push([1.0]);
    for(let i=0;i<N;i++){
      procedures.forEach(p=>{
        const q=p.q[i]/100, f=p.f[i]/100;
        if(q<=0) return; // "never queried" — no traces added
        realB.push([q]); // queried
        realB.push([f]); // followed
      });
    }
    const idxB=Array.from({length:realB.length},(_,i)=>i);
    Plotly.animate('fig5b',{
      data:idxB.map(t=>({x:realB[t]})),traces:idxB,
      layout:{annotations:an5b.map(a=>({...a,opacity:a.opacity===0?1:a.opacity}))}
    },{transition:{duration:ANIM_DUR,easing:ANIM_EASE},frame:{duration:ANIM_DUR,redraw:true}});
  });
}


/* ============================================================
   FIGURE 6 — Action Selection + Cascade Failure Taxonomy
   Matches fig_study3_combined.py exactly.
   ============================================================ */
function renderFigure6(){
  const el=document.getElementById('chart-fig6');
  if(!el) return;

  /* Action-selection colours */
  const C_S='#148f77', C_W='#d4ac0d', C_NA='#2c2c2c';

  /* Build row data: Ref OA at top, then model pairs (IK/KE) */
  const rowLabels=[], sv=[], wv=[], nv=[], bgCol=[], yTickText=[];
  /* Ref. OA */
  rowLabels.push('Ref. OA'); sv.push(100); wv.push(0); nv.push(0);
  bgCol.push('#e0f2e9'); yTickText.push('<b>Ref. OA</b>');
  for(let i=0;i<N;i++){
    rowLabels.push(MODELS[i]+' IK'); sv.push(D.srch.IK[i]); wv.push(D.wp.IK[i]); nv.push(D.na.IK[i]);
    bgCol.push('#ede7f6'); yTickText.push('LLM-IK');
    rowLabels.push(MODELS[i]+' KE'); sv.push(D.srch.KE[i]); wv.push(D.wp.KE[i]); nv.push(D.na.KE[i]);
    bgCol.push('#e8eaed'); yTickText.push('LLM-KE');
  }
  const nR=rowLabels.length, rsp=1.0;
  const yV=rowLabels.map((_,i)=>(nR-1-i)*rsp);

  /* Background row shapes */
  const sh6=[];
  for(let i=0;i<nR;i++){
    sh6.push({type:'rect',xref:'paper',yref:'y',x0:0,x1:1,
      y0:yV[i]-rsp/2+0.02,y1:yV[i]+rsp/2-0.02,
      fillcolor:bgCol[i],opacity:0.55,line:{width:0},layer:'below'});
  }
  /* Solid line below Ref. OA */
  sh6.push({type:'line',xref:'paper',yref:'y',x0:0,x1:1,
    y0:yV[0]-rsp/2+0.02,y1:yV[0]-rsp/2+0.02,
    line:{color:'#333',width:2},layer:'above'});
  /* Dashed lines between model groups */
  for(let g=1;g<N;g++){
    const idx=1+g*2;
    sh6.push({type:'line',xref:'paper',yref:'y',x0:0,x1:1,
      y0:yV[idx]+rsp/2-0.02,y1:yV[idx]+rsp/2-0.02,
      line:{color:'#aaa',width:1,dash:'dot'},layer:'above'});
  }

  /* Hatching: solid bar colour as bgcolor, semi-transparent white lines on top (matching PDF) */
  const mkPat=(sh,bg)=>({shape:sh,size:8,solidity:0.25,fgcolor:'rgba(255,255,255,0.5)',bgcolor:bg});

  const t6=[
    {type:'bar',orientation:'h',y:yV,x:zeros(nR),width:0.78,
      name:'SEARCH',marker:{color:C_S,pattern:mkPat('/',C_S)},
      hovertemplate:'%{customdata}: SEARCH %{x:.0f}%<extra></extra>',customdata:rowLabels,showlegend:false},
    {type:'bar',orientation:'h',y:yV,x:zeros(nR),width:0.78,
      name:'WAYPOINT',marker:{color:C_W,pattern:mkPat('\\',C_W)},
      hovertemplate:'%{customdata}: WAYPOINT %{x:.0f}%<extra></extra>',customdata:rowLabels,showlegend:false},
    {type:'bar',orientation:'h',y:yV,x:zeros(nR),width:0.78,
      name:'No Action',marker:{color:C_NA,pattern:mkPat('.',C_NA)},
      hovertemplate:'%{customdata}: No Action %{x:.0f}%<extra></extra>',customdata:rowLabels,showlegend:false}
  ];

  /* Percentage labels — DARK text, centred in each segment */
  const an6a=[];
  for(let i=0;i<nR;i++){
    let xCursor=0;
    const segs=[{v:sv[i],c:'#fff'},{v:wv[i],c:'#333'},{v:nv[i],c:'#fff'}];
    segs.forEach(s=>{
      if(s.v>0){
        an6a.push({x:xCursor+s.v/2,y:yV[i],xref:'x',yref:'y',
          text:'<b>'+s.v+'%</b>',showarrow:false,opacity:0,
          font:{size:12,color:s.c,family:FONT.family},xanchor:'center'});
      }
      xCursor+=s.v;
    });
  }

  /* Model name annotations — rotated vertically, positioned left of y-axis labels */
  const modelAn6=[];
  for(let i=0;i<N;i++){
    const ikIdx=1+i*2, keIdx=2+i*2;
    const midY=(yV[ikIdx]+yV[keIdx])/2;
    modelAn6.push({x:-0.06,y:midY,xref:'paper',yref:'y',
      text:'<b>'+MODELS[i]+'</b>',showarrow:false,textangle:-90,
      font:{size:10.5,color:'#222',family:FONT.family},xanchor:'center'});
  }

  /* Grid container: wider left panel, narrow right */
  el.innerHTML='<div style="display:grid;grid-template-columns:2.8fr 0.55fr;gap:0;align-items:stretch;">'
    +'<div id="fig6a"></div><div id="fig6b"></div></div>'
    +'<div id="fig6-legend" style="margin-top:0.5rem;"></div>';

  Plotly.newPlot('fig6a',t6,{
    font:{...FONT,size:FS.base},paper_bgcolor:'#fff',plot_bgcolor:'rgba(0,0,0,0)',
    margin:{l:105,r:10,t:16,b:52},
    xaxis:{range:[0,105],tickvals:[0,25,50,75,100],ticktext:['0%','25%','50%','75%','100%'],
      title:boldTitle('Action Selection Rate'),gridcolor:'rgba(0,0,0,0.06)',zeroline:false,
      showline:true,linecolor:'#333',linewidth:0.6,ticklen:3,tickfont:{size:FS.tick}},
    yaxis:{tickvals:yV,ticktext:yTickText,tickfont:{size:10,color:'#444'},
      range:[yV[nR-1]-rsp/2-0.15,yV[0]+rsp/2+0.15],showgrid:false,showline:false,ticklen:0},
    barmode:'stack',showlegend:false,
    shapes:sh6,annotations:[...an6a,...modelAn6],height:660
  },CFG);

  /* Panel (b) — Vertical Stacked Bar: Cascade Failure Taxonomy */
  const ca=D.casc;
  const cascPct=ca.cnt.map(c=>Math.round(c/15*100));
  const cascShapes=['/','+','x','|'];
  const cascTraces=ca.lbl.map((lbl,j)=>({
    type:'bar',x:[''],y:[0],width:0.5,
    name:lbl,marker:{color:ca.col[j],pattern:mkPat(cascShapes[j],ca.col[j])},
    hovertemplate:lbl+': '+ca.cnt[j]+'/15 ('+cascPct[j]+'%)<extra></extra>',
    showlegend:false
  }));

  /* Labels inside each cascade segment */
  const an6b=[];
  let cumPct=0;
  for(let j=0;j<4;j++){
    const midPct=cumPct+cascPct[j]/2;
    an6b.push({x:0,y:midPct,xref:'x',yref:'y',
      text:'<b>'+ca.cnt[j]+'/15</b><br>'+cascPct[j]+'%',showarrow:false,opacity:0,
      font:{size:11,color:'#fff',family:FONT.family},xanchor:'center'});
    cumPct+=cascPct[j];
  }
  /* "n=15" label above bar */
  an6b.push({x:0,y:105,xref:'x',yref:'y',
    text:'<b><i>n</i>=15</b>',showarrow:false,opacity:0,
    font:{size:12,color:'#333',family:FONT.family},xanchor:'center'});

  Plotly.newPlot('fig6b',cascTraces,{
    font:{...FONT,size:FS.base},paper_bgcolor:'#fff',plot_bgcolor:'rgba(0,0,0,0)',
    margin:{l:10,r:66,t:16,b:52},
    xaxis:{showticklabels:false,showgrid:false,showline:false,zeroline:false,fixedrange:true},
    yaxis:{range:[0,112],tickvals:[0,25,50,75,100],ticktext:['0%','25%','50%','75%','100%'],
      side:'right',title:{text:'<b>Share of Failures</b>',standoff:6},
      gridcolor:'rgba(0,0,0,0.06)',zeroline:false,
      showline:true,linecolor:'#333',linewidth:0.6,ticklen:3,tickfont:{size:FS.tick}},
    barmode:'stack',showlegend:false,
    annotations:an6b,height:660
  },CFG);

  /* Two-row HTML legend */
  const lgEl=document.getElementById('fig6-legend');
  if(lgEl){
    const sw=(col,hatch,lbl)=>{
      /* CSS hatched swatch matching Plotly pattern */
      let bg=col;
      if(hatch==='/') bg=`repeating-linear-gradient(45deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1.5px,${col} 1.5px,${col} 4px)`;
      else if(hatch==='\\') bg=`repeating-linear-gradient(-45deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1.5px,${col} 1.5px,${col} 4px)`;
      else if(hatch==='+') bg=`repeating-linear-gradient(0deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1.5px,${col} 1.5px,${col} 4px),repeating-linear-gradient(90deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1.5px,${col} 1.5px,${col} 4px)`;
      else if(hatch==='x') bg=`repeating-linear-gradient(45deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1.5px,${col} 1.5px,${col} 4px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1.5px,${col} 1.5px,${col} 4px)`;
      else if(hatch==='|') bg=`repeating-linear-gradient(90deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1.5px,${col} 1.5px,${col} 4px)`;
      return `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:16px;">
        <span style="display:inline-block;width:18px;height:13px;border-radius:2px;background:${bg};border:1px solid rgba(0,0,0,0.12);"></span>
        <span style="font-size:${FS.legend}px;color:#333;">${lbl}</span></span>`;
    };
    lgEl.innerHTML=`<div style="text-align:center;line-height:2.4;">
      <div>${sw(C_S,'/','SEARCH')}${sw(C_W,'\\','WAYPOINT')}${sw(C_NA,'.','No Action')}</div>
      <div>${sw(ca.col[0],'/','Behavioral Loop')}${sw(ca.col[1],'+','Hallucinated Success')}${sw(ca.col[2],'x','Stall / Frozen')}${sw(ca.col[3],'|','Backtrack → Circling')}</div>
    </div>`;
  }

  /* --- Scroll animation for Figure 6 --- */
  observeChart('chart-fig6',()=>{
    Plotly.animate('fig6a',{
      data:[{x:sv},{x:wv},{x:nv}],
      traces:[0,1,2],
      layout:{annotations:[...an6a.map(a=>({...a,opacity:1})),...modelAn6]}
    },{transition:{duration:ANIM_DUR,easing:ANIM_EASE},frame:{duration:ANIM_DUR,redraw:true}});

    Plotly.animate('fig6b',{
      data:cascPct.map(p=>({y:[p]})),
      traces:[0,1,2,3],
      layout:{annotations:an6b.map(a=>({...a,opacity:1}))}
    },{transition:{duration:ANIM_DUR,easing:ANIM_EASE},frame:{duration:ANIM_DUR,redraw:true}});
  });
}


/* ============================================================
   FIGURE 4 — INTERACTIVE INSIGHT CONTROLLER
   Clicking insight buttons highlights relevant chart regions
   and swaps the explanation text below the graph.
   ============================================================ */

const FIG4_INSIGHTS = [
  { /* 0 — What's Measured */
    html: `<p>Study 1 evaluates whether LLMs can recognise when they lack the information needed to act safely.</p>
      <p><strong>Premature action</strong> (left panel) &mdash; the model dispatches a physical retrieval command
      before verifying the object's identifying features and storage location.</p>
      <p><strong>Hallucinated features / location</strong> (right panel) &mdash; the model fabricates object
      properties without perceptual or dialogue grounding, e.g.&thinsp;asserting a thermostat is
      "silver and rectangular" with no sensor data.</p>`,
    highlight: null  /* show everything normally */
  },
  { /* 1 — KI Baseline */
    html: `<p>Under the <strong>Knowledge-Impoverished (KI)</strong> condition, models relied solely on
      pretrained knowledge. The result was total failure across the board:</p>
      <p class="insight-highlight">100% of trials across all six models exhibited premature action.
      Every model immediately issued a retrieval command without first confirming what the target
      looked like or where it was stored.</p>
      <p>Similarly, hallucination rates were at or near <span class="insight-stat">100%</span>
      for both features and location &mdash; models confidently fabricated object details.</p>`,
    highlight: 'ki'  /* dim KE bars, spotlight KI */
  },
  { /* 2 — KE Impact */
    html: `<p>Knowledge-Equalization (KE) gave models access to OntoAgent's <code>FETCHPLAN</code>
      procedure, which explicitly states: <em>"the agent must know identifying features and storage
      location before taking any physical action."</em></p>
      <p>Premature action dropped from 100% to <span class="insight-stat">60%</span>
      <span style="color:#666;">(p&lt;.001, Cohen's h&nbsp;=&nbsp;1.31)</span>.</p>
      <p>Feature hallucination fell from 100% to <span class="insight-stat">57%</span>
      <span style="color:#666;">(p&lt;.001)</span>.
      Look at the green arrows in the right panel &mdash; they show where KE reduced hallucination.</p>`,
    highlight: 'ke'  /* dim KI bars, spotlight KE */
  },
  { /* 3 — Model Variability */
    html: `<p>The aggregate numbers mask dramatic model-level differences. Improvement was concentrated
      in just <strong>two of six</strong> models:</p>
      <p><strong style="color:${C_BASE};">Opus 4.6</strong> &mdash; premature action 100%→20%,
      features 100%→0%, location 100%→20%.</p>
      <p><strong style="color:${C_BASE};">Haiku 4.5</strong> &mdash; dropped to <span class="insight-stat">0%</span>
      on all three metrics. The only model to fully self-correct.</p>
      <p>Meanwhile, <strong>Gem.3 Pro, GPT5 Mini</strong> showed <em>no improvement at all</em> &mdash;
      100% on every metric under both conditions.</p>`,
    highlight: 'models' /* highlight Opus 4.6 & Haiku 4.5 rows */
  },
  { /* 4 — Key Takeaway */
    html: `<p class="insight-highlight">Knowledge availability does not guarantee behavioural change.
      Models can retrieve the correct plan yet still fail to follow it.</p>
      <p>Even with explicit procedural knowledge, <strong>60% of trials still exhibited premature action</strong>
      and <strong>57% still hallucinated object features</strong>. Two models eliminated hallucination
      entirely; two others showed zero change despite having identical access to verification procedures.</p>
      <p>This is the <strong>retrieval-reasoning gap</strong> &mdash; a central finding explored further in
      Studies 2&ndash;4 below.</p>`,
    highlight: null
  }
];

/* Highlight shapes for different insight states */
function fig4Highlight(step){
  const panels = ['fig4a','fig4b'];
  if(!document.getElementById('fig4a')) return;

  /* Trace count per model in panel a: 2 (IK bar + KE bar) */
  const nTraces_a = 2*N;
  /* Trace count per model in panel b: 4 per field × 2 fields = varies */
  /* We'll use opacity on the entire panel instead */

  if(step === 'ki'){
    /* Dim KE bars (odd traces), full opacity KI bars (even traces) */
    for(let i=0;i<N;i++){
      Plotly.restyle('fig4a',{opacity:0.9},[2*i]);    // KI bar
      Plotly.restyle('fig4a',{opacity:0.15},[2*i+1]);  // KE bar
    }
  } else if(step === 'ke'){
    for(let i=0;i<N;i++){
      Plotly.restyle('fig4a',{opacity:0.15},[2*i]);
      Plotly.restyle('fig4a',{opacity:0.9},[2*i+1]);
    }
  } else if(step === 'models'){
    /* Highlight Opus 4.6 (i=0) and Haiku 4.5 (i=3), dim others */
    const spots = new Set([0,3]);
    for(let i=0;i<N;i++){
      const op = spots.has(i) ? 0.9 : 0.12;
      Plotly.restyle('fig4a',{opacity:op},[2*i]);
      Plotly.restyle('fig4a',{opacity:op},[2*i+1]);
    }
    /* Also dim/spotlight dumbbell traces in panel b */
    const el_b = document.getElementById('fig4b');
    if(el_b && el_b.data){
      const nTr = el_b.data.length;
      /* Each model uses 4 traces per field (line, IK dot, KE dot) × 2 fields
         = roughly 8 traces per model but varies with arrow annotations.
         Simpler: dim everything then un-dim specific y ranges */
      for(let t=0;t<nTr;t++){
        const trData = el_b.data[t];
        if(!trData.y || !trData.y.length) continue;
        const ty = trData.y[0];
        /* Opus 4.6 rows: mY(0)±OFFSET_GAP, Haiku 4.5 rows: mY(3)±OFFSET_GAP */
        const isSpot = [mY(0),mY(3)].some(m=> Math.abs(ty-m)<HALF);
        Plotly.restyle('fig4b',{opacity:isSpot?0.9:0.1},[t]);
      }
    }
  } else {
    /* Reset all to normal */
    for(let i=0;i<N;i++){
      Plotly.restyle('fig4a',{opacity:0.80},[2*i]);
      Plotly.restyle('fig4a',{opacity:0.80},[2*i+1]);
    }
    const el_b = document.getElementById('fig4b');
    if(el_b && el_b.data){
      for(let t=0;t<el_b.data.length;t++){
        Plotly.restyle('fig4b',{opacity:el_b.data[t].type==='scatter'&&el_b.data[t].mode==='lines'?0.75:1},[t]);
      }
    }
  }
}

/* ============================================================
   FIGURE 5 — INTERACTIVE INSIGHT CONTROLLER
   ============================================================ */

const FIG5_INSIGHTS = [
  { /* 0 — What's Measured */
    html: `<p>The <strong>left panel</strong> shows a diverging bar chart of diagnostic hypotheses.
      Bars extending left are <strong style="color:${C_BASE};">log-derived</strong> (anchored to the service log),
      bars extending right are <strong style="color:${C_KE};">domain-grounded</strong> (reasoned from
      maintenance knowledge). Hatched bars = KI condition, solid = KE.</p>
      <p>The <strong>right panel</strong> shows the <em>retrieval-reasoning gap</em>: for each model under KE,
      did it <em>query</em> (outline marker) the FETCHPLAN procedure and did it actually <em>follow</em>
      (filled marker) what it retrieved? Red shading highlights the gap between the two.</p>`
  },
  { /* 1 — KI: Log-Anchored */
    html: `<p>Under KI, models overwhelmingly anchored to the service log rather than reasoning
      from domain knowledge:</p>
      <p class="insight-highlight">87% of KI trials were data-anchored &mdash; models treated
      the service log as the entire diagnostic framework without applying maintenance principles.</p>
      <p>Notice the hatched bars in the left panel: they extend mostly <strong>leftward</strong>
      (log-derived) with very little rightward (domain-grounded). Only Opus&nbsp;4.6 and Haiku&nbsp;4.5
      produced any domain-grounded hypotheses under KI.</p>`
  },
  { /* 2 — KE: Domain Shift */
    html: `<p>KE dramatically shifted hypothesis composition. Domain-first diagnosis rose from
      7% to <span class="insight-stat">70%</span>
      <span style="color:#666;">(p&lt;.001, |h|&nbsp;=&nbsp;1.46)</span> &mdash;
      the <strong>largest effect in the entire study</strong>.</p>
      <p>Look at the solid bars in the left panel: they now extend strongly rightward
      (domain-grounded). GPT5&nbsp;Mini produced <span class="insight-stat">7.0</span>
      domain-grounded hypotheses per trial &mdash; the highest of any model. Haiku&nbsp;4.5 reached 5.2.</p>
      <p>However, log-derived hypotheses persisted alongside domain ones, meaning
      KE <em>supplemented</em> rather than replaced log-anchored reasoning.</p>`
  },
  { /* 3 — Retrieval-Reasoning Gap */
    html: `<p>The right panel reveals the study's most striking finding. Look at the red gaps:</p>
      <p><strong style="color:${C_BASE};">Opus 4.6</strong> queried the diagnose procedure in
      <span class="insight-stat">100%</span> of KE trials yet followed it in
      <span class="insight-stat">0%</span> &mdash; a 100% gap. It retrieved the correct plan,
      then completely ignored it.</p>
      <p><strong>Gem.3 Fl.</strong> queried fetch in 100% of trials but followed it in only 20%
      (80% gap).</p>
      <p>Conversely, <strong>GPT5 Mini</strong> <em>never queried</em> either procedure yet still
      improved its diagnostic output &mdash; suggesting some models benefit from context without
      explicit tool use.</p>`
  },
  { /* 4 — Key Takeaway */
    html: `<p class="insight-highlight">Plans improved the <em>probability</em> of correct behaviour
      without <em>guaranteeing</em> it. The retrieval-reasoning gap is real and large.</p>
      <p>Hallucinated facts were <strong>unaffected</strong> by KE (KI:&nbsp;1.4, KE:&nbsp;1.6,
      p&nbsp;=&nbsp;.41), yet expressed uncertainty rose from 43% to
      <span class="insight-stat">93%</span> (p&lt;.001) &mdash; LLMs became
      <strong>verbally more cautious without becoming factually more accurate</strong>.</p>
      <p>This dissociation is a warning: surface-level caution can mask unchanged reasoning quality.</p>`
  }
];


/* ============================================================
   FIGURE 6 — INTERACTIVE INSIGHT CONTROLLER
   ============================================================ */

const FIG6_INSIGHTS = [
  { /* 0 — What's Measured */
    html: `<p>Study 3 tests whether LLMs can evaluate the downstream consequences of each action primitive
      before selecting one. The correct action is <strong>SEARCH</strong> (locate the target object);
      <strong>WAYPOINT</strong> (navigate to a fixed coordinate) is incorrect because the object's
      location is unknown.</p>
      <p>The <strong>left panel</strong> shows action selection rates per model under KI and KE conditions.
      The <strong>right panel</strong> taxonomises the cascade failures that followed every wrong action.</p>`,
    highlight: null
  },
  { /* 1 — KI: Mixed Results */
    html: `<p>Under KI, correct action selection (SEARCH) varied dramatically across models:</p>
      <p class="insight-highlight">Only Haiku 4.5 and GPT-5 Mini selected SEARCH in 100% of trials.
      GPT-5.2 was worst at just <span class="insight-stat">40%</span>, choosing WAYPOINT 60% of the time.</p>
      <p>Gem 3 Fl. chose SEARCH 80% of the time but selected <strong>No Action</strong> in 20% of trials
      &mdash; the only model to freeze entirely without KE context.</p>`,
    highlight: 'ki'
  },
  { /* 2 — KE: Near-Perfect */
    html: `<p>Knowledge-equalization dramatically improved action selection. Correct SEARCH selection rose
      from 57% to <span class="insight-stat">93%</span>
      <span style="color:#666;">(p = .002)</span>.</p>
      <p>Four of six models reached <strong>100% correct action selection</strong> under KE.
      Gem 3 Pro and GPT-5.2 both improved to 80% but each had 20% No Action trials
      &mdash; freezing rather than choosing the wrong action.</p>
      <p class="insight-highlight">KE eliminated WAYPOINT selection entirely: no model chose the
      incorrect action when given OntoAgent's consequence-evaluation procedure.</p>`,
    highlight: 'ke'
  },
  { /* 3 — Cascade Failures */
    html: `<p>Every wrong-action trial (n=15) produced an <strong>unrecoverable cascading failure</strong>.
      No model ever self-corrected after selecting WAYPOINT or freezing.</p>
      <p><strong style="color:#3a7fc1;">Behavioral Loop (47%)</strong> &mdash; the robot repeatedly
      executed the same failing action sequence without recognising the loop.</p>
      <p><strong style="color:#4caf6e;">Hallucinated Success (27%)</strong> &mdash; the model declared
      the task complete despite never locating the object.</p>
      <p><strong style="color:#e07b39;">Stall / Frozen (20%)</strong> &mdash; execution halted with
      no further commands issued.</p>
      <p><strong style="color:#b44db8;">Backtrack → Circling (7%)</strong> &mdash; the robot attempted
      recovery but entered a spatial loop.</p>`,
    highlight: 'cascade'
  },
  { /* 4 — Key Takeaway */
    html: `<p class="insight-highlight">Action selection is a one-shot decision with no recovery path.
      Unlike hallucination (Study 1) or diagnostic errors (Study 2), a wrong action immediately
      commits the robot to an unrecoverable failure trajectory.</p>
      <p>OntoAgent prevents this by evaluating <em>execution requirements</em> before dispatching any
      command: SEARCH requires perceptual attention (available), while WAYPOINT requires known
      coordinates (unavailable). This consequence-based gate achieves <span class="insight-stat">100%</span>
      correct selection with zero cascade failures.</p>`,
    highlight: null
  }
];

/* Highlight for Figure 6 insight states */
function fig6Highlight(step){
  const elA=document.getElementById('fig6a');
  if(!elA||!elA.data) return;
  const nTraces=elA.data.length; // 3 traces (SEARCH, WAYPOINT, No Action)
  const nR=elA.data[0].y.length;

  if(step==='ki'){
    /* Dim KE rows (even indices after 0), spotlight KI rows (odd indices after 0) + Ref OA */
    const opacities=[];
    for(let i=0;i<nR;i++){
      opacities.push(i===0||(i>0&&i%2===1) ? 0.9 : 0.15);
    }
    for(let t=0;t<nTraces;t++){
      Plotly.restyle('fig6a',{'marker.opacity':opacities},[t]);
    }
  } else if(step==='ke'){
    const opacities=[];
    for(let i=0;i<nR;i++){
      opacities.push(i===0||(i>0&&i%2===0) ? 0.9 : 0.15);
    }
    for(let t=0;t<nTraces;t++){
      Plotly.restyle('fig6a',{'marker.opacity':opacities},[t]);
    }
  } else if(step==='cascade'){
    /* Dim panel (a), full opacity on panel (b) */
    for(let t=0;t<nTraces;t++){
      Plotly.restyle('fig6a',{'marker.opacity':Array(nR).fill(0.2)},[t]);
    }
  } else {
    /* Reset */
    for(let t=0;t<nTraces;t++){
      Plotly.restyle('fig6a',{'marker.opacity':Array(nR).fill(0.85)},[t]);
    }
  }
}

/* ---- Generic insight initialiser ---- */
function initInsightPanel(chartId, insights, highlightFn){
  const body = document.getElementById(chartId+'-insight-body');
  if(!body) return;
  body.innerHTML = insights[0].html;

  document.querySelectorAll('.insight-btn[data-chart="'+chartId+'"]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const step = parseInt(btn.dataset.step,10);
      const insight = insights[step];
      if(!insight) return;

      document.querySelectorAll('.insight-btn[data-chart="'+chartId+'"]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');

      body.style.animation = 'none';
      body.offsetHeight;
      body.style.animation = 'insightFade 0.35s ease';
      body.innerHTML = insight.html;

      if(highlightFn) highlightFn(insight.highlight);
    });
  });
}


/* ---- Study Tab Switcher ---- */
function initStudyTabs(){
  const btns=document.querySelectorAll('.study-tab-btn');
  const panes=document.querySelectorAll('.study-pane');
  if(!btns.length) return;

  /* Track which studies have been rendered */
  const rendered={study1:false,study2:false,study3:false};
  const renderMap={
    study1:()=>{ renderFigure4(); initInsightPanel('fig4',FIG4_INSIGHTS,fig4Highlight); },
    study2:()=>{ renderFigure5(); initInsightPanel('fig5',FIG5_INSIGHTS,null); },
    study3:()=>{ renderFigure6(); initInsightPanel('fig6',FIG6_INSIGHTS,fig6Highlight); }
  };
  /* Chart containers per study (for Plotly resize) */
  const chartIds={
    study1:['fig4a','fig4b'],
    study2:['fig5a','fig5b'],
    study3:['fig6a','fig6b']
  };

  function activateStudy(studyId){
    btns.forEach(b=>b.classList.toggle('active',b.dataset.study===studyId));
    panes.forEach(p=>{
      const isActive=p.id===studyId;
      p.classList.toggle('active',isActive);
    });

    /* Render chart on first activation */
    if(!rendered[studyId] && renderMap[studyId]){
      renderMap[studyId]();
      rendered[studyId]=true;
    }

    /* Plotly needs resize after tab becomes visible */
    requestAnimationFrame(()=>{
      (chartIds[studyId]||[]).forEach(id=>{
        const el=document.getElementById(id);
        if(el && typeof Plotly!=='undefined') Plotly.Plots.resize(el);
      });
    });
  }

  btns.forEach(btn=>{
    btn.addEventListener('click',()=>activateStudy(btn.dataset.study));
  });

  /* Render Study 1 on load (it's the default active tab) */
  activateStudy('study1');
}

/* ---- Boot ---- */
HARMONIC.ready(()=>{
  function go(){
    if(typeof Plotly!=='undefined'){
      initStudyTabs();
    }
    else setTimeout(go,200);
  }
  go();
});
