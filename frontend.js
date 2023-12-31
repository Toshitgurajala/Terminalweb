
const socket = new WebSocket("ws://localhost:6060");

var term = new window.Terminal({
    cursorBlink: true
})
term.open(document.getElementById('terminal'));

function init() {
    term.resize(190,70);
    if (term._initialized) {
        return;
    }

    term._initialized = true;

    term.prompt = () => {
        term.write('\r\n$ ');
    };
    prompt(term);

    term.onData(e => {
        switch (e) {
            case '\r': // Enter
                runCommand(term, command);
                command = '';
                break;
            case '\u007F': // Backspace (DEL)
                if (term._core.buffer.x > 5) {
                    term.write('\b \b');
                    if (command.length > 0) {
                        command = command.substr(0, command.length - 1);
                    }
                }
                break;
            case '\u0009':
                console.log('tabbed', output, ["dd", "ls"]);
                break;
            default:
                if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                    command += e;
                    term.write(e);
                }
        }
        
    });
    socket.onopen = () => {
        socket.send("clearstart" + "\n");
      };
      
}

function clearInput(command) {
    var inputLengh = command.length;
    for (var i = 0; i < inputLengh; i++) {
        term.write('\b \b');
    }
}
function prompt(term) {
    command = '';
    term.write('\r\n$ ');
}
socket.onmessage = (event) => {
    term.write(event.data);
}

function runCommand(term, command) {
    if (command.length > 0) {
        clearInput(command);
        socket.send(command + '\n');
        return;
    }
}


init();