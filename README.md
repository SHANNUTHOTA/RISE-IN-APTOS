# Resource Game DApp

This is a decentralized application (dApp) that implements a resource game on the Aptos blockchain.

## Project Structure

The project is divided into two main parts:

- `contracts`: Contains the Move smart contract for the game.
- `frontend`: Contains the React-based frontend for interacting with the dApp.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli/install-aptos-cli)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SHANNUTHOTA/RISE-IN-APTOS.git
   cd RISE-IN-APTOS
   ```

2. **Install frontend dependencies:**

   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the frontend development server:**

   ```bash
   npm run dev
   ```

   This will start the frontend on `http://localhost:5173`.

2. **Compile and deploy the smart contract:**

   Navigate to the `contracts` directory and follow the Aptos documentation for deploying a Move module.

   ```bash
   cd ../contracts
   aptos move compile
   # Followed by deployment commands
   ```

## Available Scripts (Frontend)

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the code.
- `npm run preview`: Previews the production build.
