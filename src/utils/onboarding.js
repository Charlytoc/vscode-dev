const { exec } = require('child_process');
const os = require('os');
const vscode = require('vscode');
const { promisify } = require('util');
const logger = require('./console')

const execAsync = promisify(exec);

async function checkNodeInstallation() {
    try {
        const { stdout, stderr } = await execAsync('node -v');
        if (stderr) throw Error("Node is not installed!")
        // vscode.window.showInformationMessage(`Node.js is installed. Version: ${stdout}`);
    } catch (error) {
        vscode.window.showErrorMessage('Node.js is not installed. Attempting to install Node.js...');
        await installNode();
    }
}

async function installNode() {
    const platform = os.platform();
    let installCommand;
    
    if (platform === 'win32') {
        installCommand = 'winget install Schniz.fnm && fnm env --use-on-cd | Out-String | Invoke-Expression && fnm use --install-if-missing 20';
    } else if (platform === 'darwin' || platform === 'linux') {
        installCommand = 'curl -fsSL https://fnm.vercel.app/install | bash && source ~/.bashrc && fnm use --install-if-missing 20';
    } else {
        vscode.window.showErrorMessage('Unsupported OS. Please install Node.js manually from https://nodejs.org/');
        return;
    }
    
    try {
        await execAsync(installCommand);
        vscode.window.showInformationMessage('Node.js installed successfully. Please restart VSCode.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to install Node.js. Please install it manually from https://nodejs.org/. Error: ${error.stderr}`);
    }
}

async function checkLearnpackInstallation() {
    try {
        const {stdout, stderr} = await execAsync('npm list -g @learnpack/learnpack');
        if (stderr) throw Error("LearnPack is not installed!")
    } catch (error) {
        vscode.window.showErrorMessage('@learnpack/learnpack is not installed. Attempting to install @learnpack/learnpack globally, just wait a minute!');
        await installLearnpack();
    }
}

async function installLearnpack() {
    try {
        await execAsync('npm i -g @learnpack/learnpack');
        vscode.window.showInformationMessage('@learnpack/learnpack installed successfully.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to install @learnpack/learnpack. Please install it manually, run: \nnpm i -g @learnpack/learnpack`);
        logger.debug(error)
    }
}

const onboardingManager = {
    checkNodeInstallation,
    installNode,
    checkLearnpackInstallation,
    installLearnpack
};

module.exports = onboardingManager;
