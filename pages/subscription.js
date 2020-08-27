import { Page, Layout, Card, Heading, List, Icon, Button } from '@shopify/polaris';
import { TickMinor } from '@shopify/polaris-icons';

class Subscription extends React.Component {
  state = {
    trial: true,
    current: ''
  };
  render() {
    return (
      <Page title="Subscription">
        <Layout>
            <Layout.Section oneHalf>
              <Card>
                <Card.Section>
                  <div className="subscription-plan">
                    <Heading element="h3">Basic Plan</Heading>
                    <List>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>New order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Cancelled order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Paid order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Fulfilled order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Partially fulfilled order notification</p>
                      </List.Item>
                    </List>
                    <Button primary>Choose this plan</Button>
                  </div>
                </Card.Section>
              </Card>
            </Layout.Section>
            <Layout.Section oneHalf>
              <Card className="subscription-plan">
                <Card.Section>
                <div className="subscription-plan">
                    <Heading element="h3">Premium Plan</Heading>
                    <List>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>All basic plan features</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Daily sales report</p>
                      </List.Item>
                    </List>
                    <Button primary>Choose this plan</Button>
                  </div>
                </Card.Section>
              </Card>
            </Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Subscription;