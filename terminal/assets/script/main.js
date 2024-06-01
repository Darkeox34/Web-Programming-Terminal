var terminal = document.getElementById("terminal")
var tool_bar = document.getElementById("tool_bar")
var terminal_icon = document.getElementById("terminal_icon")

var c = 0;

class Folder{
    parent;
    folderContent = [];
    folderName;

    constructor(_folderName_){
        this.folderName = _folderName_;
    }

    getClassName(){
        return this.constructor.name;
    }
}

class File{
    content;
    fileName;

    constructor(_fileName_){
        this.fileName = _fileName_;
    }
    getClassName(){
        return this.constructor.name;
    }
}

class fileSystem{
    addOutputFunc;
    root;
    currentFolder;
    parentDir;
    constructor(addOutputFunction){
        this.root = new Folder("home");
        this.root.parent = this.root;
        this.currentFolder = this.root;
        this.addOutputFunc = addOutputFunction;
    }

    printCurrentFolderContent(){
        for(let i = 0; i < this.currentFolder.folderContent.length; i++){
            if(this.currentFolder.folderContent[i].getClassName() == "File"){
                this.addOutputFunc("     - " + this.currentFolder.folderContent[i].fileName + "*");
            }
            else if(this.currentFolder.folderContent[i].getClassName() == "Folder"){
                this.addOutputFunc("     - " + this.currentFolder.folderContent[i].folderName);
            }
        }
    }

    getFullPath(){
        let path = "";
        let currFolder = this.currentFolder;

        while(this.currentFolder.folderName != "home"){
            console.log("fname: " + this.currentFolder.folderName);
            path = "/" + this.currentFolder.folderName + path;
            this.currentFolder = this.currentFolder.parent;
        }
        this.currentFolder = currFolder;
        console.log(path);
        return "/home" + path;
    }

    createFile(_fileName_){
        let newFile = new File(_fileName_);
        this.currentFolder.folderContent.push(newFile);
    }

    createFolder(_folderName_){
        let newFolder = new Folder(_folderName_);
        newFolder.parent = this.currentFolder;
        this.currentFolder.folderContent.push(newFolder);
    }

    changeDirectory(_dirName_){
        if(_dirName_ == ".."){
            this.currentFolder = this.currentFolder.parent;
            return 1;
        }
        for(let i = 0; i < this.currentFolder.folderContent.length; i++){
            this.type = this.currentFolder.folderContent[i].getClassName();
            if(this.type == "Folder"){
                if(this.currentFolder.folderContent[i].folderName == _dirName_){
                    this.currentFolder = this.currentFolder.folderContent[i];
                    return 1;
                }
            }
        }
        this.addOutputFunc("cd: No such file or directory: " + _dirName_);
    }

    remove(_name_){
        for(let i = 0; i < this.currentFolder.folderContent.length; i++){
            this.type = this.currentFolder.folderContent[i].getClassName();
            if(this.type == "File"){
                if(this.currentFolder.folderContent[i].fileName == _name_){
                    console.log("Deleting " + this.currentFolder.folderContent[i].fileName);
                    this.currentFolder.folderContent.splice(i, 1);
                    return 1;
                }
            }
            else if(this.type == "Folder"){
                if(this.currentFolder.folderContent[i].folderName == _name_){
                    console.log("Deleting " + this.currentFolder.folderContent[i].fileName);
                    this.currentFolder.folderContent.splice(i, 1);
                    return 1;
                }
            }
        }
        this.addOutputFunc("rm: cannot remove '" + _name_ + "': No such file or directory.");
        return 0;
    }
}

