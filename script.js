
    /******************
    * Simulated API Functions
    ******************/
    function simulateDelay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function detectLanguage(text) {
        await simulateDelay(500);
    const lowerText = text.toLowerCase();
    if (lowerText.includes("hola")) {
        return {language: "Spanish", code: "es" };
      } else if (lowerText.includes("bonjour")) {
        return {language: "French", code: "fr" };
      } else if (lowerText.includes("привет")) {
        return {language: "Russian", code: "ru" };
      } else if (lowerText.includes("merhaba")) {
        return {language: "Turkish", code: "tr" };
      } else if (lowerText.includes("olá")) {
        return {language: "Portuguese", code: "pt" };
      } else {
        return {language: "English", code: "en" };
      }
    }
    async function summarizeText(text) {
        await simulateDelay(800);
      // Return a summary if text is more than 150 characters
      return text.length > 150 ? text.substring(0, 100) + "..." : text;
    }
    async function translateText(text, targetLang) {
        await simulateDelay(800);
    return text + " [Translated to " + targetLang + "]";
    }
    /******************
     * Global Variables and History Storage
     ******************/
    const historyData = [];
    /******************
     * Voice Recognition Setup
     ******************/
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
    inputText.value = transcript;
      };
    }
    /******************
     * UI and Event Handlers
     ******************/
    const chatArea = document.getElementById('chatArea');
    const inputText = document.getElementById('inputText');
    const sendButton = document.getElementById('sendButton');
    const micButton = document.getElementById('micButton');
    const toggleDarkBtn = document.getElementById('toggleDark');
    const toggleHistoryBtn = document.getElementById('toggleHistory');
    const historyPanel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');

    // Toggle history sidebar and add a class to body so chat-container margin adjusts
    toggleHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('open');
    if (historyPanel.classList.contains('open')) {
        document.body.classList.add('history-open');
      } else {
        document.body.classList.remove('history-open');
      }
    });
    // Toggle light/dark mode
    toggleDarkBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    toggleDarkBtn.textContent = document.body.classList.contains('dark-mode') ? "Light Mode" : "Dark Mode";
    });
    // Start voice recognition on mic button click
    micButton.addEventListener('click', () => {
      if (recognition) {
        recognition.start();
      } else {
        alert("Voice recognition is not supported in this browser.");
      }
    });
    // Handle sending messages
    sendButton.addEventListener('click', handleSend);
    inputText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
    handleSend();
      }
    });
    // Add message entry to history panel with delete button
    function addToHistory(entry) {
        historyData.push(entry);
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.tabIndex = 0;
    historyItem.innerHTML = `
    <div class="info">
        <div class="small">${new Date().toLocaleTimeString()}</div>
        <div>${entry.text.substring(0, 30)}${entry.text.length > 30 ? '...' : ''}</div>
        <div class="small">Language: ${getFlag(entry.langCode)} ${entry.lang}</div>
    </div>
    `;
    // Delete button for history item
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-history';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete history';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
    historyItem.remove();
      });
    historyItem.appendChild(deleteBtn);
      // Scroll to the message when clicking the history item
      historyItem.addEventListener('click', () => {
        entry.element.scrollIntoView({ behavior: 'smooth' });
      });
    historyList.prepend(historyItem);
    }
    // Return emoji flag based on language code
    function getFlag(code) {
      const flags = {
        en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    pt: '🇵🇹',
    ru: '🇷🇺',
    tr: '🇹🇷'
      };
    return flags[code] || '🏳️';
    }
    async function handleSend() {
      const text = inputText.value.trim();
    if (!text) {
        alert("Please enter some text.");
    return;
      }
    inputText.value = '';
    // Create user message bubble
    const messageEl = document.createElement('div');
    messageEl.className = 'message user';
    // Text content
    const textEl = document.createElement('div');
    textEl.textContent = text;
    messageEl.appendChild(textEl);
    // Voice button to read the message aloud
    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'voice-btn';
    voiceBtn.textContent = '🔊';
    voiceBtn.title = 'Read aloud';
      voiceBtn.addEventListener('click', () => {
        const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
      });
    messageEl.appendChild(voiceBtn);

    // Create actions container for meta info, summarizer, and translation UI
    const actionsEl = document.createElement('div');
    actionsEl.className = 'actions';

    // Meta info element (for language detection)
    const metaEl = document.createElement('div');
    metaEl.className = 'meta';
    metaEl.textContent = 'Detecting language...';
    actionsEl.appendChild(metaEl);

    // Append actions container to the message bubble
    messageEl.appendChild(actionsEl);
    chatArea.appendChild(messageEl);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Process language detection
    try {
        const langData = await detectLanguage(text);
    metaEl.textContent = "Detected: " + getFlag(langData.code) + " " + langData.language;
    // Add this message to history
    addToHistory({text, lang: langData.language, langCode: langData.code, element: messageEl });

        // If the message is more than 150 characters, add a Summarize button
        if (text.length > 150) {
          const summarizeBtn = document.createElement('button');
    summarizeBtn.className = 'summarize';
    summarizeBtn.textContent = "Summarize";
    summarizeBtn.setAttribute("aria-label", "Summarize text");
          summarizeBtn.addEventListener('click', async () => {
        summarizeBtn.disabled = true;
    summarizeBtn.textContent = "Summarizing...";
    try {
              const summary = await summarizeText(text);
    const summaryEl = document.createElement('div');
    summaryEl.className = 'result';
    summaryEl.textContent = "Summary: " + summary;
    messageEl.appendChild(summaryEl);
    chatArea.scrollTop = chatArea.scrollHeight;
            } catch (error) {
        alert("Error during summarization.");
            }
          });
    actionsEl.appendChild(summarizeBtn);
        }

    // Translation UI: separate container for dropdown and translate button
    const translationContainer = document.createElement('div');
    translationContainer.className = 'translation-container';

    const translateSelect = document.createElement('select');
    translateSelect.setAttribute("aria-label", "Select language to translate to");
    const languages = [
    {label: "English", value: "en", flag: "🇺🇸" },
    {label: "Portuguese", value: "pt", flag: "🇵🇹" },
    {label: "Spanish", value: "es", flag: "🇪🇸" },
    {label: "Russian", value: "ru", flag: "🇷🇺" },
    {label: "Turkish", value: "tr", flag: "🇹🇷" },
    {label: "French", value: "fr", flag: "🇫🇷" }
    ];
        languages.forEach(lang => {
          const option = document.createElement('option');
    option.value = lang.value;
    option.textContent = `${lang.flag} ${lang.label}`;
    translateSelect.appendChild(option);
        });
    translationContainer.appendChild(translateSelect);

    const translateBtn = document.createElement('button');
    translateBtn.className = 'translate';
    translateBtn.textContent = "Translate";
    translateBtn.setAttribute("aria-label", "Translate text");
        translateBtn.addEventListener('click', async () => {
        translateBtn.disabled = true;
    translateBtn.textContent = "Translating...";
    try {
            const targetLang = translateSelect.value;
    const translation = await translateText(text, targetLang);
    const translationEl = document.createElement('div');
    translationEl.className = 'result';
    translationEl.textContent = "Translation: " + translation;
    messageEl.appendChild(translationEl);
    chatArea.scrollTop = chatArea.scrollHeight;
          } catch (error) {
        alert("Error during translation.");
          }
        });
    translationContainer.appendChild(translateBtn);
    actionsEl.appendChild(translationContainer);
        
      } catch (error) {
        metaEl.textContent = "Error detecting language.";
      }
    }


    //language translate
async function translateText(text, targetLang) {
    try {
        if ('ai' in self && 'translator' in self.ai) {
            const translatorCapabilities = await self.ai.translator.capabilities();
            const availability = await translatorCapabilities.languagePairAvailable('en', targetLang); // Check availability

            if (availability === 'readily' || availability === 'after-download') {
                const translator = await self.ai.translator.create({
                    sourceLanguage: 'en',
                    targetLanguage: targetLang,
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                        });
                    },
                });

                const translation = await translator.translate(text);
                return translation;
            } else {
                return `Translation to ${targetLang} is not currently supported. Availability: ${availability}`; // Handle unsupported languages
            }
        } else {
            return "Translator API is not supported in this browser."; // Handle API absence
        }
    } catch (error) {
        console.error("Translation error:", error);
        return "Error during translation: " + error.message; // More informative error message
    }
}