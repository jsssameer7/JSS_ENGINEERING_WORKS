// Visitor Portal controller for JSS Engineering Works

let currentSessionUser;

document.addEventListener('DOMContentLoaded', () => {
  currentSessionUser = Auth.protectPage('visitor');
  if (currentSessionUser) {
    document.getElementById('visitor-name-display').innerText = currentSessionUser.name;
    initVisitorDashboard();
  }
});

function initVisitorDashboard() {
  renderVisitorLogs();
  renderPortfolioGrid();
}

// 1. Render Logged Visits and Gate Permits
function renderVisitorLogs() {
  const logs = DB.getVisitorLogs();
  const listContainer = document.getElementById('visitor-log-list');
  const badgeContainer = document.getElementById('gate-pass-badge-container');
  
  listContainer.innerHTML = '';
  badgeContainer.innerHTML = '';
  badgeContainer.style.display = 'none';

  // Filter logs registered by this visitor account
  const myLogs = logs.filter(v => v.signupUser === currentSessionUser.username);

  if (myLogs.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">No visit requests found. Schedule your first visit on the left!</div>`;
    return;
  }

  // Check if we have an approved visit to display a gate pass
  const approvedVisit = myLogs.find(v => v.status === 'Approved');

  myLogs.forEach(v => {
    let statusClass = 'badge-pending';
    if (v.status === 'Approved') statusClass = 'badge-completed';
    if (v.status === 'Denied') statusClass = 'badge-denied';

    const formattedDate = new Date(v.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

    const card = document.createElement('div');
    card.className = 'glass-panel';
    card.style.padding = '15px';
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';
    
    card.innerHTML = `
      <div style="flex: 1; padding-right: 15px;">
        <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-main);">${v.purpose}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
          ${v.org} &bull; ${formattedDate}
        </div>
      </div>
      <span class="badge ${statusClass}">
        <span class="badge-dot"></span>
        ${v.status}
      </span>
    `;
    listContainer.appendChild(card);
  });

  // Display the Gate Pass badge if approved!
  if (approvedVisit) {
    const formattedDate = new Date(approvedVisit.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    
    badgeContainer.style.display = 'block';
    badgeContainer.innerHTML = `
      <div style="border-top: 1px solid var(--border-color); margin-top: 20px; padding-top: 20px;">
        <h3 style="font-size: 1rem; color: var(--gold-primary); text-align: center; margin-bottom: 15px;">Active Site Entry Permit</h3>
        <div class="gate-pass">
          <div class="gate-pass-title">JSS Gate Entry Pass</div>
          <div class="gate-pass-body">
            <h4 style="font-size: 1.1rem; color: var(--text-main);">${approvedVisit.name}</h4>
            <div style="font-size: 0.8rem; color: var(--gold-light); margin-top: 4px; font-weight: 500;">
              ${approvedVisit.org}
            </div>
            
            <div class="qr-container">
              <div class="qr-simulated"></div>
            </div>
            
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
              Scheduled Arrival
            </div>
            <div style="font-size: 0.85rem; color: var(--text-main); font-weight: 600; margin-top: 2px;">
              ${formattedDate}
            </div>
          </div>
          <div style="font-size: 0.75rem; color: var(--status-success); font-weight: 600; text-transform: uppercase;">
            &bull; SAFETY INDUCTION COMPLETE &bull;
          </div>
          <button class="print-btn" onclick="printGatePass()">Print / Download Pass</button>
        </div>
      </div>
    `;
  }
}

// Print dialog helper
function printGatePass() {
  window.print();
}

// 2. Handle Visit Form Submission
function handleVisitSubmit(event) {
  event.preventDefault();
  const org = document.getElementById('visit-org').value;
  const time = document.getElementById('visit-time').value;
  const purpose = document.getElementById('visit-purpose').value;

  const request = {
    name: currentSessionUser.name,
    org: org,
    dateTime: time,
    purpose: purpose,
    signupUser: currentSessionUser.username
  };

  DB.addVisitorRequest(request);
  showAlert('Permit Requested', 'Your access request has been sent to JSS admin for approval.', 'success');

  // Reset form and reload UI
  event.target.reset();
  initVisitorDashboard();
}

// --- Dynamic Portfolio & Swipeable Lightbox Functions ---

const JSS_WORKS = [
  { img: 'assets/work1.jpg', title: 'Heavy Structural Steel Framework', badge: 'AWS D1.1', desc: 'Welding support trusses and crane girder structures. Double-pass MIG/FCAW beads inspected under full ultrasonic guidelines.', process: 'MIG / Flux-Cored' },
  { img: 'assets/work2.jpg', title: 'Corrugated Sheet Cladding Installation', badge: 'Industrial Spec', desc: 'Installation of high-quality corrugated metal sheets for wall cladding, alignment, and seal insulation.', process: 'Cladding Assembly' },
  { img: 'assets/work3.jpg', title: 'Industrial Shed Roof Assembly', badge: 'AWS D1.1', desc: 'Fabricating and lifting roofing truss structures for medium and large industrial warehouses.', process: 'SMAW Structural' },
  { img: 'assets/work4.jpg', title: 'Completed Roofing Cover', badge: 'Profile Roofing', desc: 'Finished corrugated profile roof sheets installed on factory building trusses, waterproof checked.', process: 'Profile Roofing' },
  { img: 'assets/work_5.jpg', title: 'Truss Roof Frame Assembly', badge: 'AWS D1.1', desc: 'High-strength steel truss frames assembled and aligned on site before primary columns installation.', process: 'MIG / TIG Tack' },
  { img: 'assets/work_6.jpg', title: 'Wall Corrugated Panel Installation', badge: 'Industrial Spec', desc: 'Corrugated sheeting installed on the warehouse side wall using weather-sealed self-tapping screws.', process: 'Siding Assembly' },
  { img: 'assets/work_7.jpg', title: 'Roof Support Structures', badge: 'API 650', desc: 'Purlins and support columns fabricated and aligned to bear heavy sheet loads.', process: 'MIG Welding' },
  { img: 'assets/work_8.jpg', title: 'Steel Framing Truss Structure', badge: 'AWS D1.1', desc: 'Welded steel trusses hoisted for large factory bay construction, certified double passes.', process: 'Flux-Cored Arc' },
  { img: 'assets/work_9.jpg', title: 'Factory Shed Roofing Installation', badge: 'ASME Sec IX', desc: 'Installing roof panels on factory columns, structural alignment checked.', process: 'Shed Construction' },
  { img: 'assets/work_10.jpg', title: 'Structural Columns and Purlins', badge: 'Safety Certified', desc: 'Primary structural vertical support columns welded and bolted to factory foundations.', process: 'Heavy Columns' },
  { img: 'assets/work_11.jpg', title: 'Completed Roofing Cover Assembly', badge: 'Industrial Spec', desc: 'Full shed roofing overlay completed and inspected for quality bead alignment.', process: 'Roof Cladding' },
  { img: 'assets/work_12.jpg', title: 'Heavy Fabrication and Truss Alignment', badge: 'AWS D1.1', desc: 'Welders aligning support girders using overhead cranes. WPS specs followed.', process: 'Heavy Assembly' },
  { img: 'assets/work_13.jpg', title: 'Welded Roof Truss Framework', badge: 'ASME Sec IX', desc: 'Closer view of completed structural truss welding joints, visual quality inspected.', process: 'MIG Welded cap' },
  { img: 'assets/work_14.jpg', title: 'Industrial Fabrication Site Work', badge: 'Safety Certified', desc: 'Fabricators assembling portal frames, horizontal trusses, and side braces on site.', process: 'Site Fabrication' }
];

let activeLightboxIndex = 0;

function renderPortfolioGrid() {
  const grid = document.getElementById('portfolio-showcase-grid');
  grid.innerHTML = '';

  JSS_WORKS.forEach((w, index) => {
    const card = document.createElement('div');
    card.className = 'glass-panel portfolio-card';
    card.style.cursor = 'pointer';
    card.onclick = () => openLightbox(index);

    card.innerHTML = `
      <div class="portfolio-img">
        <img src="${w.img}" class="portfolio-img-cover" alt="${w.title}">
        <span class="portfolio-badge">${w.badge}</span>
      </div>
      <div class="portfolio-body">
        <div>
          <h3>${w.title}</h3>
          <p>${w.desc}</p>
        </div>
        <div style="font-size: 0.75rem; color: var(--gold-light); margin-top: 10px;">${w.process}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openLightbox(index) {
  activeLightboxIndex = index;
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  img.src = JSS_WORKS[index].img;
  caption.innerText = `${JSS_WORKS[index].title} (${index + 1} of ${JSS_WORKS.length})`;
  
  modal.style.display = 'flex';
  modal.classList.add('show');
}

function closeLightbox(event) {
  const modal = document.getElementById('lightbox-modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 100);
}

function navigateLightbox(direction, event) {
  if (event) event.stopPropagation();
  activeLightboxIndex = (activeLightboxIndex + direction + JSS_WORKS.length) % JSS_WORKS.length;
  
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  // Fade transition effect
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = JSS_WORKS[activeLightboxIndex].img;
    caption.innerText = `${JSS_WORKS[activeLightboxIndex].title} (${activeLightboxIndex + 1} of ${JSS_WORKS.length})`;
    img.style.opacity = '1';
  }, 150);
}

// Swipe Gesture Listeners for Touch Screens
let touchStartX = 0;
let touchEndX = 0;

function handleSwipeGesture() {
  if (touchEndX < touchStartX - 50) {
    navigateLightbox(1); // Swipe left -> next image
  }
  if (touchEndX > touchStartX + 50) {
    navigateLightbox(-1); // Swipe right -> prev image
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    modal.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    }, { passive: true });
  }

  // Keyboard navigation support
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('lightbox-modal');
    if (modal && modal.classList.contains('show')) {
      if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    }
  });
});

// Video Carousel switcher inside visitor dashboard
let activeVideoIdx = 0;
const videoSlides = document.querySelectorAll('.video-slide');

function navigateVideo(direction) {
  if (videoSlides.length === 0) return;
  
  // Pause currently playing video
  const currentVideo = videoSlides[activeVideoIdx].querySelector('video');
  if (currentVideo) currentVideo.pause();

  videoSlides[activeVideoIdx].style.display = 'none';
  videoSlides[activeVideoIdx].classList.remove('active');

  activeVideoIdx = (activeVideoIdx + direction + videoSlides.length) % videoSlides.length;

  videoSlides[activeVideoIdx].style.display = 'block';
  videoSlides[activeVideoIdx].classList.add('active');
}

// Touch Swipe Support for video carousel in visitor dashboard
document.addEventListener('DOMContentLoaded', () => {
  const videoCarousel = document.getElementById('video-carousel');
  if (videoCarousel) {
    let videoTouchStartX = 0;
    let videoTouchEndX = 0;
    
    videoCarousel.addEventListener('touchstart', e => {
      videoTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    videoCarousel.addEventListener('touchend', e => {
      videoTouchEndX = e.changedTouches[0].screenX;
      if (videoTouchEndX < videoTouchStartX - 50) navigateVideo(1); // Swiped left -> next
      if (videoTouchEndX > videoTouchStartX + 50) navigateVideo(-1); // Swiped right -> prev
    }, { passive: true });
  }
});
