![Isleward](https://gitlab.com/Isleward/isleward/raw/master/src/client/images/logo_1.png)

A multiplayer, moddable, extensible roguelike built with NodeJS, JS, HTML and CSS

[Test Server](http://play.isleward.com/) | [Discord](https://discord.gg/gnsn7ZP) | [Subreddit](https://www.reddit.com/r/isleward) | [Blog](http://blog.isleward.com/) | [Wiki](http://isleward.gamepedia.com/) | [Twitter](https://twitter.com/bigbadwofl) | [Patreon](http://patreon.com/bigbadwaffle)

### Installation and Usage
#### Windows
1. (Optional) Install [Chocolatey](https://chocolatey.org/install)
    * Launch Command Line as Administrator
    * Run the following command: `@powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"`
1. Install NodeJS
    * 'With Chocolatey: `choco install nodejs`
    * Manually: Download latest version from [nodejs.org](https://nodejs.org/en/download/)
1. Install Git
    * With Chocolatey: `choco install git`
    * Manually: Download latest version from [git-scm.com](https://git-scm.com/download/win)
1. Open a new Command Line window and run the following commands
1. Get the code: `git clone https://gitlab.com/Isleward/isleward.git`
1. Navigate to the server folder: `cd isleward/src/server`
1. Install dependencies: `npm install`
1. Run: `node --expose-gc index.js`
1. Navigate `http://localhost:4000/` in your browser

#### Linux
1. Download Git, NodeJS and npm through your package manager
    * Ubuntu & Debian: `sudo apt-get install git nodejs npm`
    * ArchLinux: `sudo pacman -S git nodejs npm`
    * CentOS: `yum install git nodejs npm`
1. Open a new Terminal window and run the following commands
1. Get the code: `git clone https://gitlab.com/Isleward/isleward.git`
1. Navigate to the server folder: `cd isleward/src/server`
1. Install dependencies: `npm install`
1. Run: `node --expose-gc index.js`
1. Navigate `http://localhost:4000/` in your browser

#### MacOS
1. (Optional) Install [Homebrew](https://brew.sh/))
1. Install NodeJS
    * With Homebrew: `brew install node`
    * Manually: Download latest version from [nodejs.org](https://nodejs.org/en/download/)
1. Install Git
    * With Homebrew: `brew install git`
    * Manually: Download latest version from [git-scm.com](https://git-scm.com/download/win)
1. Open a new Terminal window and run the following commands
1. Get the code: `git clone https://gitlab.com/Isleward/isleward.git`
1. Navigate to the server folder: `cd isleward/src/server`
1. Install dependencies: `npm install`
1. Run: `node --expose-gc index.js`
1. Navigate `http://localhost:4000/` in your browser

![Ingame Screenshots](http://i.imgur.com/p4ktJ5O.png)