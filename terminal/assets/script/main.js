var terminal = document.getElementById("terminal")
var tool_bar = document.getElementById("tool_bar")
var terminal_icon = document.getElementById("terminal_icon")

var c = 0;

var old_left;
var old_top;
var old_width;
var old_height;

var old_txt_width;
var old_txt_height;


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
    fileContent;
    fileName;
    perms = new Array(3);

    constructor(_fileName_){
        this.fileName = _fileName_;
        this.fileContent = "";
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
        this.isMinimized = false;
        this.isMaximized = false;

        this.container = document.createElement("div");
        this.container.className = "container";
        terminal.appendChild(this.container);

        this.bar = document.createElement("div");
        this.bar.className = "bar";
        this.container.appendChild(this.bar);

        this.closeButton = document.createElement("button");
        this.closeButton.innerHTML = "<i class='fa-solid fa-circle-xmark'></i>";
        this.closeButton.className = "button";
        this.bar.appendChild(this.closeButton);

        this.minimizeButton = document.createElement("button");
        this.minimizeButton.innerHTML = "<i class='fas fa-window-minimize'></i>"; 
        this.minimizeButton.className = "button";
        this.bar.appendChild(this.minimizeButton);

        this.maximizeButton = document.createElement("button");
        this.maximizeButton.innerHTML = "<i class='fas fa-window-maximize'></i>"; 
        this.maximizeButton.className = "button";
        this.bar.appendChild(this.maximizeButton);

        this.closeButton.addEventListener("click", () => {
            this.container.remove();
            c-=1;
        });

        this.minimizeButton.addEventListener("click", () => {
            this.container.style.display = "none";
            terminal_icon.style.backgroundColor = "#555";
            this.isMinimized = true;
        });
        this.maximizeButton.addEventListener("click", () => {
            if (!this.isMaximized) {
                old_left = this.container.style.left;
                old_top = this.container.style.top;
                old_width = this.container.style.width;
                old_height = this.container.style.height;
                old_txt_width = this.text_area.style.width;
                old_txt_height = this.text_area.style.height;
                this.container.style.width = "98vw";
                this.container.style.height = "100vh";
                this.text_area.style.width = "100%";
                this.text_area.style.height = "100%";
                this.nano_area.style.width = "100%";
                this.nano_area.style.height = "100%";
                this.container.style.left = "3.7vw";
                this.container.style.top = "0vw";
                this.isMaximized = true;
            } else {
                this.container.style.left = old_left;
                this.container.style.top = old_top;
                this.container.style.width = old_width;
                this.container.style.height = old_height;
                this.text_area.style.width = old_txt_width;
                this.text_area.style.height = old_txt_height;
                this.nano_area.style.width = "";
                this.nano_area.style.height = "";
                this.isMaximized = false;
            }
        });

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

        this.initNano();

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
        document.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key === 'x') {
                event.preventDefault();
                if (this.nano_area.style.display === "block") {
                    let nanoContent = this.nano_input.innerText;
                    this.nano_area.style.display = "none";
                    this.nano_input.innerText = "";
                    this.text_area.style.display = "block";
                    this.terminal_input.focus();
                    this.setFileContent(this.currentEditingFile, nanoContent);
                    this.currentEditingFile = null;
                    this.addOutput("File correctly saved!");
                }
            }
        });
    }


    initNano() {
        this.nano_area = document.createElement("div");
        this.nano_area.className = "nano_area";
        this.container.appendChild(this.nano_area);

        this.editing_filename = document.createElement("p");
        this.editing_filename.className = "editing_filename";

        this.nano_area.appendChild(this.editing_filename);

        this.nano_input = document.createElement("span");
        this.nano_input.contentEditable = "true";
        this.nano_input.className = "nano_input";

        this.nano_input.style.display = "block";

        this.nano_area.appendChild(this.nano_input);

        this.nano_input.focus();
        this.nano_area.style.display = "none";
    }
    addOutput(string) {
        let output_line = document.createElement("div");
        output_line.innerHTML = string;
        output_line.className = "terminal_output";
        console.log("Appending output: ", string);
        this.terminal_output.appendChild(output_line);
        console.log("Output appended!");
    }

    getWeather(city) {
        const apiKey = '7ed282e2ddf412965da08fe6d31c85d6';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    console.log(data.main);
                    const temperature = data.main.temp;
                    const humidity = data.main.humidity;
                    const temp_max = data.main.temp_max;
                    const temp_min = data.main.temp_min;
                    const weatherDescription = data.weather[0].description;
                    const windSpeed = data.wind.speed;
                    this.addOutput(`Weather in ${city}:`);
                    this.addOutput(`    - Temperature: ${temperature} °C`);
                    this.addOutput(`    - Min Temperature: ${temp_min} °C`);
                    this.addOutput(`    - Max Temperature: ${temp_max} °C`);
                    this.addOutput(`    - Description: ${weatherDescription}`);
                    this.addOutput(`    - Wind Speed: ${windSpeed} m/s`);
                    this.addOutput(`    - Humidity: ${humidity} %`);
                } else {
                    this.addOutput(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                this.addOutput('Error fetching weather data');
            });
    }

    executeScript(_filename_){
        this.command = this.getFileContent(_filename_);
        this.executeCommand(this.command); 
    }

    getFileContent(_filename_){
        for(let i = 0; i < this.filesystem.currentFolder.folderContent.length; i++){
            if(this.filesystem.currentFolder.folderContent[i].getClassName() == "File"){
                if(this.filesystem.currentFolder.folderContent[i].fileName == _filename_){
                    return this.filesystem.currentFolder.folderContent[i].fileContent;
                }
            }
        }
        return 0;
    }

    searchFile(_filename_){
        for(let i = 0; i < this.filesystem.currentFolder.folderContent.length; i++){
            if(this.filesystem.currentFolder.folderContent[i].getClassName() == "File"){
                if(this.filesystem.currentFolder.folderContent[i].fileName == _filename_){
                    return 1;
                }
            }
        }
        return 0;
    }

    setFileContent(_filename_, _content_){
        for(let i = 0; i < this.filesystem.currentFolder.folderContent.length; i++){
            if(this.filesystem.currentFolder.folderContent[i].getClassName() == "File"){
                if(this.filesystem.currentFolder.folderContent[i].fileName == _filename_){
                    return this.filesystem.currentFolder.folderContent[i].fileContent = _content_;
                }
            }
        }
        return 0;
    }

    cat(_filename_){
        this.addOutput(this.getFileContent(_filename_));
    }


    nano(_filename_) {
        this.nano_area.style.width = this.text_area.style.width;
        this.nano_area.style.height = this.text_area.style.height;
        this.text_area.style.display = "none";
        this.nano_area.style.display = "block"
        this.editing_filename.innerText ="Editing " + _filename_ + ":";
        console.log(this.nano_area.style.display);
        this.nano_input.innerText = this.getFileContent(_filename_);
        this.nano_area.addEventListener("click", () => {
            this.nano_input.focus();
        });
        this.currentEditingFile = _filename_;
    }

    executeCommand(command) {
        this.commandsHistory.push(command);
        const args = command.trim().split(' ');
        const cmd = args.shift();
        
        if(cmd.startsWith("./")){
            console.log("Executing the script of the file: " + cmd.substring(2));
            this.executeScript(cmd.substring(2));
        }else
        {
            switch(cmd){
                case 'clear':
                    this.terminal_output.innerHTML = "";
                    break;
                case 'help':
                    this.addOutput("Available Commands:");
                    this.addOutput("    - clear: 'Clear the contents of the terminal.'");
                    this.addOutput("    - echo: 'Display a line of text.'");
                    this.addOutput("    - mkdir: 'Create a folder.'");
                    this.addOutput("    - touch: 'Create a file.'");
                    this.addOutput("    - ls: 'Lists the content of a folder.'");
                    this.addOutput("    - cd: 'Allows you to move between directories.'");
                    this.addOutput("    - rm: 'Remove from your current directory a file or a folder.'");
                    this.addOutput("    - pwd: 'Prints the absolute path of your current directory.'");
                    this.addOutput("    - nano: 'Allows you to edit files.'");
                    this.addOutput("    - cat: 'Prints the content of a file.'");
                    this.addOutput("    - exit: 'Close the terminal.'");
                    this.addOutput("    - weather: 'Get a response about weather in a specific city.'");
                    break;

                case 'mkdir':
                    if(args.length == 0 || args.length > 1)
                        this.addOutput("Usage: mkdir (folderName)");
                    else
                        this.filesystem.createFolder(args[0]);
                    break;
                case 'touch':
                    if(args.length == 0 || args.length > 1)
                        this.addOutput("Usage: touch (fileName)");
                    else if(this.searchFile(args[0]) == 1)
                        this.addOutput("File already exists with this name!");
                    else
                        this.filesystem.createFile(args[0]);
                    break;
                case 'rm':
                    if(args.length == 0 || args.length > 1)
                        this.addOutput("Usage: rm (name)");
                    else
                        this.filesystem.remove(args[0]);
                    break;
                case 'ls':
                    console.log("Printing file content!")
                    this.filesystem.printCurrentFolderContent();
                    
                    break;
                case 'cd':
                    if(args.length == 0 || args.lenght > 1)
                        this.addOutput("Usage: cd (directory)");
                    else{
                        this.filesystem.changeDirectory(args[0]);
                        if(this.filesystem.currentFolder.folderName != "home")
                            this.fixed_line.innerText = "antonio@ubuntu:" + this.filesystem.getFullPath() + "$  ";
                        else
                            this.fixed_line.innerText = "antonio@ubuntu:~$  ";
                        this.fixed_line.appendChild(this.fixed_text);
                        this.fixed_line.appendChild(this.terminal_input);
                        this.terminal_input.focus();
                    }
                    break;
                case 'pwd':
                    this.addOutput(this.filesystem.getFullPath());
                    break;
                case 'echo':
                    if(args.length == 0 || args.lenght > 1)
                        this.addOutput("Usage: echo (string)");
                    else
                        this.addOutput(args[0]);
                    break;

                case 'nano':
                    if(args.length == 0 || args.lenght > 1)
                        this.addOutput("Usage: nano (file)");
                    else{
                        if(this.searchFile(args[0]) == 0){
                            this.addOutput("nano: No such file: " + args[0])
                        }else{
                        this.nano(args[0]);
                        }
                    }
                    break;
                
                case 'cat':
                    if(args.length == 0 || args.lenght > 1)
                        this.addOutput("Usage: cat (file)");
                    else{
                        if(this.searchFile(args[0]) == 0){
                            this.addOutput("cat: No such file: " + args[0])
                        }else{
                        this.cat(args[0]);
                        }
                    }
                    break;
                case 'exit':
                    this.container.remove();
                    c-=1;
                case 'weather':
                    if (args.length == 0 || args.length > 1) {
                        this.addOutput("Usage: weather (cityName)");
                    } else {
                        this.getWeather(args[0]);
                    }
                    break;
                default:
                    this.addOutput("Command not found! Write help to see all available commands!");

            }
        }
    }

    execute() {
        let command = this.terminal_input.innerHTML;
        console.log("Executing command: ", command);
        this.terminal_input.innerHTML = "";
        if(this.filesystem.currentFolder.folderName != "home")
            this.addOutput("antonio@ubuntu:" + this.filesystem.getFullPath() + "$  " + command)
        else
            this.addOutput("antonio@ubuntu:~$  " + command);

        this.executeCommand(command);
    }
}
let terminalInstance;

terminal_icon.addEventListener("click", function () {
    if (c == 0) {
        terminalInstance = new Terminal();
        c += 1;
        console.log("Terminal instance created");
    }
    else{
        this.isMinimized = false;
        terminal_icon.style.backgroundColor = "transparent";
        terminal_icon.style.transition = "background-color 0.3s";
        terminalInstance.container.style.display = "block";
    }
});


