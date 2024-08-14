const { exec } = require('child_process');
const os = require('os');
const vscode = require('vscode');
const { promisify } = require('util');
const logger = require('./console');

const execAsync = promisify(exec);

async function showWebviewPanel(title, htmlContent) {
    const panel = vscode.window.createWebviewPanel(
        'webviewPanel',
        title,
        vscode.ViewColumn.One,
        {}
    );

    panel.webview.html = htmlContent;
}

async function showNodeInstallationInstructions() {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>Node.js Installation Instructions</title>
        </head>
        <body>
            <h1>Manual Node.js Installation</h1>
            <p>Please follow the instructions below to install Node.js manually:</p>
            <ul>
                <li>Visit the <a href="https://nodejs.org/">Node.js official website</a>.</li>
                <li>Download the installer for your operating system.</li>
                <li>Follow the installation instructions provided on the website.</li>
            </ul>
            <p>After installing Node.js, please restart VSCode.</p>
        </body>
    </html>`;
    showWebviewPanel('Node.js Installation Instructions', htmlContent);
}

async function showLearnpackInstallationInstructions() {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>LearnPack Installation Instructions</title>
        </head>
        <body>
            <h1>Manual LearnPack Installation</h1>
            <p>Please follow the instructions below to install LearnPack manually:</p>
            <ul>
                <li>Open your terminal or command prompt.</li>
                <li>Run the following command: 
                <code>npm i -g @learnpack/learnpack</code>
                </li>
                </ul>
                
            <p>After installing LearnPack, run the following command</p>
            <pre>
            <code>learnpack start</code>
            </pre>
        </body>
    </html>`;
    showWebviewPanel('LearnPack Installation Instructions', htmlContent);
}

async function checkNodeInstallation() {
    try {
        const { stdout, stderr } = await execAsync('node -v');
        if (stderr) throw Error("Node is not installed!");
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
        showNodeInstallationInstructions();
    }
}

async function checkLearnpackInstallation() {
    try {
        const { stdout, stderr } = await execAsync('npm list -g @learnpack/learnpack');
        if (stderr) throw Error("LearnPack is not installed!");
    } catch (error) {
        vscode.window.showErrorMessage('@learnpack/learnpack is not installed. Attempting to install @learnpack/learnpack globally, just wait a minute!');
        await installLearnpack();
    }
}

async function installLearnpack() {
    try {
        throw Error("testing bor")
        await execAsync('npm i -g @learnpack/learnpack');
        vscode.window.showInformationMessage('@learnpack/learnpack installed successfully.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to install @learnpack/learnpack. Please install it manually, run: \nnpm i -g @learnpack/learnpack`);
        showLearnpackInstallationInstructions();
        logger.debug(error);
    }
}

const onboardingManager = {
    checkNodeInstallation,
    installNode,
    checkLearnpackInstallation,
    installLearnpack
};

module.exports = onboardingManager;
