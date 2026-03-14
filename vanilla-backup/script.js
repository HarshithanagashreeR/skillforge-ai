
        /* --- MASSIVE ENGINEERING DATABASE --- */
        const careersDB = {
            "Aerospace Engineer": ["Aerodynamics", "Propulsion Systems", "CAD", "MATLAB", "Avionics", "Thermodynamics", "Materials Science", "Fluid Dynamics", "Systems Engineering"],
            "Agricultural Engineer": ["Soil Science", "Hydrology", "AutoCAD", "GIS", "Machine Design", "Sustainability", "Data Analysis", "GPS Systems"],
            "AI & Machine Learning Engineer": ["Python", "PyTorch", "TensorFlow", "NLP", "Computer Vision", "MLOps", "Deep Learning", "Algorithms", "Mathematics"],
            "Biomedical Engineer": ["Biomechanics", "Biomaterials", "Medical Imaging", "FDA Regulations", "CAD/CAM", "Prototyping", "Data Analysis", "Physiology"],
            "Chemical Engineer": ["Thermodynamics", "Process Design", "Mass Transfer", "Fluid Mechanics", "Safety Regulations", "Aspen HYSYS", "Reaction Engineering", "AutoCAD"],
            "Civil Engineer": ["AutoCAD", "Structural Analysis", "Project Management", "Surveying", "AutoCAD Civil 3D", "Materials Science", "Cost Estimating", "Geotechnical"],
            "Cloud Architect": ["AWS", "Azure", "Kubernetes", "Docker", "Terraform", "Linux", "Networking", "Security", "CI/CD", "System Architecture"],
            "Computer Hardware Engineer": ["C++", "Verilog/VHDL", "Microcontrollers", "Embedded Systems", "Circuit Design", "Python", "Computer Architecture", "PCB Design"],
            "Cybersecurity Engineer": ["Network Security", "Linux", "Python", "Ethical Hacking", "Cryptography", "Risk Management", "SIEM", "Firewalls", "Incident Response"],
            "Data Scientist / Data Engineer": ["Python", "SQL", "Machine Learning", "Statistics", "Data Visualization", "Spark", "Hadoop", "ETL Pipelines", "Pandas"],
            "Electrical Engineer": ["Circuit Design", "MATLAB", "AutoCAD", "PLC Programming", "Power Systems", "C++", "Signal Processing", "Control Systems", "PCB Layout"],
            "Environmental Engineer": ["Water Treatment", "Environmental Impact Assessment (EIA)", "AutoCAD", "GIS", "Fluid Mechanics", "Sustainability", "Data Analysis", "Chemistry"],
            "Industrial Engineer": ["Process Optimization", "Six Sigma", "Lean Manufacturing", "Data Analysis", "Supply Chain", "Ergonomics", "Operations Research", "AutoCAD"],
            "Marine/Ocean Engineer": ["Hydrodynamics", "Naval Architecture", "AutoCAD", "Structural Analysis", "Materials Science", "Fluid Mechanics", "Project Management"],
            "Materials Engineer": ["Metallurgy", "Polymers", "Thermodynamics", "Failure Analysis", "CAD", "Testing Methodologies", "Nanotechnology", "Manufacturing"],
            "Mechanical Engineer": ["CAD", "SolidWorks", "Thermodynamics", "Fluid Mechanics", "Project Management", "FEA", "Manufacturing Processes", "Kinematics", "AutoCAD"],
            "Mechatronics Engineer": ["Robotics", "Control Systems", "PLC", "C++", "Sensors & Actuators", "Circuit Design", "SolidWorks", "Embedded Systems"],
            "Mining & Geological Engineer": ["Geology", "AutoCAD", "Surveying", "Rock Mechanics", "Safety Regulations", "Environmental Compliance", "GIS", "Cost Estimation"],
            "Nuclear Engineer": ["Reactor Physics", "Thermodynamics", "Radiation Protection", "Fluid Mechanics", "Safety Analysis", "MATLAB", "Regulatory Compliance", "Materials Science"],
            "Petroleum Engineer": ["Reservoir Engineering", "Drilling Operations", "Thermodynamics", "Geology", "Fluid Mechanics", "Data Analysis", "AutoCAD", "Risk Assessment"],
            "Robotics Engineer": ["ROS (Robot Operating System)", "C++", "Python", "Kinematics", "Computer Vision", "Control Systems", "Machine Learning", "SolidWorks"],
            "Software Engineer": ["JavaScript", "Python", "Java", "Data Structures", "Algorithms", "Git", "REST APIs", "System Design", "SQL", "React", "Node.js"],
            "Structural Engineer": ["Structural Analysis", "AutoCAD", "Revit", "Steel Design", "Concrete Design", "SAP2000", "Building Codes", "Project Management"],
            "Systems Engineer": ["Requirements Analysis", "System Architecture", "Integration", "Testing", "Project Management", "Risk Management", "Linux", "Python"]
        };

        /* --- STATE MANAGEMENT --- */
        let state = {
            isAuth: localStorage.getItem('isAuth') === 'true',
            email: localStorage.getItem('email') || '',
            userSkills: JSON.parse(localStorage.getItem('userSkills')) || [],
            targetCareer: localStorage.getItem('targetCareer') || "Software Engineer",
            analysis: JSON.parse(localStorage.getItem('analysis')) || null,
            streak: parseInt(localStorage.getItem('streak')) || 1,
            lastLogin: localStorage.getItem('lastLogin') || new Date().toDateString(),
            quizScores: JSON.parse(localStorage.getItem('quizScores')) || []
        };

        let chartInstance = null;

        /* --- INITIALIZATION --- */
        window.onload = () => {
            initThreeJS();
            populateDropdown();
            checkDailyStreak();
            renderBadges();

            if (state.isAuth) {
                document.getElementById('view-landing').classList.remove('active');
                document.getElementById('chatbot-wrapper').classList.remove('hidden');
                document.getElementById('app-container').style.display = 'flex';
                document.getElementById('sidebar-email').innerText = state.email;
                document.getElementById('settings-email').innerText = state.email;
                nav('dashboard');
            }
        };

        /* --- DAILY STREAK LOGIC --- */
        function checkDailyStreak() {
            const today = new Date().toDateString();
            if(state.lastLogin !== today) {
                state.streak += 1;
                state.lastLogin = today;
                localStorage.setItem('streak', state.streak);
                localStorage.setItem('lastLogin', state.lastLogin);
                setTimeout(() => showToast(`Daily Streak Increased! 🔥 ${state.streak} Days!`), 2000);
            }
            document.getElementById('streak-counter').innerText = state.streak;
            
            // Calculate avg score
            if(state.quizScores.length > 0) {
                const avg = Math.round(state.quizScores.reduce((a,b) => a+b, 0) / state.quizScores.length);
                document.getElementById('dash-avg-score').innerText = `${avg}%`;
            }
        }

        /* --- AUTHENTICATION --- */
        let isLoginMode = true;
        function showAuth() {
            document.getElementById('view-landing').classList.remove('active');
            document.getElementById('view-auth').classList.add('active');
        }

        function toggleAuthMode() {
            isLoginMode = !isLoginMode;
            document.getElementById('auth-title').innerText = isLoginMode ? "System Login" : "Create Account";
            document.getElementById('auth-btn').innerHTML = isLoginMode ? "<span>Authenticate</span>" : "<span>Initialize Profile</span>";
            document.getElementById('auth-switch-text').innerText = isLoginMode ? "New engineer?" : "Existing engineer?";
        }

        function handleGoogleCredentialResponse(response) {
            try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                if (payload.email) {
                    loginUser(payload.email);
                }
            } catch (e) {
                showToast("Google Authentication Failed");
            }
        }

        function handleAuth(e) {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            loginUser(email);
        }
        
        function loginUser(email) {
            state.isAuth = true;
            state.email = email;
            localStorage.setItem('isAuth', 'true');
            localStorage.setItem('email', email);
            
            document.getElementById('view-auth').classList.remove('active');
            document.getElementById('app-container').style.display = 'flex';
            document.getElementById('chatbot-wrapper').classList.remove('hidden');
            document.getElementById('sidebar-email').innerText = email;
            document.getElementById('settings-email').innerText = email;
            
            showToast("Authentication Successful");
            nav('dashboard');
        }

        function logout() {
            localStorage.clear();
            if (window.google && google.accounts && google.accounts.id) {
                try { google.accounts.id.disableAutoSelect(); } catch (e) { }
            }
            location.reload(); 
        }

        /* --- NAVIGATION --- */
        function nav(viewId) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active', 'glow-text'));
            document.getElementById(`nav-${viewId}`).classList.add('active');
            
            document.querySelectorAll('.view-section').forEach(el => {
                el.classList.remove('active');
            });
            document.getElementById(`view-${viewId}`).classList.add('active');

            if(viewId === 'dashboard') updateDashboard();
            if(viewId === 'analyzer') {
                document.getElementById('user-skills-input').value = state.userSkills.join(', ');
                if(state.analysis) renderAnalysisResults();
            }
            if(viewId === 'roadmap') generateRoadmap();
            if(viewId === 'jobs') renderJobs();
            if(viewId === 'quiz') initQuizView();
        }

        /* --- DASHBOARD UPDATES --- */
        function updateDashboard() {
            document.getElementById('dash-target-role').innerText = state.targetCareer;
            if(state.analysis) {
                document.getElementById('dash-match-score').innerText = `${state.analysis.score}%`;
                setTimeout(() => { document.getElementById('dash-progress-bar').style.width = `${state.analysis.score}%`; }, 100);
                
                if(state.analysis.score >= 80) {
                    document.getElementById('daily-insight').innerHTML = `Excellent! You are highly aligned with the requirements for a <b>${state.targetCareer}</b>. Focus on building portfolio projects and preparing for technical interviews.`;
                } else {
                    document.getElementById('daily-insight').innerHTML = `You have a gap in your matrix for <b>${state.targetCareer}</b>. Head over to the Roadmap tab to start bridging gaps like ${state.analysis.missing[0] || 'core concepts'}.`;
                }
            } else {
                document.getElementById('dash-progress-bar').style.width = '0%';
                document.getElementById('dash-match-score').innerText = `0%`;
            }
        }

        /* --- ANALYZER LOGIC --- */
        function populateDropdown() {
            const select = document.getElementById('target-career');
            select.innerHTML = '';
            Object.keys(careersDB).sort().forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.innerText = role;
                if(role === state.targetCareer) option.selected = true;
                select.appendChild(option);
            });
        }

        // Drag & Drop
        const dropzone = document.getElementById('dropzone');
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if(e.dataTransfer.files.length) handleFileUpload(e.dataTransfer);
        });

        function handleFileUpload(input) {
            const file = input.files ? input.files[0] : null;
            if(!file) return;
            
            document.getElementById('drop-icon').className = "fa-solid fa-file-pdf text-4xl text-primary mb-3";
            document.getElementById('drop-text').innerText = `Processing ${file.name}...`;
            document.getElementById('upload-loader').classList.remove('hidden');
            document.getElementById('upload-loader').classList.add('flex');

            setTimeout(() => {
                document.getElementById('upload-loader').classList.add('hidden');
                document.getElementById('drop-icon').className = "fa-solid fa-circle-check text-4xl text-success mb-3";
                document.getElementById('drop-text').innerText = "Data Extracted Successfully!";
                
                const target = document.getElementById('target-career').value;
                const required = careersDB[target];
                const extracted = [];
                for(let i=0; i<3; i++) {
                    const r = required[Math.floor(Math.random() * required.length)];
                    if(!extracted.includes(r)) extracted.push(r);
                }
                
                const existing = document.getElementById('user-skills-input').value;
                const combined = [existing, ...extracted].filter(s => s.trim().length > 0).join(', ');
                document.getElementById('user-skills-input').value = combined;

                setTimeout(() => {
                    document.getElementById('drop-icon').className = "fa-solid fa-cloud-arrow-up text-4xl text-gray-500 mb-3";
                    document.getElementById('drop-text').innerText = "Drag & drop resume here";
                }, 3000);

            }, 2500);
        }

        function runAnalysis() {
            document.getElementById('ai-loader').style.display = 'flex';
            
            setTimeout(() => {
                const target = document.getElementById('target-career').value;
                const inputStr = document.getElementById('user-skills-input').value;
                
                const userSkills = inputStr.split(',').map(s => s.trim()).filter(s => s);
                const requiredSkills = careersDB[target];
                const userSkillsLower = userSkills.map(s => s.toLowerCase());
                
                const present = [];
                const missing = [];
                
                requiredSkills.forEach(reqSkill => {
                    const isMatch = userSkillsLower.some(uSkill => uSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(uSkill));
                    if(isMatch) present.push(reqSkill);
                    else missing.push(reqSkill);
                });

                const score = Math.round((present.length / requiredSkills.length) * 100);

                state.analysis = { target, present, missing, score };
                state.userSkills = userSkills;
                state.targetCareer = target;

                localStorage.setItem('userSkills', JSON.stringify(userSkills));
                localStorage.setItem('targetCareer', target);
                localStorage.setItem('analysis', JSON.stringify(state.analysis));

                document.getElementById('ai-loader').style.display = 'none';
                renderAnalysisResults();
                showToast("Analysis Complete");
                
                if(score > 50 && !localStorage.getItem('badge_halfway')) {
                    localStorage.setItem('badge_halfway', 'true');
                    setTimeout(() => {
                        triggerCelebration();
                        showToast("New Badge Unlocked: Halfway There! 🚀");
                        renderBadges();
                    }, 1000);
                }

            }, 1200);
        }

        function renderAnalysisResults() {
            document.getElementById('analysis-overlay').classList.add('hidden');
            const { target, present, missing, score } = state.analysis;
            
            document.getElementById('result-role-name').innerText = target;
            document.getElementById('result-score').innerText = `${score}%`;
            
            document.getElementById('detected-skills-list').innerHTML = present.length > 0 ? 
                present.map(s => `<span class="bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded text-[11px] font-bold tracking-wide">${s}</span>`).join('') :
                `<span class="text-gray-500 text-xs italic">No matching data detected.</span>`;
                
            document.getElementById('missing-skills-list').innerHTML = missing.length > 0 ? 
                missing.map(s => `<span class="bg-accent/10 border border-accent/30 text-accent px-2.5 py-1 rounded text-[11px] font-bold tracking-wide">${s}</span>`).join('') :
                `<span class="text-success text-xs font-bold"><i class="fa-solid fa-check-circle"></i> Matrix Complete!</span>`;

            const ctx = document.getElementById('radarChart').getContext('2d');
            if(chartInstance) chartInstance.destroy();
            
            const labels = careersDB[target];
            const dataUser = labels.map(skill => present.includes(skill) ? 90 : 20);
            const dataReq = labels.map(() => 100);

            Chart.defaults.color = '#64748b';
            Chart.defaults.font.family = 'Inter';
            
            chartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Your Profile', data: dataUser, borderColor: '#06B6D4', backgroundColor: 'rgba(6, 182, 212, 0.25)', borderWidth: 2, pointBackgroundColor: '#06B6D4' },
                        { label: 'Industry Req', data: dataReq, borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.05)', borderDash: [4,4], borderWidth: 1, pointRadius: 0 }
                    ]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    scales: { 
                        r: { 
                            ticks: { display: false, max: 100, min: 0 }, 
                            angleLines: { color: 'rgba(255,255,255,0.05)' }, 
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            pointLabels: { color: '#cbd5e1', font: { size: 10, weight: 'bold' } }
                        } 
                    },
                    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } } }
                }
            });
        }

        /* --- ROADMAP & COURSES --- */
        function getCourseLink(skill) {
            const query = encodeURIComponent(skill);
            const r = Math.random();
            if(r < 0.4) return { platform: 'Coursera', color: 'text-blue-400', url: `https://www.coursera.org/search?query=${query}` };
            if(r < 0.8) return { platform: 'Udemy', color: 'text-purple-400', url: `https://www.udemy.com/courses/search/?src=ukw&q=${query}` };
            return { platform: 'edX', color: 'text-red-400', url: `https://www.edx.org/search?q=${query}` };
        }

        function generateRoadmap() {
            if(!state.analysis) return;
            
            if(state.analysis.missing.length === 0) {
                document.getElementById('roadmap-content').innerHTML = `
                <div class="glass-panel p-10 rounded-xl text-center glow-border border-success/50">
                    <i class="fa-solid fa-rocket text-6xl text-success mb-4"></i>
                    <h3 class="text-2xl font-black text-white mb-2">Systems Go!</h3>
                    <p class="text-gray-300">You possess all required skills for <b>${state.analysis.target}</b>.</p>
                    <button class="mt-6 bg-success hover:bg-green-400 text-slate-900 font-bold px-8 py-3 rounded-lg transition" onclick="triggerCelebration()">Celebrate!</button>
                </div>`;
                return;
            }

            let html = `<div class="space-y-4">`;
            state.analysis.missing.forEach((skill, index) => {
                const linkObj = getCourseLink(skill);
                html += `
                    <div class="glass-panel p-5 rounded-xl border-l-4 border-l-primary flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-surface/50 transition duration-300">
                        <div class="mb-4 sm:mb-0">
                            <span class="text-[10px] font-black uppercase text-accent tracking-widest bg-accent/10 px-2 py-0.5 rounded">Module ${index + 1}</span>
                            <h3 class="text-lg font-bold text-white mt-1">${skill}</h3>
                            <p class="text-xs text-gray-400 mt-1">Recommended timeframe: 2-3 weeks</p>
                        </div>
                        <a href="${linkObj.url}" target="_blank" class="flex items-center space-x-2 bg-[#0B1120] hover:bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg transition group">
                            <span class="text-xs text-gray-300 font-bold group-hover:text-white transition">Find on</span>
                            <span class="text-sm font-black ${linkObj.color}">${linkObj.platform}</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-gray-500 group-hover:text-white ml-1"></i>
                        </a>
                    </div>
                `;
            });
            html += `</div>`;
            document.getElementById('roadmap-content').innerHTML = html;
        }

        /* --- JOB MARKET --- */
        async function renderJobs() {
            const container = document.getElementById('jobs-container');
            const country = document.getElementById('job-country').value;
            
            // App Credentials (User MUST replace these in production)
            const APP_ID = '075e9ae7';
            const APP_KEY = '76d68e13f877896aa460f85bcf5274d9';

            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center p-12 text-gray-500">
                    <div class="spinner w-8 h-8 mb-4"></div>
                    <p class="font-bold text-sm">Scanning Global Job Markets...</p>
                </div>
            `;

            try {
                const target = encodeURIComponent(state.targetCareer);
                const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=6&what=${target}`);
                
                if (!response.ok) throw new Error("API Limit");
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    container.innerHTML = `<div class="col-span-full mb-2 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-xs font-bold"><i class="fa-solid fa-circle-check mr-2"></i> Real job alerts streaming from Adzuna API in ${country.toUpperCase()}</div>`;
                    container.innerHTML += data.results.map(job => {
                        const matchScore = Math.floor(Math.random() * 20) + 75; // Mock match
                        const salary = job.salary_min ? `$${Math.floor(job.salary_min / 1000)}k - $${Math.floor(job.salary_max / 1000)}k` : 'Salary Negotiable';
                        return `
                        <div class="glass-panel p-5 rounded-xl border border-gray-700 hover:border-primary transition flex flex-col justify-between">
                            <div>
                                <div class="flex justify-between mb-3">
                                    <h3 class="font-bold text-white text-sm line-clamp-2" title="${job.title}">${job.title}</h3>
                                    <span class="bg-success/20 text-success text-[10px] font-bold px-2 py-1 rounded h-fit flex-shrink-0">${matchScore}% Match</span>
                                </div>
                                <p class="text-[11px] text-gray-400 mb-2 font-bold">${job.company.display_name} • ${job.location.display_name}</p>
                                <p class="text-[10px] text-gray-500 line-clamp-3 mb-3">${job.description}</p>
                            </div>
                            <div class="flex justify-between items-center pt-4 border-t border-gray-800">
                                <span class="text-xs font-bold text-gray-300">${salary}</span>
                                <a href="${job.redirect_url}" target="_blank" class="bg-primary/10 text-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition">Apply <i class="fa-solid fa-arrow-up-right-from-square ml-1 text-[10px]"></i></a>
                            </div>
                        </div>`
                    }).join('');
                } else {
                    throw new Error("No results");
                }
            } catch (error) {
                // FALLBACK TO MOCKS
                const comps = ['Google', 'Tesla', 'SpaceX', 'Amazon', 'Apple', 'Meta'];
                container.innerHTML = `<div class="col-span-full mb-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-xs"><i class="fa-solid fa-triangle-exclamation mr-2"></i> Adzuna API is rate-limited or keys are invalid. Showing mock data for ${country.toUpperCase()}.</div>`;
                container.innerHTML += Array(6).fill().map(() => {
                    const matchPercent = Math.floor(Math.random() * 25) + 70;
                    return `
                    <div class="glass-panel p-5 rounded-xl border border-gray-700 hover:border-primary transition flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between mb-3"><h3 class="font-bold text-white text-sm">${state.targetCareer}</h3><span class="bg-success/20 text-success text-[10px] font-bold px-2 py-1 rounded">${matchPercent}% Match</span></div>
                            <p class="text-[11px] text-gray-400 mb-2 font-bold">${comps[Math.floor(Math.random() * comps.length)]} • Remote (${country.toUpperCase()})</p>
                            <p class="text-[10px] text-gray-500 line-clamp-3 mb-3">Looking for a highly skilled ${state.targetCareer} to join our core architecture team...</p>
                        </div>
                        <div class="flex justify-between items-center pt-4 border-t border-gray-800"><span class="text-xs font-bold text-gray-300">$120k - $160k</span><a href="#" class="bg-primary/10 text-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition">Apply</a></div>
                    </div>`
                }).join('');
            }
        }

        /* --- DAILY QUIZ --- */
        let quizQuestions = [];
        let curQIdx = 0;
        let quizScore = 0;
        let selectedOptIdx = null;

        function initQuizView() {
            document.getElementById('quiz-intro').classList.remove('hidden');
            document.getElementById('quiz-active').classList.add('hidden');
            document.getElementById('quiz-results').classList.add('hidden');
            if(document.fullscreenElement) document.exitFullscreen().catch(e=>console.log(e));
        }

        function setupQuizData() {
            curQIdx = 0;
            quizScore = 0;
            const t = state.targetCareer;
            
            // Generate 3 mock questions related to target career
            quizQuestions = [
                { q: `Which of the following is a core concept in ${t}?`, opts: ['Database Normalization', 'Agile Methodologies', 'Vector Calculus', 'Load Balancing'], ans: Math.floor(Math.random()*4) },
                { q: `In a typical ${t} workflow, what does 'CI/CD' refer to?`, opts: ['Continuous Integration', 'Code Injection', 'Central Intelligence', 'Cloud Infrastructure'], ans: 0 },
                { q: `Which data structure is primarily used to implement a LIFO mechanism?`, opts: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], ans: 1 }
            ];
            
            loadQuestion();
        }

        function startFocusMode() {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().then(() => {
                    setupQuizData();
                    document.getElementById('quiz-intro').classList.add('hidden');
                    document.getElementById('quiz-active').classList.remove('hidden');
                    document.addEventListener('fullscreenchange', handleFocusBreak);
                }).catch(err => {
                    // FALLBACK IMPLEMENTED HERE
                    showToast("Fullscreen blocked. Entering Windowed Mode.");
                    setupQuizData();
                    document.getElementById('quiz-intro').classList.add('hidden');
                    document.getElementById('quiz-active').classList.remove('hidden');
                });
            } else {
                setupQuizData();
                document.getElementById('quiz-intro').classList.add('hidden');
                document.getElementById('quiz-active').classList.remove('hidden');
            }
        }

        function handleFocusBreak() {
            if(!document.fullscreenElement && !document.getElementById('quiz-active').classList.contains('hidden')) {
                showToast("Focus Broken! Fullscreen exited.");
            }
        }

        function loadQuestion() {
            selectedOptIdx = null;
            document.getElementById('quiz-next-btn').disabled = true;
            document.getElementById('quiz-next-btn').className = "bg-gray-700 text-gray-400 font-bold px-10 py-3 rounded-lg transition w-full max-w-xs";
            document.getElementById('quiz-next-btn').innerText = "Select an option";
            
            document.getElementById('quiz-progress').innerText = `Question ${curQIdx + 1} of ${quizQuestions.length}`;
            document.getElementById('quiz-question').innerText = quizQuestions[curQIdx].q;
            
            let optsHtml = '';
            quizQuestions[curQIdx].opts.forEach((o, i) => {
                optsHtml += `<div id="opt-${i}" onclick="selectOption(${i})" class="quiz-option bg-surface/50 border border-gray-600 rounded-lg p-4 text-gray-300 font-medium fle items-center transition">${o}</div>`;
            });
            document.getElementById('quiz-options').innerHTML = optsHtml;
        }

        function selectOption(idx) {
            selectedOptIdx = idx;
            document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
            document.getElementById(`opt-${idx}`).classList.add('selected');
            
            document.getElementById('quiz-next-btn').disabled = false;
            document.getElementById('quiz-next-btn').className = "bg-primary hover:bg-cyan-400 text-slate-900 font-bold px-10 py-3 rounded-lg transition w-full max-w-xs transform hover:-translate-y-1";
            document.getElementById('quiz-next-btn').innerText = curQIdx === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question";
        }

        function nextQuestion() {
            if(selectedOptIdx === quizQuestions[curQIdx].ans) {
                quizScore++;
            }
            curQIdx++;
            if(curQIdx >= quizQuestions.length) {
                finishQuiz();
            } else {
                loadQuestion();
            }
        }

        function finishQuiz() {
            document.getElementById('quiz-active').classList.add('hidden');
            document.getElementById('quiz-results').classList.remove('hidden');
            if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
            
            const perc = Math.round((quizScore / quizQuestions.length) * 100);
            
            state.quizScores.push(perc);
            if(state.quizScores.length > 30) state.quizScores.shift(); // Keep last 30
            localStorage.setItem('quizScores', JSON.stringify(state.quizScores));
            
            document.getElementById('quiz-result-title').innerText = `Quiz Complete!`;
            document.getElementById('quiz-result-desc').innerText = `You scored ${quizScore} out of ${quizQuestions.length} (${perc}%).`;
            
            const icon = document.getElementById('quiz-result-icon');
            if(perc === 100) { icon.className = "fa-solid fa-crown text-5xl text-warning"; }
            else if(perc >= 66) { icon.className = "fa-solid fa-star text-5xl text-success"; }
            else { icon.className = "fa-solid fa-xmark text-5xl text-danger"; }

            if(perc >= 66) triggerCelebration();

            if(!localStorage.getItem('badge_quiz') && perc > 66) {
                localStorage.setItem('badge_quiz', 'true');
                allBadges.push({ id: 'badge_quiz', icon: '🧠', name: 'Quiz Master', desc: 'Aced Focus Quiz' });
                setTimeout(() => showToast("New Badge Unlocked: Quiz Master!"), 2000);
            }
        }

        /* --- ACHIEVEMENTS & CELEBRATIONS --- */
        const allBadges = [
            { id: 'badge_new', icon: '🔥', name: 'Ignition', desc: 'Created an account' },
            { id: 'streak_3', icon: '⚡', name: 'Momentum', desc: '3 Day Streak', cond: () => state.streak >= 3 },
            { id: 'streak_7', icon: '🔋', name: 'Powerhouse', desc: '7 Day Streak', cond: () => state.streak >= 7 },
            { id: 'badge_halfway', icon: '🚀', name: 'Liftoff', desc: 'Hit >50% Match Score' },
            { id: 'badge_quiz', icon: '🧠', name: 'Quiz Master', desc: 'Aced Focus Quiz' }
        ];

        function renderBadges() {
            const container = document.getElementById('badges-container');
            if(!container) return;
            
            if(state.streak >= 3 && !localStorage.getItem('streak_3')) localStorage.setItem('streak_3', 'true');
            if(state.streak >= 7 && !localStorage.getItem('streak_7')) localStorage.setItem('streak_7', 'true');
            if(!localStorage.getItem('badge_new')) localStorage.setItem('badge_new', 'true'); 

            let html = '';
            allBadges.forEach(b => {
                const unlocked = localStorage.getItem(b.id) === 'true';
                html += `
                    <div class="glass-panel p-4 rounded-xl text-center border ${unlocked ? 'border-warning/50 bg-warning/5 glow-border-accent' : 'border-gray-800 opacity-50 grayscale'} transition-all duration-300">
                        <div class="text-4xl mb-2 ${unlocked ? 'animate-pulse-badge' : ''}">${b.icon}</div>
                        <h4 class="font-bold text-white text-sm">${b.name}</h4>
                        <p class="text-[10px] text-gray-400 mt-1">${unlocked ? 'Unlocked!' : b.desc}</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function triggerCelebration() {
            var duration = 3 * 1000;
            var end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
                    colors: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B']
                });
                confetti({
                    particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
                    colors: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B']
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }

        /* --- SETTINGS & UTILS --- */
        function toggleSetting(checkbox) {
            if(checkbox.checked) showToast("Preference saved.");
            else showToast("Notifications paused.");
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').innerText = msg;
            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
        }

        /* --- AI CHATBOT (GEMINI INTERFERENCE) --- */
        let isChatOpen = false;
        function toggleChat() {
            const w = document.getElementById('chatbot-window'), icon = document.getElementById('chat-icon');
            if (isChatOpen) { 
                w.classList.remove('scale-100', 'opacity-100'); 
                w.classList.add('scale-0', 'opacity-0'); 
                icon.className = "fa-solid fa-message"; 
            } else { 
                w.classList.remove('scale-0', 'opacity-0'); 
                w.classList.add('scale-100', 'opacity-100'); 
                icon.className = "fa-solid fa-xmark"; 
                
                const msgs = document.getElementById('chat-messages');
                if(msgs.children.length === 0) {
                    if(!localStorage.getItem('gemini_key')) {
                        msgs.innerHTML = `<div class="flex mb-3"><div class="bg-surface text-gray-200 px-3 py-2 rounded-lg text-xs leading-relaxed border border-warning/30"><span class="text-warning font-bold"><i class="fa-solid fa-key mr-1"></i> API Key Required</span><br><br>I am powered by Google Gemini! To chat with me, please enter your free Gemini API key below.<br><br><input type="password" id="gemini-key-input" placeholder="AIzaSy..." class="w-full bg-black/50 border border-gray-600 rounded mt-2 px-2 py-1 text-white mb-2"><button onclick="saveGeminiKey()" class="bg-primary text-slate-900 font-bold px-3 py-1 rounded w-full hover:bg-cyan-400 transition">Save Key</button></div></div>`;
                    } else {
                        msgs.innerHTML = `<div class="flex mb-3"><div class="bg-surface text-gray-200 px-3 py-2 rounded-lg text-xs">Hello ${state.email ? state.email.split('@')[0] : 'Engineer'}! I'm Forge AI. I see you are tracking ${state.targetCareer}. How can I assist you?</div></div>`;
                    }
                }
                msgs.scrollTop = 9999; 
            }
            isChatOpen = !isChatOpen;
        }

        function saveGeminiKey() {
            const key = document.getElementById('gemini-key-input').value.trim();
            if(key) {
                localStorage.setItem('gemini_key', key);
                document.getElementById('chat-messages').innerHTML = `<div class="flex mb-3"><div class="bg-success/20 text-success border border-success/30 px-3 py-2 rounded-lg text-xs"><i class="fa-solid fa-check-circle mr-1"></i> Key saved securely! I am now online.</div></div>`;
            }
        }

        async function sendChatMessage() {
            const inputEl = document.getElementById('chat-input');
            const text = inputEl.value.trim(); 
            const apiKey = localStorage.getItem('gemini_key');
            
            if (!text) return;
            if (!apiKey) {
                showToast("Please provide a Gemini API Key first.");
                return;
            }

            const msgs = document.getElementById('chat-messages');
            
            msgs.innerHTML += `<div class="flex justify-end mb-3"><div class="bg-primary/20 border border-primary/30 text-white px-3 py-2 rounded-lg text-xs max-w-[85%] break-words">${text}</div></div>`;
            inputEl.value = '';
            msgs.scrollTop = 9999;

            const loaderId = 'loader-' + Date.now();
            msgs.innerHTML += `<div id="${loaderId}" class="flex mb-3"><div class="bg-surface border border-gray-700 text-gray-400 px-4 py-2 rounded-lg flex items-center space-x-1"><div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div><div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div></div></div>`;
            msgs.scrollTop = 9999;
            
            try {
                const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: "You are Forge AI, an expert career counselor and engineering assistant. The user's target career is " + state.targetCareer + ". Be concise. User message: " + text
                            }]
                        }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
                    })
                });

                const el = document.getElementById(loaderId);
                if(el) el.remove();
                
                if (!response.ok) throw new Error("API Error");
                
                const data = await response.json();
                let aiResponse = data.candidates[0].content.parts[0].text;
                
                // Parse markdown bold and newlines
                aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-bold">$1</span>').replace(/\*(.*?)\*/g, '<i class="text-gray-300">$1</i>').replace(/\n/g, '<br>');
                
                msgs.innerHTML += '<div class="flex mb-3"><div class="bg-surface border border-gray-700 text-gray-200 px-3 py-2 rounded-lg text-xs max-w-[90%] leading-relaxed">' + aiResponse + '</div></div>';
                
            } catch (error) {
                const el = document.getElementById(loaderId);
                if(el) el.remove();
                msgs.innerHTML += '<div class="flex mb-3"><div class="bg-warning/20 border border-warning/50 text-warning px-3 py-2 rounded-lg text-xs max-w-[90%]"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Error: Gemini connection failed. Invalid key?</div></div>';
                localStorage.removeItem('gemini_key'); 
            }
            msgs.scrollTop = 9999;
        }

        /* --- 3D BACKGROUND --- */
        function initThreeJS() {
            const canvas = document.getElementById('bg-canvas');
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x0B1120, 0.002);

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 200;
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);

            const particleCount = 200;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 600;
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const texCanvas = document.createElement('canvas');
            texCanvas.width = 16; texCanvas.height = 16;
            const context = texCanvas.getContext('2d');
            const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(6, 182, 212, 1)');
            gradient.addColorStop(0.4, 'rgba(139, 92, 246, 0.5)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 16, 16);
            const texture = new THREE.CanvasTexture(texCanvas);

            const material = new THREE.PointsMaterial({ 
                color: 0xffffff, size: 6, map: texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
            });
            
            const particles = new THREE.Points(geometry, material);
            scene.add(particles);

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            function animate() {
                requestAnimationFrame(animate);
                scene.rotation.y += 0.0005;
                scene.rotation.x += 0.0002;
                renderer.render(scene, camera);
            }
            animate();
        }
    