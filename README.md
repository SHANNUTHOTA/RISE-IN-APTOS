<img width="1710" height="1107" alt="Screenshot 2025-08-05 at 11 09 43 PM" src="https://github.com/user-attachments/assets/701297f4-f8c2-4e12-b230-372bfa60b5f8" />
# Aptos Resource Empire DApp

## Project Description

The Aptos Resource Empire DApp is a decentralized application built on the Aptos blockchain that allows players to gather resources, trade with each other, and manage their in-game inventory. This project serves as a foundational example of a game built on the Aptos network, showcasing core concepts like resource management, player inventories, and peer-to-peer trading with a focus on an engaging and visually appealing user experience.

## Project Vision

Our vision is to create a simple yet engaging on-chain game that demonstrates the capabilities of the Aptos blockchain for game development. We aim to provide a starting point for developers interested in building more complex and feature-rich games on Aptos, fostering a vibrant ecosystem of decentralized gaming.

## Key Features

### Core Functionality

*   **Resource Gathering:** Players can gather basic resources like wood, stone, and gold.
*   **Player Inventory:** Each player has an on-chain inventory to store their gathered resources.
*   **Trading:** Players can create trade offers to exchange resources with other players.
*   **Event Tracking:** The contract emits events for resource gathering and trade offer creation, allowing for easy tracking of in-game activities.

### Technical Features

*   **Aptos Native:** Built using the Move language, specifically for the Aptos blockchain.
*   **Resource Management:** Utilizes the Aptos resource model for secure and efficient management of player inventories and game state.
*   **Type Safety:** Leverages Move's type system to prevent common vulnerabilities and ensure contract security.

### Frontend Enhancements

*   **Modern Dark Theme:** A sophisticated and visually appealing dark theme for an immersive experience.
*   **Intuitive Layout:** Improved layout and spacing for better readability and user interaction.
*   **Dynamic UI:** Subtle animations and interactive elements to enhance user engagement.
*   **Responsive Design:** Optimized for various screen sizes, providing a consistent experience across devices.

### Security Features

*   **Cooldown Mechanism:** A cooldown period is enforced for resource gathering to prevent abuse.
*   **Balance Validation:** The contract checks if a player has sufficient resources before creating a trade offer.
*   **Signer Validation:** All actions are validated to ensure they are performed by the legitimate owner of the account.

## Future Scope

### Short-term Enhancements

*   **Accepting Trade Offers:** Implement the functionality for players to accept existing trade offers.
*   **Canceling Trade Offers:** Allow players to cancel their own trade offers.
*   **More Resources:** Introduce a wider variety of resources to gather and trade.

### Medium-term Development

*   **Crafting:** Allow players to combine resources to craft new items.
*   **Building:** Enable players to build structures that provide in-game benefits.
*   **Player vs. Player (PvP):** Introduce mechanics for players to compete against each other.

### Long-term Vision

*   **Guilds and Alliances:** Allow players to form groups and collaborate.
*   **Marketplace:** Create a decentralized marketplace for trading resources and items.
*   **Governance:** Implement a governance model where players can vote on game updates and changes.

## Ecosystem Integration

*   **Wallet Compatibility:** Seamless integration with popular Aptos wallets.
*   **Explorer Integration:** On-chain data can be viewed on any Aptos block explorer.
*   **Developer Tools:** The modular design of the contract makes it easy for other developers to build upon and integrate with.

## Getting Started

To run the Aptos Resource Empire DApp locally, follow these steps:

### Prerequisites

*   Node.js (v18 or higher)
*   npm (v8 or higher)
*   Aptos CLI (installed and configured)

### 1. Clone the Repository

```bash
git clone https://github.com/SHANNUTHOTA/RISE-IN-APTOS.git
cd RISE-IN-APTOS
```

### 2. Configure Aptos CLI

Ensure your Aptos CLI is configured with a profile that has funds on the Devnet. If not, you can initialize a new profile:

```bash
aptos init --network devnet --private-key <YOUR_PRIVATE_KEY> --profile resource_game_profile
```
Replace `<YOUR_PRIVATE_KEY>` with your actual private key. This will also fund your account on Devnet if it's not already funded.

### 3. Update Contract Address

Update the `resource_game` address in `contracts/Move.toml` to match your Aptos account address.

```toml
[addresses]
resource_game = "0x<YOUR_APTOS_ACCOUNT_ADDRESS>"
```
Replace `<YOUR_APTOS_ACCOUNT_ADDRESS>` with the address associated with your `resource_game_profile`.

### 4. Publish the Smart Contract

Navigate to the `contracts` directory and publish the Move contract:

```bash
cd contracts
aptos move publish --profile resource_game_profile
```

### 5. Install Frontend Dependencies

Navigate to the `frontend` directory and install the dependencies:

```bash
cd ../frontend
npm install
```

### 6. Run the Frontend Application

Start the development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173` (or another port if 5173 is in use).

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License.
