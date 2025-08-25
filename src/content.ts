
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




let prefix_mode = false;
let timer: number | null = null;
const TIME = 3000;

window.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (prefix_mode) {
        handle_tmux_commands(ev);
        return;
    }
    if  (ev.altKey && ev.key.toLowerCase() === 'a') {
        activate_prefix_mode();
    }
});

function activate_prefix_mode() {
    prefix_mode = true;
    console.log("prefix mode activated");
    start_prefix_timeout();
}

function start_prefix_timeout() {
    // clear existing timer
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    // new timer
    timer = setTimeout(() => {
        deactivate_prefix_mode(); 
    }, TIME);
}

function deactivate_prefix_mode() {
    prefix_mode = false;   
    console.log("prefix mode deactivated");
    
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}


function handle_tmux_commands(ev: KeyboardEvent) {

    ev.preventDefault();
    ev.stopPropagation();
    switch(ev.key.toLowerCase()) {
        case 'c': {
            console.log("create new tab");
            const msgc:CreateTabMessage = { action: "createTab" };
            browser.runtime.sendMessage(msgc);
            break;
        }
        case 'n': {
            console.log("next tab");
            const msgn:NextTabMessage = {action: "nextTab"};
            browser.runtime.sendMessage(msgn);
            break;
        }
        case 'p': {
            console.log("previous tab");
            const msgp: PrevTabMessage = { action: "prevTab" };
            browser.runtime.sendMessage(msgp);
            break;
        }
        case '1': 
        case '2': 
        case '3': 
        case '4': 
        case '5': 
        case '6': 
        case '7': 
        case '8': 
        case '9': { 
            console.log("switch to tab", ev.key);
            const msgnum:SwitchTabMessage = {action: "switchTab", tabNumber: parseInt(ev.key)};
            browser.runtime.sendMessage(msgnum);
            break;
        }
        case 'x': { 
            console.log("close curr tab");
            const msgx:CloseTabMessage = { action: "closeTab" };
            browser.runtime.sendMessage(msgx);
            break;
        }
        case 'escape': {
            console.log("cancel prefix mode");
            deactivate_prefix_mode();
            break;
        }
      default:
            console.log("unknown command:", ev.key);
    }
    // Deactivate after command (except escape)
    if (ev.key.toLowerCase() !== 'escape') {
        deactivate_prefix_mode();
    }
}

// Also deactivate prefix mode if user clicks elsewhere
document.addEventListener('click', () => {
    if (prefix_mode) {
        deactivate_prefix_mode();
    }
});

// Deactivate when losing focus
window.addEventListener('blur', () => {
    if (prefix_mode) {
        deactivate_prefix_mode();
    }
});



