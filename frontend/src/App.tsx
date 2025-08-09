import { AptosWalletAdapterProvider, useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { Layout, Row, Col, Button, List, Typography, Card, Statistic, Form, InputNumber, Select, message, Spin, Avatar, Badge, Progress, Tooltip, Divider } from 'antd';
import { AppstoreOutlined, SwapOutlined, DownOutlined, ThunderboltOutlined, TrophyOutlined, FireOutlined, RocketOutlined, StarOutlined, CrownOutlined, GiftOutlined } from '@ant-design/icons';
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { useEffect, useState } from 'react';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

const MODULE_ADDRESS = "0x7ca55747bec5befc784dd92b917e37a4ceb42a1d6693b9fd86422091cbe99907";

interface PlayerResources {
  wood: number;
  stone: number;
  gold: number;
  last_gathered: number;
}

interface TradeOffer {
  id: number;
  creator: string;
  offeredResource: string;
  offeredAmount: number;
  requestedResource: string;
  requestedAmount: number;
}

const resourceConfig = {
  wood: { 
    icon: '🌲', 
    color: '#8B4513', 
    gradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
    name: 'Wood',
    glow: 'rgba(139, 69, 19, 0.4)'
  },
  stone: { 
    icon: '⛰️', 
    color: '#708090', 
    gradient: 'linear-gradient(135deg, #708090 0%, #778899 50%, #B0C4DE 100%)',
    name: 'Stone',
    glow: 'rgba(112, 128, 144, 0.4)'
  },
  gold: { 
    icon: '✨', 
    color: '#FFD700', 
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
    name: 'Gold',
    glow: 'rgba(255, 215, 0, 0.6)'
  }
};

const App = () => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [resources, setResources] = useState<PlayerResources | null>(null);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [gatherLoading, setGatherLoading] = useState(false);
  const [createOfferLoading, setCreateOfferLoading] = useState(false);
  const [gatherCount, setGatherCount] = useState(0);
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
        await initializePlayerInventory();
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
      const payload = {
        function: `${MODULE_ADDRESS}::resource_manager::init_player_inventory`,
        functionArguments: [],
      };
      const committedTxn = await signAndSubmitTransaction({ data: payload });
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      message.success("🎉 Welcome, Trader! Your inventory is ready!");
      fetchResources();
    } catch (error) {
      console.error("Error initializing player inventory:", error);
      message.error("Failed to initialize player inventory.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (connected && account) {
        setLoading(true);
        await fetchResources();
        await fetchTradeOffers();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [connected, account]);

  const handleGatherResources = async () => {
    if (!account) return;
    setGatherLoading(true);
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::resource_manager::gather_resources`,
        functionArguments: [],
      };
      const committedTxn = await signAndSubmitTransaction({ data: payload });
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      setGatherCount(prev => prev + 1);
      message.success({
        content: "🎊 Resources gathered! Your fortune grows!",
        icon: <GiftOutlined style={{ color: '#52c41a' }} />,
      });
      fetchResources();
    } catch (error) {
      console.error("Error gathering resources:", error);
      message.error("Failed to gather resources.");
    } finally {
      setGatherLoading(false);
    }
  };

  const handleCreateTradeOffer = async (values: any) => {
    if (!account) return;
    setCreateOfferLoading(true);
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::resource_manager::create_trade_offer`,
        functionArguments: [
            values.offeredResource,
            values.offeredAmount.toString(),
            values.requestedResource,
            values.requestedAmount.toString(),
          ],
      };
      const committedTxn = await signAndSubmitTransaction({ data: payload });
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      message.success({
        content: "🚀 Trade offer live! Get ready for incoming deals!",
        icon: <RocketOutlined style={{ color: '#722ed1' }} />,
      });
      form.resetFields();
      fetchResources();
      fetchTradeOffers();
    } catch (error) {
      console.error("Error creating trade offer:", error);
      message.error("Failed to create trade offer.");
    } finally {
      setCreateOfferLoading(false);
    }
  };

  const getTotalResources = () => {
    if (!resources) return 0;
    return resources.wood + resources.stone + resources.gold;
  };

  const getPlayerLevel = () => {
    const total = getTotalResources();
    if (total >= 1000) return { level: "Diamond Trader", icon: <AppstoreOutlined />, color: "#1890ff" };
    if (total >= 500) return { level: "Gold Merchant", icon: <CrownOutlined />, color: "#faad14" };
    if (total >= 100) return { level: "Silver Collector", icon: <TrophyOutlined />, color: "#52c41a" };
    return { level: "Bronze Starter", icon: <StarOutlined />, color: "#8c8c8c" };
  };

  const renderResource = (resourceKey: keyof typeof resourceConfig, value: number) => {
    const config = resourceConfig[resourceKey];
    const maxForProgress = 200;
    const progressPercent = Math.min((value / maxForProgress) * 100, 100);
    
    return (
      <div className="premium-resource-item" data-resource={resourceKey}>
        <div className="resource-header">
          <div className="resource-icon-premium">
            <div className="icon-inner" style={{ background: config.gradient }}>
              <span className="resource-emoji">{config.icon}</span>
            </div>
            <div className="resource-particles"></div>
          </div>
          <div className="resource-info-premium">
            <Text className="resource-label">{config.name}</Text>
            <div className="resource-value-container">
              <span className="resource-value" style={{ color: config.color }}>
                {value.toLocaleString()}
              </span>
              <Badge count={value > 50 ? "Rich!" : value > 20 ? "Good" : "Low"} 
                     color={value > 50 ? "#52c41a" : value > 20 ? "#faad14" : "#ff4d4f"} />
            </div>
          </div>
        </div>
        <div className="resource-progress-container">
          <Progress 
            percent={progressPercent}
            showInfo={false}
            strokeColor={{
              '0%': config.color,
              '100%': config.color + 'AA',
            }}
            trailColor="rgba(255, 255, 255, 0.05)"
            strokeWidth={6}
            className="premium-progress"
          />
          <Text className="progress-label">Level {Math.floor(value / 20) + 1}</Text>
        </div>
      </div>
    );
  };

  const renderLander = () => (
    <div className="premium-landing">
      <div className="cosmic-bg">
        <div className="stars"></div>
        <div className="moving-stars"></div>
      </div>
      
      <div className="hero-container">
        <div className="floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        
        <div className="hero-content-premium">
          <div className="title-container">
            <div className="crown-icon">
              <CrownOutlined />
              <div className="crown-glow"></div>
            </div>
            <Title level={1} className="premium-title">
              <span className="title-line">APTOS</span>
              <span className="title-line gradient-text">RESOURCE</span>
              <span className="title-line premium-text">EMPIRE</span>
            </Title>
          </div>
          
          <div className="subtitle-container">
            <Text className="premium-subtitle">
              🚀 Enter the most <strong>exclusive trading dimension</strong> on Aptos blockchain
            </Text>
            <Text className="premium-description">
              Gather legendary resources • Create empire-level trades • Dominate the multiverse marketplace
            </Text>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <RocketOutlined className="feature-icon" />
              <div className="feature-content">
                <Text className="feature-title">Lightning Speed</Text>
                <Text className="feature-desc">Instant trades powered by Aptos</Text>
              </div>
            </div>
            <div className="feature-card">
              <AppstoreOutlined className="feature-icon" />
              <div className="feature-content">
                <Text className="feature-title">Diamond Security</Text>
                <Text className="feature-desc">Unbreakable blockchain protection</Text>
              </div>
            </div>
            <div className="feature-card">
              <TrophyOutlined className="feature-icon" />
              <div className="feature-content">
                <Text className="feature-title">Elite Trading</Text>
                <Text className="feature-desc">Join the top 1% of traders</Text>
              </div>
            </div>
          </div>
          
          <div className="cta-container">
            <div className="wallet-wrapper">
              <WalletSelector />
            </div>
            <Text className="cta-hint">
              ✨ Connect wallet to unlock your trading empire
            </Text>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApp = () => {
    const playerLevel = getPlayerLevel();
    
    return (
      <div className="game-universe">
        <div className="status-dashboard">
          <div className="player-profile">
            <div className="profile-avatar">
              <Avatar size={64} style={{ 
                background: `linear-gradient(135deg, ${playerLevel.color} 0%, ${playerLevel.color}AA 100%)`,
                border: `3px solid ${playerLevel.color}40`,
                boxShadow: `0 0 20px ${playerLevel.color}60`
              }}>
                {playerLevel.icon}
              </Avatar>
              <div className="avatar-glow" style={{ backgroundColor: playerLevel.color }}></div>
            </div>
            <div className="profile-info">
              <Text className="player-rank" style={{ color: playerLevel.color }}>
                {playerLevel.level}
              </Text>
              <Text className="player-id">
                {account?.address.toString().slice(0, 8)}...{account?.address.toString().slice(-6)}
              </Text>
              <Badge count={`${getTotalResources()} Total`} color={playerLevel.color} className="wealth-badge" />
            </div>
          </div>
          
          <div className="achievement-stats">
            <Statistic title="Gathering Sessions" value={gatherCount} prefix={<GiftOutlined />} />
            <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.1)', height: '40px' }} />
            <Statistic title="Active Trades" value={tradeOffers.length} prefix={<SwapOutlined />} />
            <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.1)', height: '40px' }} />
            <Statistic title="Empire Value" value={getTotalResources() * 10} prefix="$" />
          </div>
        </div>

        <Row gutter={[40, 40]} className="empire-grid">
          <Col xs={24} xl={10}>
            <Card className="vault-card" title={
              <div className="card-header-premium">
                <div className="header-icon">
                  <AppstoreOutlined />
                  <div className="icon-ripple"></div>
                </div>
                <span>🏛️ RESOURCE VAULT</span>
                <Badge count="SECURE" color="#52c41a" />
              </div>
            }>
              <div className="vault-content">
                {resources ? (
                  <>
                    <div className="resources-grid">
                      {renderResource('wood', resources.wood)}
                      {renderResource('stone', resources.stone)}
                      {renderResource('gold', resources.gold)}
                    </div>
                    
                    <div className="gather-section">
                      <Button
                        type="primary"
                        size="large"
                        loading={gatherLoading}
                        onClick={handleGatherResources}
                        className="supreme-gather-btn"
                        icon={<ThunderboltOutlined />}
                        block
                      >
                        {gatherLoading ? (
                          <span>⚡ GATHERING COSMIC RESOURCES...</span>
                        ) : (
                          <span>🌟 GATHER LEGENDARY RESOURCES</span>
                        )}
                      </Button>
                      <Text className="gather-hint">
                        💎 Each gathering session increases your empire power
                      </Text>
                    </div>
                  </>
                ) : (
                  <div className="vault-empty">
                    <div className="empty-vault-icon">🏦</div>
                    <Text className="empty-title">Vault Awaits Initialization</Text>
                    <Text className="empty-desc">Your trading empire starts here</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={14}>
            <div className="trading-complex">
              <Card className="trade-creation-card" title={
                <div className="card-header-premium">
                  <div className="header-icon">
                    <SwapOutlined />
                    <div className="icon-ripple"></div>
                  </div>
                  <span>🎯 TRADE FORGE</span>
                  <Badge count="HOT" color="#ff4d4f" />
                </div>
              }>
                <Form form={form} onFinish={handleCreateTradeOffer} className="forge-form">
                  <div className="trade-sections">
                    <div className="offer-section">
                      <div className="section-title">
                        <FireOutlined /> YOUR OFFER
                      </div>
                      <Row gutter={20}>
                        <Col span={12}>
                          <Form.Item name="offeredAmount" rules={[{ required: true }]}>
                            <InputNumber 
                              min={1} 
                              placeholder="Amount to offer"
                              className="premium-input"
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="offeredResource" rules={[{ required: true }]}>
                            <Select placeholder="Choose resource" className="premium-select" size="large">
                              <Option value="wood">🌲 Wood Empire</Option>
                              <Option value="stone">⛰️ Stone Kingdom</Option>
                              <Option value="gold">✨ Gold Dynasty</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>

                    <div className="exchange-divider">
                      <SwapOutlined className="exchange-icon" />
                    </div>

                    <div className="request-section">
                      <div className="section-title">
                        <AppstoreOutlined /> YOU RECEIVE
                      </div>
                      <Row gutter={20}>
                        <Col span={12}>
                          <Form.Item name="requestedAmount" rules={[{ required: true }]}>
                            <InputNumber 
                              min={1} 
                              placeholder="Amount requested"
                              className="premium-input"
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="requestedResource" rules={[{ required: true }]}>
                            <Select placeholder="Choose resource" className="premium-select" size="large">
                              <Option value="wood">🌲 Wood Empire</Option>
                              <Option value="stone">⛰️ Stone Kingdom</Option>
                              <Option value="gold">✨ Gold Dynasty</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createOfferLoading}
                    className="forge-submit-btn"
                    size="large"
                    block
                    icon={<RocketOutlined />}
                  >
                    {createOfferLoading ? "🔥 FORGING TRADE..." : "🚀 LAUNCH TRADE TO EMPIRE"}
                  </Button>
                </Form>
              </Card>

              <Card className="marketplace-card" title={
                <div className="card-header-premium">
                  <div className="header-icon">
                    <TrophyOutlined />
                    <div className="icon-ripple"></div>
                  </div>
                  <span>🏆 EMPIRE MARKETPLACE</span>
                  <Badge count={tradeOffers.length} color="#722ed1" />
                </div>
              }>
                <div className="marketplace-content">
                  {tradeOffers.length === 0 ? (
                    <div className="empty-marketplace-premium">
                      <div className="empty-marketplace-icon">🏛️</div>
                      <Text className="empty-marketplace-title">Empire Awaits First Trade</Text>
                      <Text className="empty-marketplace-desc">Be the pioneer of this trading realm!</Text>
                    </div>
                  ) : (
                    <List
                      className="premium-trade-list"
                      dataSource={tradeOffers}
                      renderItem={(item, index) => (
                        <List.Item className="premium-trade-item">
                          <div className="trade-card-content">
                            <div className="trader-info">
                              <Avatar 
                                size={48}
                                style={{ 
                                  background: `linear-gradient(${45 + index * 60}deg, #667eea, #764ba2)`,
                                  border: '2px solid rgba(255,255,255,0.2)'
                                }}
                                icon={<StarOutlined />}
                              />
                              <div className="trader-details">
                                <Text className="trader-name">
                                  Empire Trader #{item.creator.toString().slice(-4)}
                                </Text>
                                <Badge count="VERIFIED" color="#52c41a" size="small" />
                              </div>
                            </div>
                            
                            <div className="trade-flow-premium">
                              <div className="trade-offer-side">
                                <span className="trade-amount">{item.offeredAmount}</span>
                                <span className="trade-resource">
                                  {resourceConfig[item.offeredResource as keyof typeof resourceConfig]?.icon} {item.offeredResource}
                                </span>
                              </div>
                              
                              <div className="trade-arrow">
                                <SwapOutlined />
                              </div>
                              
                              <div className="trade-request-side">
                                <span className="trade-amount">{item.requestedAmount}</span>
                                <span className="trade-resource">
                                  {resourceConfig[item.requestedResource as keyof typeof resourceConfig]?.icon} {item.requestedResource}
                                </span>
                              </div>
                            </div>
                            
                            <Button 
                              type="primary"
                              className="accept-trade-btn"
                              icon={<ThunderboltOutlined />}
                              size="large"
                            >
                              EXECUTE TRADE
                            </Button>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="supreme-loading">
        <div className="loading-universe">
          <div className="loading-orb">
            <div className="orb-core">
              <Spin size="large" />
            </div>
            <div className="orb-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          </div>
          <Title level={2} className="loading-title">
            🌌 INITIALIZING TRADING EMPIRE
          </Title>
          <Text className="loading-subtitle">
            Connecting to the Aptos multiverse...
          </Text>
          <div className="loading-progress">
            <Progress percent={75} showInfo={false} strokeColor="#722ed1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout className="supreme-layout">
      <Header className="supreme-header">
        <div className="header-brand">
          <div className="brand-icon-container">
            <CrownOutlined className="brand-icon" />
            <div className="brand-glow"></div>
          </div>
          <div className="brand-text">
            <Title level={3} className="brand-title">APTOS RESOURCE EMPIRE</Title>
            <Text className="brand-tagline">Elite Trading Dimension</Text>
          </div>
        </div>
        
        <div className="header-actions">
          <WalletSelector />
        </div>
      </Header>
      
      <Content className="supreme-content">
        {connected && account ? renderApp() : renderLander()}
      </Content>
      
      <Footer className="supreme-footer">
        <div className="footer-content">
          <Text className="footer-text">
            © 2024 Aptos Resource Empire • Powered by Advanced Blockchain Technology
          </Text>
          <div className="footer-badges">
            <Badge count="Secure" color="#52c41a" />
            <Badge count="Fast" color="#1890ff" />
            <Badge count="Elite" color="#722ed1" />
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

const AppWithProvider = () => (
  <AptosWalletAdapterProvider autoConnect={true}>
    <App />
  </AptosWalletAdapterProvider>
);

export default AppWithProvider;