class Terminal {
    constructor() {

        this.commandsHistory = [];
    
        this.filesystem = new fileSystem(this.addOutput.bind(this));
        this.posX = 0;
        this.posY = 0;
        this.drag = false;

        this.container = document.createElement("div");
        this.container.className = "container";
        terminal.appendChild(this.container);

        this.bar = document.createElement("div");
        this.bar.className = "bar";
        this.container.appendChild(this.bar);

        this.text_area = document.createElement("div");
        this.text_area.className = "text_area";
        this.container.appendChild(this.text_area);

        this.terminal_output = document.createElement("div");
        this.text_area.appendChild(this.terminal_output);

        this.fixed_line = document.createElement("div");
        this.text_area.appendChild(this.fixed_line);

        this.fixed_text = document.createElement("span");
        this.fixed_text.className = "fixed_text";
        this.fixed_line.innerHTML = "antonio@ubuntu:~$  ";
        this.fixed_line.style.color = "#fff";
        this.fixed_line.appendChild(this.fixed_text);

        this.terminal_input = document.createElement("span");
        this.terminal_input.contentEditable = "true";
        this.terminal_input.className = "terminal_input";

        this.fixed_line.appendChild(this.terminal_input);
        this.terminal_input.focus();

        this.bar.addEventListener("mousedown", (mouse) => {
            this.drag = true;
            this.posX = mouse.offsetX;
            this.posY = mouse.offsetY;
            console.log("Mouse down on bar: drag started");
        });

        this.terminal_input.addEventListener("keydown", (keyButton) => {
            if (keyButton.key === "Enter") {
                keyButton.preventDefault();
                this.execute();
            }
        });

        this.text_area.addEventListener("click", () => {
            this.terminal_input.focus();
        });

        document.addEventListener("mouseup", () => {
            this.drag = false;
            console.log("Mouse up: drag ended");
        });

        this.container.addEventListener("mousemove", (mouse) => {
            if (this.drag) {
                this.container.style.left = (mouse.clientX - this.posX) + "px";
                this.container.style.top = (mouse.clientY - this.posY) + "px";
                console.log(`Container moved to: ${this.container.style.left}, ${this.container.style.top}`);
            }
        });
    }

    addOutput(string) {
        let output_line = document.createElement("div");
        output_line.innerHTML = string;
        output_line.className = "terminal_output";
        console.log("Appending output: ", string);
        this.terminal_output.appendChild(output_line);
        console.log("Output appended!");
    }

    executeCommand(command) {
        this.commandsHistory.push(command);
        const args = command.trim().split(' ');
        const cmd = args.shift();
        switch(cmd){
            case 'clear':
                this.terminal_output.innerHTML = "";
                break;
            case 'help':
                this.addOutput("Available Commands:");
                this.addOutput("    - clear: 'Clear the contents of the terminal.'");
                this.addOutput("    - mkdir: 'Create a folder.'");
                this.addOutput("    - touch: 'Create a file.'");
                this.addOutput("    - ls: 'Lists the content of a folder.'");
                this.addOutput("    - cd: 'Allows you to move between directories.'");
                this.addOutput("    - rm: 'Remove from your current directory a file or a folder.'");
                this.addOutput("    - pwd: 'Prints the absolute path of your current directory.'");
                break;
            case 'mkdir':
                if(args.length == 0 || args.length > 1)
                    this.addOutput("Usage: mkdir <folderName>");
                else
                    this.filesystem.createFolder(args[0]);
                break;
            case 'touch':
                if(args.length == 0 || args.length > 1)
                    this.addOutput("Usage: touch <fileName>");
                else
                    this.filesystem.createFile(args[0]);
                break;
            case 'rm':
                if(args.length == 0 || args.length > 1)
                    this.addOutput("Usage: rm <name>");
                else
                    this.filesystem.remove(args[0]);
                break;
            case 'ls':
                console.log("Printing file content!")
                this.filesystem.printCurrentFolderContent();
                break;
            case 'cd':
                if(args.length == 0 || args.lenght > 1)
                    this.addOutput("Usage: cd <directory>");
                else
                    this.filesystem.changeDirectory(args[0]);
                break;
            case 'pwd':
                this.addOutput(this.filesystem.getFullPath());
                break;

            default:
                this.addOutput("Command not found!");
        }
    }

    execute() {
        let command = this.terminal_input.innerHTML;
        console.log("Executing command: ", command);
        this.terminal_input.innerHTML = "";
        this.addOutput("antonio@ubuntu:~$  " + command);
        this.executeCommand(command);
    }
}


terminal_icon.addEventListener("click", function () {
    if (c === 0) {
        let terminalInstance = new Terminal();
        c += 1;
        console.log("Terminal instance created");
    }
});


