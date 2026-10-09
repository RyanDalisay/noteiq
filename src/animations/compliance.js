/* =====================================================================
   NoteIQ — Guided Compliance animation
   Flagged checklist items lift → get checked off → pan to Completion Overview → ring climbs
   Mount: add  data-niq-anim="compliance"  to an empty Div Block in Webflow.
   Needs GSAP 3 (uses the site's copy if present, else shares one copy from cdnjs).
   ===================================================================== */
(function () {
    'use strict';

    /* ---- component markup ---- */
    var GC_LABEL = "Animated walkthrough of NoteIQ guided compliance on a tablet: a patient's admission checklist flags three documents that need signatures, each is checked off, and the chart's completion overview climbs as the gaps close.";
    var GC_MARKUP = "<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\">\n      <symbol id=\"gc-i-dash\" viewBox=\"0 0 24 24\"><rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\"/><rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\"/></symbol>\n      <symbol id=\"gc-i-chsq\" viewBox=\"0 0 24 24\"><path d=\"M9 11l3 3L22 4\"/><path d=\"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"/></symbol>\n      <symbol id=\"gc-i-users\" viewBox=\"0 0 24 24\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></symbol>\n      <symbol id=\"gc-i-panel\" viewBox=\"0 0 24 24\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/><path d=\"m16 15-3-3 3-3\"/></symbol>\n      <symbol id=\"gc-i-search\" viewBox=\"0 0 24 24\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.35-4.35\"/></symbol>\n      <symbol id=\"gc-i-cdown\" viewBox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\"/></symbol>\n      <symbol id=\"gc-i-cup\" viewBox=\"0 0 24 24\"><path d=\"m18 15-6-6-6 6\"/></symbol>\n      <symbol id=\"gc-i-cleft\" viewBox=\"0 0 24 24\"><path d=\"m15 18-6-6 6-6\"/></symbol>\n      <symbol id=\"gc-i-cright2\" viewBox=\"0 0 24 24\"><path d=\"m6 17 5-5-5-5\"/><path d=\"m13 17 5-5-5-5\"/></symbol>\n      <symbol id=\"gc-i-aleft\" viewBox=\"0 0 24 24\"><path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/></symbol>\n      <symbol id=\"gc-i-aright\" viewBox=\"0 0 24 24\"><path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/></symbol>\n      <symbol id=\"gc-i-user\" viewBox=\"0 0 24 24\"><path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></symbol>\n      <symbol id=\"gc-i-clip\" viewBox=\"0 0 24 24\"><rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"m9 14 2 2 4-4\"/></symbol>\n      <symbol id=\"gc-i-folder\" viewBox=\"0 0 24 24\"><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/></symbol>\n      <symbol id=\"gc-i-steth\" viewBox=\"0 0 24 24\"><path d=\"M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3\"/><path d=\"M8 15v1a6 6 0 0 0 12 0v-4\"/><circle cx=\"20\" cy=\"10\" r=\"2\"/></symbol>\n      <symbol id=\"gc-i-heart\" viewBox=\"0 0 24 24\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/><path d=\"M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\"/></symbol>\n      <symbol id=\"gc-i-file\" viewBox=\"0 0 24 24\"><path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/></symbol>\n      <symbol id=\"gc-i-filechk\" viewBox=\"0 0 24 24\"><path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"m9 15 2 2 4-4\"/></symbol>\n      <symbol id=\"gc-i-ucog\" viewBox=\"0 0 24 24\"><circle cx=\"18\" cy=\"15\" r=\"3\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M10 15H6a4 4 0 0 0-4 4v2\"/><path d=\"m21.7 16.4-.9-.3M15.2 13.9l-.9-.3M16.6 18.7l.3-.9M19.1 12.2l.3-.9M19.6 18.7l-.4-1M16.8 12.3l-.4-1M14.3 16.6l1-.4M20.7 13.8l1-.4\"/></symbol>\n      <symbol id=\"gc-i-mic\" viewBox=\"0 0 24 24\"><path d=\"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><path d=\"M12 19v3\"/></symbol>\n      <symbol id=\"gc-i-pause\" viewBox=\"0 0 24 24\"><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/></symbol>\n      <symbol id=\"gc-i-rot\" viewBox=\"0 0 24 24\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/></symbol>\n      <symbol id=\"gc-i-spark\" viewBox=\"0 0 24 24\"><path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\"/><path d=\"M20 3v4M22 5h-4\"/></symbol>\n      <symbol id=\"gc-i-tri\" viewBox=\"0 0 24 24\"><path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4M12 17h.01\"/></symbol>\n      <symbol id=\"gc-i-info\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4M12 8h.01\"/></symbol>\n      <symbol id=\"gc-i-check\" viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"/></symbol>\n      <symbol id=\"gc-i-ccheck\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m9 12 2 2 4-4\"/></symbol>\n      <symbol id=\"gc-i-save\" viewBox=\"0 0 24 24\"><path d=\"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\"/><path d=\"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7\"/><path d=\"M7 3v4a1 1 0 0 0 1 1h7\"/></symbol>\n    <symbol id=\"gc-i-menu\" viewBox=\"0 0 24 24\"><path d=\"M4 6h16M4 12h16M4 18h16\"/></symbol>\n      <symbol id=\"gc-i-bell\" viewBox=\"0 0 24 24\"><path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"/></symbol>\n    </svg>\n<div class=\"gc-stage\"><div class=\"gc-screen\"><div class=\"gc-app\">\n  <div class=\"gc-top\" data-dim=\"1 2\"><svg class=\"gc-mark\" viewBox=\"0 0 245 249\" aria-hidden=\"true\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M5.12605 82.3662C6.47173 81.8625 7.92991 81.7367 9.34187 82.002L25.4151 85.0586C26.8558 85.3294 28.1932 85.9971 29.2764 86.9863C30.3597 87.9756 31.1468 89.2481 31.5489 90.6602L58.6651 186.178C59.6864 189.777 61.5652 193.073 64.1397 195.784C66.7143 198.495 69.9079 200.538 73.4454 201.739L211.18 248.539L68.2882 221.377C64.6187 220.679 61.1727 219.099 58.2471 216.773C55.3217 214.447 53.0037 211.445 51.4923 208.023L0.672929 92.96C0.0924779 91.6437 -0.11853 90.193 0.0635542 88.7656C0.245699 87.3384 0.813992 85.988 1.70613 84.8604C2.5983 83.7327 3.78056 82.8699 5.12605 82.3662ZM47.9952 41.3828C49.4114 41.1414 50.8672 41.292 52.2042 41.8184L67.4259 47.833C68.786 48.372 69.9698 49.2788 70.8458 50.4521C71.7217 51.6255 72.2552 53.0193 72.3868 54.4785L81.17 153.397C81.5004 157.123 82.7296 160.713 84.7511 163.858C86.7728 167.004 89.5277 169.611 92.7774 171.454L219.344 243.26L84.0528 189.767C80.5806 188.396 77.4923 186.201 75.0528 183.372C72.6133 180.543 70.8955 177.162 70.047 173.521L41.6329 50.9492C41.3098 49.5471 41.3747 48.0825 41.8214 46.7148C42.268 45.3474 43.0793 44.1281 44.1671 43.1885C45.255 42.2488 46.579 41.6242 47.9952 41.3828ZM97.0675 13.3945C97.0675 4.61874 106.901 -0.553482 114.114 4.43066L219.248 77.1211C221.559 78.7172 223.448 80.8522 224.753 83.3418C226.058 85.8313 226.738 88.6014 226.737 91.4131V180.338L242.509 191.243C243.114 191.658 243.611 192.215 243.954 192.864C244.298 193.514 244.479 194.238 244.482 194.973V206.381C244.478 206.867 244.342 207.342 244.089 207.757C243.836 208.171 243.475 208.508 243.045 208.732C242.615 208.957 242.132 209.06 241.648 209.03C241.164 209 240.697 208.838 240.298 208.562L226.752 199.199V214.555C226.752 223.33 216.918 228.502 209.705 223.515L104.557 150.831C102.246 149.235 100.356 147.101 99.0518 144.611C97.7472 142.122 97.0665 139.352 97.0675 136.54V13.3945ZM120.565 33.874C119.974 33.8383 119.385 33.9642 118.861 34.2393C118.338 34.5144 117.898 34.9278 117.592 35.4346C117.285 35.9414 117.123 36.5227 117.122 37.1152V126.007C117.122 128.818 117.803 131.586 119.107 134.075C120.412 136.564 122.301 138.698 124.611 140.294L201.597 193.521C202.084 193.858 202.653 194.055 203.244 194.091C203.835 194.127 204.424 193.999 204.948 193.724C205.472 193.448 205.911 193.034 206.217 192.526C206.523 192.019 206.683 191.437 206.683 190.845L206.694 185.336L196.164 178.07C195.56 177.653 195.067 177.095 194.726 176.444C194.385 175.794 194.207 175.069 194.207 174.334V162.94C194.204 162.452 194.334 161.972 194.584 161.553C194.834 161.133 195.194 160.791 195.625 160.562C196.056 160.334 196.542 160.228 197.028 160.257C197.515 160.286 197.986 160.448 198.387 160.726L206.694 166.467V101.957C206.695 99.1453 206.014 96.3753 204.709 93.8857C203.404 91.3963 201.515 89.2621 199.204 87.666L122.212 34.4424C121.725 34.1061 121.155 33.9097 120.565 33.874ZM135.844 117.97C136.331 117.998 136.801 118.16 137.202 118.438L181.324 148.944C181.931 149.361 182.428 149.92 182.772 150.571C183.115 151.223 183.295 151.948 183.297 152.685V164.078C183.296 164.565 183.162 165.043 182.91 165.459C182.658 165.875 182.298 166.215 181.867 166.441C181.437 166.668 180.952 166.772 180.467 166.742C179.982 166.713 179.514 166.551 179.113 166.274L134.976 135.782C134.373 135.364 133.879 134.806 133.538 134.155C133.197 133.505 133.019 132.781 133.019 132.046V120.653C133.016 120.165 133.147 119.685 133.398 119.266C133.648 118.847 134.008 118.504 134.44 118.275C134.871 118.047 135.357 117.941 135.844 117.97ZM135.844 86.4961C136.331 86.5248 136.801 86.6865 137.202 86.9639L188.84 122.662C189.444 123.08 189.938 123.637 190.278 124.288C190.619 124.939 190.797 125.664 190.797 126.398V137.791C190.8 138.28 190.669 138.76 190.418 139.179C190.167 139.598 189.807 139.941 189.376 140.169C188.945 140.397 188.46 140.503 187.973 140.475C187.486 140.446 187.016 140.284 186.614 140.007L134.976 104.309C134.372 103.891 133.879 103.333 133.538 102.683C133.197 102.032 133.019 101.307 133.019 100.572V89.1797C133.016 88.6912 133.147 88.2111 133.398 87.792C133.648 87.3729 134.008 87.0301 134.44 86.8018C134.871 86.5734 135.357 86.4674 135.844 86.4961ZM135.844 55.0889C136.331 55.1176 136.801 55.2793 137.202 55.5566L188.84 91.2539C189.444 91.6716 189.937 92.2301 190.278 92.8809C190.619 93.5316 190.797 94.2554 190.797 94.9902V106.369C190.8 106.858 190.669 107.338 190.418 107.757C190.167 108.176 189.807 108.519 189.376 108.747C188.945 108.975 188.46 109.08 187.973 109.052C187.486 109.023 187.016 108.861 186.614 108.584L134.976 72.8867C134.372 72.4691 133.879 71.9105 133.538 71.2598C133.197 70.609 133.019 69.8853 133.019 69.1504V57.7715C133.016 57.2829 133.147 56.803 133.398 56.3838C133.648 55.9647 134.008 55.6219 134.44 55.3936C134.871 55.1652 135.357 55.0602 135.844 55.0889ZM56.5128 0C65.2535 0.000179141 72.3389 7.0981 72.3389 15.8535C72.3388 24.6088 65.2535 31.7069 56.5128 31.707C47.7719 31.707 40.6858 24.6089 40.6856 15.8535C40.6856 7.09799 47.7719 0 56.5128 0Z\" fill=\"#5D3FD3\"></path>\n</svg>\n    <div class=\"gc-search\"><svg class=\"ic\"><use href=\"#gc-i-search\"/></svg>Search patients, records\u2026</div>\n    <span class=\"gc-bell\"><svg class=\"ic\"><use href=\"#gc-i-bell\"/></svg></span>\n    <div class=\"gc-user\"><span class=\"sk d\" style=\"width:80px\"></span><span class=\"sk\" style=\"width:52px\"></span></div>\n    <span class=\"gc-ava\"></span>\n  </div>\n  <div class=\"gc-grail\" data-dim=\"1 2\">\n    <span class=\"it\" style=\"top:10px\"><svg class=\"ic\"><use href=\"#gc-i-dash\"/></svg></span>\n    <span class=\"it\" style=\"top:50px\"><svg class=\"ic\"><use href=\"#gc-i-chsq\"/></svg></span>\n    <span class=\"it on\" style=\"top:90px\"><svg class=\"ic\"><use href=\"#gc-i-users\"/></svg></span>\n  </div>\n  <div class=\"gc-crumb\" data-dim=\"1 2\"><svg class=\"ic\"><use href=\"#gc-i-aleft\"/></svg>Back to Patient List<em>/ Maria Santos</em>\n    <span class=\"tz\"><span class=\"sk\" style=\"width:110px\"></span><span class=\"sk d\" style=\"width:110px\"></span></span></div>\n  <div class=\"gc-head\" data-dim=\"1 2\">\n    <div class=\"gc-pav\">MS</div>\n    <div class=\"gc-pname\"><b>Maria Santos</b><span class=\"gc-active\">Active</span></div>\n    <div class=\"gc-pmeta\"><span class=\"sk\" style=\"width:76px\"></span><span class=\"sk\" style=\"width:150px\"></span><span class=\"sk\" style=\"width:84px\"></span></div>\n    <div class=\"gc-pedit\"><span class=\"sk\" style=\"width:62px\"></span></div>\n    <div class=\"gc-pgrid\">\n      <div><span class=\"sk\" style=\"width:30px\"></span><span class=\"sk d\" style=\"width:150px\"></span></div>\n      <div><span class=\"sk\" style=\"width:22px\"></span><span class=\"sk d\" style=\"width:190px\"></span></div>\n      <div><span class=\"sk\" style=\"width:84px\"></span><span class=\"sk d\" style=\"width:130px\"></span></div>\n      <div><span class=\"sk\" style=\"width:22px\"></span><span class=\"sk d\" style=\"width:120px\"></span></div>\n    </div>\n  </div>\n  <div class=\"gc-prail\" data-dim=\"1 2\">\n    <span class=\"it\" style=\"top:14px\"><svg class=\"ic\"><use href=\"#gc-i-user\"/></svg></span>\n    <span class=\"it on\" style=\"top:54px\"><svg class=\"ic\"><use href=\"#gc-i-clip\"/></svg></span>\n    <span class=\"it\" style=\"top:94px\"><svg class=\"ic\"><use href=\"#gc-i-folder\"/></svg></span>\n    <span class=\"it\" style=\"top:134px\"><svg class=\"ic\"><use href=\"#gc-i-steth\"/></svg></span>\n    <span class=\"it\" style=\"top:174px\"><svg class=\"ic\"><use href=\"#gc-i-heart\"/></svg></span>\n    <span class=\"it\" style=\"top:214px\"><svg class=\"ic\"><use href=\"#gc-i-file\"/></svg></span>\n    <span class=\"it\" style=\"top:254px\"><svg class=\"ic\"><use href=\"#gc-i-ucog\"/></svg></span>\n  </div>\n  <div class=\"gc-tabs\" data-dim=\"1 2\"><span class=\"gc-tab\">Patient Admission</span><span class=\"sk\" style=\"width:104px\"></span><span class=\"sk\" style=\"width:76px\"></span><span class=\"sk\" style=\"width:74px\"></span><span class=\"sk\" style=\"width:120px\"></span></div>\n\n  <div class=\"gc-card gc-chk\" data-dim=\"2\">\n    <div class=\"gc-chk-hd\" data-dim=\"1\">\n      <h3>Patient Admission</h3>\n      <span class=\"gc-stack\" style=\"margin-bottom:11px\"><span class=\"gc-badge w gc-bd-a\">40% \u00b7 2 of 5 completed</span><span class=\"gc-badge g gc-bd-b\">100% \u00b7 5 of 5 completed</span></span>\n      <span class=\"sk\" style=\"width:280px\"></span><span class=\"sk\" style=\"width:210px\"></span>\n    </div>\n    <div class=\"gc-flag gc-lift\">\n      <div class=\"gc-row\"><span class=\"gc-stack icw\"><svg class=\"ic ic-a\"><use href=\"#gc-i-ccheck\"/></svg><span class=\"ic-b\"><svg class=\"ic\"><use href=\"#gc-i-check\"/></svg></span></span>\n<div class=\"main\"><div class=\"nm\">Benefit Election Statement</div><div class=\"st gc-stack\"><span class=\"w\"><svg class=\"ic\"><use href=\"#gc-i-info\"/></svg>Needs signatures</span><span class=\"g\"><svg class=\"ic\"><use href=\"#gc-i-filechk\"/></svg>Completed today</span></div></div>\n<div class=\"lk gc-stack\"><span class=\"a\">Complete now<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span><span class=\"b\">Open details<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span></div></div>\n      <div class=\"gc-row\"><span class=\"gc-stack icw\"><svg class=\"ic ic-a\"><use href=\"#gc-i-ccheck\"/></svg><span class=\"ic-b\"><svg class=\"ic\"><use href=\"#gc-i-check\"/></svg></span></span>\n<div class=\"main\"><div class=\"nm\">Notice of Non-Covered Items</div><div class=\"st gc-stack\"><span class=\"w\"><svg class=\"ic\"><use href=\"#gc-i-info\"/></svg>Needs signatures</span><span class=\"g\"><svg class=\"ic\"><use href=\"#gc-i-filechk\"/></svg>Completed today</span></div></div>\n<div class=\"lk gc-stack\"><span class=\"a\">Complete now<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span><span class=\"b\">Open details<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span></div></div>\n      <div class=\"gc-row\"><span class=\"gc-stack icw\"><svg class=\"ic ic-a\"><use href=\"#gc-i-ccheck\"/></svg><span class=\"ic-b\"><svg class=\"ic\"><use href=\"#gc-i-check\"/></svg></span></span>\n<div class=\"main\"><div class=\"nm\">Face-to-Face Encounter Signatures</div><div class=\"st gc-stack\"><span class=\"w\"><svg class=\"ic\"><use href=\"#gc-i-info\"/></svg>Needs signatures</span><span class=\"g\"><svg class=\"ic\"><use href=\"#gc-i-filechk\"/></svg>Completed today</span></div></div>\n<div class=\"lk gc-stack\"><span class=\"a\">Complete now<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span><span class=\"b\">Open details<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span></div></div>\n    </div>\n    <div class=\"gc-rest\" data-dim=\"1\">\n      <div class=\"gc-row\"><span class=\"icw\"><span class=\"ic-b\"><svg class=\"ic\"><use href=\"#gc-i-check\"/></svg></span></span>\n<div class=\"main\"><div class=\"nm\">Attending Physician</div><div class=\"st\"><span class=\"g\"><svg class=\"ic\"><use href=\"#gc-i-filechk\"/></svg><span class=\"sk\" style=\"width:92px;background:#CDEFE6\"></span></span></div></div>\n<div class=\"lk\"><span>Open details<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span></div></div>\n      <div class=\"gc-row\"><span class=\"icw\"><span class=\"ic-b\"><svg class=\"ic\"><use href=\"#gc-i-check\"/></svg></span></span>\n<div class=\"main\"><div class=\"nm\">Patient Clinical Data</div><div class=\"st\"><span class=\"g\"><svg class=\"ic\"><use href=\"#gc-i-filechk\"/></svg><span class=\"sk\" style=\"width:92px;background:#CDEFE6\"></span></span></div></div>\n<div class=\"lk\"><span>Open details<svg class=\"ic\"><use href=\"#gc-i-aright\"/></svg></span></div></div>\n    </div>\n  </div>\n  <div class=\"gc-card gc-next\" data-dim=\"1 2\">\n    <div class=\"gc-chk-hd\"><span class=\"sk d\" style=\"width:150px;height:11px;margin-bottom:11px\"></span><span class=\"sk\" style=\"width:110px;height:20px;border-radius:10px;background:var(--gc-warn-bg);margin-bottom:11px\"></span><span class=\"sk\" style=\"width:260px\"></span></div>\n    <div class=\"gc-row\"><span class=\"gc-hol\"></span><div class=\"main\"><span class=\"sk d\" style=\"width:130px;height:9px\"></span><span class=\"sk\" style=\"width:100px;margin-top:10px\"></span></div><span class=\"sk\" style=\"width:70px;margin-top:4px;background:#DDD6FE\"></span></div><div class=\"gc-row\"><span class=\"gc-hol\"></span><div class=\"main\"><span class=\"sk d\" style=\"width:160px;height:9px\"></span><span class=\"sk\" style=\"width:110px;margin-top:10px\"></span></div><span class=\"sk\" style=\"width:70px;margin-top:4px;background:#DDD6FE\"></span></div><div class=\"gc-row\"><span class=\"gc-hol\"></span><div class=\"main\"><span class=\"sk d\" style=\"width:110px;height:9px\"></span><span class=\"sk\" style=\"width:90px;margin-top:10px\"></span></div><span class=\"sk\" style=\"width:70px;margin-top:4px;background:#DDD6FE\"></span></div>\n  </div>\n\n  <div class=\"gc-card gc-ov gc-lift\" data-dim=\"1\">\n    <h4>Completion Overview</h4>\n    <div class=\"gc-ringrow\">\n      <div class=\"gc-ring\"><svg viewBox=\"0 0 58 58\"><circle cx=\"29\" cy=\"29\" r=\"24\" fill=\"none\" stroke=\"#EEF1F6\" stroke-width=\"7\"/><circle class=\"gc-arc\" cx=\"29\" cy=\"29\" r=\"24\" fill=\"none\" stroke=\"#07BE9F\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-dasharray=\"150.8\" stroke-dashoffset=\"150.8\"/></svg><b class=\"gc-pct\">27%</b></div>\n      <div><div class=\"gc-stack gc-ring-t\"><span class=\"gc-rt-a\">27 items still to complete</span><span class=\"gc-rt-b\">24 items still to complete</span></div><span class=\"sk\" style=\"width:120px\"></span></div>\n    </div>\n    <div class=\"gc-srow\"><div class=\"top\"><span class=\"sk d\" style=\"width:104px\"></span></div><div class=\"bt\"><span class=\"gc-strk\"><i class=\"gc-adm\" style=\"background:#DFAB51\" data-w=\"40\"></i></span><span class=\"sk\" style=\"width:48px\"></span></div></div><div class=\"gc-srow\"><div class=\"top\"><span class=\"sk d\" style=\"width:118px\"></span></div><div class=\"bt\"><span class=\"gc-strk\"><i class=\"\" style=\"background:#DFAB51\" data-w=\"38\"></i></span><span class=\"sk\" style=\"width:48px\"></span></div></div><div class=\"gc-srow\"><div class=\"top\"><span class=\"sk d\" style=\"width:90px\"></span></div><div class=\"bt\"><span class=\"gc-strk\"><i class=\"\" style=\"background:#EF4444\" data-w=\"23\"></i></span><span class=\"sk\" style=\"width:48px\"></span></div></div><div class=\"gc-srow\"><div class=\"top\"><span class=\"sk d\" style=\"width:80px\"></span></div><div class=\"bt\"><span class=\"gc-strk\"><i class=\"\" style=\"\" data-w=\"0\"></i></span><span class=\"sk\" style=\"width:48px\"></span></div></div><div class=\"gc-srow\"><div class=\"top\"><span class=\"sk d\" style=\"width:120px\"></span></div><div class=\"bt\"><span class=\"gc-strk\"><i class=\"\" style=\"\" data-w=\"0\"></i></span><span class=\"sk\" style=\"width:48px\"></span></div></div>\n    <div style=\"height:6px\"></div>\n  </div>\n</div></div></div>";

    /* ---- animation ---- */
    function gcInit(root) {
        if (root.classList.contains('gc-ready')) return;
        root.classList.add('gc-ready');
        var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
        var LIFT_ON = '0 26px 52px -16px rgba(30,41,60,0.30), 0 8px 18px -8px rgba(30,41,60,0.16)';
        var LIFT_OFF = '0 0 0 0 rgba(30,41,60,0), 0 0 0 0 rgba(30,41,60,0)';
        var MOVE = 'power3.inOut', C = 150.8;
        var tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'power3.out' } });
        function dim(n, p) { tl.to($$('[data-dim~="' + n + '"]'), { opacity: .32, duration: .55, ease: 'power2.out' }, p); }
        function undim(n, p) { tl.to($$('[data-dim~="' + n + '"]'), { opacity: 1, duration: .5, ease: 'power2.out' }, p); }
        function lift(el, p, s) { tl.to(el, { y: -6, scale: s, boxShadow: LIFT_ON, duration: .7 }, p); }
        function drop(el, p) { tl.to(el, { y: 0, scale: 1, boxShadow: LIFT_OFF, duration: .55, ease: MOVE }, p); }
        function count(el, from, to, p, d, fmt) { var o = { v: from }; tl.to(o, { v: to, duration: d, ease: 'power2.out', onUpdate: function () { el.textContent = fmt(o.v); } }, p); }

        var screen = $('.gc-screen'), chk = $('.gc-chk'), next = $('.gc-next'), ov = $('.gc-ov'), flag = $('.gc-flag');
        var fRows = $$('.gc-flag .gc-row'), rows = $$('.gc-chk .gc-row'), arc = $('.gc-arc'), pct = $('.gc-pct'), bars = $$('.gc-strk i');
        var PAN = -203;   // artboard px the screen slides left to reveal the overview

        tl.set([$('.gc-bd-b'), $('.gc-rt-b')].concat($$('.gc-flag .ic-b, .gc-flag .st .g, .gc-flag .lk .b')), { autoAlpha: 0 }, 0);

        /* ---- build ---- */
        tl.fromTo([chk, ov, next], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .1 }, .15);
        tl.fromTo([$('.gc-chk-hd')].concat(rows), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .55, stagger: .06 }, .35);
        tl.fromTo(arc, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - .27), duration: 1.1, ease: 'power2.out' }, .6);
        count(pct, 0, 27, .6, 1.1, function (v) { return Math.round(v) + '%'; });
        bars.forEach(function (b, i) { tl.fromTo(b, { width: '0%' }, { width: b.dataset.w + '%', duration: .9, ease: 'power2.out' }, .7 + i * .07); });

        /* ---- 1. flagged items lift, then get checked off ---- */
        tl.addLabel('hl1', 1.7);
        dim('1', 'hl1'); lift(flag, 'hl1', 1.03);
        tl.fromTo($$('.gc-flag .st .w'), { opacity: 1 }, { opacity: .45, duration: .45, repeat: 1, yoyo: true, ease: 'sine.inOut', stagger: .1 }, 'hl1+=.5');
        fRows.forEach(function (r, i) {
            var at = 3.1 + i * .4;
            tl.to(r.querySelector('.ic-a'), { autoAlpha: 0, scale: .6, duration: .2 }, at);
            tl.fromTo(r.querySelector('.ic-b'), { autoAlpha: 0, scale: .4 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(2.2)' }, at);
            tl.to(r.querySelector('.st .w'), { autoAlpha: 0, y: -6, duration: .25 }, at);
            tl.fromTo(r.querySelector('.st .g'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .35 }, at + .1);
            tl.to(r.querySelector('.lk .a'), { autoAlpha: 0, duration: .2 }, at);
            tl.fromTo(r.querySelector('.lk .b'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, at + .1);
        });
        drop(flag, 4.6); undim('1', 4.6);
        tl.to($('.gc-bd-a'), { autoAlpha: 0, duration: .3 }, 4.8);
        tl.fromTo($('.gc-bd-b'), { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(2)' }, 4.85);

        /* ---- 2. pan to the overview; the chart climbs ---- */
        tl.addLabel('pan', 5.2);
        tl.to(screen, { x: PAN, duration: 1.1, ease: MOVE }, 'pan');
        tl.addLabel('hl2', 'pan+=1.0');
        dim('2', 'hl2'); lift(ov, 'hl2', 1.035);
        tl.to(arc, { strokeDashoffset: C * (1 - .35), duration: 1, ease: 'power2.inOut' }, 'hl2+=.45');
        count(pct, 27, 35, 'hl2+=.45', 1, function (v) { return Math.round(v) + '%'; });
        tl.to($('.gc-rt-a'), { autoAlpha: 0, y: -6, duration: .3 }, 'hl2+=.55');
        tl.fromTo($('.gc-rt-b'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .4 }, 'hl2+=.65');
        tl.to($('.gc-adm'), { width: '100%', backgroundColor: '#07BE9F', duration: 1, ease: 'power2.inOut' }, 'hl2+=.45');

        /* ---- 3. reset for the loop ---- */
        tl.addLabel('out', 'hl2+=2.9');
        drop(ov, 'out'); undim('2', 'out');
        tl.to([chk, ov, next], { autoAlpha: 0, y: -12, duration: .45, ease: 'power2.in', stagger: .05 }, 'out+=.35');
        tl.to(screen, { x: 0, duration: 1.1, ease: MOVE }, 'out+=.55');
        tl.to({}, { duration: .4 }, 'out+=1.65');

        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { tl.pause(); tl.seek('hl1+=.8', false); }
        else if ('IntersectionObserver' in window) {
            // Play only while on screen AND shown: Webflow interactions fade stacked
            // panels in and out through the mount Div's opacity (e.g. the /home-2 sticky tabs)
            var inView = false;
            var sync = function () { if (inView && parseFloat(getComputedStyle(root).opacity) > .01) { if (!root._userPaused) tl.play(); } else tl.pause(); };
            (root._io = new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; }); sync(); }, { threshold: .3 })).observe(root);
            (root._mo = new MutationObserver(sync)).observe(root, { attributes: true, attributeFilter: ['style'] });
        } else tl.play();
        root._niq = tl;
    }

    /* ---- mount + boot ---- */
    function mount(el) {
        if (el.getAttribute('data-niq-mounted')) return;
        el.setAttribute('data-niq-mounted', '1');
        el.classList.add('niq-gc');
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', GC_LABEL);
        el.innerHTML = GC_MARKUP;
        gcInit(el);
    }
    /* ---- shared registry: mounts on page load AND whenever new mounts appear
       (Barba / any AJAX page swap), and cleans up mounts that get removed ---- */
    var NIQ = window.NIQAnims || (window.NIQAnims = (function () {
        var reg = [], watching = false;
        var OWN = /\b(niq-(anim|at|gc|ii|lt|ot|au)|(na|at|gc|ii|lt|ot|au)-ready)\b/g;
        function each(scope, sel, fn) {
            if (!scope) return;
            if (scope.nodeType === 1 && scope.matches(sel)) fn(scope);
            if (scope.querySelectorAll) Array.prototype.forEach.call(scope.querySelectorAll(sel), fn);
        }
        function destroyEl(el) {
            if (el._niqMount && near) { near.unobserve(el); el._niqMount = null; }
            try { if (el._niq && el._niq.kill) el._niq.kill(); } catch (e) { }
            ['_loop', '_dots'].forEach(function (k) { try { if (el[k] && el[k].stop) el[k].stop(); } catch (e) { } });
            try { if (el._io) el._io.disconnect(); } catch (e) { }
            try { if (el._ro) el._ro.disconnect(); } catch (e) { }
            try { if (el._mo) el._mo.disconnect(); } catch (e) { }
            el._niq = el._loop = el._dots = el._io = el._ro = el._mo = null;
            el.removeAttribute('data-niq-mounted'); el.removeAttribute('role'); el.removeAttribute('aria-label');
            el.className = el.className.replace(OWN, '').replace(/\s+/g, ' ').trim();
            el.innerHTML = '';
        }
        /* Build each animation only when it comes within about one screen of view,
           so a page doesn't pay for animations far down it (or hidden copies,
           e.g. desktop-only panels on phones) while it loads */
        var near = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (!e.isIntersecting) return;
                var el = e.target, fn = el._niqMount;
                near.unobserve(el); el._niqMount = null;
                if (fn && el.isConnected) fn(el);
            });
        }, { rootMargin: '100% 0px' }) : null;
        function mountWhenNear(el, fn) {
            if (el.getAttribute('data-niq-mounted') || el._niqMount) return;
            if (!near) return fn(el);
            el._niqMount = fn; near.observe(el);
        }
        var api = {
            register: function (sel, mountFn) {
                for (var i = 0; i < reg.length; i++) if (reg[i].sel === sel) return;
                reg.push({ sel: sel, mount: mountFn });
            },
            mount: function (scope) { scope = scope || document; reg.forEach(function (r) { each(scope, r.sel, function (el) { mountWhenNear(el, r.mount); }); }); },
            destroy: function (scope) { scope = scope || document; each(scope, '[data-niq-anim]', function (el) { if (el._niqMount && near) { near.unobserve(el); el._niqMount = null; } }); each(scope, '[data-niq-mounted]', destroyEl); },
            watch: function () {
                if (watching || !('MutationObserver' in window)) return;
                watching = true;
                new MutationObserver(function (muts) {
                    muts.forEach(function (m) {
                        Array.prototype.forEach.call(m.removedNodes, function (n) { if (n.nodeType === 1 && !n.isConnected) api.destroy(n); });
                        Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) api.mount(n); });
                    });
                }).observe(document.documentElement, { childList: true, subtree: true });
            }
        };
        return api;
    })());
    function boot() { NIQ.register('[data-niq-anim="compliance"]', mount); NIQ.mount(document); NIQ.watch(); }
    function go() {
        if (window.gsap) { boot(); return; }
        var existing = document.querySelector('script[data-niq-gsap]');
        if (existing) { existing.addEventListener('load', boot); return; }
        var sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        sc.setAttribute('data-niq-gsap', '1');
        sc.onload = boot; document.head.appendChild(sc);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
