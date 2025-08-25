

interface BaseMessage {
    action: string;
}

interface CreateTabMessage extends BaseMessage {
    action: 'createTab';
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

interface CloseTabMessage extends BaseMessage {
    action: 'closeTab';
}


// Union type for all possible messages
type ExtensionMessage = 
    | CreateTabMessage 
    | NextTabMessage 
    | PrevTabMessage 
    | SwitchTabMessage 
    | CloseTabMessage


// Listen for messages from content script
browser.runtime.onMessage.addListener(async (Message: any) => {
    const message = Message as ExtensionMessage;

    console.log('background received message:', message);
    
    try {
        switch (message.action) {
            case 'createTab':
                await createNewTab();
                break;
            case 'nextTab':
                await switchToNextTab();
                break;
            case 'prevTab':
                await switchToPrevTab();
                break;
            case 'switchTab':
                await switchToTabByNumber(message.tabNumber);
                break;
            case 'closeTab':
                await closeCurrentTab();
                break;
        }
    } catch (error) {
        console.error('error message:', error);
    }
});

async function createNewTab(): Promise<void> {
    const currentTab = await getCurrentTab();
    if (currentTab) {
        // create new tab next to current tab
        await browser.tabs.create({
            index: currentTab.index + 1,
            active: true,
        });
    } else {
        // fallback: create at end
        await browser.tabs.create({});
    }
}

async function switchToNextTab(): Promise<void> {
    const tabs = await browser.tabs.query({currentWindow: true});
    const currentTab = await getCurrentTab();
    
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

async function closeCurrentTab(): Promise<void> {
    const currentTab = await getCurrentTab();
    if (currentTab?.id) {
        await browser.tabs.remove(currentTab.id);
    }
}

async function getCurrentTab(): Promise<browser.tabs.Tab> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
}



