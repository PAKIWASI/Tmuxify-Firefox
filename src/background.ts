
interface BaseMessage {
    action: string;
}

interface NextTabMessage extends BaseMessage {
    action: 'nextTab';
}

interface PrevTabMessage extends BaseMessage {
    action: 'prevTab';
}

interface SwitchTabMessage extends BaseMessage {
    action: 'switchTab';
    tabNumber: number;
}

interface LastTabMessage extends BaseMessage {
    action: 'lastTab'
}

// Union type for all possible messages
type ExtensionMessage = 
    | NextTabMessage 
    | PrevTabMessage 
    | SwitchTabMessage 
    | LastTabMessage



let lastTab: browser.tabs.Tab | null = null;
let currTab: browser.tabs.Tab | null = null;

//track tab switches
browser.tabs.onActivated.addListener(async (activeInfo) => {
    if (currTab) {
        lastTab = currTab; // store previous curr tab as the last tab (if exists)
    } 
    try {  //update curr tab
        currTab = await browser.tabs.get(activeInfo.tabId); 
    }
    catch (error) {
        console.error("cant get curr tab:", error);
    }
});
//Clean up when tabs are removed 
browser.tabs.onRemoved.addListener((tabId) => {
    if (lastTab?.id === tabId) {
        lastTab = null;
    }
    if (currTab?.id === tabId) {
        currTab = null;
    }
});

// Listen for messages from content script
browser.runtime.onMessage.addListener(async (Message: any) => {
    const message = Message as ExtensionMessage;

    console.log('background received message:', message);
    
    try {
        switch (message.action) {
           case 'nextTab':
                await switchToNextTab();
                break;
            case 'prevTab':
                await switchToPrevTab();
                break;
            case 'switchTab':
                await switchToTabByNumber(message.tabNumber);
                break;
           case 'lastTab':
                await switchToLastTab();
                break;
        }
    } catch (error) {
        console.error('error message:', error);
    }
});


async function switchToNextTab(): Promise<void> {
    const tabs = await browser.tabs.query({currentWindow: true});
    const currentTab = await getCurrentTab();
    lastTab = currentTab; 

    if (!currentTab || tabs.length <= 1) return;
    
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab.id);
    const nextIndex = (currentIndex + 1) % tabs.length;
    const nextTab = tabs[nextIndex];
    
    if (nextTab.id) {
        await browser.tabs.update(nextTab.id, { active: true });
    }
}

async function switchToPrevTab(): Promise<void> {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const currentTab = await getCurrentTab();
    lastTab = currentTab;
    
    if (!currentTab || tabs.length <= 1) return;
    
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab.id);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    const prevTab = tabs[prevIndex];
    
    if (prevTab.id) {
        await browser.tabs.update(prevTab.id, { active: true });
    }
}

async function switchToTabByNumber(tabNumber: number): Promise<void> {
    const tabs = await browser.tabs.query({ currentWindow: true });
    lastTab = await getCurrentTab();

    // Convert 1-based to 0-based index
    const targetIndex = tabNumber - 1;
    
    if (targetIndex >= 0 && targetIndex < tabs.length) {
        const targetTab = tabs[targetIndex];
        if (targetTab.id) {
            await browser.tabs.update(targetTab.id, { active: true });
        }
    } else {
        console.log(`Tab ${tabNumber} doesn't exist. Only ${tabs.length} tabs available.`);
    }
}


async function switchToLastTab(): Promise<void> {
    if (lastTab?.id) {
        try {
            //check if the last tabs still exists
            await browser.tabs.get(lastTab.id);
            await browser.tabs.update(lastTab.id, {active: true});
        }
        catch (error) {
            console.log("last tab no longer exists");
            lastTab = null; 
        }
    }
    else {
        console.log("no last tab");
    }
}

async function getCurrentTab(): Promise<browser.tabs.Tab> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
}


