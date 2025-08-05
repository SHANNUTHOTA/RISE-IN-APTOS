import { AptosWalletAdapterProvider, useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { Layout, Row, Col, Button, List, Typography, Card, Statistic, Form, InputNumber, Select, message } from 'antd';
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { useEffect, useState } from 'react';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
console.log("Aptos SDK instance:", aptos);

const MODULE_ADDRESS = "0x7ca55747bec5befc784dd92b917e37a4ceb42a1d6693b9fd86422091cbe99907";

interface PlayerResources {
  wood: number;
  stone: number;
  gold: number;
}

interface TradeOffer {
  id: number;
  creator: string;
  offeredResource: string;
  offeredAmount: number;
  requestedResource: string;
  requestedAmount: number;
}

const App = () => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [resources, setResources] = useState<PlayerResources | null>(null);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [form] = Form.useForm();

  const fetchResources = async () => {
    if (!account) return;
    try {
      const playerInventory = await aptos.getAccountResource<PlayerResources>({
        accountAddress: account.address,
        resourceType: `${MODULE_ADDRESS}::resource_manager::PlayerInventory`,
      });
      setResources(playerInventory);
    } catch (error: any) {
      if (error.message.includes("Resource not found")) {
        console.log("PlayerInventory not found, prompting for initialization.");
        // This is where we would prompt the user to initialize their inventory
      } else {
        console.error("Error fetching resources:", error);
        message.error("Failed to fetch resources.");
      }
    }
  };

  const fetchTradeOffers = async () => {
    try {
      const gameState = await aptos.getAccountResource<any>({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::resource_manager::GameState`,
      });
      setTradeOffers(gameState.trade_offers.map((offer: any, index: number) => ({
        id: index,
        creator: offer.creator,
        offeredResource: offer.offered_resource,
        offeredAmount: offer.offered_amount,
        requestedResource: offer.requested_resource,
        requestedAmount: offer.requested_amount,
      })));
    } catch (error) {
      console.error("Error fetching trade offers:", error);
      message.error("Failed to fetch trade offers.");
    }
  };

  const initializePlayerInventory = async () => {
    if (!account) return;
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::resource_manager::init_player_inventory`,
          functionArguments: [],
        },
      });
      const committedTxn = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      message.success("Player inventory initialized successfully!");
      fetchResources(); // Fetch resources after initialization
    } catch (error) {
      console.error("Error initializing player inventory:", error);
      message.error("Failed to initialize player inventory.");
    }
  };

  useEffect(() => {
    if (connected && account) {
      const checkAndInitialize = async () => {
        try {
          await aptos.getAccountResource<PlayerResources>({
            accountAddress: account.address,
            resourceType: `${MODULE_ADDRESS}::resource_manager::PlayerInventory`,
          });
          // If resource exists, fetch it
          fetchResources();
        } catch (error: any) {
          if (error.message.includes("Resource not found")) {
            // If resource doesn't exist, initialize it
            await initializePlayerInventory();
          } else {
            console.error("Error checking player inventory:", error);
            message.error("Failed to check player inventory.");
          }
        }
        fetchTradeOffers(); // Always fetch trade offers
      };
      checkAndInitialize();
    }
  }, [connected, account]);

  const handleGatherResources = async () => {
    if (!account) return;
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::resource_manager::gather_resources`,
          functionArguments: [],
        },
      });
      const committedTxn = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      message.success("Resources gathered successfully!");
      fetchResources();
    } catch (error) {
      console.error("Error gathering resources:", error);
      message.error("Failed to gather resources.");
    }
  };

  const handleCreateTradeOffer = async (values: any) => {
    if (!account) return;
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::resource_manager::create_trade_offer`,
          functionArguments: [
            values.offeredResource,
            values.offeredAmount.toString(), // Convert to string for u64
            values.requestedResource,
            values.requestedAmount.toString(), // Convert to string for u64
          ],
        },
      });
      const committedTxn = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      message.success("Trade offer created successfully!");
      form.resetFields();
      fetchResources();
      fetchTradeOffers();
    } catch (error) {
      console.error("Error creating trade offer:", error);
      message.error("Failed to create trade offer.");
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col>
            <Title level={3} style={{ color: 'white', margin: 0 }}>Resource Trading Game</Title>
          </Col>
          <Col>
            <WalletSelector />
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: '20px' }}>
        {connected && account ? (
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} md={8}>
              <Card title="Your Resources" variant="outlined">
                {resources ? (
                  <>
                    <Statistic title="Wood" value={resources.wood} />
                    <Statistic title="Stone" value={resources.stone} />
                    <Statistic title="Gold" value={resources.gold} />
                    <Button style={{ marginTop: '20px' }} type="primary" onClick={handleGatherResources}>Gather Resources</Button>
                  </>
                ) : (
                  <p>Loading resources...</p>
                )}
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card title="Create a Trade Offer" variant="outlined" style={{ marginBottom: '20px' }}>
                <Form form={form} onFinish={handleCreateTradeOffer} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="offeredAmount" label="Offer Amount" rules={[{ required: true, message: 'Please input amount!' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="offeredResource" label="Offer Resource" rules={[{ required: true, message: 'Please select resource!' }]}>
                        <Select>
                          <Option value="wood">Wood</Option>
                          <Option value="stone">Stone</Option>
                          <Option value="gold">Gold</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="requestedAmount" label="Request Amount" rules={[{ required: true, message: 'Please input amount!' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="requestedResource" label="Request Resource" rules={[{ required: true, message: 'Please select resource!' }]}>
                        <Select>
                          <Option value="wood">Wood</Option>
                          <Option value="stone">Stone</Option>
                          <Option value="gold">Gold</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">Create Offer</Button>
                  </Form.Item>
                </Form>
              </Card>
              <Card title="Open Trade Offers" variant="outlined">
                <List
                  dataSource={tradeOffers}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="primary">Accept</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={`Offer #${item.id} by ${item.creator.slice(0, 6)}...${item.creator.slice(-4)}`}
                        description={`Offering ${item.offeredAmount} ${item.offeredResource} for ${item.requestedAmount} ${item.requestedResource}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Title level={2}>Connect your wallet to play</Title>
            <p>Please connect your Aptos wallet to start playing the game and manage your resources.</p>
          </div>
        )}
      </Content>
    </Layout>
  );
};

const AppWithProvider = () => (
  <AptosWalletAdapterProvider autoConnect={true}>
    <App />
  </AptosWalletAdapterProvider>
);

export default AppWithProvider;
