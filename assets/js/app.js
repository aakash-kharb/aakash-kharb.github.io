(function(){
  'use strict';
  var root=document.documentElement;
  var $=function(s,c){return(c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var reduced=matchMedia('(prefers-reduced-motion: reduce)');
  var skinToggle=$('#skin-toggle'),themeToggle=$('#theme-toggle'),toastElement=$('#toast');
  var toastTimer,academicScroll=0,activeSection='top';
  // Toggled with data-research on <html> in index.html.
  var showResearch=root.dataset.research!=='off';
  function shown(el){return showResearch||!el.closest('.research-only')}

  // Content follows the September 2026 CV. `images` lists base names in
  // assets/img/work, built by tools/build-images.py. `link` is optional.
  var projects=[
    {title:'Chickpea Omics Explorer',kind:'Research platform · Capstone',description:'An ML-assisted transcriptomics and multi-omics exploration platform for chickpea (Cicer arietinum).',role:'Designed and deployed the platform, built SVM pipelines for housekeeping vs non-housekeeping gene prediction, and automated ETL across biological datasets.',stack:'Python, scikit-learn, Django, Google Cloud',link:'http://chickpea.mdu.ac.in',images:['coe-1','coe-2','coe-3']},
    {title:'Bank Database Management',kind:'Database application',description:'A Django application for managing customer records and passbooks, built to demonstrate relational database design.',role:'Designed a normalised schema with transactional integrity, selective indexing and versioned migrations.',stack:'Python, Django, MySQL',images:['bank-1','bank-2','bank-3']},
    {title:'TechWill × Olympics',kind:'Data & insight platform',description:'A cloud-integrated analytics platform for exploring Paris 2024 Olympic data in real time.',role:'Built the visualisations, medal-prediction logic and an AI chatbot for event insights.',stack:'Python, Streamlit, Gemini API, Google Cloud',link:'https://aakash-olympics.streamlit.app',images:['olympics-1','olympics-2','olympics-3']},
    {title:'TechWill × Docx',kind:'Document intelligence',description:'Real-time PDF summarisation with conversational Q&A and visual analytics.',role:'Built the summarisation and Q&A pipeline with NLP, visual analytics and cloud storage.',stack:'Python, Streamlit, Gemini API',link:'https://aakash-docx.streamlit.app',images:['docx-1','docx-2','docx-3']},
    {title:'Game Recommendation System',kind:'Recommender system',description:'A content-based game recommender built on Steam data.',role:'Implemented KNN and cosine-similarity models and an interactive app with cloud-hosted models.',stack:'Python, scikit-learn, Streamlit',link:'https://aakash-game.streamlit.app',images:['game-rec-1','game-rec-2','game-rec-3']}
  ];

  var publications=[
    {title:'Explainable AI in Transplant Medicine: Transforming Kidney Donor Matching and Graft Outcome Prediction',venue:'International Journal of Research in Medical Science & Technology (IJRMST)',detail:'Vol. 16, Jul–Dec 2023',year:'2023',doi:'10.37648/ijrmst.v16i01.018'},
    {title:'Benchmarking CNN, LSTM, GRU and Transformer Models for Twitter Sentiment Analysis',venue:'International Journal of Universal Science & Engineering (IJUSE)',detail:'Vol. 11, Issue 1, 2025',year:'2025'},
    {title:'A Survey of Big Data Approaches in Natural Language Formation and Computing Science',venue:'International Journal of Research in Science and Technology (IJRST)',detail:'Vol. 15, Issue 1, 2025',year:'2025',doi:'10.37648/ijrst.v15i01.007'},
    {title:'Generative AI for Risk Assessments: A Taxonomy Across Models, Lifecycles and Domains',venue:'International Journal of Technology, Science and Engineering (IJTSE)',detail:'Vol. 7, Issue IV, Oct–Dec 2024',year:'2024'},
    {title:'Developing a Smart, Integrated Irrigation System Using ML and IoT with KNN',venue:'International Journal of Technology, Science and Engineering (IJTSE)',detail:'Vol. 7, Issue I, Jan–Mar 2024',year:'2024'},
    {title:'ChickpeaOmicsExplorer (COE): An ML-assisted Multi-Omics Platform for Functional Genomics',venue:'Journal for Advanced Research',detail:'Manuscript under review',year:''},
    {title:'Deciphering the synergistic role of Serendipita indica and salicylic acid in arsenic stress tolerance of Ocimum sanctum using physio-biochemical analyses and machine learning',venue:'Manuscript',detail:'Under review',year:''}
  ];

  function toast(message){toastElement.textContent=message;toastElement.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){toastElement.classList.remove('show')},1600)}
  function currentTheme(){return root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
  function updateThemeColor(){$('meta[name="theme-color"]').content=getComputedStyle(document.body).backgroundColor}

  function activateTerminalView(view){
    $$('[data-terminal-view]').forEach(function(button){var on=button.dataset.terminalView===view;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on))});
    $$('[data-terminal-panel]').forEach(function(panel){panel.classList.toggle('active',panel.dataset.terminalPanel===view)});
    $('#terminal-output').textContent='';$('#terminal-output').classList.remove('error');
  }
  function sectionToTerminal(section){if(section==='work')return'work';if(section==='research'&&showResearch)return'research';if(section==='contact')return'contact';return'about'}
  function setSkin(next,silent){
    if(next===root.dataset.skin)return;
    if(next==='terminal'){academicScroll=scrollY;activateTerminalView(sectionToTerminal(activeSection))}
    root.dataset.skin=next;try{localStorage.setItem('portfolio-skin',next)}catch(error){}
    skinToggle.setAttribute('aria-pressed',String(next==='terminal'));skinToggle.setAttribute('aria-label','Switch to '+(next==='terminal'?'academic':'terminal')+' view');
    requestAnimationFrame(function(){var b=root.style.scrollBehavior;root.style.scrollBehavior='auto';scrollTo(0,next==='terminal'?0:academicScroll);root.style.scrollBehavior=b;updateThemeColor();updateScroll()});
    if(!silent)toast(next==='terminal'?'Terminal view':'Academic view');
  }
  function setTheme(next){root.dataset.theme=next;try{localStorage.setItem('portfolio-theme',next)}catch(error){}themeToggle.setAttribute('aria-pressed',String(next==='dark'));updateThemeColor();toast(next==='dark'?'Dark theme':'Light theme')}
  skinToggle.addEventListener('click',function(){setSkin(root.dataset.skin==='terminal'?'academic':'terminal')});
  themeToggle.addEventListener('click',function(){setTheme(currentTheme()==='dark'?'light':'dark')});
  skinToggle.setAttribute('aria-pressed',String(root.dataset.skin==='terminal'));skinToggle.setAttribute('aria-label','Switch to '+(root.dataset.skin==='terminal'?'academic':'terminal')+' view');themeToggle.setAttribute('aria-pressed',String(currentTheme()==='dark'));updateThemeColor();

  var menuToggle=$('#menu-toggle'),mobileNav=$('#mobile-nav');
  function closeMenu(){mobileNav.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation')}
  menuToggle.addEventListener('click',function(){var open=mobileNav.hidden;mobileNav.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
  $$('#mobile-nav a').forEach(function(link){link.addEventListener('click',closeMenu)});

  // The current section is the last one whose top has crossed a reading
  // line 30% down the viewport; at the very bottom it is always the last.
  var sections=$$('[data-section]').filter(shown),desktopLinks=$$('.primary-nav a'),scrollQueued=false;
  function updateScroll(){
    scrollQueued=false;if(root.dataset.skin==='terminal')return;
    var max=root.scrollHeight-innerHeight;
    var line=scrollY+innerHeight*.3,current=sections[0];
    sections.forEach(function(section){if(section.getBoundingClientRect().top+scrollY<=line)current=section});
    if(scrollY>=max-2)current=sections[sections.length-1];
    activeSection=current.dataset.section;
    desktopLinks.forEach(function(link){if(link.hash==='#'+activeSection)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  }
  function queueScroll(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll)}}
  addEventListener('scroll',queueScroll,{passive:true});
  addEventListener('resize',function(){if(innerWidth>768)closeMenu();queueScroll()});

  var revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;entry.target.classList.add('in');revealObserver.unobserve(entry.target)})},{rootMargin:'0px 0px -7%',threshold:.08});
  $$('.reveal').forEach(function(el){revealObserver.observe(el)});

  // Work. Every project's text is rendered once into the same grid cell, so
  // the detail is always as tall as the longest entry and switching projects
  // never moves the page below it. Only opacity animates.
  var projectList=$('#project-list'),texts=$('#project-texts'),image=$('#project-image'),thumbs=$('#project-thumbs'),projectLink=$('#project-link'),currentProject=-1,renderToken=0;
  projects.forEach(function(project,index){
    var button=document.createElement('button');button.className='project-row';button.type='button';button.dataset.project=index;button.setAttribute('aria-pressed','false');button.innerHTML='<b></b><small></small>';$('b',button).textContent=project.title;$('small',button).textContent=project.kind;projectList.appendChild(button);
    var text=document.createElement('div');text.className='project-text';text.setAttribute('aria-hidden','true');text.innerHTML='<div><p></p><h3></h3><p class="project-description"></p></div><dl><div><dt>My role</dt><dd></dd></div><div><dt>Built with</dt><dd></dd></div></dl>';
    var ps=$$('p',text),dds=$$('dd',text);ps[0].textContent=project.kind;$('h3',text).textContent=project.title;ps[1].textContent=project.description;dds[0].textContent=project.role;dds[1].textContent=project.stack;texts.appendChild(text);
  });

  // Each screenshot is built at 1600w, 800w and 200w (thumbs). Preloads use
  // the same srcset and sizes as the image, so they fetch the file shown.
  function file(name,width){return 'assets/img/work/'+name+'-'+width+'.webp'}
  function srcset(name){return file(name,800)+' 800w, '+file(name,1600)+' 1600w'}
  function warm(name){var im=new Image();im.sizes=image.sizes;im.srcset=srcset(name);im.src=file(name,800);return im}
  function renderImage(index){
    var token=++renderToken,project=projects[currentProject],name=project.images[index],preload=warm(name);
    // Cached images swap instantly; only a slow load dims the old one.
    var dim=setTimeout(function(){if(token===renderToken)image.style.opacity='.4'},120);
    function show(){if(token!==renderToken)return;clearTimeout(dim);image.srcset=srcset(name);image.src=file(name,800);image.alt=project.title+' screenshot '+(index+1);image.style.opacity='1'}
    preload.decode().then(show,show);
    $$('button',thumbs).forEach(function(button,i){var on=i===index;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on))});
  }
  function populateProject(index){
    index=(index+projects.length)%projects.length;if(index===currentProject)return;currentProject=index;var project=projects[index];
    $$('.project-text',texts).forEach(function(text,i){var on=i===index;text.classList.toggle('active',on);text.setAttribute('aria-hidden',String(!on))});
    $$('.project-row',projectList).forEach(function(button,i){var on=i===index;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on))});
    // A project without a link keeps the link's space, so the footer never changes height.
    var hasLink=Boolean(project.link);projectLink.classList.toggle('is-unavailable',!hasLink);projectLink.setAttribute('aria-hidden',String(!hasLink));projectLink.tabIndex=hasLink?0:-1;if(hasLink)projectLink.href=project.link;else projectLink.removeAttribute('href');
    thumbs.innerHTML='';thumbs.hidden=project.images.length<2;
    if(project.images.length>1)project.images.forEach(function(name,i){var button=document.createElement('button'),thumb=document.createElement('img');button.type='button';button.setAttribute('aria-label','Show '+project.title+' screenshot '+(i+1));thumb.src=file(name,200);thumb.width=200;thumb.height=115;thumb.decoding='async';thumb.alt='';button.appendChild(thumb);button.addEventListener('click',function(){renderImage(i)});thumbs.appendChild(button)});
    renderImage(0);project.images.slice(1).forEach(warm);
  }
  $$('.project-row',projectList).forEach(function(button){button.addEventListener('click',function(){
    populateProject(Number(button.dataset.project));
    // On phones the list is a horizontal strip; keep the chosen tab in view.
    if(projectList.scrollWidth>projectList.clientWidth)projectList.scrollTo({left:button.offsetLeft-projectList.offsetLeft-16,behavior:reduced.matches?'auto':'smooth'});
  })});
  $('#next-project').addEventListener('click',function(){populateProject(currentProject+1)});
  populateProject(0);
  // Once the page has settled, fetch every project's first screenshot and all
  // thumbs so later switches come from cache.
  addEventListener('load',function(){(window.requestIdleCallback||function(fn){setTimeout(fn,800)})(function(){projects.forEach(function(project){warm(project.images[0]);project.images.forEach(function(name){new Image().src=file(name,200)})})})});

  if(showResearch){
    var questionList=$('#question-list'),terminalResearch=$('#terminal-research-list');
    publications.forEach(function(paper,index){
      var open=index===0,item=document.createElement('article');item.className='question'+(open?' open':'');
      item.innerHTML='<button type="button"><b></b><small></small><i></i></button><div class="answer"><div><p></p><p><span></span></p></div></div>';
      var button=$('button',item),rows=$$('.answer p',item);button.setAttribute('aria-expanded',String(open));
      $('b',button).textContent=paper.title;$('small',button).textContent=paper.year||'In review';$('i',button).textContent=open?'−':'＋';
      rows[0].textContent=paper.venue;$('span',rows[1]).textContent=paper.detail;
      if(paper.doi){var doi=document.createElement('a');doi.href='https://doi.org/'+paper.doi;doi.target='_blank';doi.rel='noopener';doi.textContent='DOI ↗';rows[1].appendChild(doi)}
      questionList.appendChild(item);
      var li=document.createElement('li');li.innerHTML='<b></b><small></small>';$('b',li).textContent=paper.title;$('small',li).textContent=paper.year||'in review';terminalResearch.appendChild(li);
    });
    $$('.question>button').forEach(function(button){button.addEventListener('click',function(){var item=button.parentElement,open=!item.classList.contains('open');$$('.question').forEach(function(question){var on=question===item&&open,control=$('button',question);question.classList.toggle('open',on);control.setAttribute('aria-expanded',String(on));$('i',control).textContent=on?'−':'＋'})})});
  }
  sections=$$('[data-section]').filter(shown);updateScroll();

  function copyText(text){if(navigator.clipboard&&isSecureContext)return navigator.clipboard.writeText(text);var a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();return Promise.resolve()}
  $$('[data-copy]').forEach(function(button){button.addEventListener('click',function(){copyText(button.dataset.copy).then(function(){toast('Email copied')})})});

  // Terminal. The work list keeps its numbers because `open <n>` uses them.
  var terminalWorkList=$('#terminal-work-list'),count=projects.length;
  function openAcademicProject(index){populateProject(index);activeSection='work';setSkin('academic');requestAnimationFrame(function(){requestAnimationFrame(function(){$('#work').scrollIntoView({block:'start'})})})}
  projects.forEach(function(project,index){var button=document.createElement('button');button.type='button';button.innerHTML='<span></span><b></b><small></small><i>↗</i>';$('span',button).textContent=String(index+1);$('b',button).textContent=project.title;$('small',button).textContent=project.kind;button.addEventListener('click',function(){openAcademicProject(index)});terminalWorkList.appendChild(button)});
  $$('[data-terminal-view]').forEach(function(button){button.addEventListener('click',function(){activateTerminalView(button.dataset.terminalView);$('#terminal-input').focus()})});
  var views=['about','work'].concat(showResearch?['research']:[],['contact']);
  $('#terminal-help').textContent=views.join(' · ')+' · open 1–'+count;
  var terminalInput=$('#terminal-input'),terminalOutput=$('#terminal-output'),history=[],historyIndex=0,commands=['help'].concat(views,projects.map(function(p,i){return'open '+(i+1)}),['theme','academic','clear']);
  function message(text,error){terminalOutput.textContent=text;terminalOutput.classList.toggle('error',Boolean(error))}
  function runCommand(raw){var command=raw.trim().toLowerCase();if(!command)return;var parts=command.split(/\s+/),action=parts[0];if(action==='help')message(views.join(' · ')+' · open <1-'+count+'> · theme · academic · clear');else if(action==='about'||action==='whoami')activateTerminalView('about');else if(action==='work'||action==='ls')activateTerminalView('work');else if(action==='research'&&showResearch)activateTerminalView('research');else if(action==='contact')activateTerminalView('contact');else if(action==='open'){var n=parseInt(parts[1],10);if(n>=1&&n<=count)openAcademicProject(n-1);else message('Choose a project from 1 to '+count+'.',true)}else if(action==='theme'){themeToggle.click();message('Theme changed.')}else if(action==='academic'||action==='exit')setSkin('academic');else if(action==='clear')message('');else message('Unknown command. Type help.',true)}
  $('#terminal-command').addEventListener('submit',function(event){event.preventDefault();var command=terminalInput.value.trim();terminalInput.value='';if(!command)return;history.push(command);historyIndex=history.length;runCommand(command)});
  terminalInput.addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();$('#terminal-command').requestSubmit()}else if(event.key==='ArrowUp'){event.preventDefault();if(!history.length)return;historyIndex=Math.max(0,historyIndex-1);terminalInput.value=history[historyIndex]}else if(event.key==='ArrowDown'){event.preventDefault();if(!history.length)return;historyIndex=Math.min(history.length,historyIndex+1);terminalInput.value=history[historyIndex]||''}else if(event.key==='Tab'){var q=terminalInput.value.toLowerCase(),m=commands.filter(function(c){return c.indexOf(q)===0})[0];if(!m)return;event.preventDefault();terminalInput.value=m}});

  function updateClocks(){var text=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+' IST';['#local-clock','#terminal-clock'].forEach(function(selector){var el=$(selector);if(el)el.textContent=text})}
  updateClocks();setInterval(updateClocks,30000);
  document.addEventListener('keydown',function(event){var typing=/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||event.target.isContentEditable;if(event.key==='Escape')closeMenu();if(typing||event.metaKey||event.ctrlKey||event.altKey)return;if(event.key==='s'||event.key==='S'){event.preventDefault();skinToggle.click()}if(event.key==='t'||event.key==='T'){event.preventDefault();themeToggle.click()}});
})();
