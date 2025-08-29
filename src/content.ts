
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
       case 'n': {
            const msgn:NextTabMessage = {action: "nextTab"};
            browser.runtime.sendMessage(msgn);
            break;
        }
        case 'p': {
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
            const msgnum:SwitchTabMessage = {action: "switchTab", tabNumber: parseInt(ev.key)};
            browser.runtime.sendMessage(msgnum);
            break;
        }
       case 'u': {
            const msgu: LastTabMessage = { action: "lastTab"};            
            browser.runtime.sendMessage(msgu);
            break;
        }
        case 'escape': {
            deactivate_prefix_mode();
            break;
        }
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



