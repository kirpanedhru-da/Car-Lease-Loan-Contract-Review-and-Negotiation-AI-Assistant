document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const uploadBox = document.getElementById('upload-box');
    const analysisResult = document.getElementById('analysis-result');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    // Handle Upload Interaction
    uploadBox.addEventListener('click', () => {
        if (!uploadBox.classList.contains('hidden')) {
            fileUpload.click();
        }
    });

    ['dragover', 'dragenter'].forEach(eventName => {
        uploadBox.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadBox.classList.add('drag-over');
        });
    });

    ['dragleave', 'dragend', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadBox.classList.remove('drag-over');
        });
    });

    uploadBox.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) {
            simulateUpload(e.dataTransfer.files[0].name);
        }
    });

    fileUpload.addEventListener('change', (e) => {
        if (e.target.files.length) {
            simulateUpload(e.target.files[0].name);
        }
    });

    function simulateUpload(fileName) {
        uploadBox.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin cloud-icon"></i>
            <h2>Analyzing ${fileName}...</h2>
            <p>Our LLM is extracting SLA parameters and identifying red flags.</p>
        `;
        setTimeout(() => {
            uploadBox.classList.add('hidden');
            analysisResult.classList.remove('hidden');
            chatInput.disabled = false;
            sendBtn.disabled = false;
            addChatMessage("I've analyzed the contract! I found a few red flags regarding the overage penalty and early termination. Would you like me to draft an email asking the dealer to lower the overage fee to the industry standard of $0.15/mile?", 'ai');
        }, 2500);
    }

    function addChatMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        div.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const genericResponses = [
        "That's an interesting point. I'll need to cross-reference this with the deeper clauses of your specific lease.",
        "Good question. Let me analyze that specific aspect of the contract for you...",
        "I'm looking into that. From standard contracts, you should always double-check the footnotes regarding this.",
        "I see what you mean. Dealerships sometimes hide fine print about this around page 3.",
        "That requires a bit more context. Could you provide exactly what the contract says regarding that clause?"
    ];

    function getBotResponse(userMsg) {
        const lowerMsg = userMsg.toLowerCase();
        let userName = localStorage.getItem('mock_user_name');
        if (userName) {
            userName = userName.split(' ')[0]; // use first name
        }
        
        if (lowerMsg.includes('interest') || lowerMsg.includes('apr') || lowerMsg.includes('rate') || lowerMsg.includes('factor')) {
            return `Your current APR is 6.5%, which is slightly high. ${userName ? userName + ', t' : 'T'}ry asking: 'Can we lower the Money Factor to 0.00210 to match current promotions?'`;
        } else if (lowerMsg.includes('penalty') || lowerMsg.includes('mileage') || lowerMsg.includes('overage')) {
            return "That's a great point. Tell them: 'I observed the overage penalty is $0.25/mile. The industry standard is typically $0.15/mile. I'd like to negotiate this down.'";
        } else if (lowerMsg.includes('residual')) {
            return "The Residual Value is set strictly by the bank at $18,500, meaning the dealer cannot legally change it. Instead, focus on negotiating the 'Capitalized Cost' (selling price)!";
        } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('discount')) {
            return `The Capitalized Cost is highly negotiable! ${userName ? 'As I see it, ' + userName + ',' : ''} you should ask for a breakdown of the selling price and request to remove any dealer add-ons like Nitrogen Tires or VIN etching.`;
        } else if (lowerMsg.includes('fee') || lowerMsg.includes('hidden')) {
            return "Watch out for inflated 'Acquisition Fees' and 'Disposition Fees'. Ask the dealer specifically to match the baseline bank acquisition fee without their markup.";
        } else if (lowerMsg.includes('early') || lowerMsg.includes('terminat')) {
            return "Early termination is a major red flag in lease agreements. Typically, you will still be responsible for all remaining payments. I advise keeping the car for the full 36 months if you sign.";
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            return `Hello${userName ? ' ' + userName : ''}! I'm continuing to review your contract. Ask me about your actual interest rates, mileage penalties, or how to negotiate the price down.`;
        } else if (lowerMsg.includes('thank')) {
            return `You're very welcome${userName ? ', ' + userName : ''}! I'm here to ensure you get a fair deal. Are there any other clauses you want me to explain?`;
        } else {
            return genericResponses[Math.floor(Math.random() * genericResponses.length)];
        }
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if (text) {
            addChatMessage(text, 'user');
            chatInput.value = '';
            setTimeout(() => {
                const aiReply = getBotResponse(text);
                addChatMessage(aiReply, 'ai');
            }, 800);
        }
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('i').className = 'fa-solid fa-plus';
            });
            if (!isActive) {
                item.classList.add('active');
                item.querySelector('i').className = 'fa-solid fa-xmark';
            }
        });
    });

    // Form navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const pageViews = document.querySelectorAll('.page-view');

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.getAttribute('data-target');
            pageViews.forEach(view => {
                view.classList.add('hidden');
                if (view.id === target) {
                    view.classList.remove('hidden');
                }
            });
        });
    });

    // Real VIN Decoding via NHTSA API
    const vinInput = document.getElementById('vin-input');
    const vinSearchBtn = document.getElementById('vin-search-btn');
    const vinResults = document.getElementById('vin-results');
    const vinLoading = document.getElementById('vin-loading');

    if (vinSearchBtn) {
        vinSearchBtn.addEventListener('click', async () => {
            const vin = vinInput.value.trim().toUpperCase();
            if (vin.length !== 17) {
                alert('Please enter a valid 17-character VIN.');
                return;
            }
            
            vinResults.classList.add('hidden');
            vinLoading.classList.remove('hidden');
            
            try {
                // Public US GOV API for VIN decoding
                const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
                const data = await res.json();
                
                const results_obj = {};
                if(data.Results) {
                    data.Results.forEach(item => {
                        results_obj[item.Variable] = item.Value;
                    });
                }
                
                const make = results_obj['Make'] || 'Unknown';
                const model = results_obj['Model'] || 'Unknown';
                const year = results_obj['Model Year'] || 'Unknown';
                const trim = results_obj['Trim'] || 'N/A';
                const engine = results_obj['Displacement (L)'] ? results_obj['Displacement (L)'] + 'L' : 'Unknown';
                const type = results_obj['Vehicle Type'] || 'Unknown';
                
                vinResults.innerHTML = `
                    <div class="vin-data-row"><small>Vehicle</small><span>${year} ${make} ${model}</span></div>
                    <div class="vin-data-row"><small>Trim</small><span>${trim}</span></div>
                    <div class="vin-data-row"><small>Engine</small><span>${engine}</span></div>
                    <div class="vin-data-row"><small>Type</small><span>${type}</span></div>
                `;
            } catch (e) {
                vinResults.innerHTML = `<div class="vin-data-row" style="grid-column: span 2; color: #ff5252;">Failed to fetch VIN data. Try again.</div>`;
            } finally {
                vinLoading.classList.add('hidden');
                vinResults.classList.remove('hidden');
            }
        });
    }

    // Modal Elements
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const authForm = document.getElementById('auth-form');
    const nameGroup = document.getElementById('name-group');
    const authName = document.getElementById('auth-name');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');
    const authSubmitBtn = document.getElementById('auth-submit-btn');

    let isLogin = true;

    // Open Auth Modal
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            isLogin = true;
            updateAuthUI();
            authModal.classList.remove('hidden');
        });
    }
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            isLogin = false;
            updateAuthUI();
            authModal.classList.remove('hidden');
        });
    }

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }

    tabLogin.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = true;
        updateAuthUI();
    });

    tabSignup.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = false;
        updateAuthUI();
    });

    function updateAuthUI() {
        authError.classList.add('hidden');
        if (isLogin) {
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            nameGroup.classList.add('hidden');
            authName.required = false;
            authSubmitBtn.innerText = 'Log In';
        } else {
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            nameGroup.classList.remove('hidden');
            authName.required = true;
            authSubmitBtn.innerText = 'Sign Up';
        }
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');
        
        const endpoint = isLogin ? '/api/login' : '/api/register';
        const payload = {
            email: authEmail.value,
            password: authPassword.value,
        };
        if (!isLogin) payload.name = authName.value;

        try {
            const res = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            if (!res.ok) {
                authError.innerText = data.error || 'Authentication failed.';
                authError.classList.remove('hidden');
            } else {
                alert(data.message || 'Success!');
                authModal.classList.add('hidden');
                authForm.reset();
                if (loginBtn) loginBtn.innerText = 'My Account';
                if (signupBtn) signupBtn.classList.add('hidden');
            }
        } catch (err) {
            // Fallback for when backend is not running (e.g. Node not installed)
            console.warn('Backend not reachable, falling back to local storage auth.');
            if (!isLogin) {
                // Mock registration
                localStorage.setItem('mock_user_email', payload.email);
                localStorage.setItem('mock_user_pass', payload.password);
                localStorage.setItem('mock_user_name', payload.name || 'User');
                alert('Success! Registration complete (Local mode).');
                authModal.classList.add('hidden');
                authForm.reset();
                if (loginBtn) loginBtn.innerText = 'My Account';
                if (signupBtn) signupBtn.classList.add('hidden');
            } else {
                // Mock login
                const em = localStorage.getItem('mock_user_email');
                const pw = localStorage.getItem('mock_user_pass');
                if (em === payload.email && pw === payload.password) {
                    alert('Welcome back, ' + localStorage.getItem('mock_user_name') + '! (Local mode)');
                    authModal.classList.add('hidden');
                    authForm.reset();
                    if (loginBtn) loginBtn.innerText = 'My Account';
                    if (signupBtn) signupBtn.classList.add('hidden');
                } else {
                    authError.innerText = 'Invalid email or password. (Local mode)';
                    authError.classList.remove('hidden');
                }
            }
        }
    });

    // View Details Buttons in My Contracts
    const viewBtns = document.querySelectorAll('.outline-btn');
    const detailsModal = document.getElementById('details-modal');
    const closeDetailsBtn = document.getElementById('close-details');
    const detailsBody = document.getElementById('details-body');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (tr) {
                const contractName = tr.cells[0].innerText;
                const score = tr.cells[2].innerText;
                detailsBody.innerHTML = `
                    <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <p style="margin-bottom: 0.5rem; color: #fff;"><strong>Contract:</strong> ${contractName}</p>
                        <p style="margin-bottom: 0.5rem; color: #fff;"><strong>Score:</strong> ${score}</p>
                        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0;">
                        <p>Full SLA extraction and continuous chatbot history for this contract would appear here once fully hooked to the backend history endpoint.</p>
                    </div>
                `;
                detailsModal.classList.remove('hidden');
            }
        });
    });

    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', () => {
            detailsModal.classList.add('hidden');
        });
    }

});